// --- Global variables for table dimensions ---
let head_id = []; // Will store ['1', '2', ...]
let body_id = []; // Will store ['A', 'B', ...]

// --- Event Listeners ---
$(document).ready(function () {
  // Generate table on page load with default values
  $('#generate-table').trigger('click');

  $('#generate-table').on('click', generateTable);
  $('#generate-random').on('click', generateRandomData);
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
      if (allocation !== '0' && allocation != 0) {
        cellContent += `<div class="final-allocation">${allocation}</div>`;
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
    let stepTitle = i === solution_data.length - 1 ? 'Solution Optimale' : `Solution d'étape ${i + 1}`;
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
        let val = (value == '0' || value == 0) ? '-' : `<b>${value}</b>`;
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
    output += `<span class="form-control">${z_data[i].toLocaleString()}</span>`;
    output += '</div>';

    output += '</div></div>';
  }
  $(id).append(output);
};

const fill_tree_result = () => {
  for (let i = 0; i < solution_data.length; i++) {
    // Call the new graph renderer (vis.js) if present, else fallback to GoJS
    if (typeof init_graph === 'function') {
      init_graph(i, noeuds, link_data[i]);
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
      let gainCalculation = '';
      let itemStyle = '';
      if (item.res !== 'P') {
        itemStyle = 'style="color: var(--danger-color); font-weight: bold;"';
        gainCalculation = ` => Gain = ${item.res} * ${item.coef} = <b>${item.gain}</b>`;
      }
      output += `<li ${itemStyle}>`;
      output += `G(${item.key_1}, ${item.key_2}) = ${item.v_1} + ${item.c_} - ${item.v_2} = <b>${item.res}</b>`;
      output += gainCalculation;
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
  z_data = [];
  step = [];
  noeuds = [];
  gainMaximum = {};
};
