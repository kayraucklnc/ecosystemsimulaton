import * as THREE from "../../ecosystemsimulaton/js/library/three.js-r135/build/three.module.js";
import {skyboxMaterial} from "../../ecosystemsimulaton/js/world/Materials.js";
import {World} from "../../ecosystemsimulaton/js/world/World.js";
import * as Grid from "../../ecosystemsimulaton/js/world/Grid.js";
import {MousePicker} from "../../ecosystemsimulaton/js/mouse/mouse_picking.js";
import * as Objects from "../../ecosystemsimulaton/js/world/Objects.js";
import * as Materials from "../../ecosystemsimulaton/js/world/Materials.js";
import {OrbitControls} from "../../ecosystemsimulaton/js/library/three.js-r135/examples/jsm/controls/OrbitControls.js";

function createInitScene() {
    Math.seedrandom(parameters.simulation.seed);

    const scene = new THREE.Scene();

    let grid = new Grid.Grid(scene, parameters.plane.gridWidth);
    world = new World(scene, grid);

    const camera = new THREE.PerspectiveCamera(
        75,
        canvasSize.width / canvasSize.height,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer();
    raycaster = new THREE.Raycaster();

    mousePicker = new MousePicker(scene, camera, renderer);
    camera.position.y = 15;
    camera.position.z = 30;
    renderer.setSize(canvasSize.width, canvasSize.height);
    renderer.domElement.style.display = "";
    document.getElementById("midBar").appendChild(renderer.domElement);

    terrainObject = new Objects.Terrain(new THREE.Vector3(0, -0.03, 0), new THREE.Vector3(0, 0), Materials.planeCustomMat);
    world.instantiateObject(terrainObject, false);
    world.grid.setTerrain(terrainObject);
    skybox();

    const spotLight = new THREE.SpotLight(0xffffff, 0.85, 400, 20, 0);
    spotLight.position.set(12, 25, 9);
    world.instantiateLight(spotLight);

    let lightSphereObject = new Objects.LightIndicator(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), Materials.lightIndicatorMaterial, spotLight);
    world.instantiateObject(lightSphereObject, false);

    createCustomWater();

    return {scene, camera};
}

function createInitControls(camera, renderer) {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0, 0, 0);
    orbitControls.maxPolarAngle = Math.PI / 2;
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.1;
    return orbitControls;
}

function createCustomWater() {
    let customWaterGeo = new THREE.PlaneGeometry(parameters.plane.scale, parameters.plane.scale, 400, 400).translate(0, 0, parameters.plane.waterHeight * parameters.plane.heightMultiplier).rotateX(-Math.PI / 2);
    // water.material.uniforms.size = 500.0;
    const material = Materials.customWaterMaterial3;
    water = new THREE.Mesh(customWaterGeo, material);
    world.scene.add(water);
}

function createTestSceneElements() {
    Math.seedrandom(parameters.simulation.seed);

    terrainObject.changePlaneGeometry(parameters);

    if (!parameters.simulation.entities) return;

    // let treeObject = new Objects.Tree(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), Materials.treeMaterial);
    // world.instantiateObject(treeObject);
    // let humanObject = new Objects.Rabbit(new THREE.Vector3(20, 0, 0), new THREE.Vector3(0, 0), Materials.humanMaterial);
    // world.instantiateObject(humanObject);
    // let wolfObject = new Objects.Fox(new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    // world.instantiateObject(wolfObject);

    for (let i = 0; i < 300; i++) {
        let grassObject = new Objects.Grass(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.treeMaterial);
        world.instantiateObject(grassObject);
    }

    // for (let i = 0; i < 200; i++) {
    //     let wheatObject = new Objects.Wheat(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.treeMaterial);
    //     world.instantiateObject(wheatObject);
    // }

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

    // for (let i = 0; i < 170; i++) {
    //     let cowObject = new Objects.Cow(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    //     world.instantiateObject(cowObject);
    // }

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
}

function skybox() {
    let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
    let skybox = new THREE.Mesh(skyboxGeo, skyboxMaterial);
    world.scene.add(skybox);
}

export {
    createInitScene,
    createInitControls,
    createCustomWater,
    createTestSceneElements,
    skybox,
};