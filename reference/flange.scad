// Parametric Pipe Flange (mounting plate with bolt holes)
// Parameters are injected via OpenSCAD -D flags

// Pipe inner diameter (mm)
pipe_id = 25.4;
// Wall thickness (mm)
wall_thickness = 3;
// Flange outer diameter (mm)
flange_od = 80;
// Flange plate thickness (mm)
plate_thickness = 5;
// Stub length extending from plate (mm)
stub_length = 20;
// Number of bolt holes
bolt_count = 4;
// Bolt hole diameter (mm)
bolt_diameter = 8;
// Bolt circle diameter (mm) - center-to-center of bolt holes
bolt_circle = 60;
// Resolution
$fn = 64;

pipe_od = pipe_id + 2 * wall_thickness;

module flange() {
    difference() {
        union() {
            // Flange plate
            cylinder(h = plate_thickness, d = flange_od);

            // Pipe stub
            translate([0, 0, plate_thickness])
                cylinder(h = stub_length, d = pipe_od);
        }

        // Center bore through everything
        translate([0, 0, -0.1])
            cylinder(h = plate_thickness + stub_length + 0.2, d = pipe_id);

        // Bolt holes
        for (i = [0 : bolt_count - 1]) {
            rotate([0, 0, i * 360 / bolt_count])
                translate([bolt_circle / 2, 0, -0.1])
                    cylinder(h = plate_thickness + 0.2, d = bolt_diameter);
        }
    }
}

flange();
