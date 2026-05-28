# printedpipes v2

Browser-based parametric generator for custom DWV (drain/waste/vent) plumbing fittings, printed-on-demand in vapor-smoothed ASA.

The product positioning is **obstacle bypass for residential plumbing retrofits** — fittings at arbitrary angles, offsets, and routings that don't exist in the standard hardware-store catalog. Not pressure-rated; not for supply lines, not for gas.

## Status

v0. Four fitting templates implemented, all generating watertight STLs via in-browser Manifold-3D WASM CSG. Configurator runs entirely client-side — no server-side render.

### Templates available

| Template  | Use case | Parameters |
|-----------|----------|------------|
| **P-trap** | Sink drain — integrated U-bend + 90° elbow + trap arm | pipe size, bend radius, tail length, arm length, wall |
| **Straight** | Plain pipe section, cut to length | pipe size, length, wall |
| **Elbow** | Bend at any angle from 5° to 180° with stubs | pipe size, bend angle, bend radius, stub length, wall |
| **T-pipe** | Three-way junction; 90° = standard tee, <90° = sweep tee | pipe size, main length, branch length, branch angle, wall |

### What's built

- **Browser configurator** (`generator/output/index.html`) — template tabs, dynamically-generated parameter UI per template, live three.js preview, STL download. ~120ms regenerate on slider release at 48 segments; 96 segments for downloaded STLs.
- **CLI generator** (`generator/ptrap.js`) — Node entry point for the P-trap with hardcoded params. Useful for headless / batch.
- **Smoke test** (`generator/test-templates.js`) — runs all 4 templates at defaults, reports tri count / volume / genus / bbox.

### What's not built yet

- Wizard flow (situation → pipe size → end-interface picker) — current UI is direct-parameter, power-user style.
- Trap-arm XYZ offset on the P-trap — current arm is straight along −X.
- ASTM D2466 glue-socket geometry on any template end.
- Slip-nut interface for the P-trap tailpiece.
- Toilet flange template.
- Order pipeline / pricing / fulfillment.

### Known anomalies

- 45° elbow reports genus = 3 (expected 1). Other angles (90°, 180°) report genus 1 correctly. Manifold still guarantees watertightness, so the STL should print; topology artifact worth chasing.

## Architecture

Single source of truth: a JavaScript geometry function (`generatePTrap`) is the only place pipe geometry is defined. The same function runs:

- **In Node** (`generator/ptrap.js`) for CLI batch / scripting / testing.
- **In the browser** (`generator/output/index.html`) for the live configurator. The browser script imports Manifold-3D's WASM module directly — no roundtrip to a server.

CSG is via [Manifold-3D](https://github.com/elalish/manifold) (Google project, Apache 2.0). Rendering is [three.js](https://threejs.org/). STL writer is a 30-line binary emitter (Manifold authors recommend 3MF over STL; we may add 3MF later).

## Running

### CLI

```
cd generator
npm install
node ptrap.js
# → generator/output/ptrap-v0.stl
```

### Browser configurator

```
cd generator
npm install
# Copy Manifold's WASM module into the served directory (one-time setup):
cp node_modules/manifold-3d/manifold.js node_modules/manifold-3d/manifold.wasm output/
# Serve it:
python3 -m http.server 8765 --directory output
```

Then open <http://localhost:8765/> in a browser.

## Repo structure

```
printedpipes-v2/
├── README.md
├── .gitignore
├── reference/           # SCAD templates from the v1 (Atlas-era) prototype — design reference, not used at runtime
│   ├── elbow.scad
│   ├── coupling.scad
│   └── …
└── generator/
    ├── package.json
    ├── ptrap.js         # CLI entry — same geometry as configurator
    ├── stlWriter.js     # Binary STL writer (Node)
    ├── verify-stl.py    # Watertight / manifold sanity-check
    └── output/          # Configurator + (gitignored) generated STLs
        ├── index.html   # Browser configurator UI
        ├── manifold.js  # Manifold-3D WASM loader (copied from node_modules — checked in)
        └── manifold.wasm
```

## Why v2?

v1 (the `LChandros/printedpipes` repo) was an OpenSCAD-based server that rendered STLs on-demand from `.scad` templates running on the Atlas home server. That server died, and OpenSCAD's render-per-parameter-change latency (~5–30s) made a "drag a slider to see the part update" UX impossible.

v2 replaces the entire SCAD pipeline with browser-side WASM CSG. Sliders update in real time (~100–200ms per regenerate), and the same code path produces the production STL. The old `.scad` files are kept in `reference/` as the canonical specification of what each fitting's geometry should be.
