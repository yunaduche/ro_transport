// Enhanced renderer to mimic the original GOJS diagram style
// - Left column: sources (A, B, ...), Right column: destinations (1, 2, ...)
// - Circle nodes with dashed borders showing only the key (A, B, 1, 2, ...)
// - Potentials Vx/Vy drawn as separate text labels near each node
// - Edges for all (i,j): label = cost c(i,j); tooltip shows Δ = u + c − v; non-basic edges dashed
function init_graph(containerId, nodesData, edgesData) {
  const container = document.getElementById('tree' + containerId);
  if (!container) {
    console.error('Graph container not found:', 'tree' + containerId);
    return;
  }

  if (!nodesData || !Array.isArray(nodesData) || nodesData.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding-top: 20px; color: #6c757d;">Pas de cycle à afficher pour cette étape.</div>';
    return;
  }

  // Lookup for nodes by key
  const nodeByKey = new Map();
  nodesData.forEach(n => nodeByKey.set(n.key, n));

  // Extract source/destination keys order from nodesData
  const sources = nodesData.filter(n => n.type === 'source');
  const destinations = nodesData.filter(n => n.type === 'destination');

  // Fixed layout similar to the image: two columns
  const xLeft = -220;
  const xRight = 220;
  const yStepLeft = 100;
  const yStepRight = 70;

  // Helper to compute fixed positions
  const positionByKey = new Map();
  sources.forEach((n, idx) => positionByKey.set(n.key, { x: xLeft, y: (idx + 1) * yStepLeft }));
  destinations.forEach((n, idx) => positionByKey.set(n.key, { x: xRight, y: (idx + 1) * yStepRight }));

  // Create main circle nodes
  const circleNodes = sources.concat(destinations).map(n => {
    const pos = positionByKey.get(n.key) || { x: 0, y: 0 };
    return {
      id: n.key,
      label: String(n.key),
      shape: 'circle',
      shapeProperties: { borderDashes: [4, 4] },
      font: { size: 16, color: '#333' },
      color: { border: '#444', background: '#fff' },
      x: pos.x,
      y: pos.y,
      physics: false,
      fixed: { x: true, y: true },
    };
  });

  // Create separate text nodes for potentials Vx/Vy positioned beside nodes
  const potentialTextNodes = sources.concat(destinations).map(n => {
    const pos = positionByKey.get(n.key) || { x: 0, y: 0 };
    const isSource = n.type === 'source';
    const potentialLabel = (n.value !== null && n.value !== undefined) ? String(n.value) : '?';
    const offset = isSource ? -30 : 30; // left for sources, right for destinations
    return {
      id: `pot_${n.key}`,
      label: potentialLabel,
      shape: 'text',
      font: { size: 14, color: '#000' },
      x: pos.x + offset,
      y: pos.y,
      physics: false,
      fixed: { x: true, y: true },
      selectable: false,
      chosen: false,
      title: (isSource ? 'Vx' : 'Vy') + ' = ' + potentialLabel,
    };
  });

  // Build a set of basic edges (those passed in edgesData)
  const basicSet = new Set();
  (edgesData || []).forEach(e => basicSet.add(`${e.from}->${e.to}`));

  // Only render basic edges of the current solution (less clutter)
  const allEdges = (edgesData || []).map(e => ({ from: e.from, to: e.to, text: Number(e.text) }));

  // Convert to vis edges with label=cost, tooltip shows delta; only basic edges drawn
  const visEdges = allEdges.map(e => {
    const fromNode = nodeByKey.get(e.from);
    const toNode = nodeByKey.get(e.to);
    const u = fromNode ? Number(fromNode.value ?? 0) : 0;
    const v = toNode ? Number(toNode.value ?? 0) : 0;
    const c = Number(e.text);
    const g = u + c - v;
    const isBasic = basicSet.has(`${e.from}->${e.to}`);
    if (!isBasic) return null; // skip non-basic to declutter
    const isImproving = g < 0;
    return {
      from: e.from,
      to: e.to,
      label: String(c),
      title: `u(${e.from}) + c(${e.from},${e.to}) - v(${e.to}) = ${u} + ${c} - ${v} = ${g}`,
      arrows: 'to',
      color: isImproving ? '#dc3545' : '#6c757d',
      font: { color: isImproving ? '#dc3545' : '#6c757d', align: 'top' },
      smooth: { enabled: true, type: 'cubicBezier', roundness: 0.6 },
    };
  }).filter(Boolean);

  const nodes = new vis.DataSet(circleNodes.concat(potentialTextNodes));
  const edges = new vis.DataSet(visEdges);
  const data = { nodes, edges };

  const options = {
    physics: false, // fixed positions
    interaction: { dragNodes: false, dragView: true, zoomView: true },
  };

  new vis.Network(container, data, options);
}
