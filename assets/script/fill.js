// --- Global variables for table dimensions ---
let head_id = []; // Will store ['1', '2', ...]
let body_id = []; // Will store ['A', 'B', ...]

// --- Event Listeners ---
$(document).ready(function () {
  // Generate table on page load with default values
  $('#generate-table').trigger('click');

  $('#generate-table').on('click', generateTable);
  $('#generate-random').on('click', generateRandomData);
  $('#generate-degenerate').on('click', generateDegenerateData);
  $('#generate-example').on('click', generateExampleData);
});

// --- Core Table Generation Functions ---

/**
 * Generates the entire table structure based on user input.
 */
function generateTable() {
  const numRows = parseInt($('#rows').val());
  const numCols = parseInt($('#cols').val());

  if (isNaN(numRows) || isNaN(numCols) || numRows <= 0 || numCols <= 0) {
    swal('Erreur', 'Veuillez entrer des nombres valides pour les lignes et les colonnes.', 'error');
    return;
  }

  // Clear previous table, results, and overlays
  $('.head-id, .body-id, .foot-id').empty();
  $('#final-solution-container').addClass('hide').empty();
  $('.solution-cost').empty().parent().hide();
  $('.resultat-to-hide').addClass('hide');

  // Generate header and body IDs for internal use
  head_id = Array.from({ length: numCols }, (_, i) => (i + 1).toString());
  body_id = Array.from({ length: numRows }, (_, i) => String.fromCharCode(65 + i));

  // Build and inject the table components
  fill_head(head_id);
  fill_body(body_id, head_id);
  fill_foot(head_id);
}

/**
 * Fills the table header (thead).
 */
function fill_head(columns) {
  let output = '<tr><th></th>'; // Corner cell
  columns.forEach(col => {
    output += `<th>Destination ${col}</th>`;
  });
  output += '<th>Offre</th></tr>';
  $('.head-id').html(output);
}

/**
 * Fills the table body (tbody) with input cells for costs.
 */
function fill_body(rows, columns) {
  let output = '';
  rows.forEach((row, rowIndex) => {
    output += `<tr class="data-row"><td><b>Source ${row}</b></td>`;
    columns.forEach((col, colIndex) => {
      output += `<td><input type='number' required placeholder='Coût' class='form-control content-data' data-row="${rowIndex}" data-col="${colIndex}" /></td>`;
    });
    output += `<td><input type='number' required placeholder='Offre' class='form-control stock_col' /></td>`;
    output += '</tr>';
  });
  $('.body-id').html(output);
}

/**
 * Fills the table footer (tfoot) with input cells for demand.
 */
function fill_foot(columns) {
  let output = '<tr><td><b>Demande</b></td>';
  columns.forEach(col => {
    output += `<td><input type='number' required placeholder='Demande' class='form-control stock_row' /></td>`;
  });
  output += '<td><b id="total-cell"></b></td></tr>'; // Total cell
  $('.foot-id').html(output);
}

/**
 * Fills the generated table with random, balanced data.
 */
function generateRandomData() {
  const numRows = body_id.length;
  const numCols = head_id.length;

  if (numRows === 0 || numCols === 0) {
    swal('Erreur', "Veuillez d'abord générer une matrice.", 'error');
    return;
  }

  $('.content-data').each(function () {
    $(this).val(Math.floor(Math.random() * 99) + 1);
  });

  const total = Math.floor(Math.random() * 50) + 50 * Math.max(numRows, numCols);

  const createPartitions = (n, total) => {
    let partitions = [0, total];
    for (let i = 0; i < n - 1; i++) {
      partitions.push(Math.floor(Math.random() * total));
    }
    partitions.sort((a, b) => a - b);
    let result = [];
    for (let i = 0; i < partitions.length - 1; i++) {
      result.push(partitions[i + 1] - partitions[i]);
    }
    if (result.includes(0)) {
      return createPartitions(n, total);
    }
    return result;
  };

  const supplies = createPartitions(numRows, total);
  const demands = createPartitions(numCols, total);

  $('.stock_col').each(function (i) { $(this).val(supplies[i]); });
  $('.stock_row').each(function (i) { $(this).val(demands[i]); });
  $('#total-cell').text(total);
}

