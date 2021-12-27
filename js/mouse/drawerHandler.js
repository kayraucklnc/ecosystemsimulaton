import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as Objects from "../world/Objects.js";
import * as Materials from "../world/Materials.js";

document.addEventListener('mousedown', () => drawHandler.isDrag = true);
document.addEventListener('mousemove', (e) => drawHandler.addElement(e));
document.addEventListener('mouseup', () => drawHandler.isDrag = false);

class DrawerHandler {
    constructor() {
        this.isDrag = false;
    }

    addElement(e) {
        const intersects = raycaster.intersectObjects([terrainObject.mesh]);
        if (e.button === 0 && this.isDrag && intersects[0] != null) {
            let intersectPoint = intersects[0].point;
            if (drawMode.brush) {
                if(!world.getPos(intersectPoint)){
                    let element;
                    switch (document.getElementById("brushElements").value) {
                        case "wall":
                            element = new Objects.Wall(intersectPoint, new THREE.Vector3(0, 0), Materials.wallMaterial);
                            break;
                        case "human":
                            element = new Objects.Human(intersectPoint, new THREE.Vector3(0, 0), Materials.humanMaterial);
                            break;
                        case "tree":
                            element = new Objects.Tree(intersectPoint, new THREE.Vector3(0, 0), Materials.treeMaterial);
                            break;
                        case "squirrel":
                            element = new Objects.Squirrel(intersectPoint, new THREE.Vector3(0, 0), Materials.squirrelMaterial);
                            break;
                    }
                    world.instantiateObject(element, true);
                }
            } else if (drawMode.eraser) {
                let object = world.getPos(intersectPoint);
                if(object){
                    world.deleteObject(object);
                }
            }
        }

    }

}

let drawHandler = new DrawerHandler();
