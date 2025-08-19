const set_gains = () => {
  const gain = gainMaximum.coefficient;

  // Gérer le pivot symbolique avec epsilon
  if (gain === 'E' || gain === 'ε') {
    perform_symbolic_pivot(gainMaximum.chemin);
    sanitize_base_solution();
    if (is_degenerate_case(noeuds, baseSolutionTable)) {
      add_link(baseSolutionTable, originalTable);
    }
    return;
  }

  const g = Number(gain);
  const path = gainMaximum.chemin;
  const TOLERANCE = 1e-9;

  // 1. Identifier toutes les variables candidates à quitter la base
  // Ce sont les cellules marquées '-' dont la valeur est égale au gain.
  const leavingCandidates = [];
  for (const step of path) {
    if (step.marque === '-') {
      const currentValue = Number(step.value); // Utiliser la valeur snapshotée
      if (Math.abs(currentValue - g) < TOLERANCE) {
        leavingCandidates.push({ ligne: step.ligne, colonne: step.colonne });
      }
    }
  }

  // 2. Appliquer le pivot
  let hasLeft = false; // Drapeau pour s'assurer qu'une seule variable quitte la base
  for (const step of path) {
    const { ligne, colonne, marque } = step;
    const current = baseSolutionTable[ligne][colonne];

    if (marque === '+') {
      // La variable entrante prend la valeur du gain
      if (current === 0 || current === '0' || current === 'E' || current === 'ε') {
        baseSolutionTable[ligne][colonne] = g;
      } else {
        baseSolutionTable[ligne][colonne] = Number(current) + g;
      }
    } else { // marque === '-'
      if (current === 'E' || current === 'ε') {
        continue; // Ne pas modifier une cellule epsilon dans un pivot numérique
      }

      // Vérifier si la cellule est une candidate à la sortie
      const isCandidate = leavingCandidates.some(c => c.ligne === ligne && c.colonne === colonne);

      if (isCandidate) {
        if (!hasLeft) {
          // La première candidate quitte officiellement la base
          baseSolutionTable[ligne][colonne] = 0;
          hasLeft = true;
        } else {
          // Les autres candidates deviennent epsilon pour éviter la dégénérescence
          baseSolutionTable[ligne][colonne] = 'ε';
        }
      } else {
        // Cellule non candidate, soustraire simplement le gain
        baseSolutionTable[ligne][colonne] = Number(current) - g;
      }
    }
  }

  sanitize_base_solution();
  if (is_degenerate_case(noeuds, baseSolutionTable)) {
    add_link(baseSolutionTable, originalTable);
  }
};

const get_gains = () => {
  let pathList = [];
  let maxGainIndex;
  let baseSolutionCopy = baseSolutionTable.map(arr => arr.slice());

  // --- DEBUT BLOC DE DEBOGAGE ---
  const iteration = solution_data.length;
  console.log(`--- Itération ${iteration} ---`);
  console.log("Tableau de solution au début de l'itération:", JSON.parse(JSON.stringify(baseSolutionTable)));
  console.log("Potentiels (u_i, v_j) utilisés:", JSON.parse(JSON.stringify(noeuds)));
  // --- FIN BLOC DE DEBOGAGE ---

  console.log('get gain');
  solution_data = [...solution_data, baseSolutionCopy];

  let result = [];
  const numSources = Number(source_number);
  // Rétablir la logique initiale: on attend que `noeuds` ait m sources suivies de n destinations
  const safeNumSources = isFinite(numSources) && numSources > 0 ? numSources : (Array.isArray(body_id) ? body_id.length : (noeuds ? Math.floor(noeuds.length / 2) : 0));
  for (let i = 0; i < baseSolutionTable.length; i++) {
    for (let j = 0; j < baseSolutionTable[i].length; j++) {
      if (baseSolutionTable[i][j] == 0) {
        const srcNode = noeuds && noeuds[i];
        const destIndex = j + safeNumSources;
        const dstNode = noeuds && noeuds[destIndex];
        if (!srcNode || !dstNode) {
          // Incohérence de construction des noeuds; on saute cette case
          continue;
        }
        // Calcul du coût marginal (potentiel réduit) pour les variables hors base,
        // conformément à la formule standard: δ(i,j) = C(i,j) - u_i - v_j
        let res = Number(originalTable[i][j]) - Number(srcNode.value) - Number(dstNode.value);
        let data = {
          key_1: '',
          key_2: '',
          v_1: '',
          c_: '',
          v_2: '',
          res: '',
          coef: '',
          gain: '',
        };
        data.key_1 = srcNode.key;
        data.key_2 = dstNode.key;
        data.v_1 = Number(srcNode.value);
        data.c_ = Number(originalTable[i][j]);
        data.v_2 = Number(dstNode.value);
        // result.push(data);
        if (res >= 0) {
          data.res = 'P';
          data.coef = '';
          data.gain = '';
        }
        // If there are negative values, calculate gains
        else {
          let path = mark(baseSolutionCopy, i, j);
          let coefficient = get_min_val_index(path);
          data.res = res;
          data.coef = coefficient;
          // Si le coefficient minimal est epsilon, on marque un pivot symbolique
          if (coefficient == 'E' || coefficient == 'ε') {
            pathList.push({
              coefficient: coefficient,
              gain: '-E', // indicateur spécial pour pivot symbolique
              chemin: path,
            });
            data.gain = '-E';
          } else {
            // Sélection désormais basée UNIQUEMENT sur δ (le coût marginal),
            // conformément à la méthode standard (MODI/Stepping Stone).
            // On garde néanmoins le coefficient pour l'étape d'ajustement des flux.
            pathList.push({
              coefficient: coefficient,
              gain: Number(res), // critère de choix: le δ le plus négatif
              chemin: path,
            });
            data.gain = Number(res);
          }
        }
        result.push(data);
      }
    }
  }

  step = [...step, result];
  if (pathList.length > 0) {
    maxGainIndex = get_max_val_index(pathList);
    gainMaximum = pathList[maxGainIndex];

    // --- DEBUT BLOC DE DEBOGAGE ---
    console.log("Cycle d'amélioration choisi (gainMaximum):", JSON.parse(JSON.stringify(gainMaximum)));
    // --- FIN BLOC DE DEBOGAGE ---

    // If best gain is '-E', perform a symbolic pivot to change the basis (degenerate step)
    if (gainMaximum && gainMaximum.gain === '-E') {
      perform_symbolic_pivot(gainMaximum.chemin);
      sanitize_base_solution();
      if (is_degenerate_case(noeuds, baseSolutionTable)) add_link(baseSolutionTable, originalTable);
      return;
    }
    set_gains();
  } else {
    var_init = 1;
    // --- DEBUT BLOC DE DEBOGAGE ---
    console.log("--- Fin de l'optimisation (aucune amélioration trouvée) ---");
    // --- FIN BLOC DE DEBOGAGE ---
  }
};

