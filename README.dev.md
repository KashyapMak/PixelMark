# PixelMark - Developer Guide

> For comprehensive architecture, engineering details, and deployment pipeline configuration, see the dedicated [DEVELOPER.md](./DEVELOPER.md).

## Quick Summary for Developers

- **Live Deployment**: [https://kashyapmak.github.io/PixelMark/](https://kashyapmak.github.io/PixelMark/)
- **End-User Manual**: [README.md](./README.md)
- **Deployment Pipeline**: Configured via GitHub Actions in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

### Setup & Run
```bash
# Install dependencies
npm install

# Start development server on http://localhost:3000
npm run dev

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build
```

See [DEVELOPER.md](./DEVELOPER.md) for full architecture notes, coordinate matrix transformations, and instructions on adding new tools and shapes.
