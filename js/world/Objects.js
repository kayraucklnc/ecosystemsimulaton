import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import * as ObjectBases from "./ObjectBases.js";

class Box extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;

        const cube = new THREE.BoxGeometry();
        this.mesh = new THREE.Mesh(cube, material);

        this.setPos(pos);
        this.setRot(rotation);
    }

    update() {
    }
}

class Sphere extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;

        const sphereGeometry = new THREE.SphereGeometry(0.2);
        this.mesh = new THREE.Mesh(sphereGeometry, material);

        this.setPos(pos);
        this.setRot(rotation);
    }

    update() {
    }
}

class LightIndicator extends Sphere {
    constructor(pos, rotation, material, target) {
        super(pos, rotation, material);
        this.toFollow = target;
    }

    update() {
        if (this.toFollow.position != this.getPos()) {
            this.setPos(this.toFollow.position);
        }
    }
}

class MouseFollower extends Sphere {
    constructor(pos, rotation, material, onPlane) {
        super(pos, rotation, material);
        this.onPlane = onPlane;
    }

    update() {
        const intersects = raycaster.intersectObject(this.onPlane.mesh);
        if (intersects.length > 0) {
            this.setPos(intersects[0].point);
        }
    }

}

class Terrain extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        
        const geometry = new THREE.PlaneGeometry(12, 12, 90, 90);
        this.mesh = new THREE.Mesh(geometry, this.material);

        this.setPos(pos);
        this.setRot(rotation);
        this.mesh.rotation.x = this.mesh.rotation.x + Math.PI / 2;
    }

    changePlaneGeometry(parameters) {
        this.mesh.geometry = new THREE.PlaneGeometry(parameters.plane.scale, parameters.plane.scale, parameters.plane.resolution, parameters.plane.resolution);
        const length = this.mesh.geometry.attributes.position.array.length;
        for (let i = 0; i < length; i += 3) {
            let x = this.mesh.geometry.attributes.position.array[i];
            let y = this.mesh.geometry.attributes.position.array[i + 1];
            this.mesh.geometry.attributes.position.array[i + 2] = perlin.get(x * parameters.plane.noiseScale, y * parameters.plane.noiseScale);
        }
    }

    update() {
    }
}

class Tree extends ObjectBases.LivingObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;

        const sphereGeometry = new THREE.SphereGeometry(0.4);
        this.mesh = new THREE.Mesh(sphereGeometry, material);

        this.setPos(pos);
        this.setRot(rotation);
    }

    applyDamage(damage) {
        super.applyDamage(damage);
        // console.log("Tree got " + damage + " damage.")
    }

    update() {
        // let runVector = new THREE.Vector3();
        // for (let i = 0; i < world.objects.length; i++) {
        //     let obj = world.objects[i];
        //
        //     if (obj instanceof Human) {
        //         let runVec = new THREE.Vector3().subVectors(this.getPos(), obj.getPos());
        //         runVector.add(runVec);
        //     }
        // }
        // runVector.normalize();
        // this.getPos().add(runVector.multiplyScalar(0.03));

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        super.die();
        let pos = this.getPos();
        // console.log("Tree on position " + pos.x + ", " + pos.y + ", " + pos.z + " died.")
    }
}

class Fox extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        this.speed = 2;
    }

    update() {
        if (this.checkIfTargetReached()) {
            this.target = null;
        }
    }
}

class Human extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        this.speed = 0.04;

        const cube = new THREE.BoxGeometry();
        this.mesh = new THREE.Mesh(cube, material);

        this.setPos(pos);
        this.setRot(rotation);
    }

    update() {
        //Should find the closest tree.
        let closest = null;
        let closestDist = Infinity;
        let currPos = this.getPos();
        world.objects.forEach(
            function(value, index) {
                let dist = (new THREE.Vector3()).subVectors(value.getPos(), currPos).lengthSq();
                if (value instanceof Tree && (closest == null || dist < closestDist)) {
                    closest = value;
                    closestDist = dist;
                }
            }
        )
        this.target = closest;

        if (this.checkIfNextToTarget()) {
            this.target.applyDamage(20);
        } else if (this.target != null) {
            let newVec = new THREE.Vector3().subVectors(this.target.getPos(), this.getPos());
            let movementVector = newVec.normalize().multiplyScalar(this.speed);
            let pos = this.getPos().add(movementVector);
            // console.log("Human is moving towards tree. Current Pos: " + pos.x + ", " + pos.y + ", " + pos.z);
        }
    }
}

export {Sphere, LightIndicator, MouseFollower, Terrain, Box, Human, Tree};