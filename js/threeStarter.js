import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import {OrbitControls} from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import {World} from "../../ecosystemsimulaton/js/world/World.js";
import * as Objects from "../../ecosystemsimulaton/js/world/Objects.js";
import * as Grid from "../../ecosystemsimulaton/js/world/Grid.js";
import { MousePicker } from "../../ecosystemsimulaton/js/mouse_picking.js";
import * as Materials from "../../ecosystemsimulaton/js/world/Materials.js";

function createInitScene() {
    const scene = new THREE.Scene();
    world = new World(scene);

    const camera = new THREE.PerspectiveCamera(
        75,
        innerWidth / innerHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer();
    raycaster = new THREE.Raycaster();
    mousePicker = new MousePicker(scene, camera, renderer);

    camera.position.y = 3;
    camera.position.z = 6;
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);
    return {scene, camera, renderer};
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

    let terrainObject = new Objects.Terrain( new THREE.Vector3(0, -0.01, 0), new THREE.Vector3(0, 0), Materials.planeMat );
    world.instantiateObject(terrainObject, false);

    let grid = new Grid.Grid(scene, terrainObject, parameters.plane.gridWidth);

    for (let i = 0; i < 200; i++) {
        let treeObject = new Objects.Tree(new THREE.Vector3((Math.random() - 0.5) * 20,0,(Math.random() - 0.5)*20), new THREE.Vector3(0,0), Materials.treeMaterial);
        world.instantiateObject(treeObject);
    }

    for (let i = 0; i < 50; i++) {
        let humanObject = new Objects.Human(new THREE.Vector3((Math.random() - 0.5)*20, 0, (Math.random() - 0.5)*20), new THREE.Vector3(0,0), Materials.humanMaterial);
        world.instantiateObject(humanObject);
    }

    for (let i = 0; i < 20; i++) {
        let squirrelObject = new Objects.Squirrel(new THREE.Vector3((Math.random() - 0.5)*20, 0, (Math.random() - 0.5)*20), new THREE.Vector3(0,0), Materials.squirrelMaterial);
        world.instantiateObject(squirrelObject);
    }

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set( 2, 7, 1 );
    world.instantiateLight(pointLight);

    let lightSphereObject = new Objects.LightIndicator( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), Materials.lightIndicatorMaterial, pointLight );
    world.instantiateObject(lightSphereObject, false);

    return {terrainObject};
}

function threeStarter() {
    drawthechart();
    const {scene, camera, renderer} = createInitScene();
    const controls = createInitControls(camera, renderer);
    const {terrainObject} = createTestSceneElements(scene);

    gui.setTerrain(terrainObject);

    function loop() {
        frameCount++;
        setTimeout(loop, 1000/60);

        controls.update();

        // pointLight.position.set( Math.cos(frameCount * 0.1)*3, 2, Math.sin(frameCount * 0.1)*3);
        raycaster.setFromCamera(mouse, camera);

        world.update();

        renderer.render(scene, camera);
    }

    loop();
}

window.onload = threeStarter();
