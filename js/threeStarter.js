import * as Materials from "../../ecosystemsimulaton/js/world/Materials.js";
import * as DataLoader from "../../ecosystemsimulaton/js/util/loadData.js";
import {createInitScene, createInitControls, createTestSceneElements} from "./SceneOperations.js";
import * as THREE from "../../ecosystemsimulaton/js/library/three.js-r135/build/three.module.js";
import * as Objects from "../../ecosystemsimulaton/js/world/Objects.js";

function threeStarter() {
    drawthechart();
    Materials.createAllMaterials();

    const {scene: _scene, camera: _camera} = createInitScene();
    scene = _scene;
    camera = _camera;
    const controls = createInitControls(camera, renderer);
    createTestSceneElements();
    gui.setTerrain(terrainObject);

    // var loopStats = new Stats();
    // loopStats.showPanel(0);
    // document.body.appendChild(loopStats.dom);

    let cameraOffset = new THREE.Vector3(0, 4, 4);
    let followObject = world.objects.filter((x) => {
        return x instanceof Objects.Pig;
    })[0];
    followObject.hasDied = true;
    let oldpos = new THREE.Vector3().copy(followObject.getPos());

    let newPos = new THREE.Vector3().copy(followObject.mesh.position).add(cameraOffset);
    camera.position.set(newPos.x, newPos.y, newPos.z);

    function loop() {
        // loopStats.begin();
        if (oldpos.distanceToSquared(followObject.getPos()) > 0.2) {
            let moveAmn = new THREE.Vector3().subVectors(followObject.getPos(), oldpos);
            camera.position.add(moveAmn);
            oldpos = new THREE.Vector3().copy(followObject.getPos());
        }
        orbitControls.target = followObject.mesh.position;

        raycaster.setFromCamera(mouse, camera);

        controls.update();

        renderer.render(scene, camera);

        window.requestAnimationFrame(loop);
        // loopStats.end();
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