const mark = (tableau, row, col) => {
  let chemin = [];
  let stop = false;
  let target = 'ligne';
  let data = {
    ligne: row,
    colonne: col,
    value: tableau[row][col],
    marque: '+',
  }; // premier chemin
  let ligneActuel = row;
  let colonneActuel = col;
  chemin.push(data);

  while (!stop) {
    if (target == 'ligne') {
      for (let i = 0; i < tableau.length; i++) {
        if (tableau[i][colonneActuel] != 0 && i != ligneActuel) {
          if (i == row && colonneActuel != col) {
            chemin.push({
              ligne: i,
              colonne: colonneActuel,
              value: tableau[i][colonneActuel],
              marque: '-',
            });
            stop = true; // on sort de la boucle
            break;
          }
          if (is_correct_way_row(tableau, i, colonneActuel, row)) {
            chemin.push({
              ligne: i,
              colonne: colonneActuel,
              value: tableau[i][colonneActuel],
              marque: '-',
            });
            ligneActuel = i;
            target = 'colonne';
          }
        }
      }
    } else {
      for (let j = 0; j < tableau[ligneActuel].length; j++) {
        if (
          j != colonneActuel &&
          tableau[ligneActuel][j] != 0 &&
          is_correct_way_col(tableau, ligneActuel, j, row)
        ) {
          chemin.push({
            ligne: ligneActuel,
            colonne: j,
            value: tableau[ligneActuel][j],
            marque: '+',
          });
          colonneActuel = j;
          target = 'ligne';
        }
      }
    }
  }
  return chemin;
};

// Au cas où on doit, choisir entre différents chemin, cette fonction va nous permettre de trouver le bon pour la colonne
const is_correct_way_col = (table, ligne, colonne, finalRow) => {
  for (let i = 0; i < table.length; i++) {
    // On vérifie si on est déjà de retour à la case depart (on a terminé) ===>>> on verifie si la ligne correspond à la ligne de depart
    if (i == finalRow && table[i][colonne] != 0) return true;
    if (i != ligne && table[i][colonne] != 0)
      if (is_correct_way_row(table, i, colonne, finalRow)) return true;
  }
  return false;
};

// Au cas où on doit, choisir entre différents chemin, cette fonction va nous permettre de trouver le bon pour la ligne
const is_correct_way_row = (table, ligne, colonne, finalRow) => {
  for (let i = 0; i < table[ligne].length; i++) {
    if (i != colonne && table[ligne][i] != 0)
      if (is_correct_way_col(table, ligne, i, finalRow)) return true;
  }
  return false;
};

