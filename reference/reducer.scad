// Parametric Pipe Reducer
// Parameters are injected via OpenSCAD -D flags

// Large end inner diameter (mm)
id_large = 31.75;  // 1.25 inch default
// Small end inner diameter (mm)
id_small = 19.05;  // 0.75 inch default
// Wall thickness (mm)
wall_thickness = 3;
// Transition length (mm)
transition_length = 30;
// Straight stub length on each end (mm)
stub_length = 20;
// Resolution
$fn = 64;

od_large = id_large + 2 * wall_thickness;
od_small = id_small + 2 * wall_thickness;

module reducer() {
    // Large stub
    translate([0, 0, -stub_length])
    difference() {
        cylinder(h = stub_length, d = od_large);
        translate([0, 0, -0.1])
            cylinder(h = stub_length + 0.2, d = id_large);
    }

    // Transition section
    difference() {
        cylinder(h = transition_length, d1 = od_large, d2 = od_small);
        translate([0, 0, -0.1])
            cylinder(h = transition_length + 0.2, d1 = id_large, d2 = id_small);
    }

    // Small stub
    translate([0, 0, transition_length])
    difference() {
        cylinder(h = stub_length, d = od_small);
        translate([0, 0, -0.1])
            cylinder(h = stub_length + 0.2, d = id_small);
    }
}

reducer();
