import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as ObjectBases from "./ObjectBases.js";
import * as Materials from "./Materials.js";
import * as AStar from "../util/AStar.js";
import {GridLayer} from "./Grid.js";

class Box extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;

        const cube = new THREE.BoxGeometry();
        this.mesh = new THREE.Mesh(cube, material);

        this.setPos(pos);
        this.setRot(rotation);
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
}

class LightIndicator extends ObjectBases.WorldObjectBase {
    constructor(pos, rotation, material, target) {
        super(pos, rotation, material);
        this.light = target;

        this.selectable = true;

        const sphereGeometry = new THREE.SphereGeometry(1.3);
        this.mesh = new THREE.Mesh(sphereGeometry, material);

        let lightPos = this.light.position;
        this.setPos(lightPos);
        this.setRot(rotation);

        this.spotlightTarget = new THREE.Object3D();
        this.mesh.add(this.spotlightTarget);
        this.spotlightTarget.position.y -= 10;
        this.light.target = this.spotlightTarget;

        this.wires = null;
        if (parameters.simulation.showSpotlightWires) {
            this.wires = new THREE.SpotLightHelper(this.light);
            world.scene.add(this.wires);
        }
    }

    update() {
        super.update();

        if (this.getPos().distanceToSquared(this.light.position) > 0.0001) {
            let currentPos = this.getPos();
            this.light.position.set(currentPos.x, currentPos.y, currentPos.z);
        }

        if (parameters.simulation.showSpotlightWires && this.wires == null) {
            this.wires = new THREE.SpotLightHelper(this.light);
            world.scene.add(this.wires);
        } else if (!parameters.simulation.showSpotlightWires && this.wires != null) {
            world.scene.remove(this.wires);
            this.wires = null;
        }

        if (this.wires) this.wires.update();
    }
}

class MouseFollower extends Sphere {
    constructor(pos, rotation, material, onPlane) {
        super(pos, rotation, material);
        this.onPlane = onPlane;
    }

    update() {
        super.update();

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
        let frequency, amplitude, noise;
        for (var i = 0; i <= 3; i++) {
            frequency = Math.pow(parameters.plane.lacunarity, i);
            amplitude = Math.pow(parameters.plane.persistance, i);
            noise = perlin.get(vec2.x * parameters.plane.noiseScale * frequency / parameters.plane.smoothness, vec2.y * parameters.plane.noiseScale * frequency / parameters.plane.smoothness);
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

        this.mesh.geometry.computeVertexNormals();
        this.mesh.geometry.computeTangents();

        if (this.grid) {
            this.grid.createGridGeometry(parameters);
        }

        this.material.uniforms["maxTerrainHeight"].value = parameters.plane.heightMultiplier;

        if (water) {
            water.geometry = new THREE.PlaneGeometry(parameters.plane.scale, parameters.plane.scale, 400, 400).translate(0, 0, parameters.plane.waterHeight * parameters.plane.heightMultiplier).rotateX(-Math.PI / 2);
            water.geometry.computeVertexNormals();
            water.geometry.computeTangents();
        }

        if (world.grid && this.grid == null) {
            world.grid.setTerrain(this);
            this.grid = world.grid;
        }

        world.fillAtAllGrid((gridPos, objectOnGrid) => {
            return gridPos.y <= parameters.plane.waterHeight * parameters.plane.heightMultiplier;
        }, true);

        world.objects.forEach((x) => {
            if (world.isObjectOnGrid(x)) {
                world.fixObjectPos(x);
            }
        })
    }
}


class Tree extends ObjectBases.LivingObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;

        this.selectable = true;

        this.spawnPos = null;

        this.mesh = null;
        let scaleFactor = 1.0;
        switch (Math.floor(Math.random() * 3)) {
            case 0:
                this.mesh = meshes.tree.clone();
                scaleFactor = 0.35 * world.getCellSize();
                break;
            case 1:
                this.mesh = meshes.tree2.clone();
                scaleFactor = 0.015 * world.getCellSize();
                break;
            case 2:
                this.mesh = meshes.tree3.clone();
                scaleFactor = 0.4 * world.getCellSize();
                break;
        }
        let randomScale = (Math.random() * (1.3 - 0.7) + 0.7).toFixed(4);
        scaleFactor *= randomScale;
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        this.ticker = 0;
        this.spreadCheckFrequency = 400;
        this.spreadChance = 0.25;
        this.grassSpreadChance = 0.35;
        this.nextSpread = this.spreadCheckFrequency;

