import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrateFlowCodes } from '../src/utils/migrateFlow.mjs';

const aliasMap = new Map([['ANT 375', 'ANT 375'], ['HST 375', 'ANT 375'], ['MATH 101', 'MATH 101']]);
test('slash-joined and alias codes map to the current code; unknown codes drop', () => {
  const out = migrateFlowCodes({
    nodes: [{ id: 'ANT 375/HST 375/SOC 375' }, { id: 'MATH 101' }, { id: 'GONE 999' }],
    edges: [{ id: 'e', source: 'MATH 101', target: 'HST 375' }, { id: 'f', source: 'GONE 999', target: 'MATH 101' }],
  }, aliasMap);
  assert.deepEqual(out.nodes.map((n) => n.id), ['ANT 375', 'MATH 101']);
  assert.equal(out.edges.length, 1);
  assert.equal(out.edges[0].target, 'ANT 375');
  assert.deepEqual(out.dropped, ['GONE 999']);
});
