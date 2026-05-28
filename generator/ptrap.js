// P-trap + trap arm generator (integrated, one-piece). CLI entry point.
// Mirror of the geometry built by the browser configurator in
// output/index.html. v0: hardcoded 1½" PVC DWV defaults — proves the
// Manifold→STL pipeline outside the browser.

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Module from 'manifold-3d';
import { writeBinarySTL } from './stlWriter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// All units mm.
const PIPE_ID = 38.1;          // 1½" nominal DWV inner diameter
const WALL = 3.0;
const PIPE_OD = PIPE_ID + 2 * WALL;

const R_OUTER = PIPE_OD / 2;
const R_INNER = PIPE_ID / 2;

const BEND_R = 50;             // centerline radius of curved sections
const TAIL_LEN = 50;           // vertical tailpiece (from sink down to U)
const ARM_LEN = 150;           // horizontal trap arm (toward wall)

const SEG = 64;

const wasm = await Module();
wasm.setup();
const { Manifold, CrossSection } = wasm;

function buildPath(radius) {
  // 1) 180° U-bend in vertical (XZ) plane. Caps at (+BEND_R,0,0) and
  //    (-BEND_R,0,0), both facing +Z. Dip at (0, 0, -BEND_R).
  const ubendDisk = CrossSection.circle(radius, SEG).translate([BEND_R, 0]);
  const ubend = Manifold.revolve(ubendDisk, SEG, 180).rotate([-90, 0, 0]);

  // 2) Tailpiece on the +X leg.
  const tail = Manifold.cylinder(TAIL_LEN, radius, radius, SEG, false)
    .translate([BEND_R, 0, 0]);

  // 3) 90° elbow at the top of the -X leg, turning +Z → -X.
  //    Canonical quarter-revolve produces caps at (BEND_R,0,0) facing -Y and
  //    (0,BEND_R,0) facing -X. Rotating +90° around X maps +Y→+Z so cap1
  //    ends facing -Z (mating downward onto U-bend outlet). Translate
  //    -2·BEND_R in X so cap1 lands at (-BEND_R, 0, 0).
  const elbowDisk = CrossSection.circle(radius, SEG).translate([BEND_R, 0]);
  const elbow = Manifold.revolve(elbowDisk, SEG, 90)
    .rotate([90, 0, 0])
    .translate([-2 * BEND_R, 0, 0]);

  // 4) Trap arm: cylinder aligned with -X starting at elbow exit
  //    (-2·BEND_R, 0, +BEND_R). Trap arm extends AWAY from the tailpiece
  //    column at +BEND_R — no self-intersection.
  const arm = Manifold.cylinder(ARM_LEN, radius, radius, SEG, false)
    .rotate([0, -90, 0])
    .translate([-2 * BEND_R, 0, BEND_R]);

  return Manifold.union([ubend, tail, elbow, arm]);
}

const outerSolid = buildPath(R_OUTER);
const innerSolid = buildPath(R_INNER);
const pipe = outerSolid.subtract(innerSolid);

const mesh = pipe.getMesh();
const outDir = path.join(__dirname, 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'ptrap-v0.stl');

const { triCount, bytes } = writeBinarySTL(mesh, outPath);

console.log(`Wrote ${outPath}: ${triCount} triangles, ${(bytes / 1024).toFixed(1)} KiB`);
console.log(`Outer solid volume:   ${outerSolid.volume().toFixed(1)} mm³`);
console.log(`Pipe (hollow) volume: ${pipe.volume().toFixed(1)} mm³`);
console.log(`Pipe surface area:    ${pipe.surfaceArea().toFixed(1)} mm²`);
console.log(`Triangles:            ${pipe.numTri()}`);
console.log(`Vertices:             ${pipe.numVert()}`);
console.log(`Genus:                ${pipe.genus()}`);
console.log(`Bounding box:`, pipe.boundingBox());
