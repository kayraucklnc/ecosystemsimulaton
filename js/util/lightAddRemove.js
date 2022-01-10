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