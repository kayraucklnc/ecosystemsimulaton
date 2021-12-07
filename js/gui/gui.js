class GUI {
    constructor() {
        this.gui = new dat.GUI();

        this.terrain = null;

        const terrainFolder = this.gui.addFolder("Terrain");
        const cloudsFolder  = this.gui.addFolder("Clouds");


        cloudsFolder.add(parameters.clouds,'thickness', 0.1, 1).name("Thickness");
        cloudsFolder.add(parameters.clouds,'size', 0.1, 1).name("Size");
        cloudsFolder.add(parameters.clouds,'count', 0.1, 2).name("Count");


        this.planeScale = terrainFolder.add(parameters.plane, 'scale', 1, 30).name("Plane Scale");
        this.heightMultiplier = terrainFolder.add(parameters.plane, 'heightMultiplier', 1, 30).name("Plane Height");
        this.noiseScale = terrainFolder.add(parameters.plane, 'noiseScale', 0.001, 3).name("Noise Scale");
        this.resolution = terrainFolder.add(parameters.plane, 'resolution', 4, 100).name("Resolution");
        this.color = terrainFolder.addColor(parameters.plane, 'color').name("Surface Color");

        this.gridVisible = terrainFolder.add(parameters.plane, 'gridVisible').name("Grid");

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
        this.heightMultiplier.onChange(() => {
            this.terrain.changePlaneGeometry( parameters );
        });

        this.gridVisible.onChange(() => {
            world.grid.setGridVisible( parameters.plane.gridVisible );
        })
    }
}

const gui = new GUI();