"""Basic STL validator — reads binary STL, sanity-checks structure, prints stats."""
import struct
import sys
import math
from collections import defaultdict

def main(path):
    with open(path, 'rb') as f:
        header = f.read(80)
        (tri_count,) = struct.unpack('<I', f.read(4))
        print(f'Header: {header[:30].decode("ascii", errors="replace").rstrip(chr(0))!r}')
        print(f'Triangles declared: {tri_count}')

        expected = 84 + tri_count * 50
        f.seek(0, 2)
        actual_size = f.tell()
        print(f'File size: {actual_size} bytes  (expected {expected})')
        assert actual_size == expected, f'Size mismatch: {actual_size} vs {expected}'

        f.seek(84)
        min_xyz = [float('inf')] * 3
        max_xyz = [float('-inf')] * 3
        zero_area = 0
        edge_count = defaultdict(int)

        for _ in range(tri_count):
            tri = struct.unpack('<12fH', f.read(50))
            verts = [(tri[3 + 3*i], tri[4 + 3*i], tri[5 + 3*i]) for i in range(3)]
            for v in verts:
                for i in range(3):
                    if v[i] < min_xyz[i]: min_xyz[i] = v[i]
                    if v[i] > max_xyz[i]: max_xyz[i] = v[i]
            # Area
            ax, ay, az = verts[0]
            bx, by, bz = verts[1]
            cx, cy, cz = verts[2]
            ux, uy, uz = bx - ax, by - ay, bz - az
            wx, wy, wz = cx - ax, cy - ay, cz - az
            nx = uy * wz - uz * wy
            ny = uz * wx - ux * wz
            nz = ux * wy - uy * wx
            area = math.sqrt(nx*nx + ny*ny + nz*nz) / 2
            if area < 1e-9:
                zero_area += 1
            # Edges (quantized so float jitter doesn't split a shared edge)
            def q(v):
                return tuple(round(c, 4) for c in v)
            for i in range(3):
                a = q(verts[i])
                b = q(verts[(i+1) % 3])
                edge = (a, b) if a < b else (b, a)
                edge_count[edge] += 1

        print(f'Bounding box min: {min_xyz}')
        print(f'Bounding box max: {max_xyz}')
        print(f'Extents:          {[max_xyz[i] - min_xyz[i] for i in range(3)]}')
        print(f'Zero-area triangles: {zero_area}')

        boundary = sum(1 for v in edge_count.values() if v == 1)
        shared2 = sum(1 for v in edge_count.values() if v == 2)
        shared3plus = sum(1 for v in edge_count.values() if v >= 3)
        print(f'Edges shared by 1 tri (open):  {boundary}')
        print(f'Edges shared by 2 tris (good): {shared2}')
        print(f'Edges shared by 3+ tris (bad): {shared3plus}')
        print(f'WATERTIGHT: {boundary == 0 and shared3plus == 0}')

if __name__ == '__main__':
    main(sys.argv[1])
