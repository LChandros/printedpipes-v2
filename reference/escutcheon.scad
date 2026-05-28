// Parametric Escutcheon (pipe cover plate)
// Parameters are injected via OpenSCAD -D flags

// Pipe outer diameter - the hole (mm)
pipe_od = 28.4;  // ~1" copper pipe OD
// Plate outer diameter (mm)
plate_od = 70;
// Plate thickness (mm)
thickness = 3;
// Edge chamfer size (mm, 0 = no chamfer)
chamfer = 1.5;
// Gap tolerance added to pipe hole (mm)
gap = 0.5;
// Resolution
$fn = 64;

hole_d = pipe_od + gap * 2;

module escutcheon() {
    difference() {
        // Main plate with optional chamfer
        if (chamfer > 0) {
            hull() {
                // Bottom disc (full size)
                cylinder(h = thickness - chamfer, d = plate_od);
                // Top disc (smaller, for chamfer)
                translate([0, 0, thickness - chamfer])
                    cylinder(h = chamfer, d1 = plate_od, d2 = plate_od - chamfer * 2);
            }
        } else {
            cylinder(h = thickness, d = plate_od);
        }

        // Center hole for pipe
        translate([0, 0, -0.1])
            cylinder(h = thickness + 0.2, d = hole_d);
    }
}

escutcheon();
