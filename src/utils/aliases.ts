import courseDataJSON from '../data/courseData.json';

// alias -> canonical courseCode ("ASC 100" -> "WCS 150" for a cross-listed group)
let aliasMap: Map<string, string> | null = null;

export const getAliasMap = (): Map<string, string> => {
  if (!aliasMap) {
    aliasMap = new Map();
    const courses = courseDataJSON.coursesData as any[];
    // A code that is some course's own primary code always means that course;
    // a cross-listed alias only fills codes no course owns (ASC 200 is its own
    // course, even though WCS 210 also lists it as an alias).
    courses.forEach((course) => {
      if (course.courseCode) aliasMap!.set(course.courseCode, course.courseCode);
    });
    // When two courses list the same alias, the one taught most recently wins; ties go to the
    // lower primary code. Fixed order, so the result never depends on data order.
    const termKey = (t: string) => {
      const m = /(Spring|Summer|Fall)\s+(\d{4})/.exec(t || '');
      return m ? Number(m[2]) * 10 + ({ Spring: 1, Summer: 2, Fall: 3 } as any)[m[1]] : -1;
    };
    const ordered = [...courses].sort((a, b) =>
      termKey(b.lastTaughtTerm) - termKey(a.lastTaughtTerm) || String(a.courseCode).localeCompare(String(b.courseCode)));
    ordered.forEach((course) => {
      if (!course.courseCode) return;
      (course.aliases || []).forEach((a: string) => {
        if (!aliasMap!.has(a)) aliasMap!.set(a, course.courseCode);
      });
    });
  }
  return aliasMap;
};

export const toCanonicalCode = (code: string): string => {
  const trimmed = code.trim().toUpperCase().replace(/\s+/, ' ');
  return getAliasMap().get(trimmed) || trimmed;
};

// Extract canonical course codes from free text (e.g. a pasted transcript).
export const extractCourseCodesFromText = (text: string): string[] => {
  const re = /\b([A-Z]{2,7})\s+(\d{3}[A-Za-z]?)\b/g;
  const found = new Set<string>();
  let m;
  while ((m = re.exec(text)) !== null) {
    const code = `${m[1]} ${m[2]}`;
    const canon = getAliasMap().get(code);
    if (canon) found.add(canon);
  }
  return [...found];
};

