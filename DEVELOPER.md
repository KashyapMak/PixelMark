# PixelMark - Developer & Architecture Guide 🛠️

> **Technical documentation for developers, contributors, and maintainers.**

Live deployment: [https://kashyapmak.github.io/PixelMark/](https://kashyapmak.github.io/PixelMark/)  
End-user documentation: [README.md](./README.md)

---

## Table of Contents

- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
- [NPM Scripts](#npm-scripts)
- [GitHub Pages Deployment Pipeline](#github-pages-deployment-pipeline)
  - [Pipeline Workflow File](#pipeline-workflow-file)
  - [Enabling GitHub Pages in Repository Settings](#enabling-github-pages-in-repository-settings)
  - [Vite Base URL Configuration](#vite-base-url-configuration)
- [Core Canvas Engine & State Architecture](#core-canvas-engine--state-architecture)
  - [Coordinate Transformation Matrix](#coordinate-transformation-matrix)
  - [Annotation Data Model](#annotation-data-model)
  - [History Stack (Undo / Redo)](#history-stack-undo--redo)
  - [Extending PixelMark with New Tools](#extending-pixelmark-with-new-tools)
- [Validation & Quality Assurance](#validation--quality-assurance)

---

## Architecture & Tech Stack

PixelMark is built as a pure client-side single-page web application with zero external server dependencies:

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Bundler & Build Tool**: [Vite 6](https://vitejs.dev/) with `@vitejs/plugin-react`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Animation & Transitions**: [Motion](https://motion.dev/)
- **Canvas Rendering**: Native HTML5 Canvas 2D Context with sub-pixel interpolation and high-DPI (`window.devicePixelRatio`) scaling
- **Utilities**:
  - `qrcode` for SVG/Canvas QR generation
  - `jsqr` for client-side QR code decoding and barcode scanning
  - Web Crypto API (`crypto.subtle`) for SHA-256 hashing
  - Pure JS MD5 algorithm (`src/utils/hashUtils.ts`)

---

## Project Directory Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD deployment pipeline to GitHub Pages
├── public/                   # Static assets
├── src/
│   ├── components/           # Modular React components
│   │   ├── CanvasWorkspace.tsx      # Main interactive canvas stage & pointer handlers
│   │   ├── ColorPickerModal.tsx     # Eyedropper & precision color analyzer
│   │   ├── HashCheckModal.tsx       # Cryptographic hashes & image metadata
│   │   ├── ImageCombinerModal.tsx   # Multi-screenshot stitching tool
│   │   ├── ImageEffectsModal.tsx    # Window borders, drop shadows & watermarks
│   │   ├── Inspector.tsx            # Right sidebar property inspector
│   │   ├── MiniMap.tsx              # Viewport overview & quick-pan navigation
│   │   ├── QrCodeModal.tsx          # QR generator and scanner modal
│   │   ├── ScreenCaptureModal.tsx   # WebRTC screen/tab/window recorder
│   │   ├── ShortcutsModal.tsx       # Keyboard shortcuts cheat sheet
│   │   ├── Toolbar.tsx              # Left tool palette with expandable flyouts
│   │   └── TopBar.tsx               # Header bar, action buttons & theme switcher
│   ├── utils/                # Functional logic & rendering algorithms
│   │   ├── canvasRenderer.ts        # Comprehensive HTML5 Canvas drawing engine
│   │   ├── exportUtils.ts           # PNG, JPEG, WebP, SVG, and JSON exporters
│   │   ├── hashUtils.ts             # Client-side MD5 and SHA-256 calculations
│   │   ├── sampleImages.ts          # Pre-packaged demo images
│   │   └── theme.ts                 # Dark Studio, Light Modern, and Midnight themes
│   ├── App.tsx               # Root application controller & global state
│   ├── index.css             # Tailwind CSS entrypoint
│   ├── main.tsx              # React DOM mounting
│   └── types.ts              # Global TypeScript interfaces, types & enums
├── index.html                # HTML entry point with typography & meta tags
├── metadata.json             # Applet metadata
├── package.json              # Project dependencies & npm scripts
├── tsconfig.json             # TypeScript compiler configuration
└── vite.config.ts            # Vite bundler configuration (relative base for Pages)
```

---

## Getting Started

### Prerequisites
- **Node.js**: Version 20.x or higher recommended
- **NPM**: Version 9.x or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/kashyapmak/PixelMark.git
cd PixelMark
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

---

## NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Starts the local development server |
| `npm run build` | `vite build` | Compiles the production bundle to `/dist` |
| `npm run preview` | `vite preview` | Previews the compiled `/dist` build locally |
| `npm run lint` | `tsc --noEmit` | Runs the TypeScript compiler for type checking |
| `npm run clean` | `rm -rf dist` | Deletes previous build artifacts |

---

## GitHub Pages Deployment Pipeline

PixelMark is configured for automated CI/CD deployment to **GitHub Pages** using GitHub Actions.

### Pipeline Workflow File
The deployment workflow is defined in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    name: Build & Validate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run TypeScript type check / lint
        run: npm run lint

      - name: Build production bundle
        run: npm run build

      - name: Create 404.html fallback
        run: cp dist/index.html dist/404.html

      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    name: Deploy to GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Enabling GitHub Pages in Repository Settings

To activate the automated deployment in your GitHub repository:
1. Navigate to your repository on GitHub: `https://github.com/kashyapmak/PixelMark`
2. Go to **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Push any commit to the `main` branch (or run the workflow manually via the **Actions** tab).
5. The pipeline will build and publish the site to:  
   👉 `https://kashyapmak.github.io/PixelMark/`

### Vite Base URL Configuration

In `vite.config.ts`, the `base` property is set to `./`:
```ts
export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    // ...
  };
});
```
This ensures that all bundled assets (`.js`, `.css`, fonts, and images) use relative paths. This allows the application to function correctly whether deployed at the domain root or under a subpath like `/PixelMark/`.

---

## Core Canvas Engine & State Architecture

### Coordinate Transformation Matrix

The interactive canvas operates in two primary coordinate spaces:
1. **Screen / Viewport Space**: Mouse event coordinates `(clientX, clientY)` relative to the `<canvas>` DOM element.
2. **Image / World Space**: Unscaled, unrotated pixel coordinates of the base image.

Coordinate conversion is handled by:
```ts
// Screen coordinates -> Image coordinates
function screenToImage(screenX: number, screenY: number, pan: Point, zoom: number): Point {
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  };
}
```

When user interactions occur (drawing, dragging, resizing, or rotating), all vectors are stored strictly in **Image Space**. This ensures resolution independence during zoom, panning, and high-DPI export.

### Annotation Data Model

Every visual item on the canvas conforms to the `AnnotationObject` interface (`src/types.ts`):

```ts
export interface AnnotationObject {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  points?: Point[];         // For freehand pencil, brush, polygon, and curved arrows
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  opacity: number;
  text?: string;            // For text, callout, and badge tools
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  pixelSize?: number;       // For pixelate redaction
  blurRadius?: number;      // For blur redaction
  arrowType?: 'standard' | 'double' | 'curved';
  shadow?: ShadowSettings;
  // ...
}
```

### History Stack (Undo / Redo)

Undo and Redo operations are tracked via snapshot immutability in `App.tsx`:
- `undoStack`: Array of previous `HistoryState` snapshots.
- `redoStack`: Array of undone `HistoryState` snapshots.
- Changes push the current state to `undoStack` (capped at 50 levels for memory optimization).

### Extending PixelMark with New Tools

To add a new markup tool or shape:
1. **Define the Tool**: Add the identifier to `ToolType` in `src/types.ts`.
2. **Implement Renderer**: Add the corresponding rendering branch in `src/utils/canvasRenderer.ts`:
   ```ts
   export function renderAnnotation(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
     switch (obj.type) {
       case 'my-new-tool':
         // Draw custom path on canvas
         break;
     }
   }
   ```
3. **Add Event Handling**: In `src/components/CanvasWorkspace.tsx`, handle pointer down/move/up for the new tool.
4. **Register in Toolbar**: Add the icon and tool definition in `src/components/Toolbar.tsx`.
5. **Inspector Controls**: Add any custom properties in `src/components/Inspector.tsx`.

---

## Validation & Quality Assurance

Before publishing or creating a pull request, run the verification suite:

```bash
# 1. Type Checking & Linter
npm run lint

# 2. Production Build Test
npm run build

# 3. Test Production Output Locally
npm run preview
```

### Automated GitHub Actions Checks
Every push to `main` executes `npm run lint` and `npm run build` in a clean Ubuntu runner before deploying to GitHub Pages. Any TypeScript or bundling errors will block deployment and notify the committer.
