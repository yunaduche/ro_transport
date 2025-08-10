const cno = (data, data_stock) => {
  // début prérequis
  let base_data_tmp = [];
  let i = 0; // position de ligne

  source_number = get_data('.stock_col').length;
  console.log('mika')
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
      if (data_stock[0][i] <= data_stock[1][j]) {
        data_test[j] = data_stock[0][i];
        // set stock
        data_stock[1][j] = Number(data_stock[1][j]) - Number(data_stock[0][i]);
        data_stock[0][i] = 0;
        j = data[i].length;
      } else {
        data_test[j] = data_stock[1][j];
        // set stock
        data_stock[0][i] = Number(data_stock[0][i]) - Number(data_stock[1][j]);
        data_stock[1][j] = 0;
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
  // alert(baseSolutionTable);
  originalTable = get_base_data();
};
