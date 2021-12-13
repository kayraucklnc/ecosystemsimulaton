import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as ObjectBases from "./ObjectBases.js";
import {treeMaterial} from "./Materials.js";
import * as AStar from "../util/AStar.js";

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

        const sphereGeometry = new THREE.SphereGeometry(0.5);
        this.mesh = new THREE.Mesh(sphereGeometry, material);

        this.setPos(pos);
        this.setRot(rotation);
    }

    update() {
    }
}

class LightIndicator extends ObjectBases.WorldObjectBase {
    constructor(pos, rotation, material, target) {
        super(pos, rotation, material);
        this.toFollow = target;

        this.selectable = true;

        const sphereGeometry = new THREE.SphereGeometry(0.5);
        this.mesh = new THREE.Mesh(sphereGeometry, material);

        this.setPos(this.toFollow.position);
        this.setRot(rotation);
    }

    update() {
        if (this.getPos().distanceToSquared(this.toFollow.position) > 0.01) {
            let currentPos = this.getPos();
            this.toFollow.position.set(currentPos.x, currentPos.y, currentPos.z);
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

class Terrain extends ObjectBases.WorldObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);

        this.grid = null;

        const geometry = new THREE.PlaneGeometry(12, 12, 90, 90);
        this.mesh = new THREE.Mesh(geometry, this.material);

        this.setPos(pos);
        this.setRot(rotation);
        this.mesh.rotation.x = this.mesh.rotation.x - Math.PI / 2;
        this.changePlaneGeometry(parameters);
    }

    getHeight(vec2) {
        //return perlin.get(vec2.x * parameters.plane.noiseScale, vec2.y * parameters.plane.noiseScale) * parameters.plane.heightMultiplier;
        var r = 0;
        for (var i = 0; i <= 5; i++) {
            var frequency = Math.pow(parameters.plane.lacunarity, i);
            var amplitude = Math.pow(parameters.plane.persistance, i);
            var noise = perlin.get(vec2.x *  parameters.plane.noiseScale * frequency / parameters.plane.smoothness, vec2.y *  parameters.plane.noiseScale * frequency / parameters.plane.smoothness ) ;
            r += noise * amplitude;
        }
        return r * parameters.plane.heightMultiplier;
    }


    changePlaneGeometry(parameters) {
        this.mesh.geometry = new THREE.PlaneGeometry(parameters.plane.scale, parameters.plane.scale, parameters.plane.resolution, parameters.plane.resolution);
        const length = this.mesh.geometry.attributes.position.array.length;
        for (let i = 0; i < length; i += 3) {
            let x = this.mesh.geometry.attributes.position.array[i];
            let y = this.mesh.geometry.attributes.position.array[i + 1];
            this.mesh.geometry.attributes.position.array[i + 2] = this.getHeight(new THREE.Vector2(x, -y));
        }

        if (this.grid) {
            this.grid.createGridGeometry(parameters);
        }

        world.objects.forEach((x) => {
            if(x instanceof Human){
                world.fixObjectPos(x);
            }
        })
    }

    update() {
    }
}


class Tree extends ObjectBases.LivingObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;

        this.selectable = true;

        this.mesh = meshes.tree.clone();

        this.setPos(pos);
        this.setRot(rotation);
    }



    applyDamage(damage) {
        // console.log("Tree got " + damage + " damage.")
        return super.applyDamage(damage);
    }

    update() {
    }

    die() {
        super.die();
    }
}

class Fox extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        this.speed = 0.04;

        this.selectable = true;
    }

    update() {
        if (this.checkIfTargetReached()) {
            this.target = null;
        }
    }
}

class Squirrel extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        this.speed = 0.04;

        this.selectable = true;

        const sphereGeometry = new THREE.SphereGeometry(0.08).translate(0,0.04,0);
        this.mesh = new THREE.Mesh(sphereGeometry, material);

        this.setPos(pos);
        this.setRot(rotation);

        this.movement = 0.0;

        this.squirrelStates = {
            Idle: 0,
            Moving: 1,
            Running: 2,
            Planting: 3
        }

        this.state = this.squirrelStates.Idle;
        this.stateTicker = 0;

        this.targetPos = null;
    }

    update() {
        this.stateTicker++;
        switch (this.state) {
            case this.squirrelStates.Idle:
                this.idle();
                break;
            case this.squirrelStates.Moving:
                this.moving();
                break;
            case this.squirrelStates.Running:
                this.running();
                break;
            case this.squirrelStates.Planting:
                this.planting();
                break;
        }
    }

    switchState(newState) {
        this.state = newState;
        this.stateTicker = 0;
    }

    idle() {
        if (this.stateTicker > 10) {
            this.switchState(this.squirrelStates.Moving);
        }
    }

    moving() {
        if (this.targetPos == null || this.path == null) {
            const randomPoint = new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4).add(this.getPos());
            if (world.grid.checkIfInGrid(randomPoint) && !world.checkPos(randomPoint)) {
                this.targetPos = world.getCellCenter(randomPoint);
                this.path = AStar.findPath(this.getPos(), this.targetPos);
            }
        }
        if (this.targetPos == null || this.path == null) {
            this.switchState(this.squirrelStates.Idle);
            return;
        }

        this.executePath(
            () => {
                this.targetPos = null;
                this.switchState(this.squirrelStates.Planting);
            },
            () => {
                this.path = AStar.findPath(this.getPos(), this.targetPos);
                if (!this.path || this.path.length == 1) {
                    this.targetPos = null;
                    return;
                }
            }, null, false
        )
    }

    running() {

    }

    planting() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0,0,1).applyEuler(this.getRot()));

        const newTree = new Tree(neighbourPos, new THREE.Vector3(), treeMaterial);
        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            world.instantiateObjectOnGrid(newTree);
        }

        this.switchState(this.squirrelStates.Idle);
    }
}

class Human extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        this.speed = 0.02;
        this.target = null;

        this.selectable = true;

        this.mesh = meshes.human.clone();

        this.setPos(pos);
        this.setRot(rotation);
    }

    update() {
        if (this.target == null) {
            this.target = this.findClosestWithAStar((o) => {return o instanceof Tree;});
        }

        if (this.target) {
            this.executePath(
                () => {
                    if (this.target.applyDamage(1)) {
                        this.target = null;
                    }
                },
                () => {
                    this.target = null;
                }, (e) => {
                    if (parameters.simulation.showPaths) {
                        this.createLines(this.path);
                    } else {
                        this.cleanLines();
                    }

                    this.lookTowardsPath();
                } ,true);
        }
    }
}

class Wall extends ObjectBases.WorldObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);

        const cube = new THREE.BoxGeometry(world.getCellSize(), 0.8, world.getCellSize()).translate(0,0.3,0);
        this.mesh = new THREE.Mesh(cube, material);

        this.setPos(pos);
        this.setRot(rotation);

    }

    update() {
    }
}

export {Sphere, LightIndicator, MouseFollower, Terrain, Box, Human, Tree, Squirrel, Wall};