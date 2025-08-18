/**
 * DEBUT CAS DEGENERER
 */
// Compte le nombre d'arêtes (affectations basiques) strictement non nulles
const count_links = (table) => {
  let linkCount = 0;
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      const v = table[i][j];
      if (v === 'E' || v === 'ε') { linkCount++; continue; }
      const n = Number(v);
      if (isFinite(n) && n > 0) linkCount++;
    }
  }
  return linkCount;
};

// Calcule le nombre total de noeuds = m + n à partir de la table
const total_nodes_from_table = (table) => {
  const m = table.length;
  const n = table[0] ? table[0].length : 0;
  return m + n;
};

// Détermine les composantes connexes du graphe biparti (sources/destinations)
const get_components = (table) => {
  const m = table.length;
  const n = table[0] ? table[0].length : 0;
  const total = m + n;
  const visited = new Array(total).fill(false);

  const neighbors = (idx) => {
    const result = [];
    if (idx < m) {
      // source idx -> destinations où allocation non nulle
      for (let j = 0; j < n; j++) {
        const v = table[idx][j];
        const isEdge = (v === 'E' || v === 'ε') || (isFinite(Number(v)) && Number(v) > 0);
        if (isEdge) result.push(m + j);
      }
    } else {
      // destination (idx-m) -> sources
      const col = idx - m;
      for (let i = 0; i < m; i++) {
        const v = table[i][col];
        const isEdge = (v === 'E' || v === 'ε') || (isFinite(Number(v)) && Number(v) > 0);
        if (isEdge) result.push(i);
      }
    }
    return result;
  };

  const components = [];
  for (let start = 0; start < total; start++) {
    if (visited[start]) continue;
    // BFS/DFS depuis start
    const queue = [start];
    visited[start] = true;
    const comp = [];
    while (queue.length) {
      const v = queue.shift();
      comp.push(v);
      const neigh = neighbors(v);
      for (const u of neigh) {
        if (!visited[u]) {
          visited[u] = true;
          queue.push(u);
        }
      }
    }
    components.push(comp);
  }
  return components;
};

// Dégénérescence (style TRANS):
// vrai si le nombre de variables basiques non nulles (incluant 'ε'/'E') n'est PAS exactement m+n-1
const is_degenerate_case = (_node, table) => {
  const links = count_links(table);
  const totalNodes = total_nodes_from_table(table);
  return links !== totalNodes - 1;
};

// Ajoute des liens 'ε' pour connecter les composantes jusqu'à obtenir un arbre couvrant (m+n-1 liens)
const add_link = (table, originalTable) => {
  const m = table.length;
  const n = table[0] ? table[0].length : 0;

    // Ajout epsilon minimal (style TRANS): pousser jusqu'à m+n-1 liens
  const target = m + n - 1;
  let linksNow = count_links(table);

  // 1) Trouver globalement la case 0 de coût minimal non encore liée
  const zerosByCost = get_zero_cells_sorted_by_cost(table, originalTable);
  for (let k = 0; k < zerosByCost.length && linksNow < target; k++) {
    const { i, j } = zerosByCost[k];
    if (table[i][j] === 0 || table[i][j] === '0') {
      table[i][j] = 'ε';
      linksNow++;
    }
  }

  // 2) Si besoin, couvrir les lignes isolées restantes
  for (let i = 0; i < m && linksNow < target; i++) {
    if (!check_link(table, i)) {
      insert_e_in_line(table, i, originalTable);
      linksNow = count_links(table);
    }
  }
};

// Ajout de l'Epsilon pour pallier le cas dégénéré
const insert_e_in_line = (table, row, originalTable) => {
  // Heuristique: placer ε sur la case de coût minimal de la ligne (comme souvent montré en cours)
  let bestCol = -1;
  let bestCost = Infinity;
  for (let j = 0; j < table[row].length; j++) {
    const v = table[row][j];
    const isZeroLike = v === 0 || v === '0' || v === 'NaN' || (!isFinite(Number(v)) && v !== 'E' && v !== 'ε');
    if (!isZeroLike) continue;
    const cost = Number(originalTable?.[row]?.[j]);
    if (isFinite(cost) && cost < bestCost) {
      bestCost = cost;
      bestCol = j;
    }
  }
  if (bestCol >= 0) {
    table[row][bestCol] = 'ε';
    return;
  }
  // fallback
  for (let j = 0; j < table[row].length; j++) {
    const v = table[row][j];
    if (v === 0 || v === '0' || v === 'NaN' || (!isFinite(Number(v)) && v !== 'E' && v !== 'ε')) {
      table[row][j] = 'ε';
      return;
    }
  }
};

// Retourne toutes les cases 0 triées par coût croissant (global)
const get_zero_cells_sorted_by_cost = (table, costs) => {
  const res = [];
  const m = table.length;
  const n = table[0] ? table[0].length : 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (table[i][j] === 0 || table[i][j] === '0') {
        const c = Number(costs?.[i]?.[j]);
        res.push({ i, j, c: isFinite(c) ? c : Infinity });
      }
    }
  }
  res.sort((a, b) => a.c - b.c);
  return res;
};

// Verifier si cette ligne est en lien avec les autres
const check_link = (table, row) => {
  // Une ligne est liée si au moins une valeur est non nulle sur cette ligne
  for (let j = 0; j < table[row].length; j++) {
    if (table[row][j] !== 0 && table[row][j] !== '0') return true;
  }
  return false;
};
/**
 * FIN CAS DEGENERER
 */
