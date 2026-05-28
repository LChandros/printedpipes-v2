import fs from 'node:fs';

export function writeBinarySTL(mesh, outPath) {
  const { vertProperties, triVerts, numProp } = mesh;
  const stride = numProp || 3;
  const triCount = triVerts.length / 3;

  const headerSize = 80;
  const triSize = 50;
  const buf = Buffer.alloc(headerSize + 4 + triCount * triSize);

  buf.write('printedpipes generator', 0, 'ascii');
  buf.writeUInt32LE(triCount, headerSize);

  let off = headerSize + 4;
  const v = vertProperties;

  for (let i = 0; i < triCount; i++) {
    const i0 = triVerts[i * 3 + 0] * stride;
    const i1 = triVerts[i * 3 + 1] * stride;
    const i2 = triVerts[i * 3 + 2] * stride;

    const ax = v[i0], ay = v[i0 + 1], az = v[i0 + 2];
    const bx = v[i1], by = v[i1 + 1], bz = v[i1 + 2];
    const cx = v[i2], cy = v[i2 + 1], cz = v[i2 + 2];

    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const wx = cx - ax, wy = cy - ay, wz = cz - az;
    let nx = uy * wz - uz * wy;
    let ny = uz * wx - ux * wz;
    let nz = ux * wy - uy * wx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;

    buf.writeFloatLE(nx, off);     buf.writeFloatLE(ny, off + 4);  buf.writeFloatLE(nz, off + 8);
    buf.writeFloatLE(ax, off + 12); buf.writeFloatLE(ay, off + 16); buf.writeFloatLE(az, off + 20);
    buf.writeFloatLE(bx, off + 24); buf.writeFloatLE(by, off + 28); buf.writeFloatLE(bz, off + 32);
    buf.writeFloatLE(cx, off + 36); buf.writeFloatLE(cy, off + 40); buf.writeFloatLE(cz, off + 44);
    buf.writeUInt16LE(0, off + 48);
    off += triSize;
  }

  fs.writeFileSync(outPath, buf);
  return { triCount, bytes: buf.length };
}
