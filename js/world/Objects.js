import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as ObjectBases from "./ObjectBases.js";
import * as Materials from "./Materials.js";
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
    //TODO: implement self-spreading instead of squirrels
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
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        super.die();
    }
}

class Grass extends ObjectBases.LivingObjectBase {
    //TODO: make grass passable, adjust spread values, fix error with grass spawning (spawnpos is null) that happens for some reason
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 50;
        this.selectable = true;
        this.spawnPos = null;
        this.mesh = meshes.grass.clone();

        this.ticker = 0;

        this.setPos(pos);
        this.setRot(rotation);
    }

    applyDamage(damage) {
        return super.applyDamage(damage);
    }

    update() {
        this.ticker += 1;

        if (this.ticker == 5000) {
            if (Math.random() >= 0.4) {
                this.spread();
            }
            this.ticker = 0;
        }

        if (this.health <= 0) {
            this.die();
        }
    }

    spread() {
        const randomPoint = new THREE.Vector3((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10).add(this.getPos());
        if (world.grid.checkIfInGrid(randomPoint) && !world.checkPos(randomPoint)) {
            this.spawnPos = world.getCellCenter(randomPoint);
            const newGrass = new Grass(this.spawnPos, new THREE.Vector3(), Materials.treeMaterial);
            world.instantiateObject(newGrass);

        }

    }

    /*die() {
        super.die();
    }*/
}

class Wheat extends ObjectBases.LivingObjectBase {
    //TODO: make wheat passable, harvestable with changing model if possible
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 50;
        this.selectable =true;
        this.mesh = meshes.wheat.clone();

        this.setPos(pos);
        this.setRot(rotation);
    }

   applyDamage(damage) {
       return super.applyDamage(damage);
   }

    update() {
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        super.die();
    }
}

class Fox extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 150;
        this.speed = 0.15;
        this.hunger = 50;
        this.selectable = true;

        this.gender = 0;
        if (Math.random() < 0.5) {
            this.gender = 0;
        }
        else {
            this.gender = 1;
        }

        this.foxStates = {
            Idle: 0,
            Hunting: 1,
            Mating: 2
        }

        this.mesh = meshes.fox.clone();
        this.setPos(pos);
        this.setRot(rotation);
        this.movement = 0.0

        this.state = this.foxStates.Idle;
        this.idleCount = 0;
    }

    update() {
        this.hunger += 0.1;
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
        if (this.hunger >= 100) {
            this.hunger = 100;
            this.health -= 5;
        }
        if (this.health <= 0) {
            this.die();
        }
    }
    die() {
        super.die();
    }
    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0,0,1).applyEuler(this.getRot()));

        const newFox = new Fox(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            world.instantiateObject(newFox);
            this.hunger += 40;
        }
    }
    idle() {
        this.idleCount += 1;
        if (this.idleCount >= 10) {
            this.state = this.foxStates.Hunting;
        }
    }
    hunt() {
        this.idleCount = 0;
        this.target = this.findClosestWithAStar((value) => {return value instanceof Rabbit});
        this.executePath(
            () => {
                if (this.target !== null) {
                    if (this.target.applyDamage(50)) {
                        this.hunger -= 35;
                        if (this.hunger < 0) {
                            this.hunger = 0
                        }
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
                } else {
                    this.cleanLines();
                }
            },
            true
        );
        if (this.hunger > 40) {
            this.state = this.foxStates.Hunting;
        }
        else if (this.hunger < 15) {
            this.state = this.foxStates.Mating;
        }
    }
    mate() {
        this.idleCount = 0;
        const thisGender = this.gender;
        this.target = this.findClosestWithAStar((value) => {return value instanceof Fox && thisGender !== value.gender});
        this.executePath(
            () => {
                if (this.target !== null) {
                    this.spawn();
                    this.target.hunger += 35;
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
                } else {
                    this.cleanLines();
                }
            },
            true
        );
        if (this.hunger >= 40) {
            this.state = this.foxStates.Hunting;
        }
        else {
            this.state = this.foxStates.Idle;
        }
    }

}

class Rabbit extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 50;
        this.speed = 0.2;
        this.hunger = 50;
        this.selectable = true;
        this.gender = 0;
        if (Math.random() < 0.5) {
            this.gender = 0;
        }
        else {
            this.gender = 1;
        }
        this.rabbitStates = {
            Grazing: 0,
            Mating: 1
        }

        this.mesh = meshes.rabbit.clone();
        this.setPos(pos);
        this.setRot(rotation);
        this.movement = 0.0;

        this.state = this.rabbitStates.Grazing;
    }

    update() {
        this.hunger += 0.1;
        if (this.hunger >= 100) {
            this.hunger = 100;
            this.health -= 5;
        }
        if (this.health <= 0) {
            this.die();
        }
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
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0,0,1).applyEuler(this.getRot()));

        const newRabbit = new Rabbit(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            world.instantiateObject(newRabbit);
            this.hunger += 30;
        }
    }
    mate() {
        const thisGender = this.gender;
        this.target = this.findClosestWithAStar((value) => {return value instanceof Rabbit && thisGender !== value.gender});
        this.executePath(
            () => {
                if (this.target !== null) {
                    this.spawn();
                    this.target.hunger += 35;
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
                } else {
                    this.cleanLines();
                }
            },
            true
        );

    }
    graze() {
        this.target = this.findClosestWithAStar((value) => {return value instanceof Wheat || value instanceof Grass});
        this.executePath(
            () => {
                if (this.target.applyDamage(1)) {
                    this.hunger -= 15;
                    if (this.hunger < 0) {
                        this.hunger = 0
                    }
                    ;
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
                } else {
                    this.cleanLines();
                }
            },
            true
        );
        if (this.hunger > 15) {
            this.state = this.rabbitStates.Grazing;
        }
        else {
            this.state = this.rabbitStates.Mating;
        }
    }
}

