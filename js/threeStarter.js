import * as THREE from "../../ecosystemsimulaton/js/library/three.js-r135/build/three.module.js";
import {OrbitControls} from "../../ecosystemsimulaton/js/library/three.js-r135/examples/jsm/controls/OrbitControls.js";

import {World} from "../../ecosystemsimulaton/js/world/World.js";
import * as Objects from "../../ecosystemsimulaton/js/world/Objects.js";
import * as Grid from "../../ecosystemsimulaton/js/world/Grid.js";
import {MousePicker} from "../../ecosystemsimulaton/js/mouse/mouse_picking.js";
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

    // let treeObject = new Objects.Tree(new THREE.Vector3(-6, 0, 0), new THREE.Vector3(0, 0), Materials.treeMaterial);
    // world.instantiateObject(treeObject);
    // let humanObject = new Objects.Human(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), Materials.humanMaterial);
    // world.instantiateObject(humanObject);
    // let squirrelObject = new Objects.Squirrel(new THREE.Vector3(6,0,0), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    // world.instantiateObject(squirrelObject);

    for (let i = 0; i < 200; i++) {
        let treeObject = new Objects.Tree(new THREE.Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40), new THREE.Vector3(0, 0), Materials.treeMaterial);
        world.instantiateObject(treeObject);
    }

    for (let i = 0; i < 40; i++) {
        let humanObject = new Objects.Human(new THREE.Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40), new THREE.Vector3(0, 0), Materials.humanMaterial);
        world.instantiateObject(humanObject);
    }

    for (let i = 0; i < 20; i++) {
        let squirrelObject = new Objects.Squirrel(new THREE.Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
        world.instantiateObject(squirrelObject);
    }

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(2, 9, 1);
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

        raycaster.setFromCamera(mouse, camera);

        controls.update();
        renderer.render(scene, camera);

        setTimeout(loop, 1000 / 60);
    }

    function worldLoop() {
        if (isSimActive) {
            for (let i = 0; i < simulation.timeScale / 16.6; i++) {
                world.update();
            }
        }

        setTimeout(worldLoop, (1000 / 60) / simulation.timeScale);
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

    Promise.all([treePromise, humanPromise]).then((mesh) => {
        meshes.tree = mesh[0];
        meshes.human = mesh[1];
        threeStarter();
    });
}

window.onload = preload();
