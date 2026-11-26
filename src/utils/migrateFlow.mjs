// Migrate a saved flow (localStorage) to current canonical course codes.
// Older saves can reference codes that were later merged: cross-listed groups
// saved as slash-joined ids ("ANT 375/HST 375") or alias codes ("ASC 100").
// resolveCode(code) -> canonical code or null when the code no longer exists.
// Returns { nodes, edges, remapped: {oldId: newId}, dropped: [oldId] }.

export function resolveSavedCode(code, aliasMap) {
  const trimmed = String(code || '').trim().toUpperCase().replace(/\s+/, ' ');
  if (!trimmed) return null;
  if (aliasMap.has(trimmed)) return aliasMap.get(trimmed);
  // legacy slash-joined cross-listing: keep the first part that resolves
  if (trimmed.includes('/')) {
    for (const part of trimmed.split('/').map((p) => p.trim())) {
      if (aliasMap.has(part)) return aliasMap.get(part);
    }
  }
  return null;
}

export function migrateFlowCodes(flow, aliasMap) {
  const remapped = {};
  const dropped = [];
  const nodes = [];
  const seenNewIds = new Set();
  const mergedDuplicates = [];

  for (const node of flow.nodes || []) {
    const canonical = resolveSavedCode(node.id, aliasMap);
    if (!canonical) { dropped.push(node.id); continue; }
    if (canonical !== node.id) remapped[node.id] = canonical;
    if (seenNewIds.has(canonical)) { mergedDuplicates.push(node.id); continue; } // same course saved twice under different codes
    seenNewIds.add(canonical);
    nodes.push({ ...node, id: canonical });
  }

  const edges = [];
  const seenEdges = new Set();
  for (const edge of flow.edges || []) {
    const source = resolveSavedCode(edge.source, aliasMap);
    const target = resolveSavedCode(edge.target, aliasMap);
    if (!source || !target) continue;
    if (!seenNewIds.has(source) || !seenNewIds.has(target)) continue;
    const id = `${source}->${target}`;
    if (seenEdges.has(id)) continue;
    seenEdges.add(id);
    edges.push({ ...edge, source, target });
  }

  return { nodes, edges, remapped, dropped, mergedDuplicates };
}