/**
 * Fills the table with random data likely to cause a degenerate case.
 */
function generateDegenerateData() {
  const numRows = body_id.length;
  const numCols = head_id.length;

  if (numRows < 2 || numCols < 2) {
    swal('Erreur', 'Le cas dégénéré nécessite au moins 2 lignes et 2 colonnes.', 'error');
    return;
  }

  // 1) Coûts aléatoires (peuvent être réutilisés sur plusieurs tentatives)
  $('.content-data').each(function () {
    $(this).val(Math.floor(Math.random() * 99) + 1);
  });

  const baseCosts = get_base_data().map(row => row.map(Number));

  // Utilitaire de partition équilibrée sans zéros
  const createPartitions = (n, total) => {
    let partitions = [0, total];
    for (let i = 0; i < n - 1; i++) partitions.push(Math.floor(Math.random() * total));
    partitions.sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < partitions.length - 1; i++) result.push(partitions[i + 1] - partitions[i]);
    return result.includes(0) ? createPartitions(n, total) : result;
  };

  const countPositiveAllocations = (matrix) => {
    let count = 0;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] && matrix[r][c] !== '0' && matrix[r][c] !== 'E' && matrix[r][c] !== 'ε') count++;
      }
    }
    return count;
  };

  // Simulation non-destructive de Balas-Hammer
  const simulateBalasHammer = (costs, suppliesIn, demandsIn) => {
    const supplies = suppliesIn.slice();
    const demands = demandsIn.slice();
    const data = costs.map(row => row.slice());
    const solution = init_array(costs);

    let protection = 0;
    while (supplies.some(s => s > 0) && demands.some(d => d > 0) && protection < 200) {
      const t_data = data.length > 0 && data[0].length > 0 ? data[0].map((_, colIndex) => data.map(row => row[colIndex])) : [];
      if (t_data.length === 0) break;

      const rowPen = min_difference(data, supplies);
      const colPen = min_difference(t_data, demands);
      const maxPenalty = Math.max(...rowPen, ...colPen);
      if (!isFinite(maxPenalty)) break;

      let rIdx, cIdx;
      if (rowPen.includes(maxPenalty)) {
        rIdx = rowPen.indexOf(maxPenalty);
        const rowCosts = get_row(data, rIdx);
        const minCost = Math.min(...rowCosts.filter(v => v !== null));
        cIdx = rowCosts.indexOf(minCost);
      } else {
        cIdx = colPen.indexOf(maxPenalty);
        const colCosts = get_col(data, cIdx);
        const minCost = Math.min(...colCosts.filter(v => v !== null));
        rIdx = colCosts.indexOf(minCost);
      }

      if (rIdx > -1 && cIdx > -1) {
        const alloc = Math.min(supplies[rIdx], demands[cIdx]);
        solution[rIdx][cIdx] = alloc;
        supplies[rIdx] -= alloc;
        demands[cIdx] -= alloc;
        if (supplies[rIdx] === 0) set_row_zero(data, rIdx);
        if (demands[cIdx] === 0) set_col_zero(data, cIdx);
      }
      protection++;
    }

    const m = solution.length;
    const n = solution[0]?.length || 0;
    const nonZero = countPositiveAllocations(solution);
    const isDegenerate = nonZero < (m + n - 1);
    return { solution, isDegenerate };
  };

  // 2) Tenter plusieurs tirages jusqu'à obtenir un cas dégénéré (via simulation BH)
  const maxAttempts = 25;
  let attempt = 0;
  let found = false;

  while (attempt < maxAttempts && !found) {
    const total = Math.floor(Math.random() * 50) + 50 * Math.max(numRows, numCols);
    const supplies = createPartitions(numRows, total);
    const demands = createPartitions(numCols, total);

    const { isDegenerate } = simulateBalasHammer(baseCosts, supplies, demands);
    if (isDegenerate) {
      $('.stock_col').each(function (i) { $(this).val(supplies[i]); });
      $('.stock_row').each(function (i) { $(this).val(demands[i]); });
      $('#total-cell').text(total);
      found = true;
      break;
    }
    attempt++;
  }

  if (found) return;

  // 3) Plan de repli: forcer des égalités répétées (augmente fortement la proba de dégénérescence)
  const s = Math.floor(Math.random() * 40) + 20; // taille bloc
  const suppliesFallback = Array.from({ length: numRows }, () => s);
  let demandsFallback = Array.from({ length: Math.max(1, numCols - 1) }, () => s);
  const totalFallback = suppliesFallback.reduce((a, b) => a + b, 0);
  const lastDemand = Math.max(1, totalFallback - demandsFallback.reduce((a, b) => a + b, 0));
  demandsFallback = demandsFallback.concat([lastDemand]);

  $('.stock_col').each(function (i) { $(this).val(suppliesFallback[i]); });
  $('.stock_row').each(function (i) { $(this).val(demandsFallback[i]); });
  $('#total-cell').text(totalFallback);
}

