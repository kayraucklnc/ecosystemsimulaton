import * as THREE from "../../ecosystemsimulaton/js/library/three.js-r135/build/three.module.js";
import {OrbitControls} from "../../ecosystemsimulaton/js/library/three.js-r135/examples/jsm/controls/OrbitControls.js";

import {World} from "../../ecosystemsimulaton/js/world/World.js";
import * as Objects from "../../ecosystemsimulaton/js/world/Objects.js";
import * as Grid from "../../ecosystemsimulaton/js/world/Grid.js";
import {MousePicker} from "../../ecosystemsimulaton/js/mouse_picking.js";
import * as Materials from "../../ecosystemsimulaton/js/world/Materials.js";
import {loadObject} from "../../ecosystemsimulaton/js/util/loadGLTF.js";

function createInitScene() {
    const scene = new THREE.Scene();
    world = new World(scene);

    const camera = new THREE.PerspectiveCamera(
        75,
        canvasSize.width / canvasSize.height,
        0.1,
        1000
    );
    renderer = new THREE.WebGLRenderer();
    raycaster = new THREE.Raycaster();
    mousePicker = new MousePicker(scene, camera, renderer);

    camera.position.y = 3;
    camera.position.z = 6;
    renderer.setSize(canvasSize.width, canvasSize.height);
    renderer.domElement.style.display = "";
    document.getElementById("midBar").appendChild(renderer.domElement);
    return {scene, camera};
}

function createInitControls(camera, renderer) {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0, 0, 0);
    // controls.maxPolarAngle = Math.PI / 3;
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.1;
    return orbitControls;
}

function createTestSceneElements(scene) {

    let terrainObject = new Objects.Terrain(new THREE.Vector3(0, -0.03, 0), new THREE.Vector3(0, 0), Materials.planeMat);
    world.instantiateObject(terrainObject, false);

    let grid = new Grid.Grid(scene, terrainObject, parameters.plane.gridWidth);

    for (let i = 0; i < 100; i++) {
        let treeObject = new Objects.Tree(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20), new THREE.Vector3(0, 0), Materials.treeMaterial);
        world.instantiateObject(treeObject);
    }

    for (let i = 0; i < 150; i++) {
        let grassObject = new Objects.Grass(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20), new THREE.Vector3(0, 0), Materials.treeMaterial);
        world.instantiateObject(grassObject);
    }

/*
    for (let i = 0; i < 200; i++) {
        let wheatObject = new Objects.Wheat(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20), new THREE.Vector3(0, 0), Materials.treeMaterial);
        world.instantiateObject(wheatObject);
    }
*/

    for (let i = 0; i < 30; i++) {
        let humanObject = new Objects.Human(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20), new THREE.Vector3(0, 0), Materials.humanMaterial);
        world.instantiateObject(humanObject);
    }

    for (let i = 0; i < 5; i++) {
        let squirrelObject = new Objects.Squirrel(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
        world.instantiateObject(squirrelObject);
    }

    for (let i = 0; i < 20; i++) {
        let pigObject = new Objects.Pig(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
        world.instantiateObject(pigObject);
    }

    for (let i = 0; i < 10; i++) {
        let wolfObject = new Objects.Wolf(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
        world.instantiateObject(wolfObject);
    }

    for (let i = 0; i < 25; i++) {
        let rabbitObject = new Objects.Rabbit(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
        world.instantiateObject(rabbitObject);
    }

    for (let i = 0; i < 10; i++) {
        let foxObject = new Objects.Fox(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
        world.instantiateObject(foxObject);
    }

    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(2, 7, 1);
    world.instantiateLight(pointLight);

    let lightSphereObject = new Objects.LightIndicator(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), Materials.lightIndicatorMaterial, pointLight);
    world.instantiateObject(lightSphereObject, false);


    return {terrainObject};
}

function threeStarter() {
    drawthechart();
    const {scene, camera} = createInitScene();
    const controls = createInitControls(camera, renderer);
    const {terrainObject: _terrainObject} = createTestSceneElements(scene);
    terrainObject = _terrainObject;
    gui.setTerrain(terrainObject);

    function loop() {
        frameCount++;
        setTimeout(loop, 1000 / 60);

        raycaster.setFromCamera(mouse, camera);

        controls.update();
        renderer.render(scene, camera);
    }

    function worldLoop() {
        setTimeout(worldLoop, (1000 / 60) / simulation.timeScale);

        if (isSimActive) {
            for (let i = 0; i < simulation.timeScale / 16.6; i++) {
                world.update();
            }
        }
    }

    worldLoop();
    loop();
}


function preload() {
    let treePromise = new Promise((resolve, reject) => {
        loadObject(resolve, "tree.glb");
    });
    let humanPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "human.glb");
    });
    let grassPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "grass.glb");
    });
    let wheatPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "wheat.glb");
    });
    let pigPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "pig.glb");
    });
    let wolfPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "wolf.glb");
    });
    let rabbitPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "rabbit.glb");
    });
    let foxPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "fox.glb");
    });
    let eaglePromise = new Promise((resolve, reject) => {
        loadObject(resolve, "eagle.glb");
    })

    Promise.all([treePromise, humanPromise, grassPromise, wheatPromise, pigPromise, wolfPromise, rabbitPromise, foxPromise, eaglePromise]).then((mesh) => {
        meshes.tree = mesh[0];
        meshes.human = mesh[1];
        meshes.grass = mesh[2];
        meshes.wheat = mesh[3];
        meshes.pig = mesh[4];
        meshes.wolf = mesh[5];
        meshes.rabbit = mesh[6];
        meshes.fox = mesh[7];
        meshes.eagle = mesh[8];
        threeStarter();
    });
}

window.onload = preload();
