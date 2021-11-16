import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import {OrbitControls} from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import * as Objects from "/ecosystem/js/world/Objects.js";

var data;

const fShader = document.getElementById("fragmentShader").text;
const vShader = document.getElementById("vertexShader").text;

function createInitScene() {
    const scene = new THREE.Scene();
    world = new World(scene);

    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    const camera = new THREE.PerspectiveCamera(
        75,
        500 / 600,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer();
    raycaster = new THREE.Raycaster();

    camera.position.y = 3;
    camera.position.z = 6;
    renderer.setSize(500, 600);
    document.body.appendChild(renderer.domElement);
    return {scene, camera, renderer};
}

function createInitControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    // controls.maxPolarAngle = Math.PI / 3;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    return controls;
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

    let terrainObject = new Objects.Terrain(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0),
        planeMat
    );
    let mouseFollowerObject = new Objects.MouseFollower(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0),
        material,
        terrainObject
    );
    let cubeObject = new Objects.Box(
        new THREE.Vector3(0, 2, 0),
        new THREE.Vector3(0, 0),
        material
    );

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 3, 0);


    let lightSphereObject = new Objects.LightIndicator(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0),
        material,
        pointLight
    );

    return {
        terrainObject,
        mouseFollowerObject,
        cubeObject,
        pointLight,
        lightSphereObject,
    };
}

function drawthechart() {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart(time) {
        // Create the data table.
        data = new google.visualization.DataTable();
        data.addColumn('string', 'Year');
        data.addColumn('number', 'Count');
        data.addColumn('number', 'CountB');
        data.addColumn('number', 'CountC');
        updateData();
        // Set chart options
        var options = {'title':'How Much Pizza I Ate Last Night',
            'width':700,
            'height':400,
            vAxis: {
                viewWindowMode:'explicit',
                viewWindow: {
                    max:0.7,
                    min:-0.7
                }
            },};

        // Instantiate and draw our chart, passing in some options.
        const graphDiv = document.createElement("div");
        var chart = new google.visualization.LineChart(graphDiv);
        document.body.appendChild(graphDiv);

        setInterval(() => {
            updateData();
            chart.draw(data, options);
        }, 200);

        function updateData(){
            let dataCount = 50;
            if(data.Wf.length >= dataCount){
                data.removeRows(0, 1);
            };
            let rows = [[frameCount.toString(), perlin.get(2, frameCount/100), perlin.get(3.86, frameCount/150), perlin.get(3.86, frameCount/80)]];
            data.addRows(rows);
        }
    }
}

function threeStarter() {
    drawthechart();
    const {scene, camera, renderer} = createInitScene();
    const controls = createInitControls(camera, renderer);
    const {
        terrainObject,
        mouseFollowerObject,
        cubeObject,
        pointLight,
        lightSphereObject,
    } = createTestSceneElements();

    world.instantiateObject(terrainObject);
    world.instantiateObject(mouseFollowerObject);
    world.instantiateObject(cubeObject);
    world.instantiateObject(lightSphereObject);

    world.instantiateLight(pointLight);

    gui.setTerrain(terrainObject);

    function loop() {
        frameCount++;
        requestAnimationFrame(loop);

        controls.update();

        pointLight.position.set(
            Math.cos(frameCount * 0.1) * 3,
            2,
            Math.sin(frameCount * 0.1) * 3
        );
        raycaster.setFromCamera(mouse, camera);

        world.update();

        renderer.render(scene, camera);
    }

    loop();
}

addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / 500) * 2 - 1;
    mouse.y = -(event.clientY / 600) * 2 + 1;
});

window.onload = threeStarter();