/**
 * Fills the table with the provided 4x6 example matrix.
 * Costs matrix (rows A..D, cols 1..6), supplies [50,60,20,90], demands [40,30,70,20,40,20].
 */
function generateExampleData() {
  // Ensure table is 4x6
  $('#rows').val(4);
  $('#cols').val(6);
  generateTable();

  const costs = [
    [19, 12, 14, 6, 9, 10],
    [7, 3, 4, 7, 6, 5],
    [6, 5, 9, 11, 3, 11],
    [8, 7, 11, 2, 6, 12],
  ];
  const supplies = [50, 60, 20, 90];
  const demands = [40, 30, 70, 20, 40, 20];

  // Fill costs
  $('.data-row').each(function (rowIndex) {
    $(this)
      .find('.content-data')
      .each(function (colIndex) {
        $(this).val(costs[rowIndex][colIndex]);
      });
  });

  // Fill supplies (offres)
  $('.stock_col').each(function (i) {
    $(this).val(supplies[i]);
  });

  // Fill demands (demandes)
  $('.stock_row').each(function (i) {
    $(this).val(demands[i]);
  });

  // Optional: set total cell if displayed
  const total = supplies.reduce((a, b) => a + b, 0); // should equal sum of demands
  $('#total-cell').text(total);
}

/**
 * Displays the final optimal solution in a separate, clear table.
 */
function displayFinalSolutionTable() {
  const container = $('#final-solution-container');
  container.empty(); // Clear previous table

  const finalSolution = solution_data[solution_data.length - 1];
  const costs = originalTable; // Assumes originalTable is populated globally

  if (!finalSolution || !costs || costs.length === 0) return;

  let output = '<h5>Tableau de la Solution Optimale</h5>';
  output += '<table class="table table-bordered">';

  // Header
  output += '<thead><tr><th></th>';
  head_id.forEach(col => {
    output += `<th>Destination ${col}</th>`;
  });
  output += '</tr></thead>';

  // Body
  output += '<tbody>';
  body_id.forEach((row, rowIndex) => {
    output += `<tr><td><b>Source ${row}</b></td>`;
    head_id.forEach((col, colIndex) => {
      const cost = costs[rowIndex][colIndex];
      const allocation = finalSolution[rowIndex][colIndex];
      let cellContent = `<div class="final-cost">${cost}</div>`;
      // Normaliser l'affectation pour l'affichage: ne jamais afficher de '0'
      const allocIsNaNLike = !isFinite(Number(allocation)) && allocation !== '0' && allocation !== 0 && allocation !== 'E' && allocation !== 'ε';
      const normalized = allocIsNaNLike ? 'ε' : allocation;
      const isEps = normalized === 'E' || normalized === 'ε';
      const isZero = normalized === 0 || normalized === '0' || Number(normalized) === 0;
      const displayAllocation = isEps ? '' : (isZero ? '' : String(normalized));
      if (displayAllocation !== '') {
        cellContent += `<div class="final-allocation">${displayAllocation}</div>`;
      }
      output += `<td>${cellContent}</td>`;
    });
    output += '</tr>';
  });
  output += '</tbody></table>';

  container.html(output).removeClass('hide');

  // Display the final total cost
  const finalCost = z_data[z_data.length - 1];
  if (finalCost !== undefined) {
    $('.solution-cost').html(finalCost.toLocaleString()).parent().show();
  }
}


