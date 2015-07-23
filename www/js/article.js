$(function() {
  window.appendTrDom = function() {
    var table = $('.content_sortable-content table');
    var theadTr = $(table).find('thead tr');
    var rows = $(table).find('tr');

    for(var i = rows.length - 1; i > 1; i--) {
      $(rows[i]).before('<tr class="copy">' + $(theadTr).html() +  '</tr>');
    }

  }
});
