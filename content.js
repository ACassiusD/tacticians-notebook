(() => {
  'use strict';

  const NOTE_ROOT_ID = 'tft-notes-under-tips';
  const storage = (typeof browser !== 'undefined' ? browser : chrome).storage.local;

  const getNoteKey = () => `tftNotes:${location.pathname}`;

  function updateCount(el, text) {
    if (!el) return;
    const len = text.length;
    el.textContent = len ? `${len} chars` : '';
  }

  async function createNotesPanel(tipsHeaderEl) {
    if (!tipsHeaderEl) return;

    const existing = document.getElementById(NOTE_ROOT_ID);
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = NOTE_ROOT_ID;
    container.style.cssText = `
      margin-top: 0.75rem;
      padding: 0.75rem;
      border-radius: 0.75rem;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.6);
      color: #e5e7eb;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    `;

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem;">
        <span style="font-weight:600;font-size:0.9rem;">My Notes for this comp</span>
        <span id="tft-notes-status" style="font-size:0.7rem;opacity:0.7;">Loaded</span>
      </div>
      <textarea
        id="tft-notes-textarea"
        placeholder="Gameplan, roll timings, item caps, matchup notes..."
        style="
          width:100%;
          min-height:120px;
          resize:vertical;
          background:rgba(15, 23, 42, 0.9);
          border-radius:0.5rem;
          border:1px solid rgba(75, 85, 99, 0.9);
          padding:0.5rem 0.6rem;
          color:#e5e7eb;
          font-size:0.85rem;
          outline:none;
          box-sizing:border-box;
        "
      ></textarea>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.25rem;font-size:0.7rem;opacity:0.7;">
        <span>Autosaves locally for each comp.</span>
        <span id="tft-notes-count"></span>
      </div>
    `;

    tipsHeaderEl.insertAdjacentElement('afterend', container);

    const textarea = container.querySelector('#tft-notes-textarea');
    const statusEl = container.querySelector('#tft-notes-status');
    const countEl = container.querySelector('#tft-notes-count');

    const key = getNoteKey();

    // Load saved note
    try {
      const data = await storage.get(key);
      const saved = data[key] || '';
      textarea.value = saved;
      updateCount(countEl, saved);
    } catch (e) {
      console.error('TFTAcademy notes load error', e);
      statusEl.textContent = 'Load failed';
    }

    let saveTimeout;
    textarea.addEventListener('input', () => {
      statusEl.textContent = 'Saving...';
      updateCount(countEl, textarea.value);

      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        try {
          await storage.set({ [key]: textarea.value });
          statusEl.textContent = 'Saved';
        } catch (e) {
          console.error('TFTAcademy notes save error', e);
          statusEl.textContent = 'Save failed';
        }
      }, 400);
    });
  }

  function findTipsHeader() {
    // Heuristic: header-like element whose text includes "Tips"
    const candidates = Array.from(
      document.querySelectorAll('h1,h2,h3,h4,h5,div')
    );

    return (
      candidates.find(el => {
        const txt = (el.textContent || '').trim();
        if (!txt) return false;
        if (!/tips/i.test(txt)) return false;
        return txt.length <= 40; // title-ish
      }) || null
    );
  }

  function tryInject() {
    const tipsHeader = findTipsHeader();
    if (tipsHeader) createNotesPanel(tipsHeader);
  }

  // Initial run
  tryInject();

  // React to DOM changes (SPA-style navigation)
  const observer = new MutationObserver(() => {
    tryInject();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Also watch for URL path changes (client-side routing)
  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      const existing = document.getElementById(NOTE_ROOT_ID);
      if (existing) existing.remove();
      tryInject();
    }
  }, 500);
})();

