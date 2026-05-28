// Parametric Pipe Cap (end seal)
// Parameters are injected via OpenSCAD -D flags

// Pipe inner diameter (mm) - cap fits over the pipe
pipe_id = 25.4;
// Wall thickness (mm)
wall_thickness = 3;
// Cap depth / how far it slides onto the pipe (mm)
depth = 15;
// Resolution
$fn = 64;

pipe_od = pipe_id + 2 * wall_thickness;

module cap() {
    difference() {
        // Outer shell: cylinder + dome top
        union() {
            cylinder(h = depth, d = pipe_od);
            translate([0, 0, depth])
                cylinder(h = wall_thickness, d = pipe_od);
        }

        // Inner bore (open at bottom, closed at top)
        translate([0, 0, -0.1])
            cylinder(h = depth + 0.1, d = pipe_id);
    }
}

cap();