// --- Result Display Functions (Tabs, Iterations, etc.) ---
// Helper to count strictly positive numeric allocations (excl. ε)
const countPositiveAllocationsOnly = (matrix) => {
  let count = 0;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      const v = matrix[r][c];
      if (v === 'E' || v === 'ε') continue;
      const n = Number(v);
      if (isFinite(n) && n > 0) count++;
    }
  }
  return count;
};
const click = () => {
  $('.tab-link').on('click', function () {
    let tab_id = $(this).attr('data-tab');
    $(this).addClass('active').siblings().removeClass('active');
    $('#tab-' + tab_id)
      .addClass('active')
      .siblings()
      .removeClass('active');
  });
};

const fill_link_tabs = (id) => {
  $(id).html('');
  let output = '';
  const numIterations = solution_data.length;
  for (let i = 0; i < numIterations; i++) {
    let active = i === 0 ? 'active' : '';
    let tabTitle = i === numIterations - 1 ? 'Solution Optimale' : `Itération ${i + 1}`;
    output += `<li class="tab-link ${active}" data-tab="${i}">${tabTitle}</li>`;
  }
  $(id).append(output);
};

const fill_result = (id) => {
  $(id).html(''); // Clear previous results
  let output = '';
  for (let i = 0; i < solution_data.length; i++) {
    let active = i === 0 ? 'active' : '';
    output += `<div id="tab-${i}" class="tab-content ${active}">`;
    output += '<div class="result-container">';

    // Box 1: Solution Table
    output += '<div class="result-box solution-box">';
    let stepTitle;
    if (i === 0) {
      stepTitle = `Solution de base (Méthode: ${current_method_name || '—'})`;
    } else {
      stepTitle = i === solution_data.length - 1 ? 'Solution Optimale' : `Solution d\'étape ${i + 1}`;
    }
    output += `<h5>${stepTitle}</h5>`;
    output += '<div class="table-container-step">';
    output += '<table class="table table-bordered table-step">';
    output += '<thead><tr><th></th>';
    head_id.forEach(item => { output += `<th>Dest. ${item}</th>`; });
    output += '<th>Offre</th></tr></thead><tbody>';
    for (let j = 0; j < solution_data[i].length; j++) {
      output += '<tr>';
      output += `<td><b>Source ${body_id[j]}</b></td>`;
      solution_data[i][j].forEach(value => {
        const isNaNLike = !isFinite(Number(value)) && value !== '0' && value !== 0 && value !== 'E' && value !== 'ε';
        const normalized = isNaNLike ? 'ε' : value;
        const isEps = normalized === 'E' || normalized === 'ε';
        const isZero = normalized === 0 || normalized === '0' || Number(normalized) === 0;
        // Afficher explicitement 'ε' pour les cases basiques dégénérées
        const displayValue = isEps ? 'ε' : (isZero ? '-' : String(normalized));
        let val = `<b>${displayValue}</b>`;
        output += `<td>${val}</td>`;
      });
      output += `<td>${get_data('.stock_col')[j]}</td>`;
      output += '</tr>';
    }
    output += '</tbody><tfoot><tr><td><b>Demande</b></td>';
    get_data('.stock_row').forEach(item => { output += `<td>${item}</td>`; });
    output += '<td></td></tr></tfoot>';
    output += '</table>';
    output += '</div>'; // table-container-step
    output += '</div>';

    // Section supprimée: Construction de la base

    // Box 2: Schema
    output += '<div class="result-box">';
    output += '<h5>Schéma du Cycle</h5>';
    output += `<div id="tree${i}"></div>`;
    output += '</div>';

    // Box 3: Potentials
    if (i < solution_data.length - 1 && step[i] && step[i].length > 0) {
      output += '<div class="result-box">';
      output += '<h5>Calcul des Potentiels</h5>';
      output += `<ul id="listeGains${i}" style="list-style: none; padding: 0; text-align: left;"></ul>`;
      output += '</div>';
    }

    // Box 4: Cost
    output += '<div class="result-box">';
    output += `<h5>Coût de l'étape (Z)</h5>`;
    const zVal = z_data && z_data[i] !== undefined ? z_data[i] : null;
    const zDisplay = (zVal === null) ? '—' : Number(zVal).toLocaleString();
    output += `<span class="form-control">${zDisplay}</span>`;
    output += '</div>';

    // Section supprimée: Comparaison base alternative (MINITAB/Balas)

    // Section supprimée: Indicateurs

    output += '</div></div>';
  }
  $(id).append(output);
};

