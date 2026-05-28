// Smoke test: runs each template at default params and reports
// tri count, volume, genus, bbox. Catches obvious geometry breaks before
// they ship to the browser.
import Module from 'manifold-3d';

const wasm = await Module();
wasm.setup();
const { Manifold, CrossSection } = wasm;

const SEG = 32;

function genStraight({ pipeId, wall, length }) {
  const rO = pipeId/2 + wall, rI = pipeId/2;
  const o = Manifold.cylinder(length, rO, rO, SEG, false);
  const i = Manifold.cylinder(length, rI, rI, SEG, false);
  const p = o.subtract(i);
  o.delete(); i.delete();
  return p;
}

function genElbow({ pipeId, wall, angle, bendR, stubLen }) {
  const rO = pipeId/2 + wall, rI = pipeId/2;
  const build = r => {
    const disk = CrossSection.circle(r, SEG).translate([bendR, 0]);
    const bend = Manifold.revolve(disk, SEG, angle);
    const stub1 = Manifold.cylinder(stubLen, r, r, SEG, false)
      .rotate([90, 0, 0]).translate([bendR, 0, 0]);
    const cosA = Math.cos(angle * Math.PI/180);
    const sinA = Math.sin(angle * Math.PI/180);
    const stub2 = Manifold.cylinder(stubLen, r, r, SEG, false)
      .rotate([-90, 0, 0]).rotate([0, 0, angle])
      .translate([bendR*cosA, bendR*sinA, 0]);
    const u = Manifold.union([bend, stub1, stub2]);
    bend.delete(); stub1.delete(); stub2.delete();
    return u;
  };
  const o = build(rO), i = build(rI);
  const p = o.subtract(i); o.delete(); i.delete();
  return p;
}

function genTee({ pipeId, wall, mainLen, branchLen, branchAngle }) {
  const rO = pipeId/2 + wall, rI = pipeId/2;
  const build = r => {
    const main = Manifold.cylinder(mainLen, r, r, SEG, false)
      .rotate([0, 90, 0]).translate([-mainLen/2, 0, 0]);
    const branch = Manifold.cylinder(branchLen, r, r, SEG, false)
      .rotate([0, 90 - branchAngle, 0]);
    const u = Manifold.union([main, branch]);
    main.delete(); branch.delete();
    return u;
  };
  const o = build(rO), i = build(rI);
  const p = o.subtract(i); o.delete(); i.delete();
  return p;
}

function check(name, pipe) {
  const bb = pipe.boundingBox();
  const ext = [bb.max[0]-bb.min[0], bb.max[1]-bb.min[1], bb.max[2]-bb.min[2]];
  console.log(`${name.padEnd(10)} tris=${String(pipe.numTri()).padStart(5)}  ` +
              `vol=${pipe.volume().toFixed(0).padStart(7)}mm³  ` +
              `genus=${pipe.genus()}  ` +
              `bbox=${ext.map(v => v.toFixed(0)).join('×')}mm`);
}

const cases = [
  ['straight', genStraight({ pipeId: 38.1, wall: 3, length: 120 })],
  ['elbow90',  genElbow({ pipeId: 38.1, wall: 3, angle: 90, bendR: 40, stubLen: 25 })],
  ['elbow45',  genElbow({ pipeId: 38.1, wall: 3, angle: 45, bendR: 40, stubLen: 25 })],
  ['elbow180', genElbow({ pipeId: 38.1, wall: 3, angle: 180, bendR: 40, stubLen: 25 })],
  ['tee90',    genTee({ pipeId: 38.1, wall: 3, mainLen: 120, branchLen: 70, branchAngle: 90 })],
  ['tee45',    genTee({ pipeId: 38.1, wall: 3, mainLen: 120, branchLen: 70, branchAngle: 45 })],
];

for (const [name, pipe] of cases) {
  check(name, pipe);
  pipe.delete();
}
