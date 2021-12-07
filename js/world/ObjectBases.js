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

    update() {
    }

    setModel() {
    }

    setTexture() {
    }
}

class LivingObjectBase extends WorldObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = null;
    }

    //Returns if object is dead after damage.
    applyDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
            return true;
        }

        return false;
    };

    die() {
        world.deleteObject(this);
    }
}

class MovableObjectBase extends LivingObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.speed = null;

        this.path = [];
        this.pathLines = [];
        this.pathColor = world.getRandomColor();
        this.pathHeight = world.randomFloatFromInterval(world.getCellSize() / 4, world.getCellSize());
        this.lastPos = pos;
        this.movement = 0.0;
    }

    cleanLines() {
        this.pathLines.forEach((pL) => {
            world.scene.remove(pL);
        });
        this.pathLines = [];
    }

    createLines(path) {
        this.cleanLines();

        if (path != null && path.length > 0) {
            // let line = world.createLine(this.getPos(), path[path.length - 1], this.pathHeight, this.pathColor);
            // this.pathLines.push(line);
            // world.scene.add(line);

            let line = world.createLine(this.getPos(), path[0], this.pathHeight, this.pathColor);
            this.pathLines.push(line);
            world.scene.add(line);

            for (let i = 0; i < path.length - 1; i++) {
                let line = world.createLine(path[i], path[i + 1], this.pathHeight, this.pathColor);
                this.pathLines.push(line);
                world.scene.add(line);
            }
        }
    }

    myAngleTo(u, v, normal){
        let angle = Math.acos(new THREE.Vector3().copy(u).normalize().dot(new THREE.Vector3().copy(v).normalize()));
        let cross = new THREE.Vector3().crossVectors(u, v);
        if (new THREE.Vector3().copy(normal).normalize().dot(new THREE.Vector3().copy(cross).normalize()) < 0) { // Or > 0
            angle = -angle;
        }
        return angle;
    }
    
    lookTowardsPath() {
        //Align its look around itself
        let projMovement = new THREE.Vector3().subVectors(this.getPos(), this.lastPos).projectOnPlane(world.getNormalVector(this.getPos())).normalize().multiplyScalar(world.getCellSize() / 2);
        let projZAxis = new THREE.Vector3().addVectors(this.getPos(), (new THREE.Vector3(0, 0, world.getCellSize() / 2.0)));
        projZAxis.y = world.grid.terrain.getHeight(new THREE.Vector2(projZAxis.x, projZAxis.z));
        projZAxis.sub(this.getPos());
        // world.scene.add(world.createLine(this.getPos(), new THREE.Vector3().addVectors(projZAxis, this.getPos())));
        // world.scene.add(world.createLine(this.getPos(), new THREE.Vector3().addVectors(projMovement, this.getPos()), 0,"#ff0000"));
        let angleInRad = this.myAngleTo(projZAxis, projMovement, world.getNormalVector(this.getPos()));
        this.mesh.rotateY(angleInRad);
    }
    

    attack(target) {
    }

    checkIfTargetReached(targetPos) {
        return this.getPos().distanceToSquared(targetPos) <= Math.pow(world.getCellSize() / 2.0, 2.0);
    }

    checkIfNextToTarget(targetPos) {
        return this.getPos().distanceToSquared(targetPos) <= Math.pow(world.getCellSize() * 1.5, 2.0);
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

    findClosestWithAStar(checkFunc) {
        let cloneObjects = [...world.objects];
        let thisPos = this.getPos();
        cloneObjects = cloneObjects.filter(checkFunc);
        cloneObjects.sort((a, b) => (a.getPos().distanceToSquared(thisPos) > b.getPos().distanceToSquared(thisPos)) ? 1 : -1);

        let closest = null;
        for (let i = 0; i < cloneObjects.length; i++) {
            closest = cloneObjects[i];
            this.path = AStar.findPath(this.getPos(), closest.getPos());
            if (this.path != null) {
                break;
            }
        }

        return closest;
    }

    // onReach and onStuck are functions. Needs targetPos to be assigned.
    executePath(onReach, onStuck, onMove = () => {
    }, hasTargetOnDest = false) {
        if (this.path == null) {
            onStuck();
            return;
        }

        let targetPos = null;
        let reachCheck = null;
        if (hasTargetOnDest) {
            targetPos = this.path.length > 0 ? this.path[this.path.length - 1]: this.getPos();
            reachCheck = this.checkIfNextToTarget(targetPos);
        } else {
            // targetPos = this.getPos();
            reachCheck = this.path.length == 0;
        }

        if (reachCheck) {
            onReach();
        } else {
            let movementVector = this.path[0];

            if (this.movement < 1) {
                this.movement += this.speed;
            } else if (!world.checkPos(movementVector)) {
                this.lastPos = new THREE.Vector3().copy(this.getPos());
                this.movement = 0.0;
                world.moveObjectOnGrid(this, movementVector);
                this.path.splice(0, 1);
                if (onMove) {
                    onMove();
                }

            } else {
                onStuck();
            }
        }
    }
}

export {WorldObjectBase, LivingObjectBase, MovableObjectBase};