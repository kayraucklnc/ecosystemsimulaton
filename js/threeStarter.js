import * as THREE from "../../ecosystemsimulaton/js/library/three.js-r135/build/three.module.js";
import {OrbitControls} from "../../ecosystemsimulaton/js/library/three.js-r135/examples/jsm/controls/OrbitControls.js";
import {Water} from '../../ecosystemsimulaton/js/library/three.js-r135/examples/jsm/objects/Water.js';
import {Sky} from '../../ecosystemsimulaton/js/library/three.js-r135/examples/jsm/objects/Sky.js';


import {World} from "../../ecosystemsimulaton/js/world/World.js";
import * as Objects from "../../ecosystemsimulaton/js/world/Objects.js";
import * as Grid from "../../ecosystemsimulaton/js/world/Grid.js";
import {MousePicker} from "../../ecosystemsimulaton/js/mouse/mouse_picking.js";
import * as Materials from "../../ecosystemsimulaton/js/world/Materials.js";
import * as DataLoader from "../../ecosystemsimulaton/js/util/loadData.js";

let sun;

function createInitScene() {
    sun = new THREE.Vector3();

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

function createWater() {
    let waterGeometry = new THREE.PlaneGeometry(parameters.plane.scale, parameters.plane.scale).translate(0, 0, -0.34 * parameters.plane.heightMultiplier);
    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x44d4eb,
            distortionScale: 5.0,
            fog: world.scene.fog !== undefined
        }
    );
    // water.material.uniforms.size = 500.0;
    water.rotation.x = -Math.PI / 2;

    world.scene.add(water);
}



function createTestSceneElements(scene) {
    let terrainObject = new Objects.Terrain(new THREE.Vector3(0, -0.03, 0), new THREE.Vector3(0, 0), Materials.planeCustomMat);
    world.instantiateObject(terrainObject, false);
    world.grid.setTerrain(terrainObject);

    let treeObject = new Objects.Tree(new THREE.Vector3(-6, 0, 0), new THREE.Vector3(0, 0), Materials.treeMaterial);
    world.instantiateObject(treeObject);
    let humanObject = new Objects.Human(new THREE.Vector3(6, 0, 0), new THREE.Vector3(0, 0), Materials.humanMaterial);
    world.instantiateObject(humanObject);
    // let squirrelObject = new Objects.Squirrel(new THREE.Vector3(6,0,0), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    // world.instantiateObject(squirrelObject);

    // for (let i = 0; i < 100; i++) {
    //     let treeObject = new Objects.Tree(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.treeMaterial);
    //     world.instantiateObject(treeObject);
    // }
    //
    // for (let i = 0; i < 50; i++) {
    //     let humanObject = new Objects.Human(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.humanMaterial);
    //     world.instantiateObject(humanObject);
    // }
    //
    // for (let i = 0; i < 20; i++) {
    //     let squirrelObject = new Objects.Squirrel(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    //     world.instantiateObject(squirrelObject);
    // }

    const pointLight = new THREE.PointLight(0xffffff, 1.05, 400);
    pointLight.position.set(12, 25, 9);
    world.instantiateLight(pointLight);

    let lightSphereObject = new Objects.LightIndicator(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), Materials.lightIndicatorMaterial, pointLight);
    world.instantiateObject(lightSphereObject, false);

    createWater();

    return {terrainObject};
}

function threeStarter() {
    drawthechart();
    Materials.createAllMaterials();

    const {scene, camera} = createInitScene();
    const controls = createInitControls(camera, renderer);
    const {terrainObject: _terrainObject} = createTestSceneElements(scene);
    terrainObject = _terrainObject;
    gui.setTerrain(terrainObject);

    var loopStats = new Stats();
    loopStats.showPanel(0);
    document.body.appendChild(loopStats.dom);

    function loop() {
        loopStats.begin();

        frameCount++;

        raycaster.setFromCamera(mouse, camera);
        Materials.planeCustomMat.uniforms.u_time.value += 0.01;
        if (water) {
            water.material.uniforms['time'].value += 0.1 / 60.0;
        }

        controls.update();

        renderer.render(scene, camera);

        window.requestAnimationFrame(loop);
        loopStats.end();
    }

    function worldLoop() {
        if (isSimActive) {
            for (let i = 0; i < simulation.timeScale / (1000 / 60); i++) {
                world.update();
            }
        }
        setTimeout(worldLoop, (1000 / 60) / (Math.min(1000 / 60, simulation.timeScale)));

    }


    worldLoop();
    loop();
}

function preload() {
    let loadDataPromise = new Promise((resolve, reject) => {
        DataLoader.loadData(resolve);
    });


    Promise.all([loadDataPromise]).then(() => {
        threeStarter();
    })
}

window.onload = preload();
