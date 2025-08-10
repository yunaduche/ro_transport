const set_gains = () => {
  const gain = gainMaximum.coefficient;
  for (let i = 0; i < gainMaximum.chemin.length; i++) {
    let ligne = gainMaximum.chemin[i].ligne;
    let colonne = gainMaximum.chemin[i].colonne;

    if (gainMaximum.chemin[i].marque == '+') {
      if (baseSolutionTable[ligne][colonne] == 'E')
        baseSolutionTable[ligne][colonne] = gain;
      else
        baseSolutionTable[ligne][colonne] =
          Number(baseSolutionTable[ligne][colonne]) + Number(gain);
    } else {
      if (baseSolutionTable[ligne][colonne] != 'E')
        baseSolutionTable[ligne][colonne] =
          Number(baseSolutionTable[ligne][colonne]) - Number(gain);
    }
  }
  console.log('set gain')
  if (is_degenerate_case(noeuds, baseSolutionTable))
    add_link(baseSolutionTable, noeuds);
  // return baseSolutionTable;
};

const get_gains = () => {
  let listChemin = [];
  let indexOfMaximumGain;
  let copieTableBaseSolution = baseSolutionTable.map(function (arr) {
    return arr.slice();
  });
  console.log('get gain')
  solution_data = [...solution_data, copieTableBaseSolution];

  let result = [];
  for (let i = 0; i < baseSolutionTable.length; i++) {
    for (let j = 0; j < baseSolutionTable[i].length; j++) {
      if (baseSolutionTable[i][j] == 0) {
        let resultat =
          Number(noeuds[i].value) +
          Number(originalTable[i][j]) -
          Number(noeuds[j + source_number].value);
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
        data.key_1 = noeuds[i].key;
        data.key_2 = noeuds[j + source_number].key;
        data.v_1 = Number(noeuds[i].value);
        data.c_ = Number(originalTable[i][j]);
        data.v_2 = Number(noeuds[j + source_number].value);
        // result.push(data);
        if (resultat >= 0) {
          data.res = 'P';
          data.coef = '';
          data.gain = '';
        }
        // Si il y a des valeurs négatives, nous allons calculer les gains
        else {
          let chemin = mark(copieTableBaseSolution, i, j);
          let coefficient = get_min_val_index(chemin);
          data.res = resultat;
          data.coef = coefficient;
          // Si c'est égale à Eupsilone
          if (coefficient == 'E') {
            listChemin.push({
              coefficient: coefficient,
              gain: '-E',
              chemin: chemin,
            });
            data.gain = '-E';
          } else {
            listChemin.push({
              coefficient: coefficient,
              gain: (resultat * coefficient).toString(),
              chemin: chemin,
            });
            data.gain = Number(resultat) * Number(coefficient);
          }
        }
        result.push(data);
      }
    }
  }

  step = [...step, result];
  if (listChemin.length > 0) {
    indexOfMaximumGain = get_max_val_index(listChemin);
    gainMaximum = listChemin[indexOfMaximumGain]; // On initialise la variable global gainMaximum
    set_gains();
  } else {
    var_init = 1;
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
  let minimum = chemin[1].value;
  for (let i = 1; i < chemin.length; i++) {
    if (chemin[i].value == 'E' && chemin[i].marque == '-') {
      minimum = chemin[i].value;
    }
    if (
      chemin[i].value != 'E' &&
      chemin[i].value < minimum &&
      chemin[i].marque == '-'
    )
      minimum = chemin[i].value;
  }
  return minimum;
};

//Recherche du gain maximal avant de l'appliquer
const get_max_val_index = (liste) => {
  let max = liste[0].gain;
  let index = 0;
  for (let i = 1; i < liste.length; i++) {
    if (max != '-E' && liste[i].gain != '-E') {
      if (max > liste[i].gain) {
        // on utilise l'operateur > car c'est un nombre negative, alors le maximum de gain sera le plus petit
        max = liste[i].gain;
        index = i;
      }
    }
    if (max == '-E' && liste[i].gain != '-E') {
      // on change la valeur de max par le premier nombre différent de -E
      max = liste[i].gain;
      index = i;
    }
  }
  return index;
};

const calculer_z = (data, arr) => {
  let z = 0;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (arr[i][j] != 'E') z += data[i][j] * arr[i][j];
    }
  }
  return z;
};
