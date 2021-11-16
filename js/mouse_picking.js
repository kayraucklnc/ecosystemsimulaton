import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import {DragControls} from "https://unpkg.com/three@0.126.1/examples/jsm/controls/DragControls.js";

const PickingStage = {
    FREE: 0,
    PICKED: 1
}

const MoveAxis = {
    X: 0,
    Y: 1,
    Z: 2
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

        this.dragControls = new DragControls( [this.axesHelper], this.camera, this.renderer.domElement );
        this.dragControls.addEventListener("dragstart", (event) => {
            orbitControls.enabled = false;
        })
        this.dragControls.addEventListener("dragend", (event) => {
            orbitControls.enabled = true;
        })
        this.dragControls.transformGroup = true;
        this.dragControls.deactivate();

        window.addEventListener("pointerup", mouse_up);
        window.addEventListener('pointermove', mouse_move);
    }
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
            mousePicker.scene.attach(mousePicker.pickedObject);
            mousePicker.pickedObject = null;

            mousePicker.dragControls.deactivate();
            mousePicker.axesHelper.visible = false;
        }

        if (mousePicker.stage == PickingStage.FREE && intersect && intersect.object != mousePicker.axesHelper) {
            mousePicker.stage = PickingStage.PICKED;

            mousePicker.pickedObject = intersect.object;
            const pos = mousePicker.pickedObject.position;
            mousePicker.axesHelper.position.set(pos.x, pos.y, pos.z);

            mousePicker.dragControls.activate();
            mousePicker.axesHelper.visible = true;
            mousePicker.axesHelper.attach(mousePicker.pickedObject);

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

// function mouse_move(event) {
//     mouse.x = (event.clientX / innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / innerHeight) * 2 + 1;
//
//     if (mousePicker.stage == PickingStage.PICKED) {
//         const intersects = raycaster.intersectObjects(mousePicker.scene.children);
//         if (intersects.length) {
//             let intersect = intersects[0];
//
//             let i = 1;
//             while ((intersect.object == mousePicker.pickedObject || intersect.object == mousePicker.axesHelper) && i < intersects.length) {
//                 intersect = intersects[i];
//                 i++;
//             }
//             if (intersect.object == mousePicker.pickedObject || intersect.object == mousePicker.axesHelper) {
//                 return;
//             }
//
//             const point = intersect.point;
//             mousePicker.axesHelper.position.set(point.x, point.y, point.z);
//             // this.pickedObject.lookAt(intersect.face.normal);
//         }
//     }
// }