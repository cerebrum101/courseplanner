#!/usr/bin/env node
/**
 * build-course-data.mjs — CoursePlanner data pipeline (v2)
 *
 * Replaces the ad-hoc update scripts (addSpring2026Data.py, updateFall2026Data.py,
 * preprocessCourseData.*) with a single reproducible pipeline:
 *
 *   1. Fetch the full NU public course catalog via the registrar's own JSON API
 *      (no auth needed): POST /my-registrar/public-course-catalog/json
 *   2. Normalize every course: canonical code, aliases for cross-listings
 *      ("ANT 375/HST 375/SOC 375/TUR 375" -> aliases), level, school, credits.
 *   3. Parse PREREQ/COREQ/ANTIREQ free text into structured AND/OR groups,
 *      keeping grade requirements ("C- and above") and special rules
 *      (subject ranges, KLL placement, instructor permission) as typed items.
 *      References resolve through the registrar's internal course IDs first,
 *      falling back to code/alias matching.
 *   4. Compute alias-aware reverse dependencies (ISPREREQTO / ISCOREQTO / ISANTIREQTO).
 *   5. Emit src/data/courseData.json plus src/data/courseData.meta.json
 *      (generatedAt, source snapshot term, stats) so requirement changes
 *      across terms stay visible from here on.
 *
 * Usage:
 *   node scripts/build-course-data.mjs [--offline catalog.json] [--all-levels]
 *
 * --offline reads a previously fetched catalog dump instead of the network.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://registrar.nu.edu.kz/my-registrar/public-course-catalog/json';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'data', 'courseData.json');
const META = join(ROOT, 'src', 'data', 'courseData.meta.json');
const SPRING_2027 = 'Spring 2027';
const PAGE_SIZE = 500;
// The planner covers undergraduate courses. Pass --all-levels to keep graduate,
// MD and other levels in the output too.
const INCLUDE_LEVELS = ['Undergraduate'];

async function fetchCatalog() {
  const first = await fetchPage(1);
  const total = Number(first.total);
  console.log(`Catalog reports ${total} courses`);
  const pages = Math.ceil(total / PAGE_SIZE);
  let data = first.data;
  for (let p = 2; p <= pages; p++) {
    data = data.concat((await fetchPage(p)).data);
  }
  return data;
}

async function fetchPage(page) {
  const body = new URLSearchParams({
    method: 'getSearchData',
    'searchParams[semester]': '-1',
    'searchParams[quickSearch]': '',
    'searchParams[sortField]': '-1',
    'searchParams[sortDescending]': '-1',
    'searchParams[page]': String(page),
    'searchParams[limit]': String(PAGE_SIZE),
  });
  const res = await fetch(API, { method: 'POST', body });
  if (!res.ok) throw new Error(`catalog fetch failed: HTTP ${res.status} (page ${page})`);
  return res.json();
}

/* ---------------- requirement text parsing ---------------- */

// Split "A AND B OR (C AND D)" at top level by the given keyword, respecting parens.
// Split "A AND B OR (C AND D)" at top level by the given keyword, respecting parens.
// Case-sensitive: registrar logic uses uppercase AND/OR; course titles use lowercase.
function splitTopLevel(str, keyword) {
  const parts = [];
  let depth = 0, cur = '';
  const kw = ` ${keyword} `;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && str.startsWith(kw, i)) {
      parts.push(cur.trim());
      cur = '';
      i += kw.length - 1;
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

const stripOuterParens = (s) => {
  s = s.trim();
  while (s.startsWith('(') && s.endsWith(')')) {
    // only strip if the outer parens wrap the whole string
    let depth = 0, wraps = true;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') depth++;
      if (s[i] === ')') depth--;
      if (depth === 0 && i < s.length - 1) { wraps = false; break; }
    }
    if (!wraps) break;
    s = s.slice(1, -1).trim();
  }
  return s;
};

const CODE_RE = /\b([A-Z]{2,7})\s+(\d{3}[A-Z]?)\b/g;
const ID_RE = /\((\d{3,5})\)/g;
const GRADE_RE = /\(([A-F][+-]?|P|NP)(?:\s+and above)?\)/i;
const SUBJECT_RANGE_RE = /Subject\s+"([A-Z]+)"\s+BETWEEN\s+(\d+)\s+and\s+(\d+)/i;
const PLACEMENT_RE = /[A-Z]{2,5}\s+"\[[^\]]+\][^"]*"/;

