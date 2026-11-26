import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRequirement, toLegacyReqString } from './build-course-data.mjs';

// Alias/id resolution like the real catalog: cross-listed group + standalone.
const aliases = new Map([
  ['WCS 150', 'WCS 150'], ['ASC 100', 'WCS 150'],           // cross-listed group, canonical = first alias
  ['SOC 201', 'SOC 201'], ['SOC 203', 'SOC 203'],
  ['PLS 210', 'PLS 210'], ['PLS 211', 'PLS 211'],
  ['SOC 101', 'SOC 101'], ['ECON 301', 'ECON 301'],
  ['MATH 273', 'MATH 273'], ['MATH 263', 'MATH 263'],
  ['KAZ 202', 'KAZ 202'],
  ['PHDBS 703a', 'PHDBS 703a'], ['PHDBS 703b', 'PHDBS 703b'],
]);
const ids = new Map([
  ['2183', 'WCS 150'], ['1341', 'SOC 201'], ['1377', 'SOC 203'],
  ['172', 'PLS 210'], ['84', 'MATH 273'], ['81', 'MATH 263'],
  ['4562', 'KAZ 202'], ['5836', 'PHDBS 703a'], ['8552', 'PHDBS 703b'],
]);
const resolve = { byAlias: (c) => aliases.get(c), byId: (id) => ids.get(String(id)) };

test('parses AND groups with grades', () => {
  const p = parseRequirement('MATH 273 Linear Algebra with Applications (84) (C and above) AND MATH 263 Calculus III (81) (C and above)', resolve);
  assert.equal(p.alternatives.length, 1);
  assert.deepEqual(p.alternatives[0].map((i) => i.codes), [['MATH 273'], ['MATH 263']]);
  assert.deepEqual(p.alternatives[0].map((i) => i.grade), ['C', 'C']);
});

test('parses parenthesized OR alternatives of AND groups', () => {
  const p = parseRequirement('(SOC 201 Social Science Research Methods (1341) (C- and above) AND SOC 203 Quantitative Methods in Sociology (1377) (C- and above)) OR (PLS 210 Political Science Research (172) (C- and above) AND PLS 211 Quantitative Methods (999) (C- and above))', resolve);
  assert.equal(p.alternatives.length, 2);
  assert.deepEqual(p.alternatives[0].map((i) => i.codes), [['SOC 201'], ['SOC 203']]);
  assert.equal(p.alternatives[0][0].grade, 'C-');
});

test('flat OR without parentheses', () => {
  const p = parseRequirement('MATH 321 Probability (482) (C and above) OR ECON 211 Economic Statistics (2280) (C and above)', resolve);
  assert.equal(p.alternatives.length, 2);
});

test('cross-listed reference resolves to one canonical course', () => {
  const p = parseRequirement('WCS 150/ASC 100 Advanced English for Academic Purposes (2183) (C- and above)', resolve);
  assert.deepEqual(p.alternatives[0][0].codes, ['WCS 150']);
  assert.equal(p.alternatives[0][0].grade, 'C-');
});

test('lowercase "and" in a course title is not a logic operator', () => {
  const p = parseRequirement('PHDBS 703a Biomedical Research Analysis and Design of Experimentation (5836) (P)', resolve);
  assert.equal(p.alternatives.length, 1);
  assert.deepEqual(p.alternatives[0][0].codes, ['PHDBS 703a']);
  assert.equal(p.alternatives[0][0].grade, 'P');
});

test('placement rules become notes, not course codes', () => {
  const p = parseRequirement('KAZ 202 Academic Kazakh II (4562) (C- and above) OR KLL "[C1.1] Advanced"', resolve);
  assert.equal(p.alternatives.length, 2);
  assert.deepEqual(p.alternatives[1][0].codes, []);
  assert.equal(p.alternatives[1][0].notes[0].type, 'placement');
});

test('subject range rules become notes', () => {
  const p = parseRequirement('Subject "HST" BETWEEN 101 and 199', resolve);
  assert.equal(p.alternatives[0][0].notes[0].type, 'subjectRange');
});

test('lowercase letter-suffixed codes parse', () => {
  const p = parseRequirement('PHDBS 703b Biomedical Research Analysis and Design of Experimentation (8552) (C and above)', resolve);
  assert.deepEqual(p.alternatives[0][0].codes, ['PHDBS 703b']);
});

test('legacy string keeps cross-listed items as OR groups', () => {
  const parsed = { alternatives: [[{ codes: ['WCS 150', 'ASC 100'] }], [{ codes: ['SOC 201'] }, { codes: ['SOC 203'] }]] };
  // one alternative, one cross-listed item
  assert.equal(toLegacyReqString({ alternatives: [[{ codes: ['A 100', 'B 100'] }]] }), '(%A 100% OR %B 100%)');
  assert.equal(toLegacyReqString({ alternatives: [[{ codes: ['A 100'] }, { codes: ['B 100'] }]] }), '(%A 100% AND %B 100%)');
  assert.equal(toLegacyReqString({ alternatives: [[{ codes: ['A 100'] }], [{ codes: ['B 100'] }]] }), '%A 100% OR %B 100%');
  assert.equal(toLegacyReqString({ alternatives: [] }), '');
});

test('empty requirement parses empty', () => {
  assert.deepEqual(parseRequirement('', resolve).alternatives, []);
  assert.deepEqual(parseRequirement(null, resolve).alternatives, []);
});

