const init_graph_gojs = (id, nodeDataArray, linkDataArray) => {
  // On supprime d'abord son contenu puis on le reajoute pour eviter l'erreur durant la creation du diagram
  $('#tree' + id).html('');
  $('#tree' + id).append(
    '<div id="tree_' + id + '" style="width:100%; height:500px"></div>'
  );

  const $$ = go.GraphObject.make;

  // pallette de couleur
  let colors = {
    blue: '#2a6dc0',
    orange: '#ea2857',
    green: '#75D218',
    greenpath: '#75D218',
    gray: '#5b5b5b',
    white: '#F5F5F5',
    lightsalmon: '#FFA07A',
  };

  // initialisation
  const myDiagram = new go.Diagram('tree_' + id);

  // création de lien
  myDiagram.nodeTemplate = $$(
    go.Node,
    'Auto',
    { locationSpot: go.Spot.Center },
    new go.Binding('location', 'loc', go.Point.parse),
    $$(
      go.Panel,
      $$(go.Shape, 'Circle', {
        fill: 'grey',
        strokeWidth: 0,
        width: 50,
        height: 50,
      }),
      $$(
        go.Panel,
        'Auto',
        $$(go.Shape, 'Circle', { fill: 'white', strokeWidth: 0 }),
        $$(
          go.TextBlock,
          { margin: 0, stroke: 'black', font: 'bold 12px sans-serif' },
          new go.Binding('text', 'value')
        ),
        { alignment: go.Spot.TopLeft }
      )
    ),
    $$(
      go.TextBlock,
      { margin: 3, stroke: 'white', font: 'bold 16px sans-serif' },
      new go.Binding('text', 'key')
    )
  );

  myDiagram.linkTemplate = $$(
    go.Link,
    {
      curve: go.Link.Bezier,
    },
    $$(go.Shape),
    $$(
      go.Panel,
      'Auto',
      $$(go.Shape, { fill: 'white', strokeWidth: 0 }),
      $$(go.TextBlock, { margin: 1 }, new go.Binding('text', 'text')),
      { segmentOffset: new go.Point(0, 0) }
    )
  );
  myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
};

const get_node = () => {
  let array1 = [],
    array2 = []; // pour stocker la valeur des entetes du tableau différement
  let nodeDataArray = [];

  nodeDataArray = get_title(array1, array2);
  noeuds = [...nodeDataArray];

  return nodeDataArray;
};

const set_graph = () => {
  let array1 = [],
    array2 = [];

  get_title(array1, array2);

  let linkDataArray = []; // ce sont les tableaux utilisés par gojs pour rendre la vue
  update_link(baseSolutionTable, get_node(), linkDataArray, array1, array2);

  link_data = [...link_data, linkDataArray];
  z_data = [...z_data, calculer_z(get_base_data(), baseSolutionTable)];
};

const get_link = () => {
  return link_data;
};

const get_z = () => {
  return z_data;
};

const get_data_array = () => {
  return solution_data;
};

