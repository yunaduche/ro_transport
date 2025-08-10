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

$('.submit').on('click', () => {
  empty_array();

  let methode;
  const methodVal = $('.method').val();

  // Assign the correct solving function without executing it
  if (methodVal == 1) {
    methode = () => minili(get_base_data(), get_base_data_sort(), get_base_stock());
  } else if (methodVal == 2) {
    methode = () => balas_hammer(get_data('.stock_col'), get_data('.stock_row'), get_base_data());
  } else if (methodVal == 3) {
    methode = () => cno(get_base_data(), get_base_stock());
  } else if (methodVal == 4) {
    methode = () => minico(get_base_data(), get_base_data_sort(), get_base_stock());
  } else {
    methode = () => minitab(get_base_data(), get_base_data_sort(), get_base_stock());
  }

  const methodName = $('.method option:selected').text();

  swal({
    title: `Lancer la résolution ?`,
    text: `Vous allez utiliser la méthode : ${methodName}.`,
    icon: 'info',
    buttons: {
      cancel: {
        text: 'Annuler',
        value: null,
        visible: true,
      },
      confirm: {
        text: 'Oui, lancer',
        value: true,
        visible: true,
        className: 'btn-success',
      },
    },
  }).then(function (isConfirm) {
    if (isConfirm) {
      methode(); // Execute the selected method
      $('.resultat-to-hide').removeClass('hide');

      while (var_init == 0) {
        set_graph();
        get_gains();
      }

      // Clear and fill result containers
      $('.tabs').empty();
      $('.content-wrapper').empty();

      fill_link_tabs('.tabs');
      fill_result('.content-wrapper');
      fill_tree_result();
      fill_gains('#listeGains');
      click(); // Re-bind tab click events
      displayFinalSolutionTable(); // Display the final solution in a separate table

      swal({
        icon: 'success',
        title: 'Succès !',
        text: 'La résolution est terminée.',
      });
    } else {
      // User clicked "Annuler", do nothing or just close the dialog
      swal.close();
    }
  });
});
