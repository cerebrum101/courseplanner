import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasCourseRequirements, prerequisitesMet } from '../src/utils/suggest.mjs';

const item = (...codes) => ({ raw: '', codes, grade: null, notes: [] });
const note = () => ({ raw: 'KLL', codes: [], grade: null, notes: [{ type: 'placement' }] });
const course = (alternatives) => ({ prerequisitesParsed: { raw: 'x', alternatives } });

test('AND items all needed', () => {
  const c = course([[item('A 101'), item('B 101')]]);
  assert.equal(prerequisitesMet(c, new Set(['A 101'])), false);
  assert.equal(prerequisitesMet(c, new Set(['A 101', 'B 101'])), true);
});
test('OR alternatives: one is enough', () => {
  const c = course([[item('A 101')], [item('B 101')]]);
  assert.equal(prerequisitesMet(c, new Set(['B 101'])), true);
  assert.equal(prerequisitesMet(c, new Set()), false);
});
test('cross-listed codes in one item: any satisfies', () => {
  const c = course([[item('A 101', 'Z 101')]]);
  assert.equal(prerequisitesMet(c, new Set(['Z 101'])), true);
});
test('placement-only alternative does not make a course suggestible', () => {
  const c = course([[item('KAZ 201')], [note()]]);
  assert.equal(prerequisitesMet(c, new Set()), false);
  assert.equal(prerequisitesMet(c, new Set(['KAZ 201'])), true);
  assert.equal(hasCourseRequirements(course([[note()]])), false);
});
