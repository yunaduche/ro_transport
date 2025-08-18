const minico = (data, data_sort, data_stock) => {
  // début prérequis
  let base_data_tmp = [];
  let i = 0; // position de ligne

  source_number = get_data('.stock_col').length;
  // fin prérequis

  //début traitement
  while (i < data.length) {
    let data_test = [];
    for (let n = 0; n < data[i].length; n++) {
      data_test[n] = '0'; // initialisation
    }

    let k = 0; // position dans data_sort
    let j = 0; // position dans base_data

    while (j < data[i].length) {
      // si min dans data_sort est égale à min dans data
      if (data_sort[i][k] == data[i][j] && data_test[j] == '0') {
        // si stock row différent de 0
        if (data_stock[0][i] != 0) {
          // si stock row supérieur à stock col
          if (data_stock[0][i] <= data_stock[1][j]) {
            // affectation du résultat
            data_test[j] = data_stock[0][i];

            // set stock
            data_stock[1][j] =
              Number(data_stock[1][j]) - Number(data_stock[0][i]);
            data_stock[0][i] = 0;
            j = data[i].length;
          } else {
            // affectation du resultat
            data_test[j] = data_stock[1][j];

            // set stock
            data_stock[0][i] =
              Number(data_stock[0][i]) - Number(data_stock[1][j]);
            data_stock[1][j] = 0;
            k++;
            j = 0;
          }
        } else {
          j = data[i].length;
        }
      } else {
        j++;
      }
    }
    base_data_tmp = [...base_data_tmp, data_test];
    i++;
  }

  let tmp_solution = base_data_tmp[0].map((_, colIndex) =>
    base_data_tmp.map((row) => row[colIndex])
  );
  // cas dégénerer
  if (is_degenerate_case(get_base_stock_concat(), tmp_solution))
    add_link(tmp_solution, get_base_data());

  baseSolutionTable = [...tmp_solution];
  // alert(baseSolutionTable);
  originalTable = get_base_data();

  // fin traitement
};

/**
 * get_data_col
 * @returns
 */
const get_base_data_col = () => {
  let array = [];
  let array_get_data = ['.1', '.2', '.3', '.4', '.5', '.6'];

  array_get_data.map((item) => {
    array = [...array, get_data(item)];
  });
  return array;
};

/**
 * get_data_col
 * @returns
 */
const get_base_data_col_sort = () => {
  let array = [];
  let array_get_data = ['.1', '.2', '.3', '.4', '.5', '.6'];

  array_get_data.map((item) => {
    array = [
      ...array,
      get_data(item).sort(function (a, b) {
        return a - b;
      }),
    ];
  });
  return array;
};

/**
 * get data stock col
 * @param {*} id
 */
const get_base_stock_col = () => {
  let array = [];
  let array_get_stock = ['.stock_row', '.stock_col'];
  array_get_stock.map((key) => {
    array = [...array, get_data(key)];
  });
  return array;
};
