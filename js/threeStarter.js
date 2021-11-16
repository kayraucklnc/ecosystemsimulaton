import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import {OrbitControls} from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import * as Objects from "../../ecosystemsimulaton/js/world/Objects.js";
import { MousePicker } from "../../ecosystemsimulaton/js/mouse_picking.js";

const fShader = document.getElementById("fragmentShader").text;
const vShader = document.getElementById("vertexShader").text;

function createInitScene() {
    const scene = new THREE.Scene();
    world = new World(scene);
    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
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

function createTestSceneElements() {

    const uniforms3 = THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
            color: {type: "c", value: new THREE.Color("skyblue")},
        },
    ]);

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms3,
        vertexShader: vShader,
        fragmentShader: fShader,
        side: THREE.DoubleSide,
        lights: true,
    });

    const planeMat = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        flatShading: THREE.FlatShading,
    });

    let terrainObject = new Objects.Terrain( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), planeMat );
    // let mouseFollowerObject = new Objects.MouseFollower( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), material, terrainObject );
    let mouseFollowerObject = null;
    let cubeObject = new Objects.Box( new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0), material );
    let cubeObject2 = new Objects.Box( new THREE.Vector3(5, 2, 0), new THREE.Vector3(0, 0), material );
    world.instantiateObject(cubeObject2);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set( 5, 3, 0 );

    let lightSphereObject = new Objects.LightIndicator( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), material, pointLight );

    return {terrainObject, mouseFollowerObject, cubeObject, pointLight, lightSphereObject};
}

function threeStarter() {
    const {scene, camera, renderer} = createInitScene();
    const controls = createInitControls(camera, renderer);
    const {terrainObject, mouseFollowerObject, cubeObject, pointLight, lightSphereObject} = createTestSceneElements();

    world.instantiateObject(terrainObject);
    // world.instantiateObject(mouseFollowerObject);
    world.instantiateObject(cubeObject);
    world.instantiateObject(lightSphereObject);

    world.instantiateLight(pointLight);

    gui.setTerrain(terrainObject);

    function loop() {
        frameCount++;
        requestAnimationFrame(loop);

        controls.update();

        // pointLight.position.set( Math.cos(frameCount * 0.1)*3, 2, Math.sin(frameCount * 0.1)*3);
        raycaster.setFromCamera(mouse, camera);

        world.update();

        renderer.render(scene, camera);
    }

    loop();
}

// addEventListener("mousemove", (event) => {
//     mouse.x = (event.clientX / innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / innerHeight) * 2 + 1;
// })

window.onload = threeStarter();