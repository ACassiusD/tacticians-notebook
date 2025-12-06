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
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      display: block;
      visibility: visible;
      opacity: 1;
    `;

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem;flex-wrap:wrap;">
        <span style="font-weight:600;font-size:0.9rem;min-width:0;flex:1 1 auto;">My Notes for this comp</span>
        <span id="tft-notes-status" style="font-size:0.7rem;opacity:0.7;flex-shrink:0;">Loaded</span>
      </div>
      <textarea
        id="tft-notes-textarea"
        placeholder="Gameplan, roll timings, item caps, matchup notes..."
        style="
          width:100%;
          max-width:100%;
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
          display:block;
        "
      ></textarea>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.25rem;font-size:0.7rem;opacity:0.7;flex-wrap:wrap;gap:0.25rem;">
        <span style="min-width:0;flex:1 1 auto;">Autosaves locally for each comp.</span>
        <span id="tft-notes-count" style="flex-shrink:0;"></span>
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
    // First, try to find a button with "Tips" text (new site structure)
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const txt = (btn.textContent || '').trim();
      if (txt && /^tips$/i.test(txt)) {
        // Find the parent container that holds the Tips section
        // The Tips container has border-surface-new-border class
        let parent = btn.parentElement;
        while (parent && parent !== document.body) {
          const classes = parent.className || '';
          // Look for the main Tips container with border classes
          // Check for the container that has border-surface-new-border, flex, and rounded classes
          // Also check for min-h-[140px] or w-full to ensure we get the right container
          if (classes.includes('border-surface-new-border') && 
              classes.includes('flex') && 
              (classes.includes('rounded') || classes.includes('rounded-xl'))) {
            // Verify this is the Tips section container by checking for specific structure
            const hasTipsContent = parent.textContent && /tips/i.test(parent.textContent);
            if (hasTipsContent) {
              return parent; // Return the container div
            }
          }
          parent = parent.parentElement;
        }
      }
    }
    
    // Fallback: try headers (old site structure)
    const headers = document.querySelectorAll('h1, h2, h3, h4, h5');
    for (const el of headers) {
      const txt = (el.textContent || '').trim();
      if (txt && /tips/i.test(txt) && txt.length <= 40) {
        return el;
      }
    }
    
    // Last resort: search for divs with "Tips" text
    const likelyContainers = document.querySelectorAll('div[class*="tip"], div[class*="header"], div[class*="title"], div[class*="section"]');
    for (const el of likelyContainers) {
      const txt = (el.textContent || '').trim();
      if (txt && /tips/i.test(txt) && txt.length <= 40) {
        return el;
      }
    }
    
    return null;
  }

  function tryInject() {
    // Skip if already injected and still present
    if (document.getElementById(NOTE_ROOT_ID)) return;
    
    const tipsHeader = findTipsHeader();
    if (tipsHeader) createNotesPanel(tipsHeader);
  }

  // Throttle function to limit how often tryInject runs
  let injectTimeout;
  function throttledInject() {
    clearTimeout(injectTimeout);
    injectTimeout = setTimeout(tryInject, 300);
  }

  // Initial run
  tryInject();

  // React to DOM changes (SPA-style navigation)
  // Use a more targeted observer: only watch for added nodes, not all mutations
  const observer = new MutationObserver((mutations) => {
    // Only react if nodes were actually added (not removed/modified)
    const hasAdditions = mutations.some(m => m.addedNodes.length > 0);
    if (hasAdditions) {
      throttledInject();
    }
  });

  // Observe only the body, not the entire document tree
  // And only watch for child additions, not attribute changes
  const targetNode = document.body || document.documentElement;
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }

  // Watch for URL path changes (client-side routing) - less frequent polling
  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      const existing = document.getElementById(NOTE_ROOT_ID);
      if (existing) existing.remove();
      tryInject();
    }
  }, 1000); // Reduced from 500ms to 1000ms
})();

