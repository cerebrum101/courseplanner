// Which courses can be suggested from the plan on the canvas.
// Membership only (no grades): an item is met when any of its codes is on the canvas.
// Alternatives with no course codes (placement tests, free text) cannot be checked
// against a plan, so they are ignored, as the old %CODE% strings did.
export function codedAlternatives(parsed) {
  if (!parsed || !parsed.alternatives) return [];
  return parsed.alternatives
    .map((alt) => alt.filter((item) => item.codes && item.codes.length > 0))
    .filter((alt) => alt.length > 0);
}

export function hasCourseRequirements(course) {
  return codedAlternatives(course.prerequisitesParsed).length > 0;
}

export function prerequisitesMet(course, addedSet) {
  const alts = codedAlternatives(course.prerequisitesParsed);
  if (alts.length === 0) return true;
  return alts.some((alt) => alt.every((item) => item.codes.some((c) => addedSet.has(c))));
}
