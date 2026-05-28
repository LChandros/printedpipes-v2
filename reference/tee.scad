// Parametric Pipe Tee (T-junction)
// Parameters are injected via OpenSCAD -D flags

// Pipe inner diameter (mm)
pipe_id = 25.4;
// Wall thickness (mm)
wall_thickness = 3;
// Branch angle from main pipe (degrees, 90 = standard tee)
branch_angle = 90;
// Main pipe total length (mm)
main_length = 60;
// Branch pipe length from center (mm)
branch_length = 30;
// Resolution
$fn = 64;

pipe_od = pipe_id + 2 * wall_thickness;

module tee() {
    difference() {
        union() {
            // Main pipe (along Z axis, centered)
            cylinder(h = main_length, d = pipe_od, center = true);

            // Branch pipe (rotated by branch_angle from main axis)
            rotate([0, -(90 - branch_angle), 0])
                translate([0, 0, 0])
                    cylinder(h = branch_length + pipe_od/2, d = pipe_od);
        }

        // Hollow out main pipe
        translate([0, 0, -main_length/2 - 0.1])
            cylinder(h = main_length + 0.2, d = pipe_id);

        // Hollow out branch pipe (extended through intersection)
        rotate([0, -(90 - branch_angle), 0])
            translate([0, 0, -pipe_od/2])
                cylinder(h = branch_length + pipe_od, d = pipe_id);
    }
}

tee();