        this.setPos(pos);
        this.setRot(rotation);

        world.fixObjectPos(this);
        this.overrideRot = false;
        this.mesh.rotateY(Math.random() * 3.14);

        this.spawnAnimationStart(this);
    }

    update() {
        super.update();
        if (this.hasDied) return;

        this.ticker += 1;
        if (this.ticker >= this.nextSpread) {
            this.spread();

            let change = 1 - (Math.random() - 0.5) / 3.0;
            this.nextSpread = this.spreadCheckFrequency * change;
            this.ticker = 0;
        }

        if (this.health <= 0) {
            this.die();
        }
    }

    spread() {
        let i = Math.random();
        if (datamap.get("Tree") + datamap.get("Grass") >= 6000.0 + (20.0 * i)) {
            return;
        }
        if (i < this.spreadChance) {
            const randomPoint = new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20).add(this.getPos());
            if (world.grid.checkIfInGrid(randomPoint) && !world.checkPos(randomPoint)) {
                this.spawnPos = world.getCellCenter(randomPoint);
                const newTree = new Tree(this.spawnPos, new THREE.Vector3(), Materials.treeMaterial);
                world.instantiateObject(newTree);
            }
        }

        let j = Math.random();
        if (j < this.grassSpreadChance) {
            const randomPointForGrass = new THREE.Vector3((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5).add(this.getPos());
            if (world.grid.checkIfInGrid(randomPointForGrass) && !world.checkPos(randomPointForGrass, GridLayer.Ground)) {
                let spawnPos = world.getCellCenter(randomPointForGrass);
                const newGrass = new Grass(spawnPos, new THREE.Vector3(), Materials.treeMaterial);
                world.instantiateObject(newGrass);
            }
        }
    }

    die() {
        super.die();
    }
}

class Grass extends ObjectBases.LivingObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 50;
        this.selectable = true;
        this.spawnPos = null;
        this.mesh = meshes.grass.clone();

        this.ticker = 0;
        this.spreadCheckFrequency = 200;
        this.spreadChance = 0.05;
        this.nextSpread = this.spreadCheckFrequency;

        this._onLayer = GridLayer.Ground;

        let scaleFactor = 1.5 * world.getCellSize();
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        this.setPos(pos);
        this.setRot(rotation);

        world.fixObjectPos(this);
        this.overrideRot = false;
        this.mesh.rotateY(Math.floor(Math.random() * 4) * 1.57);

        this.spawnAnimationStart(this);
    }

    update() {
        super.update();
        if (this.hasDied) return;

        this.ticker += 1;
        if (this.ticker >= this.nextSpread) {
            this.spread();

            let change = 1 - (Math.random() - 0.5) / 3.0;
            this.nextSpread = this.spreadCheckFrequency * change;
            this.ticker = 0;
        }

        if (this.health <= 0) {
            this.die();
        }
    }

    spread() {
        let i = Math.random();
        if (datamap.get("Tree") + datamap.get("Grass") >= 6000.0 + (20.0 * i)) {
            return;
        }
        if (i < this.spreadChance) {
            const randomPoint = new THREE.Vector3((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10).add(this.getPos());
            if (world.grid.checkIfInGrid(randomPoint) && !world.checkPos(randomPoint, GridLayer.Ground)) {
                this.spawnPos = world.getCellCenter(randomPoint);
                const newGrass = new Grass(this.spawnPos, new THREE.Vector3(), Materials.treeMaterial);
                world.instantiateObject(newGrass);

            }
        }
    }
}

class Wheat extends ObjectBases.LivingObjectBase {
    //TODO: make wheat passable, harvestable with changing model if possible
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 50;
        this.selectable = true;
        this.mesh = meshes.wheat.clone();
        let scaleFactor = 3.0 * world.getCellSize();
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        this._onLayer = GridLayer.Ground;

        this.setPos(pos);
        this.setRot(rotation);

        this.spawnAnimationStart(this);
    }
}