function parseItem(chunk, resolve) {
  const item = { raw: chunk.trim(), codes: [], grade: null, notes: [] };
  const gradeMatch = chunk.match(GRADE_RE);
  if (gradeMatch) item.grade = gradeMatch[1].toUpperCase();

  const rangeMatch = chunk.match(SUBJECT_RANGE_RE);
  if (rangeMatch) {
    item.notes.push({ type: 'subjectRange', subject: rangeMatch[1], from: rangeMatch[2], to: rangeMatch[3] });
  }
  const placementMatch = chunk.match(PLACEMENT_RE);
  if (placementMatch) {
    item.notes.push({ type: 'placement', text: placementMatch[0] });
  }

  const seen = new Set();
  const ids = [...chunk.matchAll(ID_RE)].map((m) => m[1]);
  const codes = [...chunk.matchAll(CODE_RE)].map((m) => `${m[1]} ${m[2]}`);
  // Resolve via internal id first (authoritative), then via code alias.
  for (const id of ids) {
    const code = resolve.byId(id);
    if (code && !seen.has(code)) { seen.add(code); item.codes.push(code); }
  }
  for (const code of codes) {
    const canon = resolve.byAlias(code);
    if (canon && !seen.has(canon)) { seen.add(canon); item.codes.push(canon); }
  }
  if (item.codes.length === 0 && item.notes.length === 0 && item.raw) {
    item.notes.push({ type: 'text', text: item.raw.replace(/\s+/g, ' ').slice(0, 200) });
  }
  return item;
}

/**
 * Parse a requirement string into:
 *   { raw, alternatives: [ [ item, item, ... ], ... ] }
 * Top level: OR of alternatives; each alternative: AND of items.
 * An item lists course codes (several = cross-listed equivalents, any satisfies),
 * an optional minimum grade, and non-course notes (subject ranges, placement...).
 */
export function parseRequirement(raw, resolve) {
  const result = { raw: (raw || '').trim(), alternatives: [] };
  // AND and OR mixed outside any brackets: the registrar states no precedence,
  // so the grouping below is a reading, not a fact. Flag it; checks stay "unknown".
  {
    let depth = 0, top = '';
    for (const ch of result.raw) { if (ch === '(') depth++; if (ch === ')') depth = Math.max(0, depth - 1); if (depth === 0) top += ch; }
    if (/ AND /.test(top) && / OR /.test(top)) result.ambiguous = true;
  }
  if (!result.raw) return result;
  const alternatives = splitTopLevel(result.raw, 'OR');
  for (const alt of alternatives) {
    const andParts = splitTopLevel(stripOuterParens(alt), 'AND');
    const items = andParts.map((p) => parseItem(stripOuterParens(p), resolve)).filter((it) => it.codes.length || it.notes.length);
    if (items.length) result.alternatives.push(items);
  }
  return result;
}

// Re-emit a PREREQNEW-style %CODE% string for the existing graph-edge code.
// Cross-listed equivalents are wrapped as (%A% OR %B%); AND items stay bare;
// multi-item alternatives are wrapped as (%X% AND %Y%).
export function toLegacyReqString(parsed) {
  if (!parsed.alternatives.length) return '';
  const altStrings = parsed.alternatives.map((items) => {
    const itemStrings = items
      .filter((it) => it.codes.length)
      .map((it) => (it.codes.length > 1 ? `(${it.codes.map((c) => `%${c}%`).join(' OR ')})` : `%${it.codes[0]}%`));
    if (!itemStrings.length) return '';
    return itemStrings.length > 1 ? `(${itemStrings.join(' AND ')})` : itemStrings[0];
  }).filter(Boolean);
  return altStrings.join(' OR ');
}

/* ---------------- normalization ---------------- */

const TERM_ORDER = { Spring: 1, Summer: 2, Fall: 3 };
const termKey = (t) => {
  const m = (t || '').match(/(Spring|Summer|Fall)\s+(\d{4})/);
  return m ? Number(m[2]) * 10 + TERM_ORDER[m[1]] : -1;
};

