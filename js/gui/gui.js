import * as SceneOperations from "../SceneOperations.js";

class GUI {
    constructor() {
        this.gui = new dat.GUI();

        this.terrain = null;

        const terrainFolder = this.gui.addFolder("Terrain");
        const simulationFolder = this.gui.addFolder("Simulation");


        this.planeScale = terrainFolder.add(parameters.plane, 'scale', 20, 1500).name("Plane Scale");
        this.heightMultiplier = terrainFolder.add(parameters.plane, 'heightMultiplier', 1, 30).name("Plane Height");
        this.noiseScale = terrainFolder.add(parameters.plane, 'noiseScale', 0.0001, 1).name("Noise Scale");
        this.resolution = terrainFolder.add(parameters.plane, 'resolution', 4, 300).name("Resolution");
        this.lacunarity = terrainFolder.add(parameters.plane, 'lacunarity', 0, 4).name("Lacunarity");
        this.smoothness = terrainFolder.add(parameters.plane, 'smoothness', 0, 4).name("Smoothness");
        this.persistance = terrainFolder.add(parameters.plane, 'persistance', 0, 1, 0.001).name("Persistance");
        this.gridVisible = terrainFolder.add(parameters.plane, 'gridVisible').name("Grid");

        this.showPaths = simulationFolder.add(parameters.simulation, 'showPaths').name("Show Paths");
        this.showPaths = simulationFolder.add(parameters.simulation, 'showSpotlightWires').name("Light Wires");
        this.seed = simulationFolder.add(parameters.simulation, 'seed').name("Seed");
        this.enableEntities = simulationFolder.add(parameters.simulation, 'entities').name("Enable Entities");
        this.lightIntensity = simulationFolder.add(parameters.simulation, 'lightIntensity', 0.01, 1).name("Light" +
            " Intensity");

        this.setOnChanges();
    }

    setTerrain(terrain) {
        this.terrain = terrain;
    }

    setOnChanges() {
        this.resolution.onChange(() => {
            this.terrain.changePlaneGeometry(parameters);
        });
        this.noiseScale.onChange(() => {
            this.terrain.changePlaneGeometry(parameters);
        });
        this.planeScale.onChange(() => {
            this.terrain.changePlaneGeometry(parameters);
        });
        this.heightMultiplier.onChange(() => {
            this.terrain.changePlaneGeometry(parameters);
        });
        this.persistance.onChange(() => {
            this.terrain.changePlaneGeometry(parameters);
        });
        this.lacunarity.onChange(() => {
            this.terrain.changePlaneGeometry(parameters);
        });
        this.smoothness.onChange(() => {
            this.terrain.changePlaneGeometry(parameters);
        });
        this.gridVisible.onChange(() => {
            world.grid.setGridVisible(parameters.plane.gridVisible);
        });
        this.lightIntensity.onChange(() => {
            world.lights.forEach((x) => {
                x.intensity = parameters.simulation.lightIntensity;
                // x.distance = parameters.simulation.lightIntensity * 5;
            })
        });

        this.seed.onFinishChange(() => {
            console.log("New seed is: " + parameters.simulation.seed);
            if (parameters.simulation.entities) {
                world.clearObjects();
                SceneOperations.createTestSceneElements();
            } else {
                world.clearObjects();
                terrainObject.changePlaneGeometry(parameters);
            }
        });

        this.enableEntities.onChange(() => {
            if (parameters.simulation.entities) {
                world.clearObjects(true);
                SceneOperations.createTestSceneElements();
            } else {
                world.clearObjects(false);
            }
        })
    }
}

gui = new GUI();