class Fox extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 150;
        this.speed = 0.04;
        this.selectable = true;

        this.hunger = 40;
        this.getsHungryByTime = true;
        this.hungerIncreasePerFrame = 0.05;
        this.hungerToStarve = 100;
        this.hungerDamage = 1;

        this.gender = 0;
        if (Math.random() < 0.5) {
            this.gender = 0;
        } else {
            this.gender = 1;
        }

        this.foxStates = {
            Idle: 0,
            Hunting: 1,
            Mating: 2
        }

        this.mesh = meshes.fox.clone();
        let scaleFactor = 2.5 * world.getCellSize();
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.setPos(pos);
        this.setRot(rotation);

        this.state = this.foxStates.Idle;
        this.idleCount = 0;

        this.spawnAnimationStart(this);
    }

    update() {
        super.update();
        if (this.hasDied) return;

        switch (this.state) {
            case this.foxStates.Idle:
                this.idle();
                break;
            case this.foxStates.Hunting:
                this.hunt();
                break;
            case this.foxStates.Mating:
                this.mate();
                break;
        }
    }

    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5));

        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            const newFox = new Fox(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
            world.instantiateObject(newFox);
            this.changeHungerBy(40);
        }
    }

    idle() {
        this.idleCount += 1;
        if (this.idleCount >= 10) {
            this.state = this.foxStates.Hunting;
            this.idleCount = 0;
        }
    }

    hunt() {
        if (this.target == null) {
            this.findClosestWithAStarStateProtected((value) => {
                return value instanceof Rabbit || value instanceof Pig;
            });
        }

        this.executePath(
            () => {
                if (this.target != null) {
                    if (!this.checkIfNextToTarget(this.target.getPos())) {
                        this.target = null;
                        return;
                    }
                    if (this.target.applyDamage(6)) {
                        this.changeHungerBy(-25);
                        this.target = null;
                    }
                }
            },
            () => {
                this.target = null;
            },
            () => {
                this.lookTowardsPath();
                if (parameters.simulation.showPaths) {
                    this.createLines(this.path);
                }
            },
            true
        );

        if (this.hunger > 40) {
            this.state = this.foxStates.Hunting;
        } else if (this.hunger < 15) {
            this.state = this.foxStates.Mating;
        }
    }

    mate() {
        const thisGender = this.gender;
        if (this.target == null) {
            this.findClosestWithAStarStateProtected((value) => {
                return value instanceof Fox && thisGender !== value.gender
            });
        }

        this.executePath(
            () => {
                if (this.target != null) {
                    if (!this.checkIfNextToTarget(this.target.getPos())) {
                        this.target = null;
                        return;
                    }

                    this.spawn();
                    this.target.changeHungerBy(35);
                }
                this.target = null;
            },
            () => {
                this.target = null;
            },
            () => {
                this.lookTowardsPath();
                if (parameters.simulation.showPaths) {
                    this.createLines(this.path);
                }
            },
            true
        );

        if (this.hunger >= 40) {
            this.state = this.foxStates.Hunting;
        }
    }

}

