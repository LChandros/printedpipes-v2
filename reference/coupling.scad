// Parametric Pipe Coupling (straight connector)
// Parameters are injected via OpenSCAD -D flags

// Pipe inner diameter (mm)
pipe_id = 25.4;
// Wall thickness (mm)
wall_thickness = 3;
// Total coupling length (mm)
length = 40;
// Internal stop ridge width (mm)
ridge_width = 3;
// Resolution
$fn = 64;

pipe_od = pipe_id + 2 * wall_thickness;

module coupling() {
    difference() {
        // Outer cylinder
        cylinder(h = length, d = pipe_od, center = true);

        // Inner bore - left side
        translate([0, 0, -length/2 - 0.1])
            cylinder(h = length/2 - ridge_width/2 + 0.1, d = pipe_id);

        // Inner bore - right side
        translate([0, 0, ridge_width/2])
            cylinder(h = length/2 - ridge_width/2 + 0.1, d = pipe_id);
    }
}

coupling();
