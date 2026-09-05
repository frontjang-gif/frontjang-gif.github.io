(() => {
  const storageKey = 'pelican-tree-state-v1';
  let saved = {};
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) saved = value;
  } catch (_) { /* Navigation still works when storage is unavailable. */ }
  document.querySelectorAll('aside details, .browse-tree details').forEach(folder => {
    const link = folder.querySelector(':scope > summary > a');
    if (!link && !folder.dataset.treeKey) return;
    // URL identifies a branch consistently across pages and both tree views.
    const key = link ? link.pathname : folder.dataset.treeKey;
    if (typeof saved[key] === 'boolean') folder.open = saved[key];
    folder.addEventListener('toggle', () => {
      if (saved[key] === folder.open) return;
      saved[key] = folder.open;
      try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch (_) {}
      document.querySelectorAll('aside details, .browse-tree details').forEach(other => {
        const otherLink = other.querySelector(':scope > summary > a');
        if (other !== folder && (otherLink ? otherLink.pathname : other.dataset.treeKey) === key) other.open = folder.open;
      });
    });
  });
  const sidebar = document.querySelector('aside');
  sidebar.querySelectorAll('a').forEach(link => {
    const target = decodeURI(link.pathname);
    const current = decodeURI(location.pathname);
    if (target === current) link.setAttribute('aria-current', 'page');
  });
})();
