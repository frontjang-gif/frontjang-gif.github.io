document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-layout]").forEach(el=>{
    const tpl=document.querySelector(`template[data-name="${el.dataset.layout}"]`);
    if(tpl)el.prepend(tpl.content.cloneNode(true));
    const pn=el.id.replace("page-","");
    el.querySelectorAll("span").forEach(s=>{if(s.textContent.includes("{{PAGENUM}}"))s.textContent=s.textContent.replace("{{PAGENUM}}",pn);});
  });
});
</script>
  <script>
/* Office Reader - Slide Viewer with Left Sidebar */
document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".or-page");
  const extras = document.querySelectorAll("div.or-extra");
  if (!pages.length) return;

  // --- Left Sidebar ---
  let tocWidth = parseInt(localStorage.getItem("or-toc-width") || "200");
  const sidebar = document.createElement("div");
  sidebar.id = "or-sidebar";
  sidebar.style.cssText = `position:fixed;top:0;left:0;bottom:0;width:${tocWidth}px;background:#f5f5f5;border-right:1px solid #ddd;z-index:9998;display:flex;flex-direction:column;font:11px sans-serif;`;
  document.body.appendChild(sidebar);
  document.body.style.marginLeft = "0";
  // Wrap pages in a content area with horizontal scroll
  const contentArea = document.createElement("div");
  contentArea.id = "or-content";
  contentArea.style.cssText = `overflow:auto;position:fixed;top:0;bottom:24px;left:${tocWidth}px;right:0;display:grid;place-items:safe center;`;
  // Move all .or-page elements into contentArea
  const pageParent = pages[0].parentElement;
  const zoomWrapper = document.createElement("div");
  zoomWrapper.style.cssText = "display:flex;flex-wrap:wrap;justify-content:center;padding:20px;gap:20px;min-width:fit-content;";
  // Only move .or-page and .or-extra elements
  pages.forEach(p => {
    // Move any or-extra siblings that follow this page (they're actually children)
    zoomWrapper.appendChild(p);
  });
  contentArea.appendChild(zoomWrapper);
  pageParent.appendChild(contentArea);

  // --- Tab Bar ---
  const tabBar = document.createElement("div");
  tabBar.style.cssText = "display:flex;border-bottom:1px solid #ddd;background:#eee;flex-shrink:0;";
  const tabs = ["☰", "🖼", "☰🖼", "📊", "📁"];
  const tabLabels = ["List", "Thumbnails", "Both", "Status", "Resources"];
  let activeTab = localStorage.getItem("or-toc-mode") || "0";
  tabs.forEach((icon, i) => {
    const t = document.createElement("button");
    t.textContent = icon;
    t.title = tabLabels[i];
    t.style.cssText = "flex:1;border:none;padding:6px;cursor:pointer;font-size:13px;background:" + (i == activeTab ? "#fff" : "#eee") + ";border-bottom:" + (i == activeTab ? "2px solid #0082F0" : "2px solid transparent") + ";";
    t.onclick = () => { activeTab = i; localStorage.setItem("or-toc-mode", i); tabs.forEach((_, j) => { tabBar.children[j].style.background = j == i ? "#fff" : "#eee"; tabBar.children[j].style.borderBottom = j == i ? "2px solid #0082F0" : "2px solid transparent"; }); renderToc(); };
    tabBar.appendChild(t);
  });
  sidebar.appendChild(tabBar);

  // --- Slide Info (in bottom bar) ---
  const info = { textContent: "", dataset: {} }; // dummy, actual display in barInfo

  // --- TOC Content ---
  const searchBox = document.createElement("input");
  searchBox.type = "text";
  searchBox.placeholder = "Search slides...";
  searchBox.style.cssText = "width:100%;box-sizing:border-box;padding:4px 6px;border:1px solid #ccc;border-radius:3px;font-size:11px;margin-bottom:4px;flex-shrink:0;";
  searchBox.oninput = () => { highlightSearch(); renderToc(); };
  function highlightSearch() {
    // Remove old highlights
    document.querySelectorAll("mark.or-hl").forEach(m => { const t = document.createTextNode(m.textContent); m.parentNode.replaceChild(t, m); });
    // Normalize text nodes after removing marks
    pages.forEach(p => p.normalize());
    const q = searchBox.value.trim();
    if (!q) return;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    pages.forEach(p => {
      // Find all leaf text containers (spans, tds, divs with direct text)
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(n => {
        if (!n.textContent.toLowerCase().includes(q.toLowerCase())) return;
        const re = new RegExp(`(${escaped})`, 'gi');
        const replaced = n.textContent.replace(re, '<mark class="or-hl" style="background:#00e5ff;padding:0 1px;">$1</mark>');
        if (replaced !== n.textContent) {
          const span = document.createElement("span");
          span.innerHTML = replaced;
          n.parentNode.replaceChild(span, n);
        }
      });
    });
  }
  sidebar.appendChild(searchBox);
  const tocContent = document.createElement("div");
  tocContent.style.cssText = "flex:1;overflow-y:scroll;overflow-x:hidden;padding:0;";
  sidebar.appendChild(tocContent);

  // --- Drag Resize ---
  const handle = document.createElement("div");
  handle.style.cssText = `position:fixed;top:0;bottom:0;width:5px;cursor:col-resize;z-index:9999;left:${tocWidth}px;`;
  document.body.appendChild(handle);
  let dragging = false;
  let dragTimer = null;
  handle.addEventListener("mousedown", (e) => { dragging = true; e.preventDefault(); });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    tocWidth = Math.max(120, Math.min(500, e.clientX));
    sidebar.style.width = tocWidth + "px";
    handle.style.left = tocWidth + "px";
    document.body.style.marginLeft = "0";
    contentArea.style.left = tocWidth + "px";
    if (typeof bar !== 'undefined') bar.style.left = tocWidth + "px";
    if (fitMode) { const pw = slidePw; const leftW = tocWidth; const rightW = rSidebarOpen ? parseInt(rSidebar.style.width) : 0; const avail = window.innerWidth - leftW - rightW - 40; zoom = Math.round(avail / pw * 100); applyZoom(); }
    // Quick resize: just update visible thumbnail container widths
    if (activeTab == 1 || activeTab == 2) {
      const w = activeTab == 1 ? tocContent.clientWidth : 60;
      const tocRect = tocContent.getBoundingClientRect();
      tocContent.querySelectorAll(".or-thumb").forEach(t => {
        const r = t.getBoundingClientRect();
        if (r.bottom < tocRect.top || r.top > tocRect.bottom) return;
        const rect = pages[0].getBoundingClientRect();
        const scale = w / rect.width;
        t.style.width = w + "px";
        t.style.height = (rect.height * scale) + "px";
        if (t.firstChild) t.firstChild.style.transform = `scale(${scale})`;
      });
    }
  });
  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    localStorage.setItem("or-toc-width", tocWidth);
    renderToc();
  });

  // --- TOC Rendering ---
  let cur = 0;
  let layoutMode = localStorage.getItem("or-layout") || "single-scroll";
  let zoom = 100;
  let sorterZoom = 100;
  let viewMode = "normal";
  // Cache original slide dimensions (before any transforms/hiding)
  const slidePw = parseFloat(getComputedStyle(pages[0]).width);
  const slidePh = parseFloat(getComputedStyle(pages[0]).height);
  // Cache cloned DOMs - clone once, rescale on resize
  const cloneCache = [];
  // Build clone cache lazily
  function ensureClone(i) {
    if (cloneCache[i]) return cloneCache[i];
    const clone = pages[i].cloneNode(true);
    clone.style.margin = "0";
    clone.style.transformOrigin = "top left";
    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.pointerEvents = "none";
    clone.style.boxShadow = "none";
    clone.querySelectorAll("details").forEach(d => d.remove());
    cloneCache[i] = clone;
    return clone;
  }
  function mkThumb(idx, w, showNum = true) {
    const p = pages[idx];
    const thumb = document.createElement("div");
    const pw = slidePw || parseFloat(getComputedStyle(p).width);
    const ph = slidePh || parseFloat(getComputedStyle(p).height);
    const innerW = w - 2;
    const scale = innerW / pw;
    const h = ph * scale + 2;
    thumb.style.cssText = `width:calc(100% - 4px);height:${h}px;border:1px solid #ccc;overflow:hidden;position:relative;background:#fff;flex-shrink:0;box-sizing:border-box;margin:0 2px;`;
    thumb.className = "or-thumb";
    thumb.dataset.idx = idx;
    const clone = ensureClone(idx).cloneNode(true);
    clone.style.transform = `scale(${scale})`;
    thumb.appendChild(clone);
    return thumb;
  }
  let activeResource = null;
  function showResourcePreview(r) {
    activeResource = r;
    let overlay = document.getElementById("or-res-overlay");
    if (overlay) overlay.remove();
    overlay = document.createElement("div");
    overlay.id = "or-res-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;";
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    const box = document.createElement("div");
    box.style.cssText = "background:#fff;border-radius:8px;padding:16px;max-width:80vw;max-height:80vh;overflow:auto;min-width:400px;position:relative;";
    const hdr = document.createElement("div");
    hdr.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px solid #eee;padding-bottom:8px;";
    hdr.innerHTML = `<span style="font-weight:bold;font-size:13px;">${r.name}</span><div><a href="${r.src}" download style="font-size:11px;margin-right:12px;">⬇ Download</a><span style="cursor:pointer;font-size:18px;" id="or-res-close">&times;</span></div>`;
    box.appendChild(hdr);
    if (r.type === "Image") {
      const img = document.createElement("img");
      img.src = r.src; img.style.cssText = "max-width:100%;max-height:60vh;display:block;margin:auto;";
      box.appendChild(img);
    } else {
      const pre = document.createElement("pre");
      pre.style.cssText = "white-space:pre-wrap;word-break:break-all;font-size:11px;background:#f5f5f5;padding:12px;border-radius:4px;max-height:60vh;overflow:auto;";
      pre.textContent = "Loading...";
      box.appendChild(pre);
      fetch(r.src).then(res => res.text()).then(txt => { pre.textContent = txt; }).catch(() => { pre.textContent = "Cannot load file content."; });
    }
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.querySelector("#or-res-close").onclick = () => overlay.remove();
  }

  function renderToc() {
    tocContent.innerHTML = "";
    const availW = tocContent.clientWidth;
    let lastSection = "";
    const query = searchBox.value.toLowerCase();
    // Status tab - show overview grid
    if (activeTab == 3) {
      const tbl = document.createElement("table");
      tbl.style.cssText = "width:100%;border-collapse:collapse;font-size:10px;";
      const hdr = document.createElement("tr");
      hdr.innerHTML = '<th style="text-align:left;padding:2px 4px;border-bottom:1px solid #ddd;">#</th><th style="padding:2px;border-bottom:1px solid #ddd;">📝</th><th style="padding:2px;border-bottom:1px solid #ddd;">💬</th><th style="padding:2px;border-bottom:1px solid #ddd;">📋</th><th style="padding:2px;border-bottom:1px solid #ddd;">🌿</th>';
      tbl.appendChild(hdr);
      pages.forEach((p, i) => {
        const title = p.dataset.title || "";
        if (query && !title.toLowerCase().includes(query) && !(p.dataset.page || "").includes(query) && !p.textContent.toLowerCase().includes(query)) return;
        const types = {Notes: false, Comments: false, Tables: false, PlantUML: false};
        for (const el of p.querySelectorAll(":scope > div.or-extra")) {
          const t = el.dataset.type || "";
          if (t === "Notes") types.Notes = true;
          else if (t === "Comments") types.Comments = true;
          else if (t.startsWith("Table")) types.Tables = true;
          else types.PlantUML = true;
        }
        const row = document.createElement("tr");
        row.style.cursor = "pointer";
        row.onclick = () => goToSlide(i);
        row.style.background = i === cur ? "#e8f0fe" : "";
        const dot = (v, tabIdx) => v ? `<span style="cursor:pointer;font-size:16px;padding:2px 4px;" data-tab="${tabIdx}">●</span>` : '';
        row.innerHTML = `<td style="padding:2px 4px;border-bottom:1px solid #eee;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px;">${p.dataset.page||i+1}. ${p.dataset.title||""}</td><td style="text-align:center;color:#4caf50;padding:2px;">${dot(types.Notes,0)}</td><td style="text-align:center;color:#ff9800;padding:2px;">${dot(types.Comments,1)}</td><td style="text-align:center;color:#2196f3;padding:2px;">${dot(types.Tables,2)}</td><td style="text-align:center;color:#9c27b0;padding:2px;">${dot(types.PlantUML,3)}</td>`;
        row.querySelectorAll("span[data-tab]").forEach(sp => {
          sp.onclick = (e) => { e.stopPropagation(); rActiveTab = parseInt(sp.dataset.tab); localStorage.setItem("or-rtab", rActiveTab); if (!rSidebarOpen) toggleRightSidebar(); goToSlide(i); updateRightPanel(); updateRTabStyles(); };
        });
        tbl.appendChild(row);
      });
      tocContent.appendChild(tbl);
      return;
    }
    // Resources tab
    if (activeTab == 4) {
      const res = document.createElement("div");
      res.style.cssText = "font-size:11px;padding:4px;";
      const resources = [];
      // External images
      const imgs = new Set();
      pages.forEach(p => { p.querySelectorAll("img[src]").forEach(img => { const s = img.src; if (s && !s.startsWith("data:")) imgs.add(s); }); });
      imgs.forEach(src => resources.push({type: "Image", src: src, name: src.split("/").pop()}));
      // OLE/embedded files (download links)
      document.querySelectorAll("a[download]").forEach(a => { const h = a.href; if (h) resources.push({type: "File", src: h, name: h.split("/").pop()}); });
      // Inline assets
      resources.push({type: "CSS", src: "#", name: "styles (inline)", inline: true});
      resources.push({type: "JS", src: "#", name: "or-viewer.js (inline)", inline: true});
      if (document.querySelectorAll("template").length) resources.push({type: "HTML", src: "#", name: `templates (${document.querySelectorAll("template").length})`, inline: true});
      // Data URIs count
      let dataCount = 0;
      pages.forEach(p => { p.querySelectorAll("img[src^='data:']").forEach(() => dataCount++); });
      if (dataCount) resources.push({type: "Data", src: "#", name: `${dataCount} inline images (base64)`, inline: true});

      res.innerHTML = `<div style="padding:4px;font-weight:bold;border-bottom:1px solid #ddd;margin-bottom:4px;">Resources (${resources.length})</div>`;
      resources.forEach(r => {
        const item = document.createElement("div");
        item.style.cssText = "padding:3px 4px;border-bottom:1px solid #eee;display:flex;gap:6px;align-items:center;";
        const icon = r.type === "Image" ? "🖼" : r.type === "CSS" ? "🎨" : r.type === "JS" ? "⚙️" : r.type === "File" ? "📎" : r.type === "HTML" ? "📄" : "💾";
        if (r.inline) {
          item.innerHTML = `<span>${icon}</span><span style="color:#0082F0;cursor:pointer;font-size:10px;" class="or-res-view">${r.name}</span><span style="color:#999;font-size:9px;">${r.type}</span>`;
          item.querySelector(".or-res-view").onclick = () => {
            let content = "";
            if (r.type === "CSS") content = document.querySelector("style").textContent;
            else if (r.type === "JS") content = document.querySelectorAll("script")[document.querySelectorAll("script").length-1].textContent;
            else if (r.type === "HTML") content = Array.from(document.querySelectorAll("template")).map(t => t.innerHTML).join("\n\n");
            else if (r.type === "Data") { content = `${dataCount} inline base64 images embedded in the HTML`; }
            const pre = tocContent.querySelector(".or-res-preview");
            if (pre) { pre.remove(); return; }
            const preview = document.createElement("pre");
            preview.className = "or-res-preview";
            preview.style.cssText = "white-space:pre-wrap;word-break:break-all;font-size:9px;background:#fff;border:1px solid #ddd;padding:6px;max-height:300px;overflow:auto;margin-top:4px;";
            preview.textContent = content;
            item.after(preview);
          };
        } else {
          const cb = document.createElement("input");
          cb.type = "checkbox"; cb.style.cssText = "margin:0;"; cb.className = "or-res-cb"; cb.dataset.src = r.src; cb.dataset.name = r.name; cb.dataset.type = r.type;
          item.innerHTML = `<span>${icon}</span><span style="color:#0082F0;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;" class="or-res-view">${r.name}</span><span style="color:#999;font-size:9px;">${r.type}</span>`;
          item.prepend(cb);
          item.querySelector(".or-res-view").onclick = () => showResourcePreview(r);
          item.querySelector(".or-res-view").ondblclick = () => { activeResource = r; chatScope.value = "resource"; };
        }
        res.appendChild(item);
      });
      tocContent.appendChild(res);
      return;
    }
    const frag = document.createDocumentFragment();
    pages.forEach((p, i) => {
      const title = p.dataset.title || "";
      if (query && !title.toLowerCase().includes(query) && !(p.dataset.page || "").includes(query) && !p.textContent.toLowerCase().includes(query)) return;
      const isHidden = p.dataset.hidden === "true";
      const section = p.dataset.section || "";
      if (section && section !== lastSection) {
        const hdr = document.createElement("div");
        hdr.textContent = section;
        hdr.style.cssText = "padding:4px 6px;font-weight:bold;font-size:10px;color:#666;border-bottom:1px solid #ddd;margin-top:6px;text-transform:uppercase;";
        frag.appendChild(hdr);
        lastSection = section;
      }
      const item = document.createElement("a");
      item.href = "#" + p.id;
      item.dataset.idx = i;
      item.style.cssText = "display:block;padding:3px 4px;color:" + (isHidden ? "#999" : "#333") + ";text-decoration:none;border-radius:3px;margin-bottom:3px;overflow:hidden;" + (isHidden ? "opacity:0.6;font-style:italic;" : "");
      if (activeTab == 0) {
        const lbl = document.createElement("div");
        lbl.textContent = `${p.dataset.page || i + 1}. ${p.dataset.title || ""}`;
        lbl.style = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;";
        item.appendChild(lbl);
      } else if (activeTab == 1) {
        item.style.padding = "2px 0";
        const thumb = mkThumb(i, availW);
        item.appendChild(thumb);
      } else {
        item.style.display = "flex";
        item.style.gap = "6px";
        item.style.alignItems = "center";
        item.style.height = "48px";
        const thumb = mkThumb(i, 64, false);
        thumb.style.flexShrink = "0";
        thumb.style.height = "40px";
        thumb.style.width = "64px";
        item.appendChild(thumb);
        const lbl = document.createElement("div");
        lbl.textContent = `${p.dataset.page || i + 1}. ${p.dataset.title || ""}`;
        lbl.style = "overflow:hidden;text-overflow:ellipsis;font-size:11px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;min-width:0;";
        item.appendChild(lbl);
      }
      item.onmouseenter = () => { if (i !== cur) item.style.background = "#e0e0e0"; };
      item.onmouseleave = () => { if (i !== cur) { item.style.background = ""; } };
      frag.appendChild(item);
    });
    tocContent.appendChild(frag);
    updateHighlight();
  }

  function updateHighlight() {
    tocContent.querySelectorAll("a[data-idx]").forEach(a => {
      const i = parseInt(a.dataset.idx);
      if (i === cur) {
        a.style.background = "#e8f0fe";
        a.style.borderLeft = "3px solid #0082F0";
      } else {
        a.style.background = "";
        a.style.borderLeft = "3px solid transparent";
      }
    });
  }

  renderToc();
  applyLayout();
  // Navigate to hash if present
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) { const idx = Array.from(pages).indexOf(target); if (idx >= 0) { cur = idx; applyLayout(); updateHighlight(); } }
  }

  // --- Scroll tracking ---
  const update = () => {
    if (layoutMode.includes("page")) return; // page mode uses goToSlide
    let c = 0;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].getBoundingClientRect().top < contentArea.getBoundingClientRect().top + contentArea.clientHeight / 2) c = i;
    }
    if (c !== cur || !info.dataset.init) {
      cur = c;
      const p = pages[c];
      const t = p.dataset.title || "";
      info.textContent = `Slide ${p.dataset.page || c + 1} / ${pages.length}` + (t ? ` — ${t}` : "");
      info.dataset.init = "1";
      updateHighlight();
      const curA = tocContent.querySelector(`a[data-idx="${c}"]`);
      if (curA) {
        const top = curA.offsetTop - tocContent.offsetTop;
        if (top < tocContent.scrollTop || top + curA.offsetHeight > tocContent.scrollTop + tocContent.clientHeight) {
          tocContent.scrollTop = top - tocContent.clientHeight / 3;
        }
      }
    }
  };
  // --- Right Sidebar (Notes/Comments/Tables/PlantUML) ---
  const rsWidth = 280;
  const rSidebar = document.createElement("div");
  rSidebar.id = "or-rsidebar";
  rSidebar.style.cssText = `position:fixed;top:0;right:0;bottom:24px;width:${rsWidth}px;background:#fafafa;border-left:1px solid #ddd;z-index:9998;display:none;flex-direction:column;font:11px sans-serif;`;
  document.body.appendChild(rSidebar);
  const rTabBar = document.createElement("div");
  rTabBar.style.cssText = "display:flex;border-bottom:1px solid #ddd;background:#eee;flex-shrink:0;";
  const rTabs = ["Notes", "Comments", "Tables", "PlantUML", "LLM"];
  let rActiveTab = parseInt(localStorage.getItem("or-rtab") || "0");
  rTabs.forEach((label, i) => {
    const t = document.createElement("button");
    t.textContent = label;
    t.style.cssText = "flex:1;border:none;padding:5px 2px;cursor:pointer;font-size:10px;background:" + (i === rActiveTab ? "#fff" : "#eee") + ";border-bottom:" + (i === rActiveTab ? "2px solid #0082F0" : "2px solid transparent") + ";";
    t.onclick = () => { rActiveTab = i; localStorage.setItem("or-rtab", i); rTabs.forEach((_, j) => { rTabBar.children[j].style.background = j === i ? "#fff" : "#eee"; rTabBar.children[j].style.borderBottom = j === i ? "2px solid #0082F0" : "2px solid transparent"; }); updateRightPanel(); };
    rTabBar.appendChild(t);
  });
  rSidebar.appendChild(rTabBar);
  const rContent = document.createElement("div");
  rContent.style.cssText = "flex:1;overflow-y:auto;overflow-x:auto;padding:8px;font-size:11px;white-space:pre-wrap;word-wrap:break-word;";
  rSidebar.appendChild(rContent);
  // Chat UI (bottom of right sidebar) - office-reader style
  const chatDivider = document.createElement("div");
  chatDivider.style.cssText = "height:4px;background:#ddd;cursor:row-resize;flex-shrink:0;";
  chatDivider.onmousedown = (e) => { e.preventDefault(); const startY = e.clientY; const startH = chatPanel.offsetHeight; const onMove = (e2) => { chatPanel.style.height = Math.max(80, startH + (startY - e2.clientY)) + "px"; }; const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); localStorage.setItem("or-chat-h", chatPanel.style.height); }; document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp); };
  rSidebar.appendChild(chatDivider);
  const chatPanel = document.createElement("div");
  chatPanel.style.cssText = `display:flex;flex-direction:column;height:${localStorage.getItem("or-chat-h")||"200px"};min-height:80px;`;
  // Header with scope/model
  const chatHeader = document.createElement("div");
  chatHeader.style.cssText = "display:flex;align-items:center;padding:3px 6px;border-bottom:1px solid #ddd;font-size:10px;color:#888;gap:4px;flex-wrap:wrap;";
  const llmDot = document.createElement("span");
  llmDot.style.cssText = "width:8px;height:8px;border-radius:50%;background:#666;";
  chatHeader.appendChild(llmDot);
  chatHeader.appendChild(Object.assign(document.createElement("span"), {textContent: "Chat"}));
  const chatScope = document.createElement("select");
  chatScope.style.cssText = "font-size:10px;border:1px solid #ccc;border-radius:2px;padding:1px 3px;";
  [{v:"none",t:"No context"},{v:"slide",t:"Current slide"},{v:"file",t:"All slides"},{v:"resource",t:"Selected resource"},{v:"multi",t:"Multi-file"}].forEach(o => { const opt = document.createElement("option"); opt.value = o.v; opt.textContent = o.t; if (o.v === "slide") opt.selected = true; chatScope.appendChild(opt); });
  chatHeader.appendChild(chatScope);
  chatScope.onchange = () => loadChatForSlide();
  const chatModel = document.createElement("select");
  chatModel.title = "Model";
  chatModel.style.cssText = "font-size:10px;border:1px solid #ccc;border-radius:2px;padding:1px 3px;max-width:80px;";
  chatModel.innerHTML = '<option value="auto">auto</option>';
  chatHeader.appendChild(chatModel);
  // Provider select (before model)
  const chatProvider = document.createElement("select");
  chatProvider.title = "Provider";
  chatProvider.style.cssText = "font-size:10px;border:1px solid #ccc;border-radius:2px;padding:1px 3px;";
  [{v:"kiro",t:"kiro"},{v:"ericai",t:"ericai"}].forEach(o => { const opt = document.createElement("option"); opt.value = o.v; opt.textContent = o.t; chatProvider.appendChild(opt); });
  chatHeader.insertBefore(chatProvider, chatModel);
  // Fetch models for selected provider
  function refreshModels() {
    const provider = chatProvider.value;
    chatModel.innerHTML = '<option value="auto">loading...</option>';
    fetch(`http://127.0.0.1:8081/v1/models?owned_by=${provider}`).then(r=>r.json()).then(d => {
      chatModel.innerHTML = '';
      const filtered = d.data || [];
      filtered.forEach(m => { const opt = document.createElement("option"); opt.value = m.id; opt.textContent = m.id; chatModel.appendChild(opt); });
      if (!chatModel.options.length) { chatModel.innerHTML = '<option value="auto">auto</option>'; llmDot.style.background = "#ff9800"; llmDot.title = "No models available for " + provider; }
      else { llmDot.style.background = "#4caf50"; llmDot.title = "Connected"; }
      if (!chatModel.options.length) chatModel.innerHTML = '<option value="auto">auto</option>';
      const saved = localStorage.getItem("or-chat-model");
      if (saved) chatModel.value = saved;
    }).catch(() => { llmDot.style.background = "#f44336"; chatModel.innerHTML = '<option value="auto">auto</option>'; });
  }
  chatProvider.onchange = () => { localStorage.setItem("or-chat-provider", chatProvider.value); refreshModels(); };
  chatModel.onchange = () => { localStorage.setItem("or-chat-model", chatModel.value); };
  // Restore saved provider
  const savedProvider = localStorage.getItem("or-chat-provider");
  if (savedProvider) chatProvider.value = savedProvider;
  refreshModels();
  const chatClear = document.createElement("button");
  chatClear.textContent = "🗑";
  chatClear.style.cssText = "margin-left:auto;border:none;background:none;cursor:pointer;font-size:12px;";
  chatClear.onclick = () => { chatMessages.innerHTML = ""; chatHistory = []; saveChatHistory(); };
  // Export chat button
  const chatExport = document.createElement("button");
  chatExport.textContent = "💾"; chatExport.title = "Export chat";
  chatExport.style.cssText = "border:none;background:none;cursor:pointer;font-size:12px;";
  chatExport.onclick = () => {
    const exportData = lastCtx ? [{role:"system", content:"Context:\n"+lastCtx}, ...chatHistory] : chatHistory;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `chat_${new Date().toISOString().slice(0,16).replace(/[:-]/g,"")}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };
  chatHeader.appendChild(chatExport);
  // CWD button
  const cwdBtn = document.createElement("button");
  cwdBtn.textContent = "📁";
  cwdBtn.title = "Change working directory";
  cwdBtn.style.cssText = "border:none;background:none;cursor:pointer;font-size:12px;";
  cwdBtn.onclick = () => {
    const dir = prompt("Working directory for kiro:", localStorage.getItem("or-chat-cwd") || "");
    if (dir) {
      fetch("http://127.0.0.1:8081/api/chat/cwd", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({cwd: dir})})
        .then(r=>r.json()).then(d => { if (d.cwd) { localStorage.setItem("or-chat-cwd", d.cwd); cwdBtn.title = "CWD: " + d.cwd; refreshAgents(); } else { alert(d.error||"Failed"); }});
    }
  };
  const savedCwd = localStorage.getItem("or-chat-cwd");
  if (savedCwd) cwdBtn.title = "CWD: " + savedCwd;
  chatHeader.appendChild(cwdBtn);
  // Agent dropdown
  const chatAgent = document.createElement("select");
  chatAgent.title = "Agent mode";
  chatAgent.style.cssText = "font-size:10px;border:1px solid #ccc;border-radius:2px;padding:1px 3px;max-width:70px;";
  [{v:"kiro_default",t:"default"},{v:"kiro_planner",t:"planner"},{v:"kiro_guide",t:"guide"}].forEach(o => { const opt = document.createElement("option"); opt.value = o.v; opt.textContent = o.t; chatAgent.appendChild(opt); });
  const savedAgent = localStorage.getItem("or-chat-agent");
  if (savedAgent) chatAgent.value = savedAgent;
  function refreshAgents() {
    fetch("http://127.0.0.1:8081/api/chat/agents", {method:"POST", headers:{"Content-Type":"application/json"}, body:"{}"})
      .then(r=>r.json()).then(d => {
        if (d.agents && d.agents.length) {
          chatAgent.innerHTML = "";
          d.agents.forEach(a => { const o = document.createElement("option"); o.value = a.id || a; o.textContent = (a.name || a.id || a).replace("kiro_",""); chatAgent.appendChild(o); });
          const saved = localStorage.getItem("or-chat-agent");
          if (saved) chatAgent.value = saved;
        }
      }).catch(()=>{});
  }
  refreshAgents();
  chatAgent.onchange = () => {
    localStorage.setItem("or-chat-agent", chatAgent.value);
    fetch("http://127.0.0.1:8081/api/chat/agent", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({agent: chatAgent.value})});
  };
  chatHeader.appendChild(chatAgent);
  chatHeader.appendChild(chatClear);
  chatPanel.appendChild(chatHeader);
  // Messages
  const chatMessages = document.createElement("div");
  chatMessages.style.cssText = "flex:1;overflow-y:auto;padding:8px;font-size:12px;line-height:1.4;";
  chatPanel.appendChild(chatMessages);
  // Input
  const chatInputDiv = document.createElement("div");
  chatInputDiv.style.cssText = "display:flex;padding:4px;gap:4px;border-top:1px solid #ddd;";
  // Prompt library button
  const promptLib = JSON.parse(localStorage.getItem("or-prompt-lib") || '["Summarize","Explain","Translate to English","Key points","Questions","Compare with previous slide","List action items"]');
  const libBtn = document.createElement("button");
  libBtn.textContent = "📋"; libBtn.title = "Prompt library";
  libBtn.style.cssText = "border:1px solid #ccc;background:#f8f8f8;border-radius:4px;cursor:pointer;font-size:13px;padding:4px 8px;";
  libBtn.onclick = () => {
    let overlay = document.getElementById("or-prompt-lib-overlay");
    if (overlay) { overlay.remove(); return; }
    overlay = document.createElement("div");
    overlay.id = "or-prompt-lib-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:99999;display:flex;align-items:center;justify-content:center;";
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    const box = document.createElement("div");
    box.style.cssText = "background:#fff;border-radius:8px;padding:16px;width:340px;max-height:70vh;overflow:auto;";
    box.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;display:flex;justify-content:space-between;"><span>Prompt Library</span><span style="cursor:pointer;font-size:16px;" id="or-plib-close">&times;</span></div>';
    const list = document.createElement("div");
    function renderList() {
      list.innerHTML = "";
      promptLib.forEach((p, i) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;gap:6px;padding:4px;border-bottom:1px solid #eee;";
        row.innerHTML = `<span style="flex:1;font-size:11px;cursor:pointer;" class="plib-use">${p}</span><button style="border:none;background:none;cursor:pointer;color:#c00;font-size:12px;" class="plib-del">✗</button>`;
        row.querySelector(".plib-use").onclick = () => { chatBox.value = p + ": "; chatBox.focus(); overlay.remove(); };
        row.querySelector(".plib-del").onclick = () => { promptLib.splice(i, 1); localStorage.setItem("or-prompt-lib", JSON.stringify(promptLib)); renderList(); };
        list.appendChild(row);
      });
    }
    renderList();
    box.appendChild(list);
    const addRow = document.createElement("div");
    addRow.style.cssText = "display:flex;gap:4px;margin-top:8px;";
    const addInput = document.createElement("input");
    addInput.placeholder = "New prompt...";
    addInput.style.cssText = "flex:1;padding:4px 8px;font-size:11px;border:1px solid #ccc;border-radius:4px;";
    const addBtn = document.createElement("button");
    addBtn.textContent = "+"; addBtn.style.cssText = "padding:4px 10px;border:1px solid #ccc;border-radius:4px;cursor:pointer;";
    addBtn.onclick = () => { if (addInput.value.trim()) { promptLib.push(addInput.value.trim()); localStorage.setItem("or-prompt-lib", JSON.stringify(promptLib)); addInput.value = ""; renderList(); } };
    addRow.appendChild(addInput); addRow.appendChild(addBtn);
    box.appendChild(addRow);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    box.querySelector("#or-plib-close").onclick = () => overlay.remove();
  };
  chatInputDiv.appendChild(libBtn);
  const chatBox = document.createElement("input");
  chatBox.placeholder = "Ask about this document...";
  chatBox.style.cssText = "flex:1;padding:6px 10px;font-size:11px;border:1px solid #ccc;border-radius:4px;outline:none;";
  const chatSend = document.createElement("button");
  chatSend.innerHTML = "&#9654;";
  chatSend.style.cssText = "padding:6px 12px;background:#0082F0;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;";
  chatInputDiv.appendChild(chatBox);
  chatInputDiv.appendChild(chatSend);
  chatPanel.appendChild(chatInputDiv);
  rSidebar.appendChild(chatPanel);
  // Chat logic
  const PROXY_URL = "http://127.0.0.1:8081/api/chat";
  let chatHistory = JSON.parse(localStorage.getItem("or-chat-history") || "[]");
  let lastCtx = "";
  let llmFmt = localStorage.getItem("or-llm-fmt") || "html";
  const perSlideHistory = JSON.parse(localStorage.getItem("or-chat-per-slide") || "{}");
  function saveChatHistory() {
    if (chatScope.value === "slide") {
      perSlideHistory[cur] = chatHistory;
      localStorage.setItem("or-chat-per-slide", JSON.stringify(perSlideHistory));
    } else {
      localStorage.setItem("or-chat-history", JSON.stringify(chatHistory));
    }
  }
  function loadChatForSlide() {
    if (chatScope.value === "slide") {
      chatHistory = perSlideHistory[cur] || [];
    } else {
      chatHistory = JSON.parse(localStorage.getItem("or-chat-history") || "[]");
    }
    chatMessages.innerHTML = "";
    chatHistory.forEach(m => addChatMsg(m.role, m.content));
  }
  // Restore chat messages from history
  loadChatForSlide();
  function addChatMsg(role, text, model) {
    const div = document.createElement("div");
    div.style.cssText = `margin:6px 0;padding:6px 10px;border-radius:6px;max-width:90%;word-break:break-word;font-size:11px;${role === "user" ? "background:#d0e4ff;margin-left:auto;border-bottom-right-radius:2px;" : "background:#f5f5f5;border:1px solid #eee;border-bottom-left-radius:2px;"}`;
    if (role === "assistant") {
      div.innerHTML = mdRender(text);
    } else {
      div.style.whiteSpace = "pre-wrap";
      div.appendChild(document.createTextNode(text));
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }
  function mdRender(s) {
    if (!s) return "";
    s = s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    // Code blocks
    s = s.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre style="background:#282c34;color:#abb2bf;padding:8px;border-radius:4px;overflow-x:auto;font-size:10px;"><code>${code}</code></pre>`);
    // Inline code
    s = s.replace(/`([^`]+)`/g, '<code style="background:#e8e8e8;padding:1px 4px;border-radius:2px;font-size:10px;">$1</code>');
    // Bold + italic
    s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<b><i>$1</i></b>");
    s = s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    s = s.replace(/\*(.+?)\*/g, "<i>$1</i>");
    // Links
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#0082F0;">$1</a>');
    // Lists
    s = s.replace(/^[\-\*] (.+)/gm, "<li>$1</li>");
    s = s.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul style="margin:4px 0;padding-left:16px;">${m}</ul>`);
    // Numbered lists
    s = s.replace(/^\d+\. (.+)/gm, "<li>$1</li>");
    // Headers
    s = s.replace(/^### (.+)/gm, '<div style="font-weight:bold;margin-top:6px;">$1</div>');
    s = s.replace(/^## (.+)/gm, '<div style="font-weight:bold;font-size:12px;margin-top:6px;">$1</div>');
    // Line breaks
    s = s.replace(/\n/g, "<br>");
    return s;
  }
  async function sendChat() {
    const q = chatBox.value.trim();
    if (!q) return;
    chatBox.value = "";
    addChatMsg("user", q);
    chatHistory.push({role: "user", content: q});
    saveChatHistory();
    const scope = chatScope.value;
    let ctx = "";
    if (scope === "slide") {
      const p = pages[cur];
      if (p) {
        const num = p.dataset.page || cur+1;
        const title = p.dataset.title || "";
        if (llmFmt === "html") {
          let filtered = "";
          p.querySelectorAll(":scope > .s[data-name]").forEach(s => {
            const dt = s.dataset.type || ""; const dn = (s.dataset.name || "").toLowerCase();
            if (dt === "footer" || dt === "slide-number" || dt === "date") return;
            if (dn.includes("footer") || dn.includes("graphic") || dn.includes("logo")) return;
            filtered += s.outerHTML + "\n";
          });
          ctx = `<div id="page-${num}">\n${filtered}</div>`;
        } else {
          let parts = [];
          p.querySelectorAll(":scope > .s[data-name]").forEach(s => {
            const dt = s.dataset.type || ""; const dn = (s.dataset.name || "").toLowerCase();
            if (dt === "footer" || dt === "slide-number" || dt === "date") return;
            if (dn.includes("footer") || dn.includes("graphic") || dn.includes("logo")) return;
            const t = s.textContent.trim(); if (t) parts.push(t);
          });
          ctx = `Slide ${num}: ${title}\n\n${parts.join("\n")}`;
        }
      }
    } else if (scope === "file") {
      pages.forEach((p, i) => {
        const num = p.dataset.page||i+1;
        const title = p.dataset.title||"";
        if (llmFmt === "html") {
          let filtered = "";
          p.querySelectorAll(":scope > .s[data-name]").forEach(s => {
            const dt = s.dataset.type || ""; const dn = (s.dataset.name || "").toLowerCase();
            if (dt === "footer" || dt === "slide-number" || dt === "date") return;
            if (dn.includes("footer") || dn.includes("graphic") || dn.includes("logo")) return;
            filtered += s.outerHTML + "\n";
          });
          if (filtered) ctx += `<div id="page-${num}">\n${filtered}</div>\n`;
        } else {
          let parts = [];
          p.querySelectorAll(":scope > .s[data-name]").forEach(s => {
            const dt = s.dataset.type || ""; const dn = (s.dataset.name || "").toLowerCase();
            if (dt === "footer" || dt === "slide-number" || dt === "date") return;
            if (dn.includes("footer") || dn.includes("graphic") || dn.includes("logo")) return;
            const t = s.textContent.trim(); if (t) parts.push(t);
          });
          if (parts.length) ctx += `--- Slide ${num}: ${title} ---\n${parts.join("\n")}\n\n`;
        }
      });
    } else if (scope === "resource") {
      const checked = [...document.querySelectorAll(".or-res-cb:checked")];
      const selected = checked.length ? checked.map(cb => ({type:cb.dataset.type, src:cb.dataset.src, name:cb.dataset.name})) : (activeResource ? [activeResource] : []);
      const parts = [];
      for (const r of selected) {
        if (r.type === "Image") {
          const path = r.src.startsWith("file:///") ? decodeURIComponent(r.src.slice(8)) : r.src;
          parts.push(`[Image file: ${path}]`);
        } else {
          const path = r.src.startsWith("file:///") ? decodeURIComponent(r.src.slice(8)) : r.src;
          try { parts.push(`[File: ${r.name}]\n` + await fetch(r.src).then(res => res.text())); } catch { parts.push(`[File: ${path}] - read this file`); }
        }
      }
      ctx = parts.join("\n\n");
    } else if (scope === "multi") {
      const urls = prompt("Enter file URLs (comma-separated):", localStorage.getItem("or-chat-multi")||"");
      if (urls) {
        localStorage.setItem("or-chat-multi", urls);
        const parts = [];
        for (const url of urls.split(",").map(u=>u.trim()).filter(Boolean)) {
          try { const html = await fetch(url).then(r=>r.text()); const doc = new DOMParser().parseFromString(html,"text/html"); parts.push(`--- ${url.split("/").pop()} ---\n${doc.body.textContent.substring(0,5000)}`); } catch {}
        }
        ctx = parts.join("\n\n");
      }
    }
    lastCtx = ctx;
    const msgDiv = addChatMsg("assistant", "...", chatModel.value);
    try {
      const isFirst = chatHistory.filter(m => m.role === "user").length <= 1;
      const messages = (ctx && isFirst) ? [{role:"system",content:"Context:\n"+ctx},{role:"user",content:q}] : [{role:"user",content:q}];
      const resp = await fetch(PROXY_URL, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({messages, model: chatModel.value, provider: chatProvider.value, stream: true})});
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try { const d = JSON.parse(line.slice(6)); answer += d.choices?.[0]?.delta?.content || ""; } catch {}
          }
        }
        msgDiv.textContent = answer || "...";
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
      msgDiv.innerHTML = mdRender(answer);
      chatHistory.push({role: "assistant", content: answer, model: chatModel.value});
      saveChatHistory();
      llmDot.style.background = "#4caf50";
    } catch (e) {
      msgDiv.textContent = "⚠ " + e.message;
      const retryBtn = document.createElement("button");
      retryBtn.textContent = "🔄 Retry";
      retryBtn.style.cssText = "margin-top:4px;display:block;font-size:10px;padding:2px 8px;border:1px solid #ccc;border-radius:3px;cursor:pointer;background:#fff;";
      retryBtn.onclick = () => { msgDiv.remove(); chatHistory.pop(); saveChatHistory(); chatBox.value = q; sendChat(); };
      msgDiv.appendChild(retryBtn);
      llmDot.style.background = "#f44336";
    }
  }
  chatSend.onclick = sendChat;
  chatBox.onkeydown = (e) => { if (e.key === "Enter") sendChat(); };
  // Check proxy status
  // Status checked by refreshModels above

  let rSidebarOpen = localStorage.getItem("or-rsidebar") === "1";
  // Right sidebar resize handle
  const rHandle = document.createElement("div");
  rHandle.style.cssText = `position:fixed;top:0;bottom:24px;width:5px;cursor:col-resize;z-index:9999;right:${rsWidth}px;display:none;`;
  document.body.appendChild(rHandle);
  if (rSidebarOpen) { rSidebar.style.display = "flex"; rHandle.style.display = ""; contentArea.style.right = rSidebar.style.width; updateRightPanel(); updateRTabStyles(); }
  let rDragging = false;
  rHandle.addEventListener("mousedown", (e) => { rDragging = true; e.preventDefault(); });
  document.addEventListener("mousemove", (e) => {
    if (!rDragging) return;
    const w = Math.max(150, Math.min(600, window.innerWidth - e.clientX));
    rSidebar.style.width = w + "px";
    rHandle.style.right = w + "px";
    contentArea.style.right = w + "px";
    if (fitMode) { const pw = slidePw; const leftW = sidebar.style.display !== "none" ? tocWidth : 0; const avail = window.innerWidth - leftW - w - 40; zoom = Math.round(avail / pw * 100); applyZoom(); }
  });
  document.addEventListener("mouseup", () => { if (rDragging) { rDragging = false; localStorage.setItem("or-rsidebar-width", rSidebar.style.width); } });
  function toggleRightSidebar() {
    rSidebarOpen = !rSidebarOpen;
    localStorage.setItem("or-rsidebar", rSidebarOpen ? "1" : "0");
    rSidebar.style.display = rSidebarOpen ? "flex" : "none";
    rHandle.style.display = rSidebarOpen ? "" : "none";
    document.body.style.marginRight = "0";
    contentArea.style.right = rSidebarOpen ? parseInt(rSidebar.style.width) + "px" : "0";
    if (fitMode) { const pw = slidePw; const leftW = sidebar.style.display !== "none" ? tocWidth : 0; const rightW = rSidebarOpen ? parseInt(rSidebar.style.width) : 0; const avail = window.innerWidth - leftW - rightW - 40; zoom = Math.round(avail / pw * 100); applyZoom(); }
  }
  function updateRightPanel() {
    rContent.innerHTML = "";
    const p = pages[cur];
    if (!p) return;
    const type = rTabs[rActiveTab];
    // LLM tab: show raw text for current slide or all slides
    if (type === "LLM") {
      const toolbar = document.createElement("div");
      toolbar.style.cssText = "display:flex;gap:6px;margin-bottom:8px;align-items:center;flex-wrap:wrap;";
      // Scope dropdown
      const scopeSel = document.createElement("select");
      scopeSel.style.cssText = "font-size:11px;border:1px solid #ccc;border-radius:3px;padding:2px 4px;";
      [{v:"slide",t:"Current Slide"},{v:"all",t:"All Slides"}].forEach(o => { const opt = document.createElement("option"); opt.value = o.v; opt.textContent = o.t; scopeSel.appendChild(opt); });
      toolbar.appendChild(scopeSel);
      // Format dropdown
      const fmtSel = document.createElement("select");
      fmtSel.style.cssText = "font-size:11px;border:1px solid #ccc;border-radius:3px;padding:2px 4px;";
      [{v:"html",t:"HTML"},{v:"txt",t:"Text"},{v:"md",t:"Markdown"},{v:"json",t:"JSON"}].forEach(o => { const opt = document.createElement("option"); opt.value = o.v; opt.textContent = o.t; fmtSel.appendChild(opt); });
      toolbar.appendChild(fmtSel);
      // Copy button
      const copyBtn = document.createElement("button");
      copyBtn.textContent = "📋 Copy";
      copyBtn.style.cssText = "padding:2px 8px;border:1px solid #ccc;border-radius:3px;cursor:pointer;font-size:11px;background:#fff;margin-left:auto;";
      toolbar.appendChild(copyBtn);
      // Exclude layout checkbox
      const exclLabel = document.createElement("label");
      exclLabel.style.cssText = "font-size:10px;display:flex;align-items:center;gap:3px;";
      const exclCb = document.createElement("input");
      exclCb.type = "checkbox"; exclCb.checked = true;
      exclLabel.appendChild(exclCb);
      exclLabel.appendChild(document.createTextNode("Exclude layout"));
      toolbar.appendChild(exclLabel);
      rContent.appendChild(toolbar);
      const textArea = document.createElement("pre");
      textArea.style.cssText = "white-space:pre-wrap;word-wrap:break-word;font-size:10px;background:#f9f9f9;padding:8px;border:1px solid #eee;overflow:auto;flex:1;";
      function getLLMText() {
        const scope = scopeSel.value;
        const fmt = fmtSel.value;
        const slides = scope === "all" ? Array.from(pages) : [pages[cur]];
        let text = "";
        slides.forEach((pg, i) => {
          const num = pg.dataset.page || (scope === "all" ? i + 1 : cur + 1);
          const title = pg.dataset.title || "";
          // Get content excluding layout elements if checked
          let content = "";
          if (exclCb.checked) {
            pg.querySelectorAll(":scope > .s[data-name]").forEach(s => {
              const dt = s.dataset.type || "";
              const dn = (s.dataset.name || "").toLowerCase();
              if (dt === "footer" || dt === "slide-number" || dt === "date") return;
              if (dn.includes("footer") || dn.includes("graphic") || dn.includes("logo")) return;
              const t = s.textContent.trim();
              if (t) content += t + "\n";
            });
          } else {
            content = pg.textContent;
          }
          content = content.trim();
          if (fmt === "txt") {
            text += `--- Slide ${num}: ${title} ---\n${content}\n\n`;
          } else if (fmt === "md") {
            text += `## Slide ${num}: ${title}\n\n${content}\n\n`;
          } else if (fmt === "html") {
            if (exclCb.checked) {
              let filtered = "";
              pg.querySelectorAll(":scope > .s[data-name]").forEach(s => {
                const dt = s.dataset.type || "";
                const dn = (s.dataset.name || "").toLowerCase();
                if (dt === "footer" || dt === "slide-number" || dt === "date") return;
                if (dn.includes("footer") || dn.includes("graphic") || dn.includes("logo")) return;
                filtered += s.outerHTML + "\n";
              });
              text += `<div id="page-${num}">\n${filtered}</div>\n`;
            } else {
              text += pg.outerHTML + "\n";
            }
          } else if (fmt === "json") {
            const extras = [];
            pg.querySelectorAll(":scope > div.or-extra").forEach(el => extras.push({type: el.dataset.type, content: el.textContent.trim()}));
            text += JSON.stringify({slide: num, title: title, text: content, extras: extras}, null, 2) + "\n";
          }
        });
        return text;
      }
      function updateLLM() { textArea.textContent = getLLMText(); }
      scopeSel.onchange = updateLLM;
      fmtSel.value = llmFmt;
      fmtSel.onchange = () => { llmFmt = fmtSel.value; localStorage.setItem("or-llm-fmt", llmFmt); updateLLM(); };
      exclCb.onclick = updateLLM;
      copyBtn.onclick = () => { navigator.clipboard.writeText(textArea.textContent); copyBtn.textContent = "✓ Copied!"; setTimeout(() => copyBtn.textContent = "📋 Copy", 1500); };
      rContent.appendChild(textArea);
      updateLLM();
      return;
    }
    let found = false;
    for (const el of p.querySelectorAll(":scope > div.or-extra")) {
      const t = el.dataset.type || "";
      const match = type === "Tables" ? t.startsWith("Table") : type === "PlantUML" ? (t !== "Notes" && t !== "Comments" && !t.startsWith("Table")) : t === type;
      if (match) {
        const content = el.cloneNode(true);
        content.hidden = false;
        rContent.appendChild(content);
        // For tables, also show raw HTML
        if (type === "Tables") {
          const details = document.createElement("details");
          details.style.cssText = "margin-top:4px;font-size:10px;";
          details.innerHTML = '<summary style="cursor:pointer;color:#666;">Raw HTML</summary><pre style="white-space:pre-wrap;word-break:break-all;background:#f5f5f5;padding:4px;border:1px solid #ddd;max-height:200px;overflow:auto;font-size:9px;">' + el.innerHTML.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
          rContent.appendChild(details);
        }
        found = true;
      }
    }
    if (!found) {
      if (type === "Notes") {
        rContent.innerHTML = '<div style="color:#999;padding:20px;text-align:center;">Click to add notes</div>';
      } else {
        rContent.innerHTML = `<div style="color:#999;padding:20px;text-align:center;">No ${type.toLowerCase()} for this slide</div>`;
      }
    }
  }

  // --- Bottom Status Bar ---
  const bar = document.createElement("div");
  bar.style.cssText = "position:fixed;bottom:0;left:" + tocWidth + "px;right:0;height:24px;background:#f0f0f0;border-top:1px solid #ddd;z-index:9998;display:flex;align-items:center;padding:0 8px;font:11px sans-serif;gap:8px;";
  document.body.appendChild(bar);
  document.body.style.paddingBottom = "24px";
  // Slide counter
  const barInfo = document.createElement("span");
  barInfo.style = "min-width:80px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  bar.appendChild(barInfo);
  // Notes toggle
  const notesBtn = document.createElement("button");
  notesBtn.textContent = "📝 Notes";
  notesBtn.className = "or-bar-btn";
  notesBtn.onclick = () => { if (rSidebarOpen && rActiveTab === 0) { toggleRightSidebar(); } else { rActiveTab = 0; if (!rSidebarOpen) toggleRightSidebar(); updateRightPanel(); updateRTabStyles(); } };
  bar.appendChild(notesBtn);
  // Extra type buttons in bottom bar
  const barExtraBtns = [];
  rTabs.forEach((label, i) => {
    if (i === 0) { barExtraBtns.push(notesBtn); return; }
    const b = document.createElement("button");
    b.textContent = label;
    b.className = "or-bar-btn";
    b.onclick = () => { if (rSidebarOpen && rActiveTab === i) { toggleRightSidebar(); } else { rActiveTab = i; if (!rSidebarOpen) toggleRightSidebar(); updateRightPanel(); updateRTabStyles(); } };
    bar.appendChild(b);
    barExtraBtns.push(b);
  });
  function updateRTabStyles() {
    rTabs.forEach((_, j) => { rTabBar.children[j].style.background = j === rActiveTab ? "#fff" : "#eee"; rTabBar.children[j].style.borderBottom = j === rActiveTab ? "2px solid #0082F0" : "2px solid transparent"; });
  }
  function updateExtraIndicators() {
    const p = pages[cur];
    if (!p) return;
    rTabs.forEach((type, i) => {
      let has = false;
      for (const el of p.querySelectorAll(":scope > div.or-extra")) {
        const t = el.dataset.type || "";
        const match = type === "Tables" ? t.startsWith("Table") : type === "PlantUML" ? (t !== "Notes" && t !== "Comments" && !t.startsWith("Table")) : t === type;
        if (match) { has = true; break; }
      }
      if (barExtraBtns[i]) barExtraBtns[i].style.color = has ? "#0082F0" : "";
      if (barExtraBtns[i]) barExtraBtns[i].style.fontWeight = has ? "bold" : "";
      if (rTabBar.children[i]) rTabBar.children[i].style.color = has ? "#0082F0" : "";
    });
  }
  // Spacer
  bar.appendChild(Object.assign(document.createElement("div"), {style: "flex:1"}));
  // View mode state
  function applyLayout() {
    const cols = layoutMode.includes("double") ? 2 : 1;
    const isPage = layoutMode.includes("page");
    const isVert = layoutMode === "double-v-page";
    pages.forEach(p => {
      if (cols === 2 && !isVert) {
      const avail = (window.innerWidth - (viewMode === "normal" ? tocWidth : 0) - (rSidebarOpen ? parseInt(rSidebar.style.width) : 0) - 60) / 2;
        const pw = slidePw;
        const scale = (avail / pw) * (zoom / 100);
        p.style.transform = `scale(${scale})`;
        p.style.transformOrigin = "top left";
        p.style.display = "inline-block";
        p.style.verticalAlign = "top";
        p.style.marginRight = (-(pw * (1 - scale)) + 10) + "px";
        p.style.marginBottom = (-(slidePh * (1 - scale)) + 10) + "px";
      } else if (isVert) {
        const availH = (window.innerHeight - 80) / 2;
        const ph = slidePh;
        const pw = slidePw;
        const scale = Math.min(availH / ph, (window.innerWidth - (viewMode === "normal" ? tocWidth : 0) - (rSidebarOpen ? parseInt(rSidebar.style.width) : 0) - 40) / pw) * (zoom / 100);
        p.style.transform = `scale(${scale})`;
        p.style.transformOrigin = "top center";
        p.style.display = "block";
        p.style.verticalAlign = "";
        p.style.marginRight = "";
        p.style.marginBottom = (-(ph * (1 - scale))) + "px";
      } else {
        const s = zoom / 100;
        p.style.zoom = "";
        p.style.transform = "";
        p.style.transformOrigin = "";
        p.style.display = ""; p.style.verticalAlign = "";
        p.style.marginRight = "";
        p.style.marginBottom = "";
      }
    });
    // Apply zoom to content area
    contentArea.style.zoom = "";
    zoomWrapper.style.zoom = (zoom !== 100) ? (zoom / 100) : "";
    if (isPage) {
      document.documentElement.style.scrollSnapType = "";
      document.body.style.display = "flex";
      document.body.style.justifyContent = "center";
      document.body.style.alignItems = "center";
      document.body.style.minHeight = "calc(100vh - 52px)";
      document.body.style.flexWrap = isVert ? "nowrap" : "wrap";
      document.body.style.flexDirection = isVert ? "column" : "";
      const show = cols === 2 ? [cur, cur + 1] : [cur];
      pages.forEach((p, i) => { p.style.display = show.includes(i) ? (cols === 2 && !isVert ? "inline-block" : "") : "none"; });
    } else {
      document.body.style.display = "";
      document.body.style.justifyContent = "";
      document.body.style.alignItems = "";
      document.body.style.minHeight = "";
      document.body.style.flexWrap = "";
      document.body.style.flexDirection = "";
      pages.forEach(p => { if (p.style.display === "none") p.style.display = cols === 2 ? "inline-block" : ""; });
      document.documentElement.style.scrollSnapType = "";
    }
  }
  function setView(mode) {
    viewMode = mode;
    pages.forEach(p => { p.style.transform = ""; p.style.marginBottom = ""; });
    if (mode === "normal") {
      sidebar.style.display = "flex"; handle.style.display = ""; contentArea.style.left = tocWidth + "px"; bar.style.left = tocWidth + "px";
      contentArea.style.display = "grid";
      zoomWrapper.style.display = "flex"; const sg = document.getElementById("or-sorter"); if (sg) sg.style.display = "none";
    } else if (mode === "reading") {
      sidebar.style.display = "none"; handle.style.display = "none"; contentArea.style.left = "0"; bar.style.left = "0";
      contentArea.style.display = "grid";
      zoomWrapper.style.display = "flex"; const sg = document.getElementById("or-sorter"); if (sg) sg.style.display = "none";
    } else if (mode === "sorter") {
      sidebar.style.display = "none"; handle.style.display = "none"; contentArea.style.left = "0";
      contentArea.style.display = "block";
      bar.style.left = "0";
      // Build thumbnail grid
      zoomWrapper.style.display = "none";
      let sorterGrid = document.getElementById("or-sorter");
      if (!sorterGrid) {
        sorterGrid = document.createElement("div");
        sorterGrid.id = "or-sorter";
        sorterGrid.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;padding:12px;align-content:start;justify-content:center;";
        contentArea.appendChild(sorterGrid);
      }
      sorterGrid.style.display = "flex";
      sorterGrid.innerHTML = "";
      // Calculate scale to fill ~4 columns
      const availW = contentArea.clientWidth - 24 - 30;
      const thumbW = availW / 4;
      const sorterScale = (thumbW / slidePw) * (sorterZoom / 100);
      pages.forEach((p, i) => {
        const card = document.createElement("div");
        card.style.cssText = "cursor:pointer;border:2px solid " + (i === cur ? "#0082F0" : "#ddd") + ";border-radius:4px;overflow:hidden;background:#fff;";
        const thumb = document.createElement("div");
        const pw = slidePw; const ph = slidePh;
        const scale = sorterScale;
        thumb.style.cssText = `overflow:hidden;`;
        const clone = p.cloneNode(true);
        clone.style.cssText = `zoom:${scale};width:${pw}px;height:${ph}px;pointer-events:none;position:relative;`;
        clone.querySelectorAll("details,.or-extra").forEach(d => d.remove());
        thumb.appendChild(clone);
        card.appendChild(thumb);
        const lbl = document.createElement("div");
        lbl.textContent = `${p.dataset.page||i+1}. ${(p.dataset.title||"").substring(0,25)}`;
        lbl.style.cssText = "padding:2px 4px;font-size:9px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
        card.appendChild(lbl);
        card.onclick = () => { setView("normal"); goToSlide(i); };
        sorterGrid.appendChild(card);
      });
    }
    applyLayout();
  }
  // View buttons
  const views = [
    {icon: "📋", title: "Normal", action: () => setView("normal")},
    {icon: "🔲", title: "Slide Sorter", action: () => setView("sorter")},
    {icon: "📖", title: "Reading View", action: () => setView("reading")},
    {icon: "🖥", title: "Slide Show", action: () => { fsOverlay.style.display = "flex"; fsOverlay.requestFullscreen().then(() => showSlide(cur)); }},
  ];
  views.forEach(v => {
    const b = document.createElement("button");
    b.textContent = v.icon;
    b.title = v.title;
    b.className = "or-bar-btn";
    b.onclick = v.action;
    bar.appendChild(b);
  });
  // Zoom
  bar.appendChild(Object.assign(document.createElement("span"), {textContent: " | ", style: "color:#999"}));
  // Layout mode selector
  const layoutSel = document.createElement("select");
  layoutSel.style = "font-size:11px;border:1px solid #ccc;border-radius:3px;padding:1px 3px;";
  [{v:"single-scroll",t:"Single ∞"},{v:"single-page",t:"Single □"},{v:"double-scroll",t:"Double ∞"},{v:"double-h-page",t:"Double ←→"},{v:"double-v-page",t:"Double ↑↓"}].forEach(o => {
    const opt = document.createElement("option"); opt.value = o.v; opt.textContent = o.t; if (o.v === layoutMode) opt.selected = true; layoutSel.appendChild(opt);
  });
  layoutSel.onchange = () => { layoutMode = layoutSel.value; localStorage.setItem("or-layout", layoutMode); setView(viewMode); };
  bar.appendChild(layoutSel);
  bar.appendChild(Object.assign(document.createElement("span"), {textContent: " | ", style: "color:#999"}));
  const zoomLabel = document.createElement("span");
  zoomLabel.textContent = "100%";
  zoomLabel.style = "min-width:35px;text-align:center;";
  const zoomMinus = document.createElement("button");
  zoomMinus.textContent = "−";
  zoomMinus.className = "or-bar-btn";
  zoomMinus.onclick = () => { if (viewMode === "sorter") { sorterZoom = Math.max(25, sorterZoom - 25); } else { zoom = Math.max(25, zoom - 25); } applyZoom(); };
  const zoomPlus = document.createElement("button");
  zoomPlus.textContent = "+";
  zoomPlus.className = "or-bar-btn";
  zoomPlus.onclick = () => { if (viewMode === "sorter") { sorterZoom = Math.min(400, sorterZoom + 25); } else { zoom = Math.min(400, zoom + 25); } applyZoom(); };
  const zoomFit = document.createElement("button");
  zoomFit.textContent = "⊞";
  zoomFit.title = "Fit to window";
  zoomFit.className = "or-bar-btn";
  let fitMode = localStorage.getItem("or-fit") !== "0";
  zoomFit.onclick = () => { 
    fitMode = !fitMode;
    localStorage.setItem("or-fit", fitMode ? "1" : "0");
    zoomFit.style.background = fitMode ? "#0082F0" : "";
    zoomFit.style.color = fitMode ? "#fff" : "";
    if (fitMode) {
      const pw = slidePw; const leftW = sidebar.style.display !== "none" ? tocWidth : 0; const rightW = rSidebarOpen ? parseInt(rSidebar.style.width) : 0; const avail = window.innerWidth - leftW - rightW - 40; zoom = Math.round(avail / pw * 100);
    } else {
      zoom = 100;
    }
    applyZoom();
  };
  if (fitMode) { zoomFit.style.background = "#0082F0"; zoomFit.style.color = "#fff"; const pw = slidePw; const leftW = sidebar.style.display !== "none" ? tocWidth : 0; const rightW = rSidebarOpen ? parseInt(rSidebar.style.width) : 0; const avail = window.innerWidth - leftW - rightW - 40; zoom = Math.round(avail / pw * 100); }
  window.addEventListener("resize", () => { if (fitMode) { zoomFit.onclick(); fitMode = true; zoomFit.style.background = "#0082F0"; zoomFit.style.color = "#fff"; } });
  function applyZoom() { 
    if (viewMode === "sorter") {
      const sg = document.getElementById("or-sorter");
      if (sg) {
        const availW = contentArea.clientWidth - 24 - 30;
        const thumbW = availW / 4;
        const scale = (thumbW / slidePw) * (sorterZoom / 100);
        sg.querySelectorAll(".or-page").forEach(c => { c.style.zoom = scale; });
      }
      zoomLabel.textContent = sorterZoom + "%";
    } else {
      applyLayout();
      zoomLabel.textContent = zoom + "%";
    }
    // Center content area scroll
    if (typeof contentArea !== 'undefined') {
      const sw = contentArea.scrollWidth;
      const cw = contentArea.clientWidth;
      if (sw > cw) contentArea.scrollLeft = (sw - cw) / 2;
      else contentArea.scrollLeft = 0;
    }
  }
  // Ctrl+Wheel zoom centered on mouse pointer
  contentArea.addEventListener("wheel", (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    if (viewMode === "sorter") {
      if (e.deltaY < 0) sorterZoom = Math.min(400, sorterZoom + 10);
      else sorterZoom = Math.max(25, sorterZoom - 10);
      applyZoom();
      return;
    }
    const oldZoom = zoom;
    if (e.deltaY < 0) zoom = Math.min(400, zoom + 10);
    else zoom = Math.max(25, zoom - 10);
    // Calculate scroll offset to keep mouse point stable
    const rect = contentArea.getBoundingClientRect();
    const mx = (e.clientX - rect.left + contentArea.scrollLeft) / (oldZoom / 100);
    const my = (e.clientY - rect.top + contentArea.scrollTop) / (oldZoom / 100);
    applyLayout();
    zoomLabel.textContent = zoom + "%";
    // Restore mouse position
    contentArea.scrollLeft = mx * (zoom / 100) - (e.clientX - rect.left);
    contentArea.scrollTop = my * (zoom / 100) - (e.clientY - rect.top);
  }, {passive: false});
  bar.appendChild(zoomMinus);
  bar.appendChild(zoomLabel);
  bar.appendChild(zoomPlus);
  bar.appendChild(zoomFit);
  // Export PPTX button
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "⬇ PPTX"; exportBtn.title = "Export annotations to PPTX";
  exportBtn.className = "or-bar-btn";
  exportBtn.style.marginLeft = "auto";
  exportBtn.onclick = () => {
    const src = document.querySelector("meta[data-source]")?.dataset.source || prompt("Source PPTX path:");
    if (!src) return;
    fetch("http://127.0.0.1:8081/api/export-pptx", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({source: src, drawings: JSON.parse(localStorage.getItem("or-drawings")||"{}")})})
      .then(r=>r.json()).then(d => { if(d.path) alert("Exported: "+d.path); else alert(d.error||"Failed"); });
  };
  bar.appendChild(exportBtn);
  // Update bar on scroll
  function updateBar() { const p = pages[cur]; const t = p?.dataset.title || ""; barInfo.textContent = `Slide ${p?.dataset.page || cur + 1} / ${pages.length}` + (t ? ` — ${t}` : ""); updateExtraIndicators(); }
  // Style for bar buttons
  const barStyle = document.createElement("style");
  barStyle.textContent = ".or-bar-btn{background:none;border:none;cursor:pointer;padding:2px 5px;border-radius:3px;font-size:12px;}.or-bar-btn:hover{background:#ddd;}";
  document.head.appendChild(barStyle);

  contentArea.addEventListener("scroll", update, { passive: true });
  contentArea.addEventListener("scroll", updateBar, { passive: true });
  update();
  updateBar();

  // --- Page mode navigation ---
  function goToSlide(idx) {
    cur = Math.max(0, Math.min(pages.length - 1, idx));
    history.replaceState(null, "", "#" + pages[cur].id);
    if (layoutMode.includes("page")) {
      applyLayout();
    } else {
      pages[cur].scrollIntoView({ behavior: "smooth" });
    }
    updateHighlight();
    updateBar();
    loadChatForSlide();
    if (activeTab == 3) { const st = tocContent.scrollTop; renderToc(); tocContent.scrollTop = st; }
    if (rSidebarOpen) updateRightPanel();
    info.textContent = `Slide ${pages[cur].dataset.page || cur + 1} / ${pages.length}` + (pages[cur].dataset.title ? ` — ${pages[cur].dataset.title}` : "");
    info.dataset.init = "1";
    history.replaceState(null, "", "#" + pages[cur].id);
    const curA = tocContent.querySelector(`a[data-idx="${cur}"]`);
    if (curA) {
      const top = curA.offsetTop - tocContent.offsetTop;
      if (top < tocContent.scrollTop || top + curA.offsetHeight > tocContent.scrollTop + tocContent.clientHeight) {
        tocContent.scrollTop = top - tocContent.clientHeight / 3;
      }
    }
  }
  // Arrow keys for page mode
  document.addEventListener("keydown", (e) => {
    if (document.fullscreenElement) return;
    if (!layoutMode.includes("page")) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); goToSlide(cur + 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); goToSlide(cur - 1); }
  });
  // Mouse wheel for page mode
  document.addEventListener("wheel", (e) => {
    if (document.fullscreenElement) return;
    if (!layoutMode.includes("page")) return;
    if (e.ctrlKey) return;
    if (e.target.closest("#or-sidebar") || e.target.closest("#or-toc") || e.target.closest("#or-rsidebar")) return;
    // Only navigate if content area can't scroll further
    const atBottom = contentArea.scrollTop + contentArea.clientHeight >= contentArea.scrollHeight - 2;
    const atTop = contentArea.scrollTop <= 2;
    if (e.deltaY > 0 && !atBottom) return;
    if (e.deltaY < 0 && !atTop) return;
    e.preventDefault();
    if (e.deltaY > 0) goToSlide(cur + 1);
    else if (e.deltaY < 0) goToSlide(cur - 1);
  }, {passive: false});
  // TOC click in page mode
  tocContent.addEventListener("click", (e) => {
    if (!layoutMode.includes("page")) return;
    const a = e.target.closest("a");
    if (a && a.dataset.idx !== undefined) { e.preventDefault(); goToSlide(parseInt(a.dataset.idx)); }
  });

  // --- Drawing / Annotations ---
  let drawMode = ""; // "" | "pen" | "text"
  let drawColor = "#ff0000";
  let drawWidth = 3;
  const drawingsStore = {}; // slideIdx -> [{type,data}]
  function loadDrawings() { try { Object.assign(drawingsStore, JSON.parse(localStorage.getItem("or-drawings")||"{}")); } catch {} }
  function saveDrawings() { localStorage.setItem("or-drawings", JSON.stringify(drawingsStore)); }
  loadDrawings();

  function createCanvas() {
    const cvs = document.createElement("canvas");
    cvs.className = "or-draw-canvas";
    cvs.style.cssText = "position:absolute;top:0;left:0;width:100%;height:calc(100% - 36px);z-index:100001;pointer-events:none;";
    return cvs;
  }
  function activateDrawing(canvas, slideIdx) {
    const ctx2d = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    // Restore saved paths
    const paths = drawingsStore[slideIdx] || [];
    paths.forEach(p => {
      if (p.type === "pen") { ctx2d.strokeStyle = p.color; ctx2d.lineWidth = p.width; ctx2d.lineCap = "round"; ctx2d.beginPath(); p.pts.forEach((pt,i) => { if (i===0) ctx2d.moveTo(pt[0]*canvas.width, pt[1]*canvas.height); else ctx2d.lineTo(pt[0]*canvas.width, pt[1]*canvas.height); }); ctx2d.stroke(); }
      else if (p.type === "text") { ctx2d.font = `${p.size||14}px sans-serif`; ctx2d.fillStyle = p.color; ctx2d.fillText(p.text, p.x*canvas.width, p.y*canvas.height); }
    });
    let drawing = false, curPath = [];
    canvas.onmousedown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (drawMode === "pen") {
        drawing = true; curPath = [];
        ctx2d.strokeStyle = drawColor; ctx2d.lineWidth = drawWidth; ctx2d.lineCap = "round"; ctx2d.beginPath();
        ctx2d.moveTo(mx, my); curPath.push([mx/canvas.width, my/canvas.height]);
      } else if (drawMode === "text") {
        const txt = prompt("Text:");
        if (txt) {
          ctx2d.font = "14px sans-serif"; ctx2d.fillStyle = drawColor;
          ctx2d.fillText(txt, mx, my);
          if (!drawingsStore[slideIdx]) drawingsStore[slideIdx] = [];
          drawingsStore[slideIdx].push({type:"text", text:txt, x:mx/canvas.width, y:my/canvas.height, color:drawColor, size:14});
          saveDrawings();
        }
      }
    };
    canvas.onmousemove = (e) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      ctx2d.lineTo(mx, my);
      ctx2d.stroke(); ctx2d.beginPath(); ctx2d.moveTo(mx, my);
      curPath.push([mx/canvas.width, my/canvas.height]);
    };
    canvas.onmouseup = () => {
      if (drawing && curPath.length > 1) {
        if (!drawingsStore[slideIdx]) drawingsStore[slideIdx] = [];
        drawingsStore[slideIdx].push({type:"pen", pts:curPath, color:drawColor, width:drawWidth});
        saveDrawings();
      }
      drawing = false;
    };
  }

  // --- Fullscreen Presentation (Shift+F5) ---
  const fsOverlay = document.createElement("div");
  fsOverlay.style.cssText = "display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:99999;justify-content:center;align-items:center;";
  document.body.appendChild(fsOverlay);
  let fsIdx = 0;
  function showSlide(idx) {
    fsOverlay.innerHTML = "";
    const p = pages[idx];
    const clone = p.cloneNode(true);
    const pw = slidePw;
    const ph = slidePh;
    const s = Math.min(window.innerWidth / pw, window.innerHeight / ph);
    clone.style.cssText = `transform:scale(${s});transform-origin:center center;margin:0;box-shadow:none;position:absolute;top:50%;left:50%;margin-left:${-pw/2}px;margin-top:${-ph/2}px;width:${pw}px;height:${ph}px;`;
    clone.querySelectorAll("span").forEach(sp => { if (sp.textContent.includes("{{PAGENUM}}")) sp.textContent = sp.textContent.replace("{{PAGENUM}}", p.dataset.page || idx + 1); });
    fsOverlay.appendChild(clone);
    // Drawing canvas
    const cvs = createCanvas();
    fsOverlay.appendChild(cvs);
    requestAnimationFrame(() => { cvs.width = fsOverlay.offsetWidth; cvs.height = fsOverlay.offsetHeight; activateDrawing(cvs, idx); cvs.style.pointerEvents = drawMode ? "auto" : "none"; });
    fsOverlay.appendChild(fsToast);
    fsOverlay.appendChild(laser);
    fsOverlay.appendChild(fsBar);
    fsPageInfo.textContent = `${idx + 1} / ${pages.length}`;
    fsSel.value = idx;
    fsIdx = idx;
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "F5" && e.shiftKey) {
      e.preventDefault();
      fsOverlay.style.display = "flex";
      fsOverlay.requestFullscreen().then(() => showSlide(cur));
    }
    if (document.fullscreenElement === fsOverlay) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        if (fsIdx < pages.length - 1) showSlide(fsIdx + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (fsIdx > 0) showSlide(fsIdx - 1);
      }
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) { fsOverlay.style.display = "none"; fsOverlay.innerHTML = ""; }
  });
  // Number key navigation in fullscreen
  let fsNumBuf = "";
  let fsNumTimer = null;
  const fsToast = document.createElement("div");
  fsToast.style.cssText = "position:absolute;bottom:40px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#fff;padding:8px 20px;border-radius:6px;font:24px sans-serif;display:none;z-index:100000;";
  // Laser pointer
  let laserOn = false;
  const laser = document.createElement("div");
  laser.style.cssText = "position:absolute;width:12px;height:12px;border-radius:50%;background:red;box-shadow:0 0 8px red;pointer-events:none;display:none;z-index:100001;transform:translate(-50%,-50%);";
  // Fullscreen toolbar (auto-hide)
  const fsBar = document.createElement("div");
  fsBar.style.cssText = "position:absolute;bottom:0;left:0;right:0;height:36px;background:rgba(0,0,0,0.8);display:flex;align-items:center;padding:0 12px;gap:10px;font:12px sans-serif;color:#fff;opacity:0;transition:opacity 0.3s;z-index:100002;";
  const fsPageInfo = document.createElement("span");
  fsBar.appendChild(fsPageInfo);
  // Page dropdown
  const fsSel = document.createElement("select");
  fsSel.style.cssText = "background:#333;color:#fff;border:1px solid #555;border-radius:3px;font-size:11px;padding:2px;";
  pages.forEach((p, i) => { const o = document.createElement("option"); o.value = i; o.textContent = `${p.dataset.page||i+1}. ${(p.dataset.title||"").substring(0,30)}`; fsSel.appendChild(o); });
  fsSel.onchange = () => showSlide(parseInt(fsSel.value));
  fsBar.appendChild(fsSel);
  // Spacer
  fsBar.appendChild(Object.assign(document.createElement("div"), {style:"flex:1"}));
  // Cursor buttons
  const cursors = [
    {icon:"➤",title:"Normal",cur:"default"},
    {icon:"🔴",title:"Laser (L)",cur:"none",laser:true},
    {icon:"✏️",title:"Pen (P)",cur:"crosshair",draw:"pen"},
    {icon:"T",title:"Text (T)",cur:"text",draw:"text"},
    {icon:"🧹",title:"Clear drawings",cur:"default",clear:true},
    {icon:"🗑",title:"Clear all slides",cur:"default",clearAll:true}
  ];
  cursors.forEach(c => { const b = document.createElement("button"); b.textContent = c.icon; b.title = c.title; b.style.cssText = "background:none;border:none;color:#fff;font-size:14px;cursor:pointer;padding:2px 6px;"; b.onclick = () => {
    laserOn = !!c.laser; laser.style.display = laserOn ? "block" : "none"; fsOverlay.style.cursor = c.cur;
    drawMode = c.draw || "";
    const cvs = fsOverlay.querySelector(".or-draw-canvas");
    if (cvs) cvs.style.pointerEvents = drawMode ? "auto" : "none";
    if (c.clear && cvs) { delete drawingsStore[fsIdx]; saveDrawings(); const ctx2d = cvs.getContext("2d"); ctx2d.clearRect(0,0,cvs.width,cvs.height); }
    if (c.clearAll && cvs) { Object.keys(drawingsStore).forEach(k => delete drawingsStore[k]); saveDrawings(); const ctx2d = cvs.getContext("2d"); ctx2d.clearRect(0,0,cvs.width,cvs.height); }
  }; fsBar.appendChild(b); });
  // Pen color/width pickers
  const undoBtn = document.createElement("button");
  undoBtn.textContent = "↩"; undoBtn.title = "Undo (Z)";
  undoBtn.style.cssText = "background:none;border:none;color:#fff;font-size:14px;cursor:pointer;padding:2px 6px;";
  undoBtn.onclick = () => {
    if (drawingsStore[fsIdx] && drawingsStore[fsIdx].length) {
      drawingsStore[fsIdx].pop(); saveDrawings();
      const cvs = fsOverlay.querySelector(".or-draw-canvas");
      if (cvs) { const ctx2d = cvs.getContext("2d"); ctx2d.clearRect(0,0,cvs.width,cvs.height); activateDrawing(cvs, fsIdx); }
    }
  };
  fsBar.appendChild(undoBtn);
  const penColor = document.createElement("input");
  penColor.type = "color"; penColor.value = "#ff0000";
  penColor.style.cssText = "width:24px;height:20px;border:none;padding:0;cursor:pointer;background:none;";
  penColor.onchange = () => { drawColor = penColor.value; };
  fsBar.appendChild(penColor);
  const penWidth = document.createElement("select");
  penWidth.style.cssText = "background:#333;color:#fff;border:1px solid #555;border-radius:3px;font-size:10px;padding:1px;";
  [1,2,3,5,8].forEach(w => { const o = document.createElement("option"); o.value = w; o.textContent = w+"px"; if(w===3) o.selected=true; penWidth.appendChild(o); });
  penWidth.onchange = () => { drawWidth = parseInt(penWidth.value); };
  fsBar.appendChild(penWidth);
  // End Show button
  const endBtn = document.createElement("button");
  endBtn.textContent = "✕"; endBtn.title = "End Show (Esc)";
  endBtn.style.cssText = "background:none;border:1px solid #666;color:#fff;font-size:12px;cursor:pointer;padding:2px 8px;border-radius:3px;margin-left:auto;";
  endBtn.onclick = () => document.exitFullscreen();
  fsBar.appendChild(endBtn);
  // Fullscreen right-click context menu
  const fsMenu = document.createElement("div");
  fsMenu.style.cssText = "position:absolute;background:#222;border:1px solid #555;border-radius:4px;padding:4px 0;font:12px sans-serif;color:#fff;display:none;z-index:100003;min-width:150px;";
  const menuItems = [
    {label: "Next Slide →", action: () => { if (fsIdx < pages.length - 1) showSlide(fsIdx + 1); }},
    {label: "Previous Slide ←", action: () => { if (fsIdx > 0) showSlide(fsIdx - 1); }},
    {label: "─────────", action: null},
    {label: "➤ Normal Cursor", action: () => { laserOn = false; laser.style.display = "none"; fsOverlay.style.cursor = "default"; }},
    {label: "🔴 Laser Pointer", action: () => { laserOn = true; laser.style.display = "block"; fsOverlay.style.cursor = "none"; }},
    {label: "🔍 Big Cursor (Small)", action: () => { laserOn = false; laser.style.display = "none"; fsOverlay.style.cursor = "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22><circle cx=%2216%22 cy=%2216%22 r=%2214%22 fill=%22none%22 stroke=%22red%22 stroke-width=%222%22/></svg>') 16 16, auto"; }},
    {label: "🔍 Big Cursor (Large)", action: () => { laserOn = false; laser.style.display = "none"; fsOverlay.style.cursor = "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22><circle cx=%2232%22 cy=%2232%22 r=%2228%22 fill=%22none%22 stroke=%22red%22 stroke-width=%223%22/><circle cx=%2232%22 cy=%2232%22 r=%222%22 fill=%22red%22/></svg>') 32 32, auto"; }},
    {label: "🔍 Highlight Cursor", action: () => { laserOn = false; laser.style.display = "none"; fsOverlay.style.cursor = "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><circle cx=%2224%22 cy=%2224%22 r=%2220%22 fill=%22rgba(255,255,0,0.3)%22 stroke=%22%23ff8800%22 stroke-width=%222%22/></svg>') 24 24, auto"; }},
    {label: "─────────", action: null},
    {label: "End Show (Esc)", action: () => document.exitFullscreen()},
  ];
  menuItems.forEach(mi => {
    const item = document.createElement("div");
    item.textContent = mi.label;
    if (mi.action) {
      item.style.cssText = "padding:4px 16px;cursor:pointer;";
      item.onmouseenter = () => item.style.background = "#444";
      item.onmouseleave = () => item.style.background = "";
      item.onclick = () => { mi.action(); fsMenu.style.display = "none"; };
    } else {
      item.style.cssText = "padding:2px 16px;color:#666;font-size:10px;";
    }
    fsMenu.appendChild(item);
  });
  fsOverlay.addEventListener("contextmenu", (e) => {
    if (!document.fullscreenElement) return;
    e.preventDefault();
    fsMenu.style.display = "block";
    fsOverlay.appendChild(fsMenu);
    const mw = fsMenu.offsetWidth, mh = fsMenu.offsetHeight;
    fsMenu.style.left = Math.min(e.clientX, window.innerWidth - mw - 4) + "px";
    fsMenu.style.top = Math.min(e.clientY, window.innerHeight - mh - 4) + "px";
  });
  fsOverlay.addEventListener("click", () => { fsMenu.style.display = "none"; });
  let fsBarTimer = null;
  fsOverlay.addEventListener("mousemove", (e) => {
    if (laserOn) { laser.style.left = e.clientX + "px"; laser.style.top = e.clientY + "px"; }
    if (!document.fullscreenElement) return;
    if (e.clientY > window.innerHeight - 80) {
      fsBar.style.opacity = "1";
      if (fsBarTimer) clearTimeout(fsBarTimer);
      fsBarTimer = null;
    } else {
      if (!fsBarTimer) {
        fsBarTimer = setTimeout(() => { fsBar.style.opacity = "0"; fsBarTimer = null; }, 1000);
      }
    }
  });
  fsOverlay.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Zoom in fullscreen
      const clone = fsOverlay.querySelector(".or-page");
      if (!clone) return;
      let fsZoom = parseFloat(clone.dataset.zoom || "1");
      fsZoom = e.deltaY < 0 ? Math.min(3, fsZoom + 0.1) : Math.max(0.5, fsZoom - 0.1);
      clone.dataset.zoom = fsZoom;
      const s = Math.min(window.innerWidth / slidePw, window.innerHeight / slidePh) * fsZoom;
      clone.style.transform = `scale(${s})`;
      return;
    }
    if (e.deltaY > 0 && fsIdx < pages.length - 1) showSlide(fsIdx + 1);
    else if (e.deltaY < 0 && fsIdx > 0) showSlide(fsIdx - 1);
  }, {passive: false});
  document.addEventListener("keydown", (e) => {
    if (!document.fullscreenElement) return;
    // Number keys for slide jump
    if (e.key >= "0" && e.key <= "9") {
      fsNumBuf += e.key;
      fsToast.textContent = fsNumBuf;
      fsToast.style.display = "block";
      if (fsNumTimer) clearTimeout(fsNumTimer);
      fsNumTimer = setTimeout(() => { fsToast.style.display = "none"; fsNumBuf = ""; }, 2000);
      return;
    }
    if (e.key === "Enter" && fsNumBuf) {
      const n = parseInt(fsNumBuf) - 1;
      if (n >= 0 && n < pages.length) showSlide(n);
      fsToast.style.display = "none";
      fsNumBuf = "";
      if (fsNumTimer) clearTimeout(fsNumTimer);
      return;
    }
    // L key toggles laser pointer
    if (e.key === "l" || e.key === "L") {
      laserOn = !laserOn; drawMode = "";
      laser.style.display = laserOn ? "block" : "none";
      fsOverlay.style.cursor = laserOn ? "none" : "";
      const cvs = fsOverlay.querySelector(".or-draw-canvas");
      if (cvs) cvs.style.pointerEvents = "none";
      return;
    }
    if (e.key === "p" || e.key === "P") {
      drawMode = drawMode === "pen" ? "" : "pen";
      laserOn = false; laser.style.display = "none";
      fsOverlay.style.cursor = drawMode ? "crosshair" : "default";
      const cvs = fsOverlay.querySelector(".or-draw-canvas");
      if (cvs) cvs.style.pointerEvents = drawMode ? "auto" : "none";
      return;
    }
    if (e.key === "z" || e.key === "Z") { undoBtn.onclick(); return; }
  });
});
