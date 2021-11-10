class Tree extends LivingObjectBase {
    constructor(pos, rotation) {
        super(pos, rotation);
        this.health = 100;
    }

    applyDamage(damage) {
        super.applyDamage(damage);
        console.log("Tree got " + damage + " damage.")
    }

    update() {
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        console.log("Tree on position " + this.pos + " died.")
    }
}

class Fox extends MovableObjectBase {
    constructor(pos, rotation) {
        super(pos, rotation);
        this.health = 100;
        this.speed = 2;
    }

    update() {
        if (this.checkIfTargetReached()) {
            this.target = null;
        }
    }
}

class Human extends MovableObjectBase {
    constructor(pos, rotation) {
        super(pos, rotation);
        this.health = 100;
        this.speed = 2;
    }

    update() {
        if (this.target == null) {
            //Should find the closest tree.
            this.target = gameObjectList.find((x) => x instanceof Tree);
        }

        if (this.checkIfNextToTarget()) {
            this.target.applyDamage(20);
        } else if (this.target != null) {
            this.pos = this.pos.add(this.target.pos.subtract(this.pos).normalize().multiply(this.speed));
            console.log("Human is moving towards tree. Current Pos: " + this.pos);
        }
    }
}