class Pig extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 200;
        this.speed = 0.1;
        this.hunger = 50;
        this.selectable = true;
        this.mode = 0;
        this.stateTick = 0;
        this.target = null;

        this.gender = 0;
        if (Math.random() < 0.5) {
            this.gender = 0;
        }
        else {
            this.gender = 1;
        }


        this.mesh = meshes.pig.clone();
        this.setPos(pos);
        this.setRot(rotation);
        this.movement = 0.0
    }

    update() {
        this.stateTick += 1;
        if (this.health <= 0) {
            this.die();
        }
        //will go for the closest grass if hungry, else it'll try to find a mate
        let satiated = false;
        if (this.hunger <= 15) {satiated = true;};
        if (this.hunger >= 40) {satiated = false};
        if (this.hunger > 20 && !satiated && this.target == null) {
            this.target = this.findClosestWithAStar((value) => {return value instanceof Grass});
            this.mode = 0;
        }
        else if (this.hunger < 20 && satiated && this.target == null) {
            const tmpGnd = this.gender;
            this.target = this.findClosestWithAStar((value) => {return value instanceof Pig && value.gender !== tmpGnd});
            this.mode = 1;
        }

        if (this.mode == 0 && this.target) {
            this.executePath(
                () => {
                    if (this.target.applyDamage(5)) {
                        this.hunger -= 10;
                        if (this.hunger < 0) {this.hunger = 0};
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
                    } else {
                        this.cleanLines();
                    }
                },
                true
            );
        } else if (this.mode == 1) {
            this.executePath(
                () => {
                    if (this.target !== null) {
                        this.spawn();
                        this.target.hunger += 35;
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
                    } else {
                        this.cleanLines();
                    }
                },
                true
            );
        }
        this.hunger += 0.05;

        if (this.hunger >= 100) {
            this.hunger = 100;
            this.health -= 1;
        }
    }

    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0,0,1).applyEuler(this.getRot()));

        const newPig = new Pig(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            world.instantiateObject(newPig);
            this.hunger += 40;
        }
    }
}

class Wolf extends ObjectBases.MovableObjectBase {
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 250;
        this.speed = 0.2;
        this.hunger = 50;
        this.selectable = true;

        this.gender = 0;
        if (Math.random() < 0.5) {
            this.gender = 0;
        }
        else {
            this.gender = 1;
        }

        this.wolfStates = {
            Idle: 0,
            Hunting: 1,
            Mating: 2
        }

        this.mesh = meshes.wolf.clone();
        this.setPos(pos);
        this.setRot(rotation);
        this.movement = 0.0

        this.state = this.wolfStates.Idle;
        this.idleCount = 0;
    }

    update() {
        this.hunger += 0.2;
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
        if (this.hunger >= 100) {
            this.hunger = 100;
            this.health -= 5;
        }
        if (this.health <= 0) {
            this.die();
        }
    }
    die() {
        super.die();
    }
    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0,0,1).applyEuler(this.getRot()));

        const newWolf = new Wolf(neighbourPos, new THREE.Vector3(), Materials.squirrelMaterial);
        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            world.instantiateObject(newWolf);
            this.hunger += 40;
        }
    }
    idle() {
        this.idleCount += 1;
        if (this.idleCount >= 10) {
            this.state = this.wolfStates.Hunting;
        }
    }
    hunt() {
        this.idleCount = 0;
        this.target = this.findClosestWithAStar((value) => {return value instanceof Pig});
        this.executePath(
            () => {
                if (this.target !== null) {
                    if (this.target.applyDamage(50)) {
                        this.hunger -= 40;
                        if (this.hunger < 0) {
                            this.hunger = 0
                        }
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
                } else {
                    this.cleanLines();
                }
            },
            true
        );
        if (this.hunger > 40) {
            this.state = this.wolfStates.Hunting;
        }
        else if (this.hunger < 15) {
            this.state = this.wolfStates.Mating;
        }
    }
    mate() {
        this.idleCount = 0;
        const thisGender = this.gender;
        this.target = this.findClosestWithAStar((value) => {return value instanceof Wolf && thisGender !== value.gender});
        this.executePath(
            () => {
                if (this.target !== null) {
                    this.spawn();
                    this.target.hunger += 35;
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
                } else {
                    this.cleanLines();
                }
            },
            true
        );
        if (this.hunger >= 40) {
            this.state = this.wolfStates.Hunting;
        }
        else {
            this.state = this.wolfStates.Idle;
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

        const newTree = new Tree(neighbourPos, new THREE.Vector3(), Materials.treeMaterial);
        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            world.instantiateObject(newTree);
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

class House extends ObjectBases.WorldObjectBase {
    //TODO: implement house class, each one costs a certain amount of wood (taken from stockpile or from human inventory), humans need houses to survive
    //a house will be placed in a random location within a 5x5 "reserved" area of the grid, the rest of the area will be used for wheat farms
}

class Stockpile extends ObjectBases.WorldObjectBase {
    //TODO: implement stockpile, where all resources harvested by humans go to and are used from for buildings and other stuff maybe
    //making houses and farms be built around or close to the stockpile might be a good idea
}

export {Sphere, LightIndicator, MouseFollower, Terrain, Box, Human, Tree, Grass, Wheat, Fox, Rabbit, Pig, Wolf, Squirrel, Wall};