// Recherche du minimum dans le mark -
const get_min_val_index = (chemin) => {
  // Recherche le minimum parmi les cases marquées '-' ;
  // si l'une d'elles est ε, on renvoie 'E' (ε) pour signaler un déplacement symbolique
  let minimum = null;
  for (let i = 1; i < chemin.length; i++) {
    if (chemin[i].marque !== '-') continue;
    const v = chemin[i].value;
    if (v === 'E' || v === 'ε') return 'E';
    const num = Number(v);
    if (!isFinite(num)) continue;
    if (minimum === null || num < minimum) minimum = num;
  }
  // Si le minimum est 0, c'est un pivot dégénéré: traiter comme 'E' pour échanger la base symboliquement
  if (minimum === 0) return 'E';
  // Par sécurité si aucune valeur valide, on retourne 0 (aucun mouvement)
  return minimum === null ? 0 : minimum;
};

// Choisir l'index du meilleur mouvement selon δ le plus négatif, avec tie-break:
// 1) On privilégie tout mouvement avec gain numérique (δ < 0)
// 2) Parmi les δ minimaux (à tolérance près), on choisit celui qui a le plus grand coefficient
// 3) Sinon, s'il n'existe que des pivots symboliques ('-E'), on retourne le premier '-E'
const get_max_val_index = (liste) => {
  if (!Array.isArray(liste) || liste.length === 0) return 0;
  const TOL = 1e-9;
  let bestIndex = -1;
  let minGain = Infinity;
  let bestCoef = -Infinity;

  for (let i = 0; i < liste.length; i++) {
    const g = Number(liste[i].gain);
    if (!isFinite(g)) continue; // ignore '-E' ici
    const coefNum = Number(liste[i].coefficient);
    if (g < minGain - TOL) {
      // nouveau meilleur δ (plus négatif)
      minGain = g;
      bestCoef = isFinite(coefNum) ? coefNum : -Infinity;
      bestIndex = i;
    } else if (Math.abs(g - minGain) <= TOL) {
      // tie sur δ: choisir le plus grand coefficient autorisé
      const c = isFinite(coefNum) ? coefNum : -Infinity;
      if (c > bestCoef) {
        bestCoef = c;
        bestIndex = i;
      }
    }
  }

  if (bestIndex !== -1) return bestIndex;
  // Aucun gain numérique: retourner le premier '-E' si présent (pivot symbolique)
  for (let i = 0; i < liste.length; i++) if (liste[i].gain === '-E') return i;
  return 0;
};

// Pivot dégénéré correct: choisir une case '-' basique à 0 (ou ε) comme sortante, et la case entrante '+' devient basique à ε
const perform_symbolic_pivot = (chemin) => {
  if (!Array.isArray(chemin) || chemin.length === 0) return;
  // Case entrante: premier élément (marque '+')
  const enter = chemin[0];
  const enterRow = enter.ligne;
  const enterCol = enter.colonne;

  // Choisir la case sortante parmi les positions marquées '-' avec valeur 0 ou ε
  let leave = null;
  for (let k = 1; k < chemin.length; k++) {
    const step = chemin[k];
    if (step.marque !== '-') continue;
    const v = baseSolutionTable[step.ligne][step.colonne];
    if (v === 'E' || v === 'ε' || Number(v) === 0) {
      leave = step;
      break;
    }
  }
  if (!leave) return;

  // Effectuer le pivot dégénéré: la case entrante devient basique à ε, la case sortante quitte la base (0)
  baseSolutionTable[enterRow][enterCol] = 'ε';
  baseSolutionTable[leave.ligne][leave.colonne] = 0;
};

const calculer_z = (data, arr) => {
  let z = 0;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      const x = arr[i][j];
      // Ignorer les cases non basiques marquées epsilon
      if (x === 'E' || x === 'ε') continue;
      const cost = Number(data[i][j]);
      const qty = Number(x);
      if (!isFinite(cost) || !isFinite(qty) || qty === 0) continue;
      z += cost * qty;
    }
  }
  return z;
};

// Nettoie la table de base pour éviter toute apparition de NaN ou de types incohérents
const sanitize_base_solution = () => {
  for (let i = 0; i < baseSolutionTable.length; i++) {
    for (let j = 0; j < baseSolutionTable[i].length; j++) {
      const v = baseSolutionTable[i][j];
      // Conserver explicitement l'epsilon
      if (v === 'E' || v === 'ε') continue;
      // Si une chaîne mélange des 0 et des E/ε quelconques, la normaliser en epsilon pur
      if (typeof v === 'string') {
        const s = v.trim();
        if (s.includes('ε') || s.includes('E')) {
          baseSolutionTable[i][j] = 'ε';
          continue;
        }
      }
      // Coercition numérique robuste
      const n = Number(v);
      if (!isFinite(n) || isNaN(n)) {
        baseSolutionTable[i][j] = 0;
      } else if (n < 0) {
        baseSolutionTable[i][j] = 0;
      } else {
        baseSolutionTable[i][j] = n;
      }
    }
  }
};
