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


function skybox() {
    let sun;
    sun = new THREE.Vector3();

    const sky = new Sky();
    sky.scale.setScalar(10000);
    world.scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 20;
    skyUniforms['rayleigh'].value = 4;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const parameters = {
        elevation: 1,
        azimuth: 200
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);


    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);

    world.scene.environment = pmremGenerator.fromScene(sky).texture;


}

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

function createCustomWater() {
    let customWaterGeo = new THREE.PlaneGeometry(parameters.plane.scale, parameters.plane.scale).translate(0, 0, parameters.plane.waterHeight * parameters.plane.heightMultiplier).rotateX(-Math.PI / 2);
    // water.material.uniforms.size = 500.0;
    const material = Materials.customWaterMaterial2;
    water = new THREE.Mesh(customWaterGeo, material);
    world.scene.add(water);
}

function createTestSceneElements(scene) {
    // let treeObject = new Objects.Tree(new THREE.Vector3(-35, 0, 0), new THREE.Vector3(0, 0), Materials.treeMaterial);
    // world.instantiateObject(treeObject);
    // let humanObject = new Objects.Human(new THREE.Vector3(35, 0, 0), new THREE.Vector3(0, 0), Materials.humanMaterial);
    // world.instantiateObject(humanObject);
    // let squirrelObject = new Objects.Squirrel(new THREE.Vector3(6,0,0), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    // world.instantiateObject(squirrelObject);

    for (let i = 0; i < 100; i++) {
        let grassObject = new Objects.Grass(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.treeMaterial);
        world.instantiateObject(grassObject);
    }

    // for (let i = 0; i < 200; i++) {
    //     let wheatObject = new Objects.Wheat(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.treeMaterial);
    //     world.instantiateObject(wheatObject);
    // }


    // for (let i = 0; i < 500; i++) {
    //     let treeObject = new Objects.Tree(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.treeMaterial);
    //     world.instantiateObject(treeObject);
    // }
    //
    //
    // for (let i = 0; i < 200; i++) {
    //     let humanObject = new Objects.Human(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.humanMaterial);
    //     world.instantiateObject(humanObject);
    // }
    //
    //
    // // for (let i = 0; i < 50; i++) {
    // //     let squirrelObject = new Objects.Squirrel(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    // //     world.instantiateObject(squirrelObject);
    // // }
    //
    //
    // for (let i = 0; i < 150; i++) {
    //     let pigObject = new Objects.Pig(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    //     world.instantiateObject(pigObject);
    // }
    //
    // for (let i = 0; i < 150; i++) {
    //     let wolfObject = new Objects.Wolf(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    //     world.instantiateObject(wolfObject);
    // }
    //
    // for (let i = 0; i < 150; i++) {
    //     let rabbitObject = new Objects.Rabbit(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    //     world.instantiateObject(rabbitObject);
    // }
    //
    // for (let i = 0; i < 10; i++) {
    //     let foxObject = new Objects.Fox(new THREE.Vector3((Math.random() - 0.5) * parameters.plane.scale, 0, (Math.random() - 0.5) * parameters.plane.scale), new THREE.Vector3(0, 0), Materials.squirrelMaterial);
    //     world.instantiateObject(foxObject);
    // }

    const pointLight = new THREE.PointLight(0xffffff, 1.05, 400);
    pointLight.position.set(12, 25, 9);
    world.instantiateLight(pointLight);

    let lightSphereObject = new Objects.LightIndicator(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), Materials.lightIndicatorMaterial, pointLight);
    world.instantiateObject(lightSphereObject, false);

    // createWater();
    createCustomWater();
    return {terrainObject};
}

function threeStarter() {
    drawthechart();
    Materials.createAllMaterials();

    const {scene: _scene, camera: _camera} = createInitScene();
    scene = _scene;
    camera = _camera;
    const controls = createInitControls(camera, renderer);
    createTestSceneElements(scene);
    gui.setTerrain(terrainObject);

    var loopStats = new Stats();
    loopStats.showPanel(0);
    document.body.appendChild(loopStats.dom);

    function loop() {
        loopStats.begin();

        raycaster.setFromCamera(mouse, camera);

        controls.update();

        renderer.render(scene, camera);

        window.requestAnimationFrame(loop);
        loopStats.end();
    }

    function worldLoop() {
        if (isSimActive) {
            let timeBoostAmount = simulation.timeScale / (1000 / 60)
            for (let i = 0; i < timeBoostAmount; i++) {
                frameCount++;
                world.update();
            }

            Materials.planeCustomMat.uniforms.u_time.value += 0.01 * timeBoostAmount;
        }

        window.requestAnimationFrame(worldLoop);
        // setTimeout(worldLoop, (1000 / 60) / (Math.min(1000 / 60, simulation.timeScale)));
    }


    worldLoop();
    loop();
}

document.onkeydown = function (ev) {
    if (ev.key === "p") {
        world.clearObjects();
    }
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