class Rabbit extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 50;
        this.speed = 0.05;

        this.hunger = 40;
        this.getsHungryByTime = true;
        this.hungerIncreasePerFrame = 0.05;
        this.hungerToStarve = 100;
        this.hungerDamage = 1;

        this.selectable = true;
        this.gender = 0;
        if (Math.random() < 0.5) {
            this.gender = 0;
        } else {
            this.gender = 1;
        }
        this.rabbitStates = {
            Grazing: 0,
            Mating: 1
        }

        this.mesh = meshes.rabbit.clone();
        this.setPos(pos);
        this.setRot(rotation);

        let scaleFactor = 5.0 * world.getCellSize();
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.state = this.rabbitStates.Grazing;

        this.spawnAnimationStart(this);
    }

    update() {
        super.update();
        if (this.hasDied) return;

        switch (this.state) {
            case this.rabbitStates.Mating:
                this.mate();
                break;
            case this.rabbitStates.Grazing:
                this.graze();
                break;
        }
    }

    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5));

        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            const newRabbit = new Rabbit(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
            world.instantiateObject(newRabbit);
            this.changeHungerBy(30);
        }
    }

    mate() {
        const thisGender = this.gender;
        if (this.target == null) {
            this.findClosestWithAStarStateProtected((value) => {
                return value instanceof Rabbit && thisGender !== value.gender;
            });
        }

        this.executePath(
            () => {
                if (this.target != null) {
                    if (!this.checkIfNextToTarget(this.target.getPos())) {
                        this.target = null;
                        return;
                    }

                    this.spawn();
                    this.target.changeHungerBy(5);
                    this.target = null;
                }
            },
            () => {
                this.target = null;
            },
            () => {
                this.lookTowardsPath();
                if (parameters.simulation.showPaths) {
                    this.createLines(this.path);
                }

                this.findClosestWithAStarStateProtected((value) => {
                    return value instanceof Rabbit && thisGender !== value.gender;
                });
            },
            true
        );

        if (this.hunger > 60 || (this.target != null && this.target.hunger > 70)) {
            this.state = this.rabbitStates.Grazing;
            this.target = null;
        }
    }

    graze() {
        if (this.target == null) {
            this.findClosestWithAStarStateProtected((value) => {
                return value instanceof Wheat || value instanceof Grass;
            }, GridLayer.Ground);
        }

        this.executePath(
            () => {
                if (this.target != null) {
                    if (!this.checkIfNextToTarget(this.target.getPos())) {
                        this.target = null;
                        return;
                    }

                    if (this.target.applyDamage(2)) {
                        this.changeHungerBy(-40);
                        this.target = null;
                    }
                }
            },
            () => {
                this.target = null;
            },
            () => {
                this.lookTowardsPath();
                if (parameters.simulation.showPaths) {
                    this.createLines(this.path);
                }
            },
            true
        );

        if (this.hunger < 15 && Math.random() > 0.5) {
            this.state = this.rabbitStates.Mating;
            this.target = null;
        }
    }
}

class Pig extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 200;
        this.speed = 0.03;
        this.state = 0;
        this.stateTick = 0;
        this.target = null;

        this.hunger = 40;
        this.getsHungryByTime = true;
        this.hungerIncreasePerFrame = 0.05;
        this.hungerToStarve = 100;
        this.hungerDamage = 1;

        this.gender = 0;
        if (Math.random() < 0.5) {
            this.gender = 1;
        }


        this.mesh = meshes.pig.clone();
        this.setPos(pos);
        this.setRot(rotation);

        let scaleFactor = 3.0 * world.getCellSize();
        let randomScale = (Math.random() * (1.1 - 0.9) + 0.9).toFixed(4);
        scaleFactor *= randomScale;
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        this.spawnAnimationStart(this);
    }

    update() {
        super.update();
        if (this.hasDied) return;

        this.stateTick += 1;
        if (this.health <= 0) {
            this.die();
        }

        if (this.hunger > 15 && this.target == null) {
            this.state = 0;
            this.findClosestWithAStarStateProtected((value) => {
                return value instanceof Grass
            }, GridLayer.Ground);
        } else if (this.hunger <= 15 && this.target == null) {
            const tmpGnd = this.gender;
            this.state = 1;
            this.findClosestWithAStarStateProtected((value) => {
                return value instanceof Pig && value.gender !== tmpGnd
            });
        }

        if (this.state == 0) {
            this.executePath(
                () => {
                    if (this.target == null || !this.checkIfNextToTarget(this.target.getPos())) {
                        this.target = null;
                        return;
                    }

                    if (this.target.applyDamage(2)) {
                        this.changeHungerBy(-40);
                        this.target = null;
                    }
                },
                () => {
                    this.target = null;
                },
                () => {
                    this.lookTowardsPath();
                    if (parameters.simulation.showPaths) {
                        this.createLines(this.path);
                    }
                },
                true
            );
        } else if (this.state == 1) {
            this.executePath(
                () => {
                    if (this.target != null) {
                        if (!this.checkIfNextToTarget(this.target.getPos())) {
                            this.target = null;
                            return;
                        }

                        this.spawn();
                        this.target.changeHungerBy(30);
                    }
                    this.target = null;
                },
                () => {
                    this.target = null;
                },
                () => {
                    this.lookTowardsPath();
                    if (parameters.simulation.showPaths) {
                        this.createLines(this.path);
                    }
                },
                true
            );
        }

    }

    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5));

        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            const newPig = new Pig(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
            world.instantiateObject(newPig);
            this.changeHungerBy(40);
        }
    }
}

class Cow extends Pig {
    static rotated = false;