function buildIndexes(catalog) {
  // The catalog returns one row per course per offering term. Group by COURSEID:
  // latest row = canonical record, aliases union across rows, terms = history.
  const byId = new Map();
  const byAlias = new Map();
  const byCourseId = new Map();

  for (const row of catalog) {
    const cid = String(row.COURSEID || '').trim();
    const abbr = (row.ABBR || '').trim();
    if (!cid || !abbr) continue;
    if (!byCourseId.has(cid)) byCourseId.set(cid, []);
    byCourseId.get(cid).push(row);
  }

  const mergedByCode = new Map();
  const courses = [];
  for (const [cid, rows] of byCourseId) {
    rows.sort((a, b) => termKey(b.TERMNAME) - termKey(a.TERMNAME));
    const row = rows[0];
    const aliases = [];
    for (const r of rows) {
      for (const a of (r.ABBR || '').split('/').map((s) => s.trim()).filter(Boolean)) {
        if (!aliases.includes(a)) aliases.push(a);
      }
    }
    const code = aliases[0];
    const offeredTerms = rows.map((r) => r.TERMNAME).filter((t) => t && t !== 'not offered yet');
    const course = {
      courseCode: code,
      aliases,
      courseName: (row.TITLE || '').trim(),
      courseId: cid,
      school: row.SCHOOL || null,
      schoolAbbr: row.SCHOOLABBR || null,
      department: row.DEPARTMENT || null,
      level: row.ACADEMICLEVEL || null,
      credits: row.CRUS || null,
      creditsECTS: row.CRECTS || null,
      breadth: row.BREADTH || null,
      description: (row.SHORTDESC || '').trim(),
      offeredTerms,
      lastTaughtTerm: row.TERMNAME || null,
      AVAILABLE_SPRING_2027: offeredTerms.includes(SPRING_2027),
      rawPrereq: (row.PREREQ || '').trim(),
      rawCoreq: (row.COREQ || '').trim(),
      rawAntireq: (row.ANTIREQ || '').trim(),
    };
    // The catalog can list the same course code under several COURSEIDs
    // (different schools/versions or transfer placeholders). Merge by code:
    // keep the latest term's record, union aliases and offering terms.
    if (mergedByCode.has(code)) {
      const m = mergedByCode.get(code);
      for (const a of course.aliases) if (!m.aliases.includes(a)) m.aliases.push(a);
      for (const t of course.offeredTerms) if (!m.offeredTerms.includes(t)) m.offeredTerms.push(t);
      m.AVAILABLE_SPRING_2027 = m.AVAILABLE_SPRING_2027 || course.AVAILABLE_SPRING_2027;
      if (!m.rawPrereq && course.rawPrereq) m.rawPrereq = course.rawPrereq;
      if (!m.rawCoreq && course.rawCoreq) m.rawCoreq = course.rawCoreq;
      if (!m.rawAntireq && course.rawAntireq) m.rawAntireq = course.rawAntireq;
    } else {
      mergedByCode.set(code, course);
      courses.push(course);
    }
    byId.set(cid, code);
    for (const alias of aliases) if (!byAlias.has(alias)) byAlias.set(alias, code);
  }
  return { courses, byId: (id) => byId.get(String(id)), byAlias: (code) => byAlias.get(code) };
}

function attachRequirements(courses, resolve) {
  const revPrereq = new Map(), revCoreq = new Map(), revAntireq = new Map();
  let unresolvedRefs = 0;

  for (const course of courses) {
    const prereq = parseRequirement(course.rawPrereq, resolve);
    const coreq = parseRequirement(course.rawCoreq, resolve);
    const antireq = parseRequirement(course.rawAntireq, resolve);

    course.prerequisitesParsed = prereq;
    course.corequisitesParsed = coreq;
    course.antirequisitesParsed = antireq;
    course.PREREQNEW = toLegacyReqString(prereq);
    course.COREQNEW = toLegacyReqString(coreq);
    course.ANTIREQNEW = toLegacyReqString(antireq);

    const collect = (parsed, map) => {
      for (const alt of parsed.alternatives) {
        for (const item of alt) {
          if (!item.codes.length && item.raw && !item.notes.length) unresolvedRefs++;
          for (const ref of item.codes) {
            if (!map.has(ref)) map.set(ref, new Set());
            map.get(ref).add(course.courseCode);
          }
        }
      }
    };
    collect(prereq, revPrereq);
    collect(coreq, revCoreq);
    collect(antireq, revAntireq);
  }

  for (const course of courses) {
    course.ISPREREQTO = [...(revPrereq.get(course.courseCode) || [])].sort();
    course.ISCOREQTO = [...(revCoreq.get(course.courseCode) || [])].sort();
    course.ISANTIREQTO = [...(revAntireq.get(course.courseCode) || [])].sort();
  }
  return { unresolvedRefs };
}