const update_link = (
  tab_solution,
  nodeDataArray,
  linkDataArray,
  head_h,
  head_v
) => {
  // Remplir le tableau linkDataArray pour lier les noeuds
  for (let i = 0; i < tab_solution.length; i++) {
    for (let j = 0; j < tab_solution[i].length; j++) {
      const v = tab_solution[i][j];
      // Inclure toutes les variables basiques pour le calcul (numériques > 0 et epsilon)
      const isNumericPositive = typeof v === 'number' && isFinite(v) && v > 0;
      const isEpsilon = v === 'E' || v === 'ε';
      if (isNumericPositive || isEpsilon) {
        let data = { from: '', to: '', text: '', isEps: false };
        data.from = head_h[i].key;
        data.to = head_v[j].key;
        data.text = originalTable[i][j];
        data.isEps = isEpsilon === true;
        linkDataArray.push(data);
      }
    }
  }

  if (linkDataArray.length === 0) {
    // This can happen in a degenerate case where the initial solution is not connected.
    // The main loop should handle this, but we prevent a crash here.
    return;
  }
  let index = get_val_max(linkDataArray); // On recherche le lien possédant la valeur maximale

  let origin = linkDataArray[index].from;
  // Initialisation du point de départ
  for (let i = 0; i < nodeDataArray.length; i++) {
    if (nodeDataArray[i].key == origin) nodeDataArray[i].value = 0;
  }
  // Calculer la valeur de chaque noeud à partir des valeurs des liens
  while (!check_empty_node(nodeDataArray)) {
    // on execute l'algo tant qu'il y a encore des noeuds qui ne possède aucune valeur

    for (let j = 0; j < nodeDataArray.length; j++) {
      // Remplir la destination à l'aide des noeuds sources non null
      if (nodeDataArray[j].type == 'source' && nodeDataArray[j].value != null) {
        for (let k = 0; k < linkDataArray.length; k++) {
          if (linkDataArray[k].from == nodeDataArray[j].key) {
            let val = nodeDataArray[j].value;
            for (let i = 0; i < nodeDataArray.length; i++) {
              if (
                nodeDataArray[i].key == linkDataArray[k].to &&
                nodeDataArray[i].type == 'destination' &&
                nodeDataArray[i].value == null
              ) {
                nodeDataArray[i].value =
                  Number(val) + Number(linkDataArray[k].text);
              }
            }
          }
        }
      }
      // Remplir les noeuds sources à l'aide des noeuds de destinations non null
      if (
        nodeDataArray[j].type == 'destination' &&
        nodeDataArray[j].value != null
      ) {
        for (let k = 0; k < linkDataArray.length; k++) {
          if (
            nodeDataArray[j].key == linkDataArray[k].to &&
            nodeDataArray[j].value != null
          ) {
            let val = nodeDataArray[j].value;
            for (let l = 0; l < nodeDataArray.length; l++) {
              if (
                nodeDataArray[l].key == linkDataArray[k].from &&
                nodeDataArray[l].value == null
              ) {
                nodeDataArray[l].value =
                  Number(val) - Number(linkDataArray[k].text);
              }
            }
          }
        }
      }
    }
  }

  // Normalisation des potentiels pour une meilleure lisibilité du graphe:
  // on force le plus petit potentiel de source (Vx) à 0, en soustrayant
  // la même constante à tous les noeuds (sources et destinations).
  // Cette transformation conserve les égalités v_j = u_i + c_ij et les deltas Δ.
  try {
    const numSources = head_h.length; // même ordre que get_title
    let minSource = Infinity;
    for (let s = 0; s < numSources; s++) {
      const val = Number(nodeDataArray[s].value);
      if (isFinite(val) && val < minSource) minSource = val;
    }
    if (isFinite(minSource) && minSource !== 0) {
      for (let t = 0; t < nodeDataArray.length; t++) {
        const v = Number(nodeDataArray[t].value);
        if (isFinite(v)) nodeDataArray[t].value = v - minSource;
      }
    }
  } catch (e) {
    // en cas d'absence de valeurs numériques (ne devrait pas arriver sur une base connectée), ne rien faire
  }
};

// Receuille la liste des noeuds dans deux tableaux différents
const get_title = (head, body) => {
  let rang1 = 1,
    rang2 = 1;
  // recevoir la première liste des noeuds
  body_id.map((item) => {
    let loc = '50 ' + Number(rang1 * 100);
    let data = { key: item, loc: loc, value: null, type: 'source' };
    head.push(data);
    rang1++;
  });

  // recevoir la deuxième liste des noeuds
  // recevoir la première liste des noeuds
  head_id.map((item) => {
    let loc = '270 ' + Number(rang2 * 70);
    let data = { key: item, loc: loc, value: null, type: 'destination' };
    body.push(data);
    rang2++;
  });
  return head.concat(body);
};

// Verifier si le noeud possède deja une valeur différent de null
const check_empty_node = (tableau) => {
  for (let i = 0; i < tableau.length; i++) {
    if (tableau[i].value == null) return false;
  }
  return true;
};

// Obtenir l'index de la valeur maximum dans le tableau linkDataArray
const get_val_max = (tableau) => {
  let max = 0; //initialisation
  let index = 0;
  for (let i = 0; i < tableau.length; i++) {
    if (max < Number(tableau[i].text)) {
      max = tableau[i].text;
      index = i;
    }
  }
  return index;
};
