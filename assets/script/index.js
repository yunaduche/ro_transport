let noeuds = []; // copie de la variables nodeDataArray
let gainMaximum = {};
let baseSolutionTable = []; // copie de la solution de base
let originalTable = []; // copie de la table original
let source_number; // nombre des colonnes sources
let solution_data = []; // array pour toutes kes solutions de base
let link_data = []; // array pour tous les linkArrayData pour le schéma
let z_data = []; // array pour chaque z
let step = []; // array pour tous les gains de chaque itération
let var_init = 0;
let cycle_paths_data = []; // chemin de cycle par itération pour la mise en évidence
let current_method_name = '';
let base_selection_trace = [];
let compare_other_method_label = '';
let compare_other_solution = null;

$('.submit').on('click', () => {
  empty_array();

  let methode;
  const methodVal = $('.method').val();
  console.log('Valeur de la méthode sélectionnée :', methodVal);

  // Assign the correct solving function without executing it
  if (methodVal == 2) {
    methode = () => balas_hammer(get_data('.stock_col'), get_data('.stock_row'), get_base_data());
  } else if (methodVal == 5) {
    // Activer réellement la méthode MINITAB (générique)
    const base = get_base_data();
    const costsFlat = base.flat().map(Number);
    const stocks = get_base_stock();
    const supplies = (stocks && stocks[0]) ? stocks[0].map(Number) : [];
    const demands = (stocks && stocks[1]) ? stocks[1].map(Number) : [];
    methode = () => minitab_generic(costsFlat, base.length, base[0]?.length || 0, supplies, demands);
  } else {
    // fallback par défaut
    methode = () => balas_hammer(get_data('.stock_col'), get_data('.stock_row'), get_base_data());
  }

  const methodName = $('.method option:selected').text();
  current_method_name = methodName;

  // Lancer la résolution directement sans modale de confirmation
  methode();

  // Calculer en parallèle une base de comparaison (méthode alternative pure) pour mettre en évidence les différences
  try {
    const baseCosts = get_base_data().map(row => row.map(Number));
    const stocks = get_base_stock();
    const supplies = (stocks && stocks[0]) ? stocks[0].map(Number) : [];
    const demands = (stocks && stocks[1]) ? stocks[1].map(Number) : [];
    if (current_method_name.toLowerCase().includes('minitab')) {
      if (typeof solve_balas_hammer_pure === 'function') {
        compare_other_solution = solve_balas_hammer_pure(baseCosts, supplies, demands);
        compare_other_method_label = 'Balas Hammer';
      }
    } else if (current_method_name.toLowerCase().includes('balas')) {
      if (typeof solve_minitab_pure === 'function') {
        compare_other_solution = solve_minitab_pure(baseCosts, supplies, demands);
        compare_other_method_label = 'MINITAB';
      }
    } else {
      compare_other_solution = null;
      compare_other_method_label = '';
    }
  } catch (e) {
    compare_other_solution = null;
    compare_other_method_label = '';
  }

  // Sécuriser immédiatement la base contre la dégénérescence
  get_node(); // initialise 'noeuds'
  if (is_degenerate_case(noeuds, baseSolutionTable)) {
    add_link(baseSolutionTable, originalTable);
  }
  // snapshot propre comme première itération
  solution_data = [JSON.parse(JSON.stringify(baseSolutionTable))];

  $('.resultat-to-hide').removeClass('hide');

      while (var_init == 0) {
        // Ajoute le graphe d'allocation de l'étape (potentiels calculés à l'intérieur)
        set_graph();

        // Calculer les gains et déterminer le cycle d'amélioration
        get_gains();

        if (gainMaximum && gainMaximum.chemin && gainMaximum.chemin.length > 0) {
          // Mémoriser le chemin de cycle pour l'affichage (superposition sur le graphe d'allocation)
          cycle_paths_data.push(gainMaximum.chemin);
        } else {
          // Étape finale (pas de cycle)
          cycle_paths_data.push(null);
        }

        // Reset pour itération suivante
        gainMaximum = {};
      }

  // Clear and fill result containers
  $('.tabs').empty();
  $('.content-wrapper').empty();

  // S'assurer que la dernière solution (optimale) possède bien son graphe et son Z
  if (link_data.length < solution_data.length) {
    set_graph();
  }

  fill_link_tabs('.tabs');
  fill_result('.content-wrapper');
  fill_tree_result();
  fill_gains('#listeGains');
  // Log interne: trace de la construction de la base pour vérifier la méthode sélectionnée
  if (Array.isArray(base_selection_trace) && base_selection_trace.length > 0) {
    const debug = base_selection_trace
      .map((e, idx) => `${idx + 1}) ${e.method} -> (${e.i + 1},${e.j + 1}) coût=${e.cost}, alloc=${e.alloc}`)
      .join('\n');
    console.log('[TRACE BASE]', current_method_name, '\n' + debug);
  }
  click(); // Re-bind tab click events
  displayFinalSolutionTable(); // Display the final solution in a separate table
});

