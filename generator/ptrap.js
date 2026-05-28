// P-trap CLI generator — Fernco-compatible (Schedule 40 PVC dims).
// Mirror of the geometry in output/index.html, hardcoded to 1½" defaults.

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Module from 'manifold-3d';
import { writeBinarySTL } from './stlWriter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Schedule 40 PVC, 1½" nominal — matches Fernco 1056-150 coupling.
const PIPE_OD = 48.26;
const PIPE_ID = 40.89;
const R_OUTER = PIPE_OD / 2;
const R_INNER = PIPE_ID / 2;

const BEND_R  = 50;     // centerline radius of curved sections (mm)
const TAIL_LEN = 60;    // tailpiece (sink end) — must be ≥30 mm for Fernco grip
const ARM_LEN  = 150;   // trap arm (wall end) — also ≥30 mm

const SEG = 64;

const wasm = await Module();
wasm.setup();
const { Manifold, CrossSection } = wasm;

function buildPath(radius) {
  const ubendDisk = CrossSection.circle(radius, SEG).translate([BEND_R, 0]);
  const ubend = Manifold.revolve(ubendDisk, SEG, 180).rotate([-90, 0, 0]);

  const tail = Manifold.cylinder(TAIL_LEN, radius, radius, SEG, false)
    .translate([BEND_R, 0, 0]);

  const elbowDisk = CrossSection.circle(radius, SEG).translate([BEND_R, 0]);
  const elbow = Manifold.revolve(elbowDisk, SEG, 90)
    .rotate([90, 0, 0])
    .translate([-2 * BEND_R, 0, 0]);

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
console.log(`Pipe spec:            1½" Sch 40 PVC (OD ${PIPE_OD}, ID ${PIPE_ID})`);
console.log(`Fernco recommended:   1056-150 (1½" flexible coupling) × 2`);
console.log(`Outer solid volume:   ${outerSolid.volume().toFixed(1)} mm³`);
console.log(`Pipe (hollow) volume: ${pipe.volume().toFixed(1)} mm³`);
console.log(`Pipe surface area:    ${pipe.surfaceArea().toFixed(1)} mm²`);
console.log(`Triangles:            ${pipe.numTri()}`);
console.log(`Genus:                ${pipe.genus()}`);
console.log(`Bounding box:`, pipe.boundingBox());
