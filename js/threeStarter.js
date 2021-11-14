import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import {OrbitControls} from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";

var fShader = document.getElementById("fragmentShader").text;
var vShader = document.getElementById("vertexShader").text;

function changePlaneGeometry(C, parameters) {
    C.geometry = new THREE.PlaneGeometry(parameters.plane.scale, parameters.plane.scale, parameters.plane.resolution, parameters.plane.resolution);
    const arr = C.geometry.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
        let x = C.geometry.attributes.position.array[i];
        let y = C.geometry.attributes.position.array[i + 1];
        C.geometry.attributes.position.array[i + 2] = perlin.get(x * parameters.plane.noiseScale, y * parameters.plane.noiseScale);
    }
}

function createInitScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    camera.position.y = 3;
    camera.position.z = 6;
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);
    return {scene, camera, renderer};
}

function createInitControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    // controls.maxPolarAngle = Math.PI / 3;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    return controls;
}

function createTestSceneElements() {
    const plane = new THREE.PlaneGeometry(12, 12, 90, 90);
    const sphereGeometry = new THREE.SphereGeometry(0.2);
    const lightSphereGeometry = new THREE.SphereGeometry(0.2);
    const cube = new THREE.BoxGeometry().translate(0, 2, 0);

    var uniforms3 = THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
            color: {type: "c", value: new THREE.Color("skyblue")},
        },
    ]);

    var material = new THREE.ShaderMaterial({
        uniforms: uniforms3,
        vertexShader: vShader,
        fragmentShader: fShader,
        side: THREE.DoubleSide,
        lights: true,
    });

    var planeMat = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        flatShading: THREE.FlatShading,
    });

    const sphereMesh = new THREE.Mesh(sphereGeometry, material);
    const cubeMesh = new THREE.Mesh(cube, material);
    const planeMesh = new THREE.Mesh(plane, planeMat);
    planeMesh.rotation.x = Math.PI / 2;
    const lightSphereMesh = new THREE.Mesh(lightSphereGeometry, material);


    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set( 5, 3, 0 );

    return {sphereMesh, cubeMesh, planeMesh, lightSphereMesh, pointLight};
}

function threeStarter() {
    const {scene, camera, renderer} = createInitScene();
    const raycaster = new THREE.Raycaster();
    const controls = createInitControls(camera, renderer);
    const {sphereMesh, cubeMesh, planeMesh, lightSphereMesh, pointLight} = createTestSceneElements();

    scene.add(pointLight);
    scene.add(sphereMesh);
    scene.add(cubeMesh);
    scene.add(planeMesh);
    scene.add(lightSphereMesh);

    resolution.onChange(() => {
        changePlaneGeometry(planeMesh, parameters);
    });
    noiseScale.onChange(() => {
        changePlaneGeometry(planeMesh, parameters);
    });
    planeScale.onChange(() => {
        changePlaneGeometry(planeMesh, parameters);
    });

    var time = 0;
    function animate() {
        time+=0.01;
        requestAnimationFrame(animate);
        pointLight.position.set(Math.cos(time)*3, 2, Math.sin(time)*3);
        lightSphereMesh.position.x = pointLight.position.x;
        lightSphereMesh.position.y = pointLight.position.y;
        lightSphereMesh.position.z = pointLight.position.z;


        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(planeMesh);
        if (intersects.length > 0) {
            sphereMesh.position.x = intersects[0].point.x;
            sphereMesh.position.y = intersects[0].point.y;
            sphereMesh.position.z = intersects[0].point.z;
        }


        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}

addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / innerHeight) * 2 + 1;
})

window.onload = threeStarter();