    constructor(pos, rotation, material) {
        super(pos, rotation, material);

        this.mesh = meshes.cow.clone();
        if (!Cow.rotated) {
            Cow.rotated = true;
            this.mesh.geometry.rotateX(90.0 * 3.14 / 180.0);
        }
        this.setPos(pos);
        this.setRot(rotation);

        let scaleFactor = 0.038 * world.getCellSize();
        let randomScale = (Math.random() * (1.1 - 0.9) + 0.9).toFixed(4);
        scaleFactor *= randomScale;

        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5));

        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            const newCow = new Cow(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
            world.instantiateObject(newCow);
            this.changeHungerBy(40);
        }
    }
}

class Wolf extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 200;
        this.speed = 0.03;
        this.selectable = true;

        this.hunger = 50;
        this.getsHungryByTime = true;
        this.hungerIncreasePerFrame = 0.04;
        this.hungerToStarve = 100;
        this.hungerDamage = 2;

        this.gender = 0;
        if (Math.random() < 0.5) {
            this.gender = 0;
        } else {
            this.gender = 1;
        }

        this.wolfStates = {
            Idle: 0,
            Hunting: 1,
            Mating: 2
        }

        this.mesh = meshes.wolf.clone();
        let scaleFactor = 2.0 * world.getCellSize();
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        this.setPos(pos);
        this.setRot(rotation);

        this.state = this.wolfStates.Idle;
        this.idleCount = 0;

        this.spawnAnimationStart(this);
    }

    update() {
        super.update();
        if (this.hasDied) return;

        switch (this.state) {
            case this.wolfStates.Idle:
                this.idle();
                break;
            case this.wolfStates.Hunting:
                this.hunt();
                break;
            case this.wolfStates.Mating:
                this.mate();
                break;
        }
        if (this.health <= 0) {
            this.die();
        }
    }

    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5));

        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            const newWolf = new Wolf(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
            world.instantiateObject(newWolf);
            this.changeHungerBy(40);
        }
    }

    idle() {
        this.idleCount += 1;
        if (this.idleCount >= 10) {
            this.state = this.wolfStates.Hunting;
            this.idleCount = 0;
        }
    }

    hunt() {
        if (this.target == null) {
            this.findClosestWithAStarStateProtected((value) => {
                return value instanceof Pig || value instanceof Rabbit || value instanceof Fox || value instanceof Human;
            });
        }

        this.executePath(
            () => {
                if (this.target != null) {
                    if (!this.checkIfNextToTarget(this.target.getPos())) {
                        this.target = null;
                        return;
                    }

                    if (this.target.applyDamage(5)) {
                        this.changeHungerBy(-25);
                        this.target = null;
                    }
                }
            },
            () => {
                this.target = null;
            },
            () => {
                this.lookTowardsPath();
                if (parameters.simulation.showPaths) {
                    this.createLines(this.path);
                }
            },
            true
        );

        if (this.hunger > 40) {
            this.state = this.wolfStates.Hunting;
        } else if (this.hunger < 15) {
            this.state = this.wolfStates.Mating;
            this.target = null;
        }
    }

    mate() {
        const thisGender = this.gender;
        if (this.target == null) {
            this.findClosestWithAStarStateProtected((value) => {
                return value instanceof Wolf && thisGender !== value.gender
            });
        }

        this.executePath(
            () => {
                if (this.target != null) {
                    if (!this.checkIfNextToTarget(this.target.getPos())) {
                        this.target = null;
                        return;
                    }

                    this.spawn();
                    this.target.changeHungerBy(35);
                }
                this.target = null;
            },
            () => {
                this.target = null;
            },
            () => {
                this.lookTowardsPath();
                if (parameters.simulation.showPaths) {
                    this.createLines(this.path);
                }
            },
            true
        );

        if (this.hunger >= 40) {
            this.state = this.wolfStates.Hunting;
            this.target = null;
        }
    }

}

class Eagle {
//TODO: Implement eagle class, spawns from and rests on trees, dies without rest, hunts rabbits
}

class Squirrel extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        this.speed = 0.04;

        this.selectable = true;

        const sphereGeometry = new THREE.SphereGeometry(0.08).translate(0, 0.04, 0);
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

        this.spawnAnimationStart(this);
    }

    update() {
        super.update();
        if (this.hasDied) return;

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
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0, 0, 1).applyEuler(this.getRot()));

        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            const newTree = new Tree(neighbourPos, new THREE.Vector3(), Materials.treeMaterial);
            world.instantiateObjectOnGrid(newTree);
        }

        this.switchState(this.squirrelStates.Idle);
    }
}

