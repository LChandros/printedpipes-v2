// Parametric Pipe Offset (S-bend to shift pipe laterally)
// Parameters are injected via OpenSCAD -D flags

// Pipe inner diameter (mm)
pipe_id = 25.4;
// Wall thickness (mm)
wall_thickness = 3;
// Lateral offset distance (mm)
offset_distance = 30;
// Bend radius (mm)
bend_radius = 40;
// Straight stub length on each end (mm)
stub_length = 20;
// Resolution
$fn = 64;

pipe_od = pipe_id + 2 * wall_thickness;

// Calculate bend angle from offset and radius
// offset = 2 * radius * (1 - cos(angle))  ... for symmetric S-bend
// But simpler: offset = 2 * radius * sin(angle) - ... actually let's use
// the geometry: each bend sweeps angle A, total lateral shift = 2*R*sin(A) - 2*R*(1-cos(A))*0
// For an S-bend: offset = 2 * R * (1 - cos(A)) where A is each bend angle
// So A = acos(1 - offset/(2*R))
// Clamp to valid range
raw_angle = acos(max(-1, min(1, 1 - offset_distance / (2 * bend_radius))));
bend_angle = raw_angle;

module pipe_ring() {
    difference() {
        circle(d = pipe_od);
        circle(d = pipe_id);
    }
}

module offset_pipe() {
    // Bottom stub (along -Z)
    translate([bend_radius, 0, 0])
    rotate([90, 0, 0])
    linear_extrude(height = stub_length)
        pipe_ring();

    // First bend (bottom, curving toward +X)
    rotate_extrude(angle = bend_angle, $fn = max(64, bend_angle * 2))
        translate([bend_radius, 0, 0])
            pipe_ring();

    // Calculate end position of first bend
    bx1 = bend_radius * cos(bend_angle);
    bz1 = bend_radius * sin(bend_angle);

    // Second bend (top, curving back, offset by the distance)
    translate([offset_distance, 0, 0])
    rotate([0, 0, 180])
    translate([-bend_radius, 0, 0])
    rotate([0, 0, -bend_angle])
    rotate_extrude(angle = bend_angle, $fn = max(64, bend_angle * 2))
        translate([bend_radius, 0, 0])
            pipe_ring();

    // Top stub
    // End of S-bend: shifted by offset_distance in X, some amount in Z
    total_rise = 2 * bend_radius * sin(bend_angle);
    translate([offset_distance + bend_radius, 0, total_rise])
    rotate([-90, 0, 0])
    linear_extrude(height = stub_length)
        pipe_ring();
}

offset_pipe();
