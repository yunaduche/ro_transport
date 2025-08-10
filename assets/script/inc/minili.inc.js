const minili = (data, data_sort, data_stock) => {
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

  // cas dégénerer
  if (is_degenerate_case(get_base_stock_concat(), base_data_tmp))
    add_link(base_data_tmp);

  baseSolutionTable = [...base_data_tmp];
  originalTable = get_base_data();

  // fin traitement
};

const index_of = (element, data) => {
  let index = data.indexOf(element.toString());
  return index;
};
