import * as THREE from "../library/three.js-r135/build/three.module.js";
import {LightIndicator} from "../world/Objects.js";
import * as Materials from "../world/Materials.js";
import {skyboxMaterial} from "../world/Materials.js";

document.getElementById("add-light-button").addEventListener("click", () => {
    console.log("Add light");
    addLight();

    if (world.lights.length == 1) {
        for (let k = 0; k < 6; k++)
            skyboxMaterial[k].color = new THREE.Color(1, 1, 1);
    }
});

document.getElementById("remove-light-button").addEventListener("click", () => {
    console.log("Remove light");
    removeLight();

    if (world.lights.length == 0) {
        let moonLight = 0.2;
        for (let k = 0; k < 6; k++)
            skyboxMaterial[k].color = new THREE.Color(moonLight, moonLight, moonLight);
    }
});

class LightRotationChanger {
    constructor(lightIndicatorObject) {
        this.lightIndicator = lightIndicatorObject;

        let lightRot = this.lightIndicator.getRot();

        let xSlider = document.getElementById("light-x-slider");
        xSlider.value = lightRot.x;
        xSlider.addEventListener("change", this.onXChange);
        xSlider.addEventListener("input", this.onXChange);

        let ySlider = document.getElementById("light-y-slider");
        ySlider.value = lightRot.y;
        ySlider.addEventListener("change", this.onYChange);
        ySlider.addEventListener("input", this.onYChange);

        let zSlider = document.getElementById("light-z-slider");
        zSlider.value = lightRot.z;
        zSlider.addEventListener("change", this.onZChange);
        zSlider.addEventListener("input", this.onZChange);

        // this.currentRotation = {x:lightRot.x, y:lightRot.y, z:lightRot.z};
    }

    endListening() {
        document.getElementById("light-x-slider").removeEventListener("change", this.onXChange);
        document.getElementById("light-x-slider").removeEventListener("input", this.onXChange);
        document.getElementById("light-y-slider").removeEventListener("change", this.onYChange);
        document.getElementById("light-y-slider").removeEventListener("input", this.onYChange);
        document.getElementById("light-z-slider").removeEventListener("change", this.onZChange);
        document.getElementById("light-z-slider").removeEventListener("input", this.onZChange);
    }

    onXChange() {
        let that = pickingEvents._lightRotationChanger;
        let newXValue = document.getElementById("light-x-slider").value;
        that.lightIndicator.getRot().x = newXValue;

        // that.lightIndicator.mesh.rotateOnWorldAxis(new THREE.Vector3(1), newXValue - that.currentRotation.x);
        // that.currentRotation.x = newXValue;
    }

    onYChange() {
        let that = pickingEvents._lightRotationChanger;
        let newYValue = document.getElementById("light-y-slider").value;
        that.lightIndicator.getRot().y = newYValue;
    }

    onZChange() {
        let that = pickingEvents._lightRotationChanger;
        let newZValue = document.getElementById("light-z-slider").value;
        that.lightIndicator.getRot().z = newZValue;
    }
}

pickingEvents.addPickListener((pickedObject) => {
    if (pickedObject instanceof LightIndicator) {
        showLightRotationControls();

        if (pickingEvents._lightRotationChanger) pickingEvents._lightRotationChanger.endListening();
        pickingEvents._lightRotationChanger = new LightRotationChanger(pickedObject);
    }
});

pickingEvents.addFreeListener((freedObject) => {
    if (freedObject instanceof LightIndicator) {
        hideLightRotationControls();

        if (pickingEvents._lightRotationChanger) pickingEvents._lightRotationChanger.endListening();
        pickingEvents._lightRotationChanger = null;
    }
});

function showLightRotationControls() {
    document.getElementById("lightSliders").setAttribute("style", "display: flex; flex-direction: row;");
}

function hideLightRotationControls() {
    document.getElementById("lightSliders").setAttribute("style", "display: none;");
}

function addLight() {
    let pointLight = new THREE.SpotLight(0xffffff, 0.85, 400, 20, 0);
    pointLight.position.set((Math.random() - 0.5) * parameters.plane.scale / 2, 23 + Math.random() * 4, (Math.random() - 0.5) * parameters.plane.scale / 2);
    world.instantiateLight(pointLight);

    let lightSphereObject = new LightIndicator(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), Materials.lightIndicatorMaterial, pointLight);
    world.instantiateObject(lightSphereObject, false);
}

function removeLight() {
    if (mousePicker.pickedObject == null) {
        return;
    }

    let object = world.getObjectOfMesh(mousePicker.pickedObject);
    if (mousePicker.pickedObject != null && object instanceof LightIndicator) {
        let light = object.light;

        world.deleteLight(light);
        world.deleteObject(object);
    }
}