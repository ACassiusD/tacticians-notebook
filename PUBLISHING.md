# Publishing Tacticians Notebook to Firefox Add-ons

## Step-by-Step Publishing Guide

### 1. Create a Developer Account

1. Go to **https://addons.mozilla.org/developers/**
2. Sign in with your **Firefox Account** (or create one if needed)
3. Complete the developer registration (may require email verification)

### 2. Prepare Your Extension Files

#### Create a ZIP File

Your ZIP should contain **only** these files:
```
tacticians-notebook.zip
├── manifest.json
├── content.js
└── (optional) README.md or icons
```

**Important**: 
- Do NOT include `node_modules`, `.git`, or other development files
- The ZIP should be the root level (not a folder containing files)
- Maximum size: 4MB for unlisted, 5MB for listed extensions

#### Optional: Add Icons (Recommended)

You can add icons to your `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Tacticians Notebook",
  "version": "1.0.0",
  "description": "...",
  "icons": {
    "16": "icon-16.png",
    "48": "icon-48.png",
    "96": "icon-96.png",
    "128": "icon-128.png"
  },
  ...
}
```

Icon sizes needed:
- 16x16px (toolbar)
- 48x48px (extension management)
- 96x96px (AMO listing)
- 128x128px (AMO listing)

### 3. Submit Your Extension

1. Go to **https://addons.mozilla.org/developers/addon/submit/**
2. Choose **"On this site"** (public listing) or **"On your own"** (unlisted)
   - **On this site**: Public, searchable, requires review
   - **On your own**: Unlisted, direct link only, faster approval
3. Upload your ZIP file
4. Fill out the submission form:
   - **Name**: "Tacticians Notebook" (or your preferred name)
   - **Summary**: Short description (max 250 characters)
   - **Description**: Full description of features
   - **Categories**: Select relevant categories
   - **Tags**: Add relevant tags (e.g., "tft", "notes", "gaming")
   - **Screenshots**: Optional but recommended (at least 1)

### 4. Submission Details

#### Listing Information

**Summary** (250 chars max):
```
Add a persistent note-taking panel to TFTAcademy comp pages. Save gameplan, roll timings, item priorities, and matchup notes that persist across page reloads.
```

**Description** (can be longer):
```
Tacticians Notebook enhances your TFTAcademy experience by adding a dedicated note-taking panel below the Tips section on each comp page.

Features:
- Persistent notes that save automatically
- Unique notes for each comp (based on URL)
- Character counter
- Auto-save with visual feedback
- Dark theme matching TFTAcademy's design

Perfect for keeping track of:
- Gameplan and strategy
- Roll timings
- Item priorities
- Matchup notes
- Personal reminders

Notes are stored locally in your browser and never leave your device.
```

**Categories**: 
- Productivity
- Social & Communication (if gaming-related)

**Tags**:
- tft
- tftacademy
- notes
- gaming
- productivity
- league-of-legends

### 5. Review Process

#### Automatic Review (Unlisted)
- Usually approved within **1-2 hours**
- For simple extensions with minimal permissions
- Your extension qualifies (only uses `storage` permission)

#### Manual Review (Listed/Public)
- Can take **1-7 days**
- More thorough security and code review
- Required for public listings

#### What Reviewers Check:
- ✅ Code security (no malicious code)
- ✅ Privacy policy (if you collect data)
- ✅ Permissions justification
- ✅ Functionality matches description
- ✅ No trademark violations

### 6. After Approval

#### Unlisted Extensions
- You'll get a direct link to share
- Format: `https://addons.mozilla.org/firefox/addon/your-addon-id/`
- Users can install directly from the link

#### Listed Extensions
- Appears in Firefox Add-ons search
- Can be rated and reviewed by users
- More visibility but requires more maintenance

### 7. Updating Your Extension

1. Update `version` in `manifest.json` (e.g., "1.0.1")
2. Create new ZIP with updated files
3. Go to **Developer Hub** → **Your Add-ons** → Select your extension
4. Click **"Upload New Version"**
5. Upload new ZIP
6. Add **Release Notes** describing changes
7. Submit for review (usually faster for updates)

## Quick Checklist Before Publishing

- [ ] `manifest.json` has correct version number
- [ ] All files are included in ZIP
- [ ] No unnecessary files in ZIP
- [ ] Extension tested in Firefox
- [ ] Description and summary written
- [ ] Screenshots prepared (optional but recommended)
- [ ] Privacy policy prepared (if needed)

## Privacy Policy

Since your extension only uses local storage and doesn't collect or transmit data, you can add this to your listing:

**Privacy Policy**:
```
This extension does not collect, store, or transmit any personal data. All notes are stored locally in your browser using the browser's local storage API. No data leaves your device.
```

## Troubleshooting

### Common Issues

**"Invalid manifest"**
- Check `manifest.json` syntax (use JSON validator)
- Ensure all required fields are present
- Verify manifest_version is 3

**"File too large"**
- Remove unnecessary files
- Optimize images if included
- Check for hidden files (.git, node_modules)

**"Review rejected"**
- Check email for specific reasons
- Address security concerns
- Update code and resubmit

**"Permission denied"**
- Ensure you're using correct developer account
- Verify email is verified
- Check if account is in good standing

## Resources

- **Developer Hub**: https://addons.mozilla.org/developers/
- **Documentation**: https://extensionworkshop.com/
- **Manifest V3 Guide**: https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/
- **Review Policies**: https://extensionworkshop.com/documentation/publish/add-on-policies/

## Tips for Success

1. **Start with Unlisted**: Easier approval, can switch to listed later
2. **Clear Description**: Help users understand what your extension does
3. **Screenshots**: Visual proof helps with approval and user trust
4. **Version Carefully**: Use semantic versioning (1.0.0 → 1.0.1 → 1.1.0)
5. **Respond to Reviews**: Engage with users who leave feedback

## Next Steps After Publishing

1. Share the link with friends/testers
2. Gather feedback
3. Fix bugs and release updates
4. Consider switching to listed if you want more visibility
5. Add features based on user requests

Good luck with your publication! 🚀

