// Parametric Pipe Elbow
// Parameters are injected via OpenSCAD -D flags

// Pipe inner diameter (mm)
pipe_id = 25.4;  // 1 inch default
// Wall thickness (mm)
wall_thickness = 3;
// Bend angle (degrees, 1-180)
angle = 90;
// Bend radius (mm, center of pipe path)
bend_radius = 40;
// Straight stub length on each end (mm)
stub_length = 20;
// Resolution
$fn = 64;

pipe_od = pipe_id + 2 * wall_thickness;

module pipe_ring() {
    difference() {
        circle(d = pipe_od);
        circle(d = pipe_id);
    }
}

module elbow() {
    // Bend section - rotate extrude a ring cross-section
    // The ring is placed at (bend_radius, 0) and swept through 'angle' degrees
    rotate([0, 0, 0])
    rotate_extrude(angle = angle, $fn = max(angle, 64))
        translate([bend_radius, 0, 0])
            pipe_ring();

    // Stub 1 - at the start of the bend (extending downward along -Y)
    translate([bend_radius, 0, 0])
    rotate([90, 0, 0])
    linear_extrude(height = stub_length)
        pipe_ring();

    // Stub 2 - at the end of the bend
    rotate([0, 0, angle])
    translate([bend_radius, 0, 0])
    rotate([-90, 0, 0])
    translate([0, 0, 0])
    linear_extrude(height = stub_length)
        pipe_ring();
}

elbow();
