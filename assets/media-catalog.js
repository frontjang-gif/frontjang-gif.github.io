(function () {
  'use strict';

  function valuesFor(item, field) {
    var value = item[field];
    if (value === null || typeof value === 'undefined' || value === '') return [];
    return Array.isArray(value) ? value.map(String) : [String(value)];
  }

  function normalized(value) {
    return String(value || '').toLocaleLowerCase();
  }

  function initialize(list) {
    var kind = list.dataset.catalog;
    var controls = document.querySelector('[data-catalog-controls="' + kind + '"]');
    if (!controls) return;

    fetch(list.dataset.catalogUrl)
      .then(function (response) {
        if (!response.ok) throw new Error('Catalog request failed');
        return response.json();
      })
      .then(function (payload) {
        var items = payload[kind] || [];
        var byUrl = {};
        items.forEach(function (item) { byUrl[decodeURIComponent(item.url)] = item; });

        var cards = Array.from(list.querySelectorAll('.post-card')).map(function (card) {
          var item = byUrl[decodeURIComponent(card.dataset.postUrl)];
          return item ? { card: card, item: item } : null;
        }).filter(Boolean);

        controls.querySelectorAll('select[data-filter]').forEach(function (select) {
          var field = select.dataset.filter;
          var options = [];
          items.forEach(function (item) { options = options.concat(valuesFor(item, field)); });
          options = options.filter(function (value, index, all) { return all.indexOf(value) === index; });
          options.sort(function (left, right) {
            if (field === 'rating') return Number(right) - Number(left);
            if (field === 'decade') return right.localeCompare(left);
            return left.localeCompare(right);
          });
          options.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
          });
        });

        var params = new URLSearchParams(window.location.search);
        controls.querySelectorAll('[data-filter]').forEach(function (control) {
          if (params.has(control.dataset.filter)) control.value = params.get(control.dataset.filter);
        });

        function applyFilters() {
          var active = {};
          controls.querySelectorAll('[data-filter]').forEach(function (control) {
            active[control.dataset.filter] = control.value.trim();
          });

          var shown = 0;
          cards.forEach(function (entry) {
            var searchable = normalized(Object.keys(entry.item).map(function (key) {
              return valuesFor(entry.item, key).join(' ');
            }).join(' '));
            var matches = Object.keys(active).every(function (field) {
              var expected = active[field];
              if (!expected) return true;
              if (field === 'query') return searchable.indexOf(normalized(expected)) !== -1;
              return valuesFor(entry.item, field).indexOf(expected) !== -1;
            });
            entry.card.hidden = !matches;
            if (matches) shown += 1;
          });

          controls.querySelector('.media-catalog-status').textContent = shown + ' of ' + cards.length;
          var nextParams = new URLSearchParams();
          Object.keys(active).forEach(function (field) {
            if (active[field]) nextParams.set(field, active[field]);
          });
          var query = nextParams.toString();
          history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
        }

        controls.addEventListener('input', applyFilters);
        controls.addEventListener('change', applyFilters);
        controls.querySelector('[data-filter-reset]').addEventListener('click', function () {
          controls.querySelectorAll('[data-filter]').forEach(function (control) { control.value = ''; });
          applyFilters();
        });
        applyFilters();
      })
      .catch(function () {
        controls.querySelector('.media-catalog-status').textContent = 'Filters are unavailable; showing all items.';
      });
  }

  document.querySelectorAll('.media-catalog[data-catalog]').forEach(initialize);
}());
