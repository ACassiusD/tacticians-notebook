# Tacticians Notebook - Developer Documentation

## Overview

Tacticians Notebook is a Firefox/Chrome browser extension that adds a persistent note-taking panel to TFTAcademy.com comp pages. The extension injects a notes panel below the "Tips" section, allowing users to save comp-specific notes that persist across page reloads.

## Architecture

### Extension Type
- **Manifest Version**: 3
- **Type**: Content Script Extension
- **Injection Point**: `document_idle` (runs after DOM is ready but before `window.onload`)

### File Structure
```
tacticians-notebook/
├── manifest.json      # Extension configuration
├── content.js         # Main content script (runs in page context)
└── README.md          # User-facing documentation
```

## Technical Implementation

### 1. Content Script Execution

The content script (`content.js`) is wrapped in an IIFE (Immediately Invoked Function Expression) to:
- Avoid polluting the global namespace
- Prevent variable conflicts with the page's JavaScript
- Enable strict mode for better error catching

```javascript
(() => {
  'use strict';
  // ... extension code
})();
```

### 2. Storage Mechanism

**Storage API**: Uses `browser.storage.local` (Firefox) or `chrome.storage.local` (Chrome) for cross-browser compatibility.

**Storage Key Format**: `tftNotes:${location.pathname}`
- Example: `tftNotes:/tierlist/comps/set-16-neeko-ori`
- Each comp page has its own isolated storage key
- Notes are automatically associated with the URL path

**Storage Operations**:
- **Read**: Asynchronous `storage.get(key)` on panel creation
- **Write**: Debounced (400ms) on textarea input events
- **Scope**: Local to the browser (not synced across devices)

### 3. DOM Injection Strategy

#### Finding the Tips Section

The extension uses a multi-tier fallback strategy to locate the Tips section:

1. **Primary Method (New Site Structure)**:
   - Searches for `<button>` elements with text content matching `/^tips$/i`
   - Traverses up the DOM tree to find the parent container
   - Identifies container by CSS classes: `border-surface-new-border`, `flex`, and `rounded`
   - Returns the container div for injection

2. **Fallback Method (Old Site Structure)**:
   - Searches for header elements (`h1-h5`) containing "Tips" text
   - Validates text length ≤ 40 characters (to avoid false matches)

3. **Last Resort**:
   - Searches divs with class names containing: `tip`, `header`, `title`, or `section`
   - Matches elements with "Tips" in text content

#### Panel Injection

```javascript
tipsHeaderEl.insertAdjacentElement('afterend', container);
```

- Uses `insertAdjacentElement('afterend')` to insert the panel immediately after the Tips section
- Prevents duplicate injections by checking for existing panel ID
- Removes existing panel before creating a new one (handles re-injections)

### 4. Performance Optimizations

#### MutationObserver Throttling

**Problem**: DOM mutations can fire hundreds of times per second, causing performance issues.

**Solution**:
- **Throttling**: 300ms debounce on injection attempts
- **Filtering**: Only reacts to `addedNodes` mutations (ignores removals/modifications)
- **Scope**: Observes `document.body` instead of entire `document.documentElement`
- **Early Exit**: Skips injection if panel already exists

```javascript
const observer = new MutationObserver((mutations) => {
  const hasAdditions = mutations.some(m => m.addedNodes.length > 0);
  if (hasAdditions) {
    throttledInject(); // 300ms debounce
  }
});
```

#### QuerySelector Optimization

**Before**: `document.querySelectorAll('h1,h2,h3,h4,h5,div')` - queries ALL divs (thousands of elements)

**After**: 
- Targeted queries: `button`, then `h1-h5`, then specific div classes
- Early returns on first match
- Stops searching once Tips section is found

#### Polling Reduction

- URL change detection: Reduced from 500ms to 1000ms interval
- Only checks `location.pathname` (not full URL)
- Removes existing panel before re-injection on route change

### 5. Event Handling

#### Input Debouncing

**Save Operation**: Debounced with 400ms timeout
- Prevents excessive storage writes during typing
- Updates character count immediately
- Shows "Saving..." status during debounce period
- Updates to "Saved" after successful write

```javascript
textarea.addEventListener('input', () => {
  statusEl.textContent = 'Saving...';
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    await storage.set({ [key]: textarea.value });
    statusEl.textContent = 'Saved';
  }, 400);
});
```

### 6. Styling Strategy

**Inline Styles**: All styles are inline to:
- Avoid CSS conflicts with page styles
- Ensure consistent appearance across site updates
- Eliminate need for separate CSS file
- Use CSS-in-JS approach for isolation

**Design System**:
- Dark theme matching TFTAcademy aesthetic
- Semi-transparent backgrounds (`rgba(15, 23, 42, 0.9)`)
- System font stack for cross-platform consistency
- Responsive textarea with vertical resize

### 7. SPA (Single Page Application) Support

