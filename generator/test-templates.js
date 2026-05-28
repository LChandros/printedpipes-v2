// Smoke test: runs each template at default params and reports
// tri count, volume, genus, bbox. Catches obvious geometry breaks before
// they ship to the browser.
//
// All templates use Schedule 40 PVC OD/ID — same dims the browser configurator
// uses. Stubs slip into Fernco couplings; no glue sockets.
import Module from 'manifold-3d';

const wasm = await Module();
wasm.setup();
const { Manifold, CrossSection } = wasm;

const SEG = 32;

const PIPE_SPECS = {
  '125': { nominal: '1¼"', od: 42.16, id: 35.05 },
  '150': { nominal: '1½"', od: 48.26, id: 40.89 },
  '200': { nominal: '2"',  od: 60.33, id: 52.50 },
  '300': { nominal: '3"',  od: 88.90, id: 77.93 },
};

function specFor(key) { return PIPE_SPECS[String(key)]; }

function genStraight({ pipeSize, length }) {
  const s = specFor(pipeSize); const rO = s.od/2, rI = s.id/2;
  const o = Manifold.cylinder(length, rO, rO, SEG, false);
  const i = Manifold.cylinder(length, rI, rI, SEG, false);
  const p = o.subtract(i); o.delete(); i.delete();
  return p;
}

function genElbow({ pipeSize, angle, bendR, stubLen }) {
  const s = specFor(pipeSize); const rO = s.od/2, rI = s.id/2;
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

function genTee({ pipeSize, topLen, bottomLen, branchLen, branchAngle }) {
  const s = specFor(pipeSize); const rO = s.od/2, rI = s.id/2;
  const build = r => {
    const mainTotal = topLen + bottomLen;
    const main = Manifold.cylinder(mainTotal, r, r, SEG, false)
      .translate([0, 0, -bottomLen]);
    const branch = Manifold.cylinder(branchLen, r, r, SEG, false)
      .rotate([0, branchAngle, 0]);
    const u = Manifold.union([main, branch]);
    main.delete(); branch.delete();
    return u;
  };
  const o = build(rO), i = build(rI);
  const p = o.subtract(i); o.delete(); i.delete();
  return p;
}

function genPtrap({ pipeSize, bendR, tailLen, armLen }) {
  const s = specFor(pipeSize); const rO = s.od/2, rI = s.id/2;
  const build = r => {
    const ubendDisk = CrossSection.circle(r, SEG).translate([bendR, 0]);
    const ubend = Manifold.revolve(ubendDisk, SEG, 180).rotate([-90, 0, 0]);
    const tail = Manifold.cylinder(tailLen, r, r, SEG, false).translate([bendR, 0, 0]);
    const elbowDisk = CrossSection.circle(r, SEG).translate([bendR, 0]);
    const elbow = Manifold.revolve(elbowDisk, SEG, 90)
      .rotate([90, 0, 0]).translate([-2 * bendR, 0, 0]);
    const arm = Manifold.cylinder(armLen, r, r, SEG, false)
      .rotate([0, -90, 0]).translate([-2 * bendR, 0, bendR]);
    const u = Manifold.union([ubend, tail, elbow, arm]);
    ubend.delete(); tail.delete(); elbow.delete(); arm.delete();
    return u;
  };
  const o = build(rO), i = build(rI);
  const p = o.subtract(i); o.delete(); i.delete();
  return p;
}

function check(name, pipe) {
  const bb = pipe.boundingBox();
  const ext = [bb.max[0]-bb.min[0], bb.max[1]-bb.min[1], bb.max[2]-bb.min[2]];
  console.log(`${name.padEnd(12)} tris=${String(pipe.numTri()).padStart(5)}  ` +
              `vol=${pipe.volume().toFixed(0).padStart(7)}mm³  ` +
              `genus=${pipe.genus()}  ` +
              `bbox=${ext.map(v => v.toFixed(0)).join('×')}mm`);
}

const cases = [
  ['straight-1½',  genStraight({ pipeSize: '150', length: 120 })],
  ['elbow90-1½',   genElbow({ pipeSize: '150', angle: 90, bendR: 40, stubLen: 40 })],
  ['elbow45-1½',   genElbow({ pipeSize: '150', angle: 45, bendR: 40, stubLen: 40 })],
  ['elbow180-1½',  genElbow({ pipeSize: '150', angle: 180, bendR: 40, stubLen: 40 })],
  ['tee90-1½',     genTee({ pipeSize: '150', topLen: 70, bottomLen: 70, branchLen: 80, branchAngle: 90 })],
  ['tee45-1½',     genTee({ pipeSize: '150', topLen: 70, bottomLen: 70, branchLen: 80, branchAngle: 45 })],
  ['tee135-1½',    genTee({ pipeSize: '150', topLen: 70, bottomLen: 70, branchLen: 80, branchAngle: 135 })],
  ['tee-asym-1½',  genTee({ pipeSize: '150', topLen: 40, bottomLen: 160, branchLen: 80, branchAngle: 90 })],
  ['ptrap-1½',     genPtrap({ pipeSize: '150', bendR: 50, tailLen: 60, armLen: 150 })],
  ['ptrap-2"',     genPtrap({ pipeSize: '200', bendR: 60, tailLen: 60, armLen: 150 })],
];

for (const [name, pipe] of cases) {
  check(name, pipe);
  pipe.delete();
}
