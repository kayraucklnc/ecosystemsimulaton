import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import {DragControls} from "https://unpkg.com/three@0.126.1/examples/jsm/controls/DragControls.js";
import {Terrain} from "./world/Objects.js";

const PickingStage = {
    FREE: 0,
    PICKED: 1
}

export class MousePicker {
    constructor(scene, camera, renderer) {
        this.stage = PickingStage.FREE;
        this.pickedObject = null
        this.pickedObjectSavedColor = 0;

        this.axesHelper = new THREE.AxesHelper();
        this.axesHelper.visible = false;

        this.scene = scene;
        this.scene.add(this.axesHelper);

        this.camera = camera;
        this.renderer = renderer;

        this.dragControls = null;

        window.addEventListener("pointerup", mouse_up);
        window.addEventListener('pointermove', mouse_move);
    }
}

function createDragControls(mousePicker, objects) {
    mousePicker.dragControls = new DragControls(objects, mousePicker.camera, mousePicker.renderer.domElement);
    mousePicker.dragControls.addEventListener("dragstart", (event) => {
        orbitControls.enabled = false;
    })
    mousePicker.dragControls.addEventListener("dragend", (event) => {
        orbitControls.enabled = true;
    })
    mousePicker.dragControls.transformGroup = true;
    mousePicker.dragControls.deactivate();

    return mousePicker.dragControls;
}

function mouse_up(event) {
    if (event.button == 0) {
        // console.log("mouse_up");

        const intersects = raycaster.intersectObjects(mousePicker.scene.children);
        let intersect = null;
        if (intersects.length) {
            intersect = intersects[0];
        }

        if (mousePicker.stage == PickingStage.PICKED && (!intersect || intersect.object != mousePicker.pickedObject)) {
            console.log("Freed: " + mousePicker.pickedObject.id);

            mousePicker.stage = PickingStage.FREE;
            mousePicker.pickedObject.remove(mousePicker.axesHelper);
            mousePicker.pickedObject = null;

            mousePicker.dragControls.deactivate();
            mousePicker.axesHelper.visible = false;
        }

        if (mousePicker.stage == PickingStage.FREE && intersect && intersect.object != mousePicker.axesHelper) {
            if (!world.getObjectOfMesh(intersect.object).selectable) {
                return;
            }

            mousePicker.stage = PickingStage.PICKED;

            mousePicker.pickedObject = intersect.object;
            const pos = mousePicker.pickedObject.position;
            mousePicker.axesHelper.position.set(pos.x, pos.y, pos.z);

            mousePicker.axesHelper.visible = true;
            mousePicker.pickedObject.attach(mousePicker.axesHelper);

            mousePicker.dragControls = createDragControls(mousePicker, [mousePicker.pickedObject]);
            mousePicker.dragControls.activate();

            console.log("Picked: " + mousePicker.pickedObject.id);
        }
    }
}

function mouse_move(event) {
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / innerHeight) * 2 + 1;
}

function get_mouse_intersect() {
    const intersects = raycaster.intersectObjects(mousePicker.scene.children);
    if (intersects.length) {
        let intersect = intersects[0];

        let i = 1;
        while ((intersect.object == mousePicker.pickedObject) && i < intersects.length) {
            intersect = intersects[i];
            i++;
        }
        if (intersect.object == mousePicker.pickedObject) {
            return null;
        }

        return intersect;
    }

    return null;
}