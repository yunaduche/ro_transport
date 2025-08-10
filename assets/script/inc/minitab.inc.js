const minitab = (data, data_sort, stock_row, stock_col) => {
  // début prérequis
  let base_data_tmp = [];
  let k = 0; // position dans sort
  source_number = get_data('.stock_col').length;
  let data_test = [];
  for (let m = 0; m < data.length; m++) {
    data_test[m] = '0';
  }
  // fin prérequis

  while (k < data_sort.length) {
    let i = 0; // position dans data
    while (i < data.length) {
      // comparaison
      if (data_sort[k] == data[i] && data_test[i] == '0') {
        if (stock_row[position_row(i)] != 0) {
          if (stock_col[position_col(i)] != 0) {
            if (stock_row[position_row(i)] < stock_col[position_col(i)]) {
              data_test[i] = stock_row[position_row(i)];

              stock_col[position_col(i)] =
                Number(stock_col[position_col(i)]) -
                Number(stock_row[position_row(i)]);
              stock_row[position_row(i)] = 0;
            } else {
              data_test[i] = stock_col[position_col(i)];

              stock_row[position_row(i)] =
                Number(stock_row[position_row(i)]) -
                Number(stock_col[position_col(i)]);
              stock_col[position_col(i)] = 0;
            }
            i = data.length;
          } else {
            i++;
          }
        } else {
          i++;
        }
      } else {
        i++;
      }
    }
    k++;
  }

  // diviser data_test en multiple tableau de 6 elements
  data_test.forEach(function (x, y, z) {
    !(y % 6) ? base_data_tmp.push(z.slice(y, y + 6)) : '';
  });

  // cas dégénerer
  if (is_degenerate_case(get_base_stock_concat(), base_data_tmp))
    add_link(base_data_tmp);

  baseSolutionTable = [...base_data_tmp];
  originalTable = get_base_data();
  // fin traitement
};

// position pour stock colonne
const position_col = (index) => {
  return index % 6;
};

// position pour stock ligne
const position_row = (index) => {
  if (index < 6) position = 0;
  else if (index < 12) position = 1;
  else if (index < 18) position = 2;
  else position = 3;
  return position;
};
