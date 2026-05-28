import Module from 'manifold-3d';

const wasm = await Module();
wasm.setup();
const { Manifold, CrossSection } = wasm;

// Disk of radius 1, offset to (10, 0) in 2D. Revolve 360°. Result is a torus.
// The spin axis of the revolve tells us how 2D X/Y map to 3D X/Y/Z.
const disk = CrossSection.circle(1, 32).translate([10, 0]);
const torus = Manifold.revolve(disk, 32, 360);

console.log('Full torus bounds:', torus.boundingBox());
// Major radius 10, minor radius 1 → torus
//   - radial extent (in plane of revolution) = 11
//   - axial extent (along spin axis) = 1
// Spans 11 in TWO axes (the plane of revolution) and 1 in the third (spin axis)

// Now a 90° wedge — caps will show us the start/end positions
const wedge = Manifold.revolve(disk, 32, 90);
console.log('90° wedge bounds:', wedge.boundingBox());
// At θ=0, disk cap sits at the 2D position (10, 0). Which 3D coordinates?
// At θ=90°, the disk has rotated 90° around the spin axis. Where does it land?

// Tall rectangle to disambiguate even more: spans 2 in 2D X (at x=5..7), 4 in 2D Y (at y=-2..+2)
const rect = CrossSection.square([2, 4], false).translate([5, -2]);
const halfRevRect = Manifold.revolve(rect, 16, 180);
console.log('Rect halfrev bounds:', halfRevRect.boundingBox());
// Expected if spin axis is Z (2D Y → 3D Z):
//   2D X ∈ [5, 7] → radial in XY plane → 3D X ∈ [-7, 7], Y ∈ [-7, 7] (180° sweeps half)
//                                          Actually 180° from (X=5..7, Y=anything): start at +X, end at -X, max Y at θ=90°
//                                          X ∈ [-7, 7], Y ∈ [0, 7]
//   2D Y ∈ [-2, 2] → 3D Z ∈ [-2, 2]
// Expected if spin axis is Y (2D Y → 3D Y):
//   X ∈ [-7, 7], Z ∈ [0, 7], Y ∈ [-2, 2]
