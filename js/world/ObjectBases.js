// import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as AStar from "../util/AStar.js";

class WorldObjectBase {
    constructor(pos, rotation, material) {
        this.mesh = null;
        this.material = material;

        this.selectable = false;

        this.setPos(pos);
        this.setRot(rotation);
    }

    getPos() {
        return this.mesh.position;
    }
    setPos(vec3) {
        if (this.mesh != null) {
            this.mesh.position.x = vec3.x;
            this.mesh.position.y = vec3.y;
            this.mesh.position.z = vec3.z;
        }
    }

    getRot() {
        return this.mesh.rotation;
    }
    setRot(vec3) {
        if (this.mesh != null) {
            this.mesh.rotation.x = vec3.x;
            this.mesh.rotation.y = vec3.y;
            this.mesh.rotation.z = vec3.z;
        }
    }

    getQuaternion() {
        return this.mesh.quaternion;
    }
    setQuaternion(quaternion) {
        if (this.mesh != null) {
            this.mesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        }
    }

    update() {}
    setModel() {}
    setTexture() {}
}

class LivingObjectBase extends WorldObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = null;
    }

    applyDamage(damage) {
        this.health -= damage;
    };
    die() {
        world.deleteObject(this);
    }
}

class MovableObjectBase extends LivingObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.speed = null;
        this.target = null;

        this.path = [];
    }

    attack(target) {}
    checkIfTargetReached(targetPos) {
        return this.getPos().distanceTo(targetPos) <= world.getCellSize() / 2.0;
    }

    checkIfNextToTarget(targetPos) {
        return this.getPos().distanceTo(targetPos) <= world.getCellSize() * 1.5;
    }

    getMovementVectorToTarget(targetPos) {
        let movementVector = new THREE.Vector3().subVectors(targetPos, this.getPos());
        let x = Math.abs(movementVector.x);
        let z = Math.abs(movementVector.z);
        if (x > z) {
            movementVector.x *= 2.0;
            movementVector.z /= 2.0;
        } else if (x < z) {
            movementVector.x /= 2.0;
            movementVector.z *= 2.0;
        } else {
            if (Math.random() > 0.5) {
                movementVector.x *= 2.0;
                movementVector.z /= 2.0;
            } else {
                movementVector.x /= 2.0;
                movementVector.z *= 2.0;
            }
        }
        movementVector = movementVector.normalize().multiplyScalar(this.speed);
        return movementVector;
    }

    setPathWithAStar(targetPos) {
        this.path = AStar.findPath(this.getPos(), targetPos);
    }

    findClosestWithAStar(checkFunc) {
        let closest = null;
        let closestPathLen = Infinity;
        let closestPath = null;
        for (let worldObject of world.objects) {
            if (!checkFunc(worldObject)) {
                continue;
            }
            let currentPath = AStar.findPath(this.getPos(), worldObject.getPos());
            if (currentPath.length < closestPathLen) {
                closestPathLen = currentPath.length;
                closest = worldObject;
                closestPath = currentPath;
            }
        }

        this.path = closestPath;

        return closest;
    }
}

export {WorldObjectBase, LivingObjectBase, MovableObjectBase};