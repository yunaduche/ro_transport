const balas_hammer = (stock_col_str, stock_row_str, base_data_str) => {
  // 1. Convert all string inputs to numbers immediately.
  const base_data = base_data_str.map(row => row.map(Number));
  const stock_col = stock_col_str.map(Number);
  const stock_row = stock_row_str.map(Number);

  // Create copies for internal mutation
  const current_stock_col = [...stock_col];
  const current_stock_row = [...stock_row];
  let data = base_data.map(arr => arr.slice());
  let data_init = init_array(base_data);

  source_number = stock_col.length;
  if (typeof base_selection_trace !== 'undefined') base_selection_trace = [];

  let protection = 0; // Avoid infinite loops
  while (current_stock_col.some(s => s > 0) && current_stock_row.some(d => d > 0) && protection < 100) {
    // Ensure data is not empty before transposing
    let t_data = data.length > 0 && data[0].length > 0 ? data[0].map((_, colIndex) => data.map(row => row[colIndex])) : [];
    if (t_data.length === 0) break;

    let row_penalties = min_difference(data, current_stock_col);
    let col_penalties = min_difference(t_data, current_stock_row);
    
    let max_penalty = Math.max(...row_penalties, ...col_penalties);

    if (max_penalty === -Infinity) break; // No more valid moves

    let indexRow, indexCol;

    if (row_penalties.includes(max_penalty)) {
        indexRow = row_penalties.indexOf(max_penalty);
        let row_costs = get_row(data, indexRow);
        let min_cost_in_row = Math.min(...row_costs.filter(cost => cost !== null));
        indexCol = row_costs.indexOf(min_cost_in_row);
    } else {
        indexCol = col_penalties.indexOf(max_penalty);
        let col_costs = get_col(data, indexCol);
        let min_cost_in_col = Math.min(...col_costs.filter(cost => cost !== null));
        indexRow = col_costs.indexOf(min_cost_in_col);
    }
    
    if (indexRow > -1 && indexCol > -1) {
        let allocation = Math.min(current_stock_col[indexRow], current_stock_row[indexCol]);
        data_init[indexRow][indexCol] = allocation;
        
        current_stock_col[indexRow] -= allocation;
        current_stock_row[indexCol] -= allocation;

        if (typeof base_selection_trace !== 'undefined') {
          const cost = (data && data[indexRow]) ? data[indexRow][indexCol] : null;
          base_selection_trace.push({ method: 'BALAS-HAMMER', i: indexRow, j: indexCol, cost, alloc: allocation });
        }

        if (current_stock_col[indexRow] === 0) {
            set_row_zero(data, indexRow);
        }
        if (current_stock_row[indexCol] === 0) {
            set_col_zero(data, indexCol);
        }
    }
    protection++;
  }

  if (is_degenerate_case(stock_col.concat(stock_row), data_init)) {
    add_link(data_init, base_data);
  }

  baseSolutionTable = data_init;
  originalTable = base_data;
};

// Variante pure BH pour comparaison/diagnostic (sans variables globales)
const solve_balas_hammer_pure = (base_data, suppliesIn, demandsIn) => {
  const data = base_data.map(arr => arr.slice());
  const supplies = suppliesIn.slice();
  const demands = demandsIn.slice();
  const solution = init_array(base_data);
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
  return solution;
};

const min_difference = (data, stock) => {
  let penalties = [];
  for (let i = 0; i < stock.length; i++) {
    if (stock[i] > 0) {
      const valid_costs = data[i] ? data[i].filter(cost => cost !== null) : [];
      if (valid_costs.length >= 2) {
        let min1 = Math.min(...valid_costs);
        const remaining_costs = valid_costs.filter(cost => cost > min1);
        let min2 = remaining_costs.length > 0 ? Math.min(...remaining_costs) : min1;
        penalties.push(min2 - min1);
      } else if (valid_costs.length === 1) {
        penalties.push(valid_costs[0]);
      } else {
        penalties.push(-Infinity);
      }
    } else {
      penalties.push(-Infinity);
    }
  }
  return penalties;
};

const get_max = (arr1, arr2) => {
    const max1 = Math.max(...arr1.filter(isFinite));
    const max2 = Math.max(...arr2.filter(isFinite));
    return Math.max(max1, max2);
}

const get_max_index = (arr) => {
  let max = -Infinity;
  let maxIndex = -1;
  for(let i=0; i < arr.length; i++) {
      if(isFinite(arr[i]) && arr[i] > max) {
          max = arr[i];
          maxIndex = i;
      }
  }
  return maxIndex;
};

const set_col_zero = (data, index) => {
  for (let i = 0; i < data.length; i++) {
    if(data[i]) data[i][index] = null;
  }
};

const set_row_zero = (data, index) => {
    if(data[index]) {
        for (let i = 0; i < data[index].length; i++) {
            data[index][i] = null;
        }
    }
};

const get_col = (matrice, col) => {
  let column = [];
  for (let i = 0; i < matrice.length; i++) {
    if (matrice[i]) column.push(matrice[i][col]);
  }
  return column;
};

const get_row = (matrice, row) => {
  return matrice[row];
};