class Human extends ObjectBases.MovableObjectBase {
    static treeCutCount = 0;
    static neededTreeToBuildAHouse = 10;

    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        this.target = null;
        this.selectable = true;

        this.hunger = 50;
        this.getsHungryByTime = true;
        this.hungerIncreasePerFrame = 0.02;
        this.hungerToStarve = 100;
        this.hungerDamage = 2;

        this.mesh = null;
        let scaleFactor = 1.0;
        switch (Math.floor(Math.random() * 2)) {
            case 0:
                this.mesh = meshes.human.clone();
                scaleFactor = 0.04 * world.getCellSize();
                break;
            case 1:
                this.mesh = meshes.human2.clone();
                scaleFactor = 0.0045 * world.getCellSize();
                break;
        }
        let randomScale = (Math.random() * (1.1 - 0.9) + 0.9).toFixed(4);
        scaleFactor *= randomScale;
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        this.gender = 0;
        if (Math.random() < 0.5) {
            this.gender = 0;
        } else {
            this.gender = 1;
        }

        this.humanStates = {
            Idle: 0,
            Hunting: 1,
            Mating: 2,
            HouseBuilding: 3
        }

        this.setPos(pos);
        this.setRot(rotation);

        this.state = this.humanStates.Idle;
        this.idleCount = 0;

        this.updateAccordingToAggressiveness();

        this.spawnAnimationStart(this);
    }

    updateAccordingToAggressiveness() {
        let aggressiveness = parameters.simulation.humanAggressiveness;
        this.speed = 0.02 + 0.02 * (aggressiveness - 1.0) * 0.1;

        this.huntingDamage = 15 * aggressiveness;
        // this.hungerChangeOnHunt = -20 * aggressiveness;
        this.hungerChangeOnHunt = -20;
    }

    update() {
        super.update();
        if (this.hasDied) return;

        switch (this.state) {
            case this.humanStates.Idle:
                this.idle();
                break;
            case this.humanStates.Hunting:
                this.hunt();
                break;
            case this.humanStates.Mating:
                this.mate();
                break;
            case this.humanStates.HouseBuilding:
                this.housebuilding();
                break;
        }
        if (this.health <= 0) {
            this.die();
        }
    }

    spawn() {
        // const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0, 0, 1).applyEuler(this.getRot()));
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5));

        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            const newHuman = new Human(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
            world.instantiateObject(newHuman);
            this.changeHungerBy(35);
        }
    }

    idle() {
        this.idleCount += 1;
        if (this.idleCount >= 10) {
            this.state = this.humanStates.Hunting;
            this.idleCount = 0;
        }
    }

    hunt() {

        if (this.target == null) {
            if (datamap.get("Tree") > 2) {
                this.findClosestWithAStarStateProtected((o) => {
                    return o instanceof Tree || o instanceof Wolf;
                });
            } else {
                this.findClosestWithAStarStateProtected((o) => {
                    return o instanceof Pig || o instanceof Rabbit || o instanceof Grass || o instanceof Wolf;
                });
            }
        }

        this.executePath(
            () => {
                if (this.target != null) {
                    if (!this.checkIfNextToTarget(this.target.getPos())) {
                        this.target = null;
                        return;
                    }

                    if (this.target.applyDamage(this.huntingDamage)) {
                        if (this.target instanceof Tree) {
                            Human.treeCutCount += 1;

                            if (Human.treeCutCount >= Human.neededTreeToBuildAHouse) {
                                Human.treeCutCount = 0;
                                this.state = this.humanStates.HouseBuilding;
                            }
                        }

                        this.changeHungerBy(this.hungerChangeOnHunt);
                        this.target = null;
                    }
                }
            },
            () => {
                this.target = null;
            },
            () => {
                this.lookTowardsPath();
                if (parameters.simulation.showPaths) {
                    this.createLines(this.path);
                }
            },
            true
        );

        if (this.hunger < 25) {
            this.state = this.humanStates.Mating;
            this.target = null;
        }
    }

    mate() {
        const thisGender = this.gender;
        if (this.target == null) {
            this.findClosestWithAStarStateProtected((value) => {
                return value instanceof Human && thisGender !== value.gender
            });
        }

        this.executePath(
            () => {
                if (this.target != null) {
                    if (!this.checkIfNextToTarget(this.target.getPos())) {
                        this.target = null;
                        return;
                    }

                    this.spawn();
                    this.target.changeHungerBy(35);
                }
                this.target = null;
            },
            () => {
                this.target = null;
            },
            () => {
                this.lookTowardsPath();
                if (parameters.simulation.showPaths) {
                    this.createLines(this.path);
                }
            },
            true
        );

        if (this.hunger >= 40) {
            this.state = this.humanStates.Hunting;
            this.target = null;
        }
    }

    housebuilding() {
        this.treeCutCount = 0;

        if (this.target == null) {
            const randomPoint = new THREE.Vector3((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5).add(this.getPos());
            if (world.grid.checkIfInGrid(randomPoint) && !world.checkPos(randomPoint)) {
                this.target = world.getCellCenter(randomPoint);
                let startedState = this.state;
                this.findPath(this.target, (e) => {
                    if (this.state == startedState) {
                        this.path = world.getPathFromPure2DMatrix(e);
                        let targetPos = this.path.length > 0 ? this.path[this.path.length - 1] : this.getPos();
                        this.target = targetPos;
                    }
                }, (e) => {
                    if (this.state == startedState) {
                        this.path = null;
                        this.target = null;

                    }
                });
            }
        }

        this.executePath(
            () => {
                if (this.target != null) {
                    const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5));

                    if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
                        const newHouse = new House(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
                        world.instantiateObject(newHouse);
                    }
                }

                this.state = this.humanStates.Idle;
                this.target = null;
            },
            () => {
                this.target = null;
            },
            () => {
                this.lookTowardsPath();
                if (parameters.simulation.showPaths) {
                    this.createLines(this.path);
                }
            },
            false
        );

        if (this.hunger >= 80) {
            this.state = this.humanStates.Hunting;
            this.target = null;
        }
    }
}