const fill_tree_result = () => {
  for (let i = 0; i < solution_data.length; i++) {
    // Call the new graph renderer (vis.js) if present, else fallback to GoJS
    if (typeof init_graph === 'function') {
      const cyclePath = typeof cycle_paths_data !== 'undefined' ? cycle_paths_data[i] : null;
      init_graph(i, noeuds, link_data[i], cyclePath);
    } else if (typeof init_graph_gojs === 'function') {
      init_graph_gojs(i, noeuds, link_data[i]);
    }
  }
};

const fill_gains = (id) => {
  for (let i = 0; i < step.length; i++) {
    const gainList = $(`${id}${i}`);
    gainList.empty();
    if (!step[i]) continue;

    let output = '';
    step[i].forEach(item => {
      let itemStyle = '';
      if (item.res !== 'P') {
        itemStyle = 'style="color: var(--danger-color); font-weight: bold;"';
      }
      // Notation mathématique: Δ_{ij} = u_i + c_{ij} − v_j
      const showGain = (item.res !== 'P');
      // L’interface affiche uniquement le signe N/P selon δ; on ne multiplie plus par le coefficient
      const gainText = showGain ? ` :N` : '';
      output += `<li ${itemStyle}>`;
      output += `Δ<sub>${item.key_1},${item.key_2}</sub> = u<sub>${item.key_1}</sub> + c<sub>${item.key_1},${item.key_2}</sub> − v<sub>${item.key_2}</sub> = <b>${item.v_1}</b> + <b>${item.c_}</b> − <b>${item.v_2}</b> = <b>${item.res}</b>${gainText}`;
      output += `</li>`;
    });
    gainList.append(output);
  }
};

// initialiser variable global
const empty_array = () => {
  var_init = 0;
  baseSolutionTable = [];
  originalTable = [];
  solution_data = [];
  link_data = [];
  cycle_paths_data = []; // Holds the cycle path for each iteration
  z_data = [];
  step = [];
  noeuds = [];
  gainMaximum = {};
  // Reset diagnostics/comparaison
  if (typeof base_selection_trace !== 'undefined') base_selection_trace = [];
  if (typeof current_method_name !== 'undefined') current_method_name = '';
  if (typeof compare_other_solution !== 'undefined') compare_other_solution = null;
  if (typeof compare_other_method_label !== 'undefined') compare_other_method_label = '';
};
