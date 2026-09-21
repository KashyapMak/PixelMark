# PixelMark 🎯

> **High-Performance Browser-Based Image Markup, Vector Annotation, and Redaction Studio**

[![Deploy to GitHub Pages](https://github.com/kashyapmak/PixelMark/actions/workflows/deploy.yml/badge.svg)](https://github.com/kashyapmak/PixelMark/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Backend](https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald.svg)](#privacy--security)

### 🚀 **Live Demo & App URL:**
### 👉 [https://kashyapmak.github.io/PixelMark/](https://kashyapmak.github.io/PixelMark/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How to Use PixelMark](#how-to-use-pixelmark)
  - [1. Loading an Image](#1-loading-an-image)
  - [2. Annotating & Drawing](#2-annotating--drawing)
  - [3. Censor & Redaction](#3-censor--redaction)
  - [4. Editing Existing Elements](#4-editing-existing-elements)
  - [5. Exporting & Sharing](#5-exporting--sharing)
- [Additional Tools Suite](#additional-tools-suite)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Themes & Customization](#themes--customization)
- [Privacy & Security](#privacy--security)
- [Developer Guide](#developer-guide)

---

## Overview

**PixelMark** is a modern, responsive web application designed for fast, crisp, and professional image annotations, tutorial creation, bug reporting, and screenshot markups. 

Everything runs **100% locally in your web browser** using HTML5 Canvas and Web APIs. Your images, credentials, or sensitive documents are never uploaded to any remote server or third-party service.

---

## Key Features

- **Rich Vector Annotations**:
  - **Drawing & Highlights**: Smooth freehand pencil, fine brush, semi-transparent highlighter marker.
  - **Geometric Shapes**: Rectangles, rounded boxes, ellipses, polygons, stars, triangles.
  - **Arrows & Connectors**: High-visibility direct arrows, double-ended pointers, curved Bezier arrows, and technical dimension measurement rulers with auto-calculated pixel lengths.
  - **Typography & Callouts**: Standard text, bordered/outlined billboard text, speech & comic callout bubbles, and auto-incrementing step number badges (`1`, `2`, `3`...).
- **Privacy & Redaction Tools**:
  - **Pixelate**: Obscure sensitive passwords, API keys, or faces with adjustable mosaic grid density.
  - **Gaussian Blur**: Smooth, clean redaction for confidential data.
  - **Spotlight Mode**: Dim the surrounding canvas to illuminate and focus on a designated critical area.
- **Precision Canvas Transformations**:
  - Arbitrary custom rectangular cropping with preset aspect ratios (Freeform, 1:1, 4:3, 16:9, Golden Ratio).
  - 90° clockwise and counter-clockwise rotation, horizontal/vertical flipping.
  - Smooth zoom from **10% to 500%** with mouse wheel or pinch-to-zoom.
  - Pan navigation with middle-click, spacebar drag, or interactive mini-map viewport.
- **Full Object Manipulation**:
  - Multi-select using selection marquees or Shift+Click.
  - Interactive 8-point bounding box handles for resizing, scaling, and 360° rotation.
  - Layer management (Bring to Front, Send to Back, Step Up/Down).
  - Alignment tools (Align Left, Center, Right, Top, Middle, Bottom).
  - Duplicate (`Ctrl+D`), Copy (`Ctrl+C`), Paste (`Ctrl+V`), and Delete.
  - Multi-level Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`).
- **Additional Productivity Suite**:
  - **Screen & Window Capture**: Direct browser-level tab/window/screen capture via WebRTC Display Media.
  - **Screen Color Picker**: Magnifier loupe eyedropper, RGB/HEX/HSL analyzer, and saved swatch palette.
  - **QR Code Studio**: Built-in 2D QR generator and live image QR decoder with stamp-to-canvas capability.
  - **Image Effects Studio**: Add polished macOS / Windows window frames, drop shadows, canvas padding borders, and watermarks.
  - **Image Combiner & Stitcher**: Merge multiple screenshots horizontally or vertically with customized spacing and dividers.
  - **Hash & Image Metrics**: Technical resolution, aspect ratio, color depth, and instant SHA-256 / MD5 cryptographic integrity checksums.
- **Export & Portability**:
  - One-click copy directly to system clipboard as a PNG image (`Ctrl+Shift+C`).
  - High-resolution download in **PNG**, **JPEG**, **WebP**, and scalable **SVG**.
  - Save project state as a `.pixelmark` JSON file to resume editing anytime.

---

## How to Use PixelMark

### 1. Loading an Image
You can load an image into PixelMark using any of the following methods:
- **Drag and Drop**: Simply drag any image file from your computer or desktop and drop it directly onto the canvas.
- **Clipboard Paste**: Press `Ctrl+V` (or `Cmd+V` on Mac) anywhere in the app to paste a copied screenshot or image.
- **Open Button**: Click **Open** in the top navigation bar to select a file from your file system.
- **Sample Gallery**: Click **Samples** in the top bar to test with preloaded diagrams, dashboards, or interface screenshots.
- **Screen Capture**: Choose **Tools > Screen Capture** to take a live screenshot of any application window, screen, or browser tab.

### 2. Annotating & Drawing
1. Select a tool from the **Left Toolbar** (Pencil, Arrow, Rectangle, Step Badge, Text, etc.).
2. Many toolbar icons feature an **arrow indicator** that opens an expandable flyout menu with related tools, quick stroke sizes, and line styles.
3. Click and drag on the canvas to place your annotation.
4. For step badges, simply click anywhere on the image—the counter increments automatically (`1`, `2`, `3`...).

### 3. Censor & Redaction
To redact sensitive data (such as emails, bank details, or passwords):
1. In the left toolbar, click on the **Pixelate** or **Blur** tool (under the Redaction flyout).
2. Drag a rectangle over the sensitive area.
3. Use the right **Inspector panel** to adjust the pixel block size or blur strength.

### 4. Editing Existing Elements
1. Switch to the **Select tool** (press `V` or click the arrow at the top of the toolbar).
2. Click any annotation on the canvas.
3. Use the bounding box handles to resize or rotate the element.
4. Use the right **Inspector panel** to customize:
   - Stroke color, fill color, and opacity
   - Stroke width and dash patterns (solid, dashed, dotted)
   - Font family, font size, alignment, and drop shadows
   - Layer ordering (Bring to Front, Send to Back)

### 5. Exporting & Sharing
- **Copy to Clipboard**: Click **Copy Image** in the top bar (or press `Ctrl+Shift+C`) to instantly paste into Slack, Discord, Microsoft Teams, GitHub issues, or emails.
- **Download**: Click **Export** to save your markup as a **PNG**, **JPEG**, **WebP**, or **SVG** file.
- **Save Project**: Select **Save JSON** to keep all vector layers editable for later sessions.

---

## Additional Tools Suite

Access these auxiliary utilities from the top bar or toolbar flyout:

| Tool | Purpose |
| :--- | :--- |
| **Screen Capture** | Capture your entire display, application window, or browser tab directly into the canvas. |
| **Color Picker** | Inspect pixel colors with an eyedropper, view HEX/RGB/HSL values, and copy color codes. |
| **Image Effects** | Add macOS dark/light window frames, elevation drop shadows, canvas padding, and watermarks. |
| **QR Code Studio** | Generate custom QR codes to stamp onto images, or scan and decode QR codes within screenshots. |
| **Image Combiner** | Stitch two or more screenshots side-by-side or stacked vertically with clean borders. |
| **Hash & Metrics** | Calculate cryptographic SHA-256 and MD5 hashes, dimensions, file size, and color depths. |

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `V` | Select / Transform Tool |
| `H` / `P` | Freehand Pencil |
| `R` | Rectangle Shape |
| `O` | Ellipse / Circle Shape |
| `A` | Arrow Tool |
| `T` | Text Tool |
| `S` | Step Number Badge Tool |
| `X` | Pixelate Redaction Tool |
| `B` | Blur Redaction Tool |
| `Space + Drag` | Pan canvas |
| `Ctrl + Z` / `Cmd + Z` | Undo |
| `Ctrl + Y` / `Cmd + Shift + Z` | Redo |
| `Ctrl + C` / `Ctrl + V` | Copy / Paste selected annotations |
| `Ctrl + D` | Duplicate selected annotations |
| `Delete` / `Backspace` | Delete selected annotations |
| `Ctrl + S` | Save image |
| `Ctrl + Shift + C` | Copy merged image to clipboard |
| `Ctrl + +` / `Ctrl + -` | Zoom in / Zoom out |
| `Ctrl + 0` | Fit image to screen |
| `?` | Show Shortcuts cheat sheet |

---

## Themes & Customization

PixelMark includes three themes switchable via the palette icon in the top navigation bar:
- **Dark Studio** (Default): Designed for high-contrast focus and prolonged markup work.
- **Light Modern**: A daylight palette with clean borders and light checkered transparency grid.
- **Midnight Indigo**: Deep twilight theme featuring rich indigo accents.

Your theme preference is automatically stored in `localStorage` across visits.

---

## Privacy & Security

- **100% Client-Side**: All rendering, pixel processing, blurring, and exports happen locally inside your browser tab.
- **No Remote Telemetry**: PixelMark does not collect, log, or transmit your images to any server.
- **Safe for Sensitive Work**: Confidently annotate financial statements, medical records, or proprietary code screenshots without security risk.

---

## Developer Guide

For source code structure, building locally, running the TypeScript compiler, and continuous deployment workflows, see the companion **[Developer Guide (DEVELOPER.md)](./DEVELOPER.md)**.
