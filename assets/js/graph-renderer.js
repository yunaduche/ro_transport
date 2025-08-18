// Enhanced renderer to mimic the original GOJS diagram style
// - Left column: sources (A, B, ...), Right column: destinations (1, 2, ...)
// - Circle nodes with dashed borders showing only the key (A, B, 1, 2, ...)
// - Potentials Vx/Vy drawn as separate text labels near each node
// - Edges for all (i,j): label = cost c(i,j); tooltip shows Δ = u + c − v; non-basic edges dashed
function init_graph(containerId, nodesData, edgesData, cyclePath) {
  const container = document.getElementById('tree' + containerId);
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(nodesData) || nodesData.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding-top: 20px; color: #6c757d;">Pas de graphe pour cette étape.</div>';
    return;
  }

  const nodeByKey = new Map();
  nodesData.forEach(n => nodeByKey.set(n.key, n));
  const sources = nodesData.filter(n => n.type === 'source');
  const destinations = nodesData.filter(n => n.type === 'destination');

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 280;
  const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);

  // Calcul de positions fixes (gauche/droite)
  const yStepLeft = Math.max(50, Math.min(120, Math.floor(height / (sources.length + 1))));
  const yStepRight = Math.max(40, Math.min(100, Math.floor(height / (destinations.length + 1))));
  const positions = new Map();
  sources.forEach((n, idx) => positions.set(n.key, { x: 60, y: (idx + 1) * yStepLeft }));
  destinations.forEach((n, idx) => positions.set(n.key, { x: width - 60, y: (idx + 1) * yStepRight }));

  // Arêtes: privilégier allocations > 0; autoriser un très petit nombre d'arêtes epsilon pour connexité visuelle
  let epsAdded = 0;
  // Afficher toutes les arêtes basiques (y compris ε) pour que la base atteigne m+n−1
  const edges = (edgesData || [])
    .filter(e => nodeByKey.has(e.from) && nodeByKey.has(e.to));

  // Traits
  svg.append('g')
    .selectAll('line')
    .data(edges)
    .enter()
    .append('line')
    .attr('x1', d => positions.get(d.from).x)
    .attr('y1', d => positions.get(d.from).y)
    .attr('x2', d => positions.get(d.to).x)
    .attr('y2', d => positions.get(d.to).y)
    .attr('stroke', d => d.isEps ? '#c0c0c0' : '#6c757d')
    .attr('stroke-width', d => d.isEps ? 1 : 1.5)
    .attr('stroke-dasharray', d => d.isEps ? '4,3' : null);

  // Labels d'arêtes (coût uniquement, sans Δ pour épurer)
  svg.append('g')
    .selectAll('text.edge-label')
    .data(edges)
    .enter()
    .append('text')
    .attr('class', 'edge-label')
    .attr('x', d => (positions.get(d.from).x + positions.get(d.to).x) / 2)
    .attr('y', d => (positions.get(d.from).y + positions.get(d.to).y) / 2 - 6)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .attr('fill', d => d.isEps ? '#999' : '#343a40')
    .text(d => String(d.text));

  // Nœuds sources
  const sourceGroup = svg.append('g').selectAll('g.source')
    .data(sources)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${positions.get(d.key).x},${positions.get(d.key).y})`);

  sourceGroup.append('circle').attr('r', 18).attr('fill', '#fff').attr('stroke', '#444');
  sourceGroup.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('font-weight', '600').text(d => d.key);
  sourceGroup.append('text').attr('x', -28).attr('dy', '0.35em').attr('font-size', 12).text(d => (d.value ?? '?'));

  // Nœuds destinations
  const destGroup = svg.append('g').selectAll('g.dest')
    .data(destinations)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${positions.get(d.key).x},${positions.get(d.key).y})`);

  destGroup.append('circle').attr('r', 18).attr('fill', '#fff').attr('stroke', '#444');
  destGroup.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('font-weight', '600').text(d => d.key);
  destGroup.append('text').attr('x', 28).attr('dy', '0.35em').attr('font-size', 12).text(d => (d.value ?? '?'));

  // Superposition: cycle d'amélioration (si fourni)
  // Ne pas afficher le cycle (lignes/overlays) sur le graphe
  if (Array.isArray(cyclePath) && cyclePath.length > 0) {
    // Intentionally left blank: cycle overlay disabled per request
  }
}
