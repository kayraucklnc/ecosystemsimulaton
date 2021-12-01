import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";

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
    }

    attack(target) {}
    checkIfTargetReached() {
        return this.getPos().equals(this.target.getPos());
    }

    checkIfNextToTarget() {
        return this.target != null && this.getPos().distanceTo(this.target.getPos()) <= 1;
    }
}

export {WorldObjectBase, LivingObjectBase, MovableObjectBase};