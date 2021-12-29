import * as THREE from "../library/three.js-r135/build/three.module.js";
import {LightIndicator} from "../world/Objects.js";
import * as Materials from "../world/Materials.js";

document.getElementById("add-light-button").addEventListener("click", () => {
    console.log("Add light");
    addLight();
});

document.getElementById("remove-light-button").addEventListener("click", () => {
    console.log("Remove light");
    removeLight();
});

function addLight() {
    let pointLight = new THREE.PointLight(0xffffff, 1.05, 400);
    pointLight.position.set((Math.random() - 0.5) * parameters.plane.scale / 2, 23 + Math.random() * 4, (Math.random() - 0.5) * parameters.plane.scale / 2);
    world.instantiateLight(pointLight);

    let lightSphereObject = new LightIndicator(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0), Materials.lightIndicatorMaterial, pointLight);
    world.instantiateObject(lightSphereObject, false);
}

function removeLight() {
    let object = world.getObjectOfMesh(mousePicker.pickedObject);
    if (mousePicker.pickedObject != null && object instanceof LightIndicator) {
        let light = object.light;

        world.deleteLight(light);
        world.deleteObject(object);
    }
}