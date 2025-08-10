/**
 * DEBUT CAS DEGENERER
 */
const is_degenerate_case = (node, table) => {
  let link_number = 0;
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      if (table[i][j] != 0) link_number++;
    }
  }
  return link_number != node.length - Number(1);
};

const add_link = (table) => {
  for (let k = 0; k < source_number; k++) {
    for (let i = 0; i < table.length; i++) {
      if (k == i && !check_link(table, i)) {
        insert_e_in_line(table, i);
        return;
      }
    }
  }
};

// Ajout de l'Eupsilon pour pallier le cas dégénéré
const insert_e_in_line = (table, row) => {
  for (let j = 0; j < table[row].length; j++) {
    if (table[row][j] == 0) {
      table[row][j] = 'E';
      return;
    }
  }
};

// Verifier si cette ligne est en lien avec les autres
const check_link = (table, row) => {
  for (let j = 0; j < table[row].length; j++) {
    if (table[row][j] != 0) {
      for (let i = 0; i < table.length; i++) {
        if (table[i][j] != 0) {
          for (let k = 0; k < table.length; k++) {
            if (k != row && table[k][j] != 0) return true;
          }
        }
      }
    }
  }
  return false;
};
/**
 * FIN CAS DEGENERER
 */
