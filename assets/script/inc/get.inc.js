/**
 * DEBUT GET DATA
 */

// get item
const get_item = (id, position) => {
  let inputs = $(id);
  let i = 0;
  while (i != position) {
    i++;
  }
  return $(inputs[i]).val();
};

/**
 * get data global
 * @param {*} id
 */
const get_data = (id) => {
  let inputs = $(id);
  let resultat = [];
  for (let i = 0; i < inputs.length; i++) {
    resultat = [...resultat, $(inputs[i]).val()];
  }
  return resultat;
};

/**
 * get data sort utile pour min algorithme
 * @param {*} id
 */
const get_data_sort = (id) => {
  let inputs = $(id);
  let resultat = [];
  for (let i = 0; i < inputs.length; i++) {
    resultat = [...resultat, $(inputs[i]).val()];
  }
  resultat.sort(function (a, b) {
    return a - b;
  });
  return resultat;
};

/**
 * get data stock
 * @param {*} id
 */
const get_base_stock = () => {
  let array = [];
  let array_get_stock = ['.stock_col', '.stock_row'];
  array_get_stock.map((key) => {
    array = [...array, get_data(key)];
  });
  return array;
};

/**
 * get data stock
 * @param {*} id
 */
const get_base_stock_concat = () => {
  let array = [];
  let array_get_stock = ['.stock'];
  array_get_stock.map((key) => {
    array = [...array, get_data(key)];
  });
  return array;
};

/**
 * get base data
 * Dynamically reads the cost matrix from the table.
 * @returns {Array<Array<string>>} A 2D array representing the cost matrix.
 */
const get_base_data = () => {
  const matrix = [];
  // Iterate over each table row that contains data
  $('.data-row').each(function () {
    const row = [];
    // Find all cost inputs within the current row and get their values
    $(this)
      .find('.content-data')
      .each(function () {
        row.push($(this).val());
      });
    matrix.push(row);
  });
  return matrix;
};

/**
 * get base data sort
 * Dynamically reads and sorts the cost matrix from the table.
 * @returns {Array<Array<string>>} A 2D array with each row's costs sorted.
 */
const get_base_data_sort = () => {
  const matrix = [];
  $('.data-row').each(function () {
    const row = [];
    $(this)
      .find('.content-data')
      .each(function () {
        row.push($(this).val());
      });
    // Sort the collected row before pushing it to the matrix
    row.sort((a, b) => Number(a) - Number(b));
    matrix.push(row);
  });
  return matrix;
};

const init_array = (array) => {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    var tmp_result = [];
    for (var j = 0; j < array[i].length; j++) {
      tmp_result[j] = 0;
    }
    result.push(tmp_result);
  }
  return result;
};

/**
 * FIN GET DATA
 */
