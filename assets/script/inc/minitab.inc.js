/**
 * Implémentation générique MINITAB (heuristique basée sur tri global des coûts)
 * Entrées:
 *  - costsFlat: tableau 1D des coûts (ligne majeure) de taille m*n
 *  - rows: m, cols: n
 *  - supplies: longueur m
 *  - demands: longueur n
 * Sortie: met à jour baseSolutionTable et originalTable
 */
const minitab_generic = (costsFlat, rows, cols, supplies, demands) => {
  const m = rows;
  const n = cols;
  if (!m || !n) return;

  // Reconstituer la matrice des coûts et préparer la solution
  const costs = [];
  for (let i = 0; i < m; i++) {
    const start = i * n;
    costs.push(costsFlat.slice(start, start + n).map(Number));
  }
  const solution = init_array(costs);

  // Créer la liste triée des cellules par coût croissant (i,j,c)
  const cells = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const c = Number(costs[i][j]);
      cells.push({ i, j, c: isFinite(c) ? c : Infinity });
    }
  }
  cells.sort((a, b) => a.c - b.c);

  const curSup = supplies.slice().map(Number);
  const curDem = demands.slice().map(Number);

  // Tracer les sélections effectuées (pour debug/validation UI)
  if (typeof base_selection_trace !== 'undefined') base_selection_trace = [];

  for (const cell of cells) {
    const i = cell.i;
    const j = cell.j;
    if (curSup[i] <= 0 || curDem[j] <= 0) continue;
    const alloc = Math.min(curSup[i], curDem[j]);
    solution[i][j] = alloc;
    curSup[i] -= alloc;
    curDem[j] -= alloc;
    if (typeof base_selection_trace !== 'undefined') {
      base_selection_trace.push({ method: 'MINITAB', i, j, cost: cell.c, alloc });
    }
  }

  // Assurer la non-dégénérescence si besoin
  if (is_degenerate_case([], solution)) {
    add_link(solution, costs);
  }

  baseSolutionTable = solution;
  originalTable = costs;
  // Normalisation pour éviter NaN / chaînes ambiguës
  if (typeof sanitize_base_solution === 'function') {
    sanitize_base_solution();
  }
  // Nombre de noeuds sources (lignes) pour le calcul des potentiels
  if (typeof rows === 'number' && rows > 0) {
    source_number = rows;
  }
};

// Variante 100% pure (sans effets de bord globaux) pour comparaison/diagnostic
const solve_minitab_pure = (costs, supplies, demands) => {
  const m = costs.length;
  const n = m ? costs[0].length : 0;
  if (!m || !n) return [];
  const curSup = supplies.slice();
  const curDem = demands.slice();
  const solution = init_array(costs);
  // builder global list
  const cells = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const c = Number(costs[i][j]);
      cells.push({ i, j, c: isFinite(c) ? c : Infinity });
    }
  }
  cells.sort((a, b) => a.c - b.c);
  for (const cell of cells) {
    const i = cell.i; const j = cell.j;
    if (curSup[i] <= 0 || curDem[j] <= 0) continue;
    const alloc = Math.min(curSup[i], curDem[j]);
    solution[i][j] = alloc;
    curSup[i] -= alloc;
    curDem[j] -= alloc;
  }
  return solution;
};
