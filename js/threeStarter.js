import * as Materials from "../../ecosystemsimulaton/js/world/Materials.js";
import * as DataLoader from "../../ecosystemsimulaton/js/util/loadData.js";
import {createInitScene, createInitControls, createTestSceneElements} from "./SceneOperations.js";

function threeStarter() {
    drawthechart();
    Materials.createAllMaterials();

    const {scene: _scene, camera: _camera} = createInitScene();
    scene = _scene;
    camera = _camera;
    const controls = createInitControls(camera, renderer);
    createTestSceneElements();
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
