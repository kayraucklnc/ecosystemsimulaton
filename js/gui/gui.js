class GUI {
    constructor() {
        this.gui = new dat.GUI();

        this.terrain = null;

        this.planeScale = this.gui.add(parameters.plane, 'scale', 1, 30);
        this.noiseScale = this.gui.add(parameters.plane, 'noiseScale', 0.001, 3);
        this.resolution = this.gui.add(parameters.plane, 'resolution', 4, 100);

        this.setOnChanges();
    }

    setTerrain(terrain) {
        this.terrain = terrain;
    }

    setOnChanges() {
        this.resolution.onChange(() => {
            this.terrain.changePlaneGeometry( parameters );
        });
        this.noiseScale.onChange(() => {
            this.terrain.changePlaneGeometry( parameters );
        });
        this.planeScale.onChange(() => {
            this.terrain.changePlaneGeometry( parameters );
        });
    }
}

const gui = new GUI();