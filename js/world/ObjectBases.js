class WorldObjectBase {
    constructor(pos, rotation) {
        this.renderable = null;
        this.pos = pos;
        this.rotation = rotation;
    }

    update() {}
    setModel() {}
    setTexture() {}
}

class LivingObjectBase extends WorldObjectBase {
    constructor(pos, rotation) {
        super(pos, rotation);
        this.health = null;
    }

    applyDamage(damage) {
        this.health -= damage;
    };
    die() {}
}

class MovableObjectBase extends LivingObjectBase {
    constructor(pos, rotation) {
        super(pos, rotation);
        this.speed = null;
        this.target = null;
    }

    attack(target) {}
    checkIfTargetReached() {
        return this.pos.equals(this.target.pos);
    }

    checkIfNextToTarget() {
        return this.target != null && this.pos.subtract(this.target.pos).magnitude <= 1;
    }
}