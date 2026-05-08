# Vaultkeeper

Vaultkeeper is a desktop worldbuilding and creative writing app built with Tauri, React, TypeScript, Zustand, and Tiptap.

## Current Features

- Rich text editor with a floating formatting toolbar
- Formatting support for headings, bold, italic, underline, strike, lists, blockquotes, alignment, text color, highlight, font family, and font size
- Wiki-style page linking
- Vault creation and vault launcher
- Page creation, page browsing, and autosave
- Safe page deletion to `vault/.trash/pages/`
- Backlink-aware delete confirmation
- Graph view for page relationships
- Resizable and collapsible side panels
- Live theme customization with multiple built-in presets

## Tech Stack

- Tauri 2
- React
- TypeScript
- Zustand
- Tiptap
- CSS variable theming

## Run Locally

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run build
```