/* ---------------- main ---------------- */
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
const offline = process.argv.includes('--offline')
  ? process.argv[process.argv.indexOf('--offline') + 1]
  : null;

const catalog = offline ? JSON.parse(readFileSync(offline, 'utf8')) : await fetchCatalog();
console.log(`Fetched ${catalog.length} catalog rows`);

const { courses, byId, byAlias } = buildIndexes(catalog);
const levels = {};
for (const c of courses) levels[c.level] = (levels[c.level] || 0) + 1;

const { unresolvedRefs } = attachRequirements(courses, { byId, byAlias });
const allLevels = process.argv.includes('--all-levels');
let kept = allLevels ? courses : courses.filter((c) => INCLUDE_LEVELS.includes(c.level));
// The planner's course list has always been limited to recently taught courses (the previous
// data started at Fall 2024). Older courses stay in the data so saved plans and requirement
// references still resolve, but are flagged recent: false and hidden from the list.
const RECENT_FROM = termKey('Fall 2024');
// Every code the previous planner listed (frozen from commit 38e8ed8) stays listed.
const baselineCodes = new Set(JSON.parse(readFileSync(join(ROOT, 'scripts', 'baseline-codes.json'), 'utf8')));
// Transfer-credit equivalents ("T - MAT 3004", "T-GEN 1100") are only listed if the previous planner listed them.
const isTransferStyle = (c) => /^T\s?-/.test(c.courseCode);
for (const c of kept) {
  const inBaseline = c.aliases.some((a) => baselineCodes.has(a));
  const taughtRecently = c.offeredTerms.some((t) => termKey(t) >= RECENT_FROM);
  c.recent = inBaseline || (taughtRecently && !isTransferStyle(c));
}

const meta = {
  generatedAt: new Date().toISOString(),
  source: API,
  sourceSemester: 'latest (all-semester catalog)',
  availabilityTerm: SPRING_2027,
  courseCount: kept.length,
  catalogCourseCount: courses.length,
  levelsIncluded: allLevels ? 'all' : INCLUDE_LEVELS,
  levels,
  spring2027Count: kept.filter((c) => c.AVAILABLE_SPRING_2027).length,
  unresolvedRequirementRefs: unresolvedRefs,
  notes: [
    'aliases[] lists every cross-listed code; courseCode is the first alias.',
    '*Parsed fields keep exact AND/OR structure, grades and non-course rules.',
    'PREREQNEW/COREQNEW/ANTIREQNEW are legacy %CODE% strings for the graph-edge code.',
    'Requirement history: snapshots are versioned by generatedAt from this run on.',
  ],
};

// Courses from the previous data that the registrar catalog no longer lists stay in the
// data flagged legacy: true, so saved plans that use them keep their nodes.
{
  const legacy = JSON.parse(readFileSync(join(ROOT, 'scripts', 'legacy-courses.json'), 'utf8'));
  const known = new Set(courses.flatMap((c) => c.aliases));
  const keep = legacy.filter((c) => !c.aliases.some((a) => known.has(a))).map((c) => ({ ...c, recent: true }));
  kept = kept.concat(keep);
  meta.legacyCourseCount = keep.length;
  meta.courseCount = kept.length;
}
meta.recentCourseCount = kept.filter((c) => c.recent).length;
meta.recentFrom = 'Fall 2024';

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ coursesData: kept }, null, 1));
writeFileSync(META, JSON.stringify(meta, null, 2));
console.log('Wrote', OUT);
console.log('Stats:', JSON.stringify(meta, null, 2));
}

