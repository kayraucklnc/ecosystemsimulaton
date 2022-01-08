import * as Objects from "../world/Objects.js";
import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as Materials from "../world/Materials.js";


class GUI {
    constructor() {
        this.gui = new dat.GUI();

        this.terrain = null;

        const terrainFolder = this.gui.addFolder("Terrain");
        const cloudsFolder = this.gui.addFolder("Clouds");
        const simulationFolder = this.gui.addFolder("Simulation");


        cloudsFolder.add(parameters.clouds, 'thickness', 0.1, 1).name("Thickness");
        cloudsFolder.add(parameters.clouds, 'size', 0.1, 1).name("Size");
        cloudsFolder.add(parameters.clouds, 'count', 0.1, 2).name("Count");


        this.planeScale = terrainFolder.add(parameters.plane, 'scale', 20, 1500).name("Plane Scale");
        this.heightMultiplier = terrainFolder.add(parameters.plane, 'heightMultiplier', 1, 30).name("Plane Height");
        this.noiseScale = terrainFolder.add(parameters.plane, 'noiseScale', 0.001, 3).name("Noise Scale");
        this.resolution = terrainFolder.add(parameters.plane, 'resolution', 4, 300).name("Resolution");
        this.lacunarity = terrainFolder.add(parameters.plane, 'lacunarity', 0, 4).name("Lacunarity");
        this.smoothness = terrainFolder.add(parameters.plane, 'smoothness', 0, 4).name("Smoothness");
        this.persistance = terrainFolder.add(parameters.plane, 'persistance', 0, 1, 0.001).name("Persistance");
        this.gridVisible = terrainFolder.add(parameters.plane, 'gridVisible').name("Grid");

        this.showPaths = simulationFolder.add(parameters.simulation, 'showPaths').name("Show Paths");
        this.seed = simulationFolder.add(parameters.simulation, 'seed').name("Seed");
        this.enableEntities = simulationFolder.add(parameters.simulation, 'entities').name("Enable Entities");

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

        this.seed.onChange(() => {

        });

        this.enableEntities.onChange(() => {
            if (parameters.simulation.entities) {
                for (let i = 0; i < 300; i++) {
                    let grassObject = new Objects.Grass(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.treeMaterial);
                    world.instantiateObject(grassObject);
                }

                for (let i = 0; i < 200; i++) {
                    let wheatObject = new Objects.Wheat(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.treeMaterial);
                    world.instantiateObject(wheatObject);
                }

                for (let i = 0; i < 50; i++) {
                    let squirrelObject = new Objects.Squirrel(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
                    world.instantiateObject(squirrelObject);
                }

                for (let i = 0; i < 500; i++) {
                    let treeObject = new Objects.Tree(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.treeMaterial);
                    world.instantiateObject(treeObject);
                }

                for (let i = 0; i < 200; i++) {
                    let humanObject = new Objects.Human(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.humanMaterial);
                    world.instantiateObject(humanObject);
                }

                for (let i = 0; i < 350; i++) {
                    let pigObject = new Objects.Pig(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
                    world.instantiateObject(pigObject);
                }

                for (let i = 0; i < 170; i++) {
                    let cowObject = new Objects.Cow(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
                    world.instantiateObject(cowObject);
                }

                for (let i = 0; i < 120; i++) {
                    let wolfObject = new Objects.Wolf(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
                    world.instantiateObject(wolfObject);
                }

                for (let i = 0; i < 300; i++) {
                    let rabbitObject = new Objects.Rabbit(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
                    world.instantiateObject(rabbitObject);
                }

                for (let i = 0; i < 180; i++) {
                    let foxObject = new Objects.Fox(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
                    world.instantiateObject(foxObject);
                }
            } else {
                world.clearObjects();
            }
        })
    }
}

gui = new GUI();