class Wall extends ObjectBases.WorldLargeObject {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);

        const cube = new THREE.BoxGeometry(world.getCellSize(), 0.8, world.getCellSize()).translate(0, 0.3, 0);
        this.mesh = new THREE.Mesh(cube, material);

        this.setPos(pos);
        this.setRot(rotation);

        this.overrideRot = false;

        this.spawnAnimationStart(this);
    }
}

class House extends ObjectBases.WorldLargeObject {
    //TODO: implement house class, each one costs a certain amount of wood (taken from stockpile or from human inventory), humans need houses to survive
    //a house will be placed in a random location within a 5x5 "reserved" area of the grid, the rest of the area will be used for wheat farms
    constructor(pos, rotation, material) {
        super(pos, rotation, material);

        this.mesh = null;
        let scaleFactor = 1.0;
        switch (Math.floor(Math.random() * 2)) {
            case 0:
                this.mesh = meshes.house.clone();
                scaleFactor = 0.09 * world.getCellSize();
                break;
            case 1:
                this.mesh = meshes.house2.clone();
                scaleFactor = 0.7 * world.getCellSize();
                break;
        }
        let randomScale = (Math.random() * (1.1 - 0.9) + 0.9).toFixed(4);
        scaleFactor *= randomScale;
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        this.setPos(pos);
        this.setRot(rotation);

        world.fixObjectPos(this);
        this.overrideRot = false;
        this.mesh.rotateY(Math.floor(Math.random() * 4) * 1.57);

        this.spawnAnimationStart(this);
    }
}

class Stockpile extends ObjectBases.WorldObjectBase {
    //TODO: implement stockpile, where all resources harvested by humans go to and are used from for buildings and other stuff maybe
    //making houses and farms be built around or close to the stockpile might be a good idea
}

class FillerObject extends ObjectBases.WorldObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.setPos(pos);
        this.setRot(rotation);
    }
}

class LargeFillerObject extends ObjectBases.WorldLargeObject {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.setPos(pos);
        this.setRot(rotation);
    }
}


export {
    Sphere,
    LightIndicator,
    MouseFollower,
    Terrain,
    Box,
    Human,
    Tree,
    Grass,
    Wheat,
    Fox,
    Rabbit,
    Pig,
    Cow,
    Wolf,
    Squirrel,
    Wall,
    House,
    FillerObject,
    LargeFillerObject
};