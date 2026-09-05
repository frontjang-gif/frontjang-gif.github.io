(() => {
  const form = document.querySelector('#search-form');
  const query = document.querySelector('#query');
  const section = document.querySelector('#section');
  const tag = document.querySelector('#tag-filter');
  const status = document.querySelector('#search-status');
  const results = document.querySelector('#search-results');
  const more = document.querySelector('#more-results');
  const normalize = value => value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase();
  let records = [], matches = [], limit = 40;
  const restore = () => {
    const params = new URLSearchParams(location.search);
    query.value = params.get('q') || '';
    section.value = params.get('section') || '';
    tag.value = params.get('tag') || '';
  };
  function render() {
    results.replaceChildren();
    for (const record of matches.slice(0, limit)) {
      const item = document.createElement('article');
      item.className = 'card';
      const heading = document.createElement('h2');
      const link = document.createElement('a');
      link.href = record.url;
      link.textContent = record.title;
      heading.append(link);
      const detail = document.createElement('p');
      detail.textContent = record.section + ' · ' + record.text.slice(0, 220);
      item.append(heading, detail);
      results.append(item);
    }
    status.textContent = matches.length ? `${matches.length} results · showing ${Math.min(limit, matches.length)}` : 'No results. Try another term or clear the filters.';
    more.hidden = limit >= matches.length;
  }
  function search(updateURL = true) {
    const terms = normalize(query.value.trim()).split(/\s+/).filter(Boolean);
    matches = records.filter(r => (!section.value || r.section === section.value) &&
      (!tag.value || r.tags.includes(tag.value)) && terms.every(term => r.normalized.includes(term)));
    limit = 40;
    if (updateURL) {
      const params = new URLSearchParams();
      if (query.value.trim()) params.set('q', query.value.trim());
      if (section.value) params.set('section', section.value);
      if (tag.value) params.set('tag', tag.value);
      history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''));
    }
    render();
  }
  restore();
  fetch('/search-index.json').then(response => {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.json();
  }).then(data => {
    records = data.map(r => ({...r, normalized: normalize([r.title, r.text, ...r.tags].join(' '))}));
    search(false);
    form.addEventListener('input', () => search());
    form.addEventListener('submit', event => { event.preventDefault(); search(); });
    form.addEventListener('reset', () => setTimeout(() => search(), 0));
    more.addEventListener('click', () => { limit += 40; render(); });
    window.addEventListener('popstate', () => { restore(); search(false); });
  }).catch(() => { status.textContent = 'Search could not load. Reload this page to retry, or browse Tags.'; });
})();