TFTAcademy uses client-side routing, so the extension handles:

1. **Initial Load**: `tryInject()` runs immediately on script load
2. **DOM Changes**: MutationObserver watches for new content
3. **Route Changes**: `setInterval` polls for `location.pathname` changes
4. **Cleanup**: Removes old panel before injecting new one on route change

## Debugging

### Browser Console

**Firefox**:
- Press `Ctrl+Shift+J` (or `Cmd+Shift+J` on Mac) for Browser Console
- Shows extension errors and logs

**Chrome**:
- Press `Ctrl+Shift+J` for Developer Tools
- Check Console tab for content script logs

### Content Script Logging

The extension logs errors to console:
- `'TFTAcademy notes load error'` - Storage read failures
- `'TFTAcademy notes save error'` - Storage write failures

### Common Issues

1. **Panel Not Appearing**:
   - Check console for errors
   - Verify Tips section exists on page
   - Check if `findTipsHeader()` returns null
   - Inspect DOM to see if panel was created but hidden

2. **Notes Not Saving**:
   - Check browser storage permissions
   - Verify storage quota not exceeded
   - Check console for storage errors

3. **Performance Issues**:
   - Check MutationObserver callback frequency
   - Verify throttling is working (should see 300ms delays)
   - Profile with browser DevTools Performance tab

## Browser Compatibility

### Firefox
- Uses `browser.storage.local` API
- Manifest V3 support
- Tested on Firefox 109+

### Chrome/Chromium
- Uses `chrome.storage.local` API
- Manifest V3 support
- Tested on Chrome 88+

### Cross-Browser Detection
```javascript
const storage = (typeof browser !== 'undefined' ? browser : chrome).storage.local;
```

## Security Considerations

1. **Content Security**: Content script runs in page context but is isolated from page JavaScript
2. **Storage**: Data stored locally, never transmitted
3. **Permissions**: Only requires `storage` permission (no network access)
4. **XSS Protection**: Uses `textContent` instead of `innerHTML` for user input display

## Future Improvements

### Potential Enhancements

1. **Export/Import**: Add ability to export notes as JSON/text
2. **Sync**: Use `storage.sync` for cross-device synchronization
3. **Rich Text**: Support markdown or rich text formatting
4. **Search**: Add search functionality across all saved notes
5. **Templates**: Pre-filled note templates for common comps
6. **Backup**: Automatic backup to cloud storage

### Code Improvements

1. **TypeScript**: Convert to TypeScript for better type safety
2. **Modularization**: Split into separate modules (storage, DOM, UI)
3. **Testing**: Add unit tests for core functions
4. **Error Recovery**: Better error handling and retry logic
5. **Accessibility**: Add ARIA labels and keyboard navigation

## API Reference

### Functions

#### `getNoteKey()`
Returns storage key for current page path.
- **Returns**: `string` - Format: `tftNotes:${location.pathname}`

#### `updateCount(el, text)`
Updates character count display.
- **Parameters**:
  - `el`: HTMLElement - Count display element
  - `text`: string - Text to count
- **Returns**: `void`

#### `createNotesPanel(tipsHeaderEl)`
Creates and injects the notes panel.
- **Parameters**:
  - `tipsHeaderEl`: HTMLElement - Element to insert panel after
- **Returns**: `Promise<void>`
- **Side Effects**: 
  - Creates DOM elements
  - Sets up event listeners
  - Loads/saves from storage

#### `findTipsHeader()`
Locates the Tips section in the DOM.
- **Returns**: `HTMLElement | null`
- **Strategy**: Multi-tier fallback (button → headers → divs)

#### `tryInject()`
Attempts to inject the notes panel.
- **Returns**: `void`
- **Side Effects**: May create notes panel if Tips section found

#### `throttledInject()`
Throttled version of `tryInject()`.
- **Throttle**: 300ms
- **Returns**: `void`

### Constants

- `NOTE_ROOT_ID`: `'tft-notes-under-tips'` - Unique ID for notes panel container

## Testing

### Manual Testing Checklist

- [ ] Panel appears on comp pages
- [ ] Panel does not appear on non-comp pages
- [ ] Notes save after typing
- [ ] Notes persist after page reload
- [ ] Notes are unique per comp (different paths)
- [ ] Panel works with SPA navigation
- [ ] Character count updates correctly
- [ ] Status messages display correctly
- [ ] No console errors
- [ ] Performance is acceptable (no lag)

### Test URLs

- Comp page: `https://tftacademy.com/tierlist/comps/set-16-neeko-ori`
- Non-comp page: `https://tftacademy.com/` (should not inject)

## Contributing

When modifying the extension:

1. Test on both Firefox and Chrome
2. Check console for errors
3. Verify performance (use DevTools Performance tab)
4. Test with slow network (throttle in DevTools)
5. Test SPA navigation (click between comps)
6. Verify storage persistence across reloads

## License

[Add your license here]

