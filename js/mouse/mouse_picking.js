import * as THREE from "https://cdn.skypack.dev/three@0.135.0/build/three.module.js";
import {DragControls} from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/DragControls.js";

const PickingStage = {
    FREE: 0,
    PICKED: 1
}

export class PickingEvents {
    constructor() {
        this._pickEventListeners = [];
        this._freeEventListeners = [];
    }

    addPickListener(func) {
        this._pickEventListeners.push(func);
    }

    removePickListener(func) {
        const indexOf = this._pickEventListeners.indexOf(func);
        if (indexOf != -1) {
            this._pickEventListeners.splice(indexOf, 1);
        }
    }

    addFreeListener(func) {
        this._freeEventListeners.push(func);
    }

    removeFreeListener(func) {
        const indexOf = this._freeEventListeners.indexOf(func);
        if (indexOf != -1) {
            this._freeEventListeners.splice(indexOf, 1);
        }
    }

    setPickEvent() {
        this._pickEventListeners.forEach((func) => {
            func(world.getObjectOfMesh(mousePicker.pickedObject));
        })
    }

    setFreeEvent() {
        this._freeEventListeners.forEach((func) => {
            func(world.getObjectOfMesh(mousePicker.pickedObject));
        })
    }
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

        this.renderer.domElement.addEventListener("pointerup", mouse_up);
        this.renderer.domElement.addEventListener('pointermove', mouse_move);

        this.isActive = true;
    }
}

function createDragControls(mousePicker, objects) {
    mousePicker.dragControls = new DragControls(objects, mousePicker.camera, mousePicker.renderer.domElement);
    mousePicker.dragControls.addEventListener("dragstart", () => {
        orbitControls.enabled = false;
    })
    mousePicker.dragControls.addEventListener("dragend", () => {
        orbitControls.enabled = true;
    })
    mousePicker.dragControls.transformGroup = true;
    mousePicker.dragControls.deactivate();

    return mousePicker.dragControls;
}

function mouse_up(event) {
    if (event.button == 0) {
        const intersects = raycaster.intersectObjects(world.parentObject.children);
        let intersect = null;
        if (intersects.length) {
            intersect = intersects[0];
        }

        if (mousePicker.stage == PickingStage.PICKED && (!intersect || intersect.object != mousePicker.pickedObject)) {
            console.log("Freed: " + mousePicker.pickedObject.id);

            mousePicker.stage = PickingStage.FREE;

            pickingEvents.setFreeEvent();

            mousePicker.pickedObject.remove(mousePicker.axesHelper);
            mousePicker.pickedObject = null;

            mousePicker.dragControls.deactivate();
            mousePicker.axesHelper.visible = false;
        }

        if (mousePicker.isActive && mousePicker.stage == PickingStage.FREE && intersect && intersect.object != mousePicker.axesHelper) {
            let objectOfMesh = world.getObjectOfMesh(intersect.object);
            if (!objectOfMesh || !objectOfMesh.selectable) {
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

            pickingEvents.setPickEvent();
            console.log("Picked: " + mousePicker.pickedObject.id);
        }
    }
}

function mouse_move(event) {
    mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.clientHeight ) * 2 + 1;
}

pickingEvents = new PickingEvents();