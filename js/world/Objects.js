import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as ObjectBases from "./ObjectBases.js";
import {planeMat, squirrelMaterial, treeMaterial} from "./Materials.js";

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
        return perlin.get(vec2.x * parameters.plane.noiseScale, vec2.y * parameters.plane.noiseScale) * parameters.plane.heightMultiplier;
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
                world.fixObjectPosRot(x);
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
        // let pos = this.getPos();
        // console.log("Tree on position " + pos.x + ", " + pos.y + ", " + pos.z + " died.")
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
        super.applyDamage(damage);
    }

    update() {
        this.ticker += 1;

        if (this.ticker % 600 == 0) {
            this.spread();
        }

        if (this.health <= 0) {
            this.die();
        }
    }

    spread() {
        const randomPoint = new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20).add(this.getPos());
        if (world.grid.checkIfInGrid(randomPoint) && !world.checkPos(randomPoint)) {
            this.spawnPos = world.getCellCenter(randomPoint);
        }
        const newGrass = new Grass(this.spawnPos, new THREE.Vector3(), treeMaterial);
        if (world.grid.checkIfInGrid(this.spawnPos) && !world.checkPos(this.spawnPos)) {
            world.instantiateObject(newGrass);
        }

    }

    die() {
        super.die();
    }
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
        super.applyDamage(damage);
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
        this.hunger += 1;
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

        const newFox = new Fox(neighbourPos, new THREE.Vector3(), squirrelMaterial);
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
        let closestRabbit = null;
        let closestRabbitDist = Infinity;
        let currentPos = this.getPos();
        world.objects.forEach(
            function (value, index) {
                let dist = (new THREE.Vector3()).subVectors(value.getPos(), currentPos).lengthSq();
                if (value instanceof Rabbit && (closestRabbit == null || dist < closestRabbitDist)) {
                    closestRabbit = value;
                    closestRabbitDist = dist;
                }
            }
        )
        this.target = closestRabbit;
        if (this.target != null && this.checkIfNextToTarget(this.target.getPos())) {
            this.target.applyDamage(10);
            if (this.hunger >= 0) this.hunger -= 15;
        } else if (this.target != null) {
            let movementVector = this.getMovementVectorToTarget(this.target.getPos());
            if (this.movement < 1) {
                this.movement += this.speed;
            } else if (!world.checkNeighbour(this.getPos(), movementVector)) {
                this.movement = 0.0;
                world.moveObjectOnGridInDirection(this, movementVector);
            }
        }
        if (this.hunger > 40) {
            this.state = this.foxStates.Hunting;
        }
        else if (this.hunger < 15) {
            this.state = this.foxStates.Mating;
        }
    }
    mate() {
        this.idleCount = 0;
        let closestFox = null;
        let closestFoxDist = Infinity;
        let currentPos = this.getPos();
        const thisGender = this.gender;
        world.objects.forEach(
            function (value, index) {
                let dist = (new THREE.Vector3()).subVectors(value.getPos(), currentPos).lengthSq();
                if (value instanceof Fox && (closestFox == null || dist < closestFoxDist) && value.gender !== thisGender) {
                    closestFox = value;
                    closestFoxDist = dist;
                }
            }
        )
        this.target = closestFox;
        if (this.target != null && this.checkIfNextToTarget(this.target.getPos())) {
            this.spawn();
            this.target.hunger += 35;
        } else if (this.target != null) {
            let movementVector = this.getMovementVectorToTarget(this.target.getPos());

            if (this.movement < 1) {
                this.movement += this.speed;
            } else if (!world.checkNeighbour(this.getPos(), movementVector)) {
                this.movement = 0.0;
                world.moveObjectOnGridInDirection(this, movementVector);
            }
        }
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
        this.hunger += 1;
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
    die() {
        super.die();
    }
    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0,0,1).applyEuler(this.getRot()));

        const newRabbit = new Rabbit(neighbourPos, new THREE.Vector3(), squirrelMaterial);
        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            world.instantiateObject(newRabbit);
            this.hunger += 30;
        }
    }
    mate() {
        let closestRabbit = null;
        let closestRabbitDist = Infinity;
        let currentPos = this.getPos();
        const thisGender = this.gender;
        world.objects.forEach(
            function (value, index) {
                let dist = (new THREE.Vector3()).subVectors(value.getPos(), currentPos).lengthSq();
                if (value instanceof Rabbit && (closestRabbit == null || dist < closestRabbitDist) && value.gender !== thisGender) {
                    closestRabbit = value;
                    closestRabbitDist = dist;
                }
            }
        )
        this.target = closestRabbit;
        if (this.target != null && this.checkIfNextToTarget(this.target.getPos())) {
            this.spawn();
            this.target.hunger += 35;
        } else if (this.target != null) {
            let movementVector = this.getMovementVectorToTarget(this.target.getPos());

            if (this.movement < 1) {
                this.movement += this.speed;
            } else if (!world.checkNeighbour(this.getPos(), movementVector)) {
                this.movement = 0.0;
                world.moveObjectOnGridInDirection(this, movementVector);
            }
        }
        if (this.hunger >= 40) {
            this.state = this.rabbitStates.Grazing;
        }
        else {
            this.state = this.rabbitStates.Mating;
        }
    }
    graze() {
        let closestGrass, closestWheat = null;
        let closestGrassDist, closestWheatDist = Infinity;
        let currentPos = this.getPos();
        world.objects.forEach(
            function (value, index) {
                let dist = (new THREE.Vector3()).subVectors(value.getPos(), currentPos).lengthSq();
                if (value instanceof Grass && (closestGrass == null || dist < closestGrassDist)) {
                    closestGrass = value;
                    closestGrassDist = dist;
                }
            }
        )
        world.objects.forEach(
            function (value, index) {
                let dist = (new THREE.Vector3()).subVectors(value.getPos(), currentPos).lengthSq();
                if (value instanceof Wheat && (closestWheat == null || dist < closestWheatDist)) {
                    closestWheat = value;
                    closestWheatDist = dist;
                }
            }
        )
        if (closestGrassDist < closestWheatDist) {
            this.target = closestGrass;
        }
        else if (closestWheatDist <= closestGrassDist) {
            this.target = closestWheat;
        }
        if (this.target != null && this.checkIfNextToTarget(this.target.getPos())) {
            this.target.applyDamage(5);
            if (this.hunger > 0) this.hunger -= 15;
        } else if (this.target != null) {
            let movementVector = this.getMovementVectorToTarget(this.target.getPos());
            if (this.movement < 1) {
                this.movement += this.speed;
            } else if (!world.checkNeighbour(this.getPos(), movementVector)) {
                this.movement = 0.0;
                world.moveObjectOnGridInDirection(this, movementVector);
            }
        }
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
        let closestGrass = null;
        let closestGrassDist = Infinity;
        let closestPig = null;
        let closestPigDist = Infinity;
        let currentPos = this.getPos();
        let satiated = false;
        if (this.hunger <= 15) {satiated = true;};
        if (this.hunger >= 40) {satiated = false};
        if (this.hunger > 15 && !satiated) {
            world.objects.forEach(
                function (value, index) {
                    let dist = (new THREE.Vector3()).subVectors(value.getPos(), currentPos).lengthSq();
                    if (value instanceof Grass && (closestGrass == null || dist < closestGrassDist)) {
                        closestGrass = value;
                        closestGrassDist = dist;
                    }
                }
            )
            this.target = closestGrass;
            this.mode = 0;
        }
        else if (this.hunger < 20 && satiated) {
            const tmpGnd = this.gender;
            world.objects.forEach(
                function (value, index) {
                    let dist = (new THREE.Vector3()).subVectors(value.getPos(), currentPos).lengthSq();
                    if (value instanceof Pig && (closestPig == null || dist < closestPigDist) && value.gender !== tmpGnd) {
                        closestPig = value;
                        closestPigDist = dist;
                    }
                }
            )
            this.target = closestPig;
            this.mode = 1;
        }

        if (this.mode == 0) {
            if (this.target != null && this.checkIfNextToTarget(this.target.getPos())) {
                this.target.applyDamage(5);
                if (this.hunger > 0) this.hunger -= 5;
            } else if (this.target != null) {
                let movementVector = this.getMovementVectorToTarget(this.target.getPos());

                if (this.movement < 1) {
                    this.movement += this.speed;
                } else if (!world.checkNeighbour(this.getPos(), movementVector)) {
                    this.movement = 0.0;
                    world.moveObjectOnGridInDirection(this, movementVector);
                }
            }
        } else if (this.mode == 1) {
            if (this.target != null && this.checkIfNextToTarget(this.target.getPos())) {
                this.spawn();
                this.target.hunger += 35;
            } else if (this.target != null) {
                let movementVector = this.getMovementVectorToTarget(this.target.getPos());

                if (this.movement < 1) {
                    this.movement += this.speed;
                } else if (!world.checkNeighbour(this.getPos(), movementVector)) {
                    this.movement = 0.0;
                    world.moveObjectOnGridInDirection(this, movementVector);
                }
            }
        }
        this.hunger += 1;

        if (this.hunger >= 100) {
            this.hunger = 100;
            this.health -= 1;
        }
    }
    die() {
        super.die();
    }
    spawn() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0,0,1).applyEuler(this.getRot()));

        const newPig = new Pig(neighbourPos, new THREE.Vector3(), squirrelMaterial);
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
        this.hunger += 1;
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

        const newWolf = new Wolf(neighbourPos, new THREE.Vector3(), squirrelMaterial);
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
        let closestPig = null;
        let closestPigDist = Infinity;
        let currentPos = this.getPos();
        world.objects.forEach(
            function (value, index) {
                let dist = (new THREE.Vector3()).subVectors(value.getPos(), currentPos).lengthSq();
                if (value instanceof Pig && (closestPig == null || dist < closestPigDist)) {
                    closestPig = value;
                    closestPigDist = dist;
                }
            }
        )
        this.target = closestPig;
        if (this.target != null && this.checkIfNextToTarget(this.target.getPos())) {
            this.target.applyDamage(10);
            if (this.hunger >= 0) this.hunger -= 15;
        } else if (this.target != null) {
            let movementVector = this.getMovementVectorToTarget(this.target.getPos());
            if (this.movement < 1) {
                this.movement += this.speed;
            } else if (!world.checkNeighbour(this.getPos(), movementVector)) {
                this.movement = 0.0;
                world.moveObjectOnGridInDirection(this, movementVector);
            }
        }
        if (this.hunger > 40) {
            this.state = this.wolfStates.Hunting;
        }
        else if (this.hunger < 15) {
            this.state = this.wolfStates.Mating;
        }
    }
    mate() {
        this.idleCount = 0;
        let closestWolf = null;
        let closestWolfDist = Infinity;
        let currentPos = this.getPos();
        const thisGender = this.gender;
        world.objects.forEach(
            function (value, index) {
                let dist = (new THREE.Vector3()).subVectors(value.getPos(), currentPos).lengthSq();
                if (value instanceof Wolf && (closestWolf == null || dist < closestWolfDist) && value.gender !== thisGender) {
                    closestWolf = value;
                    closestWolfDist = dist;
                }
            }
        )
        this.target = closestWolf;
        if (this.target != null && this.checkIfNextToTarget(this.target.getPos())) {
            this.spawn();
            this.target.hunger += 35;
        } else if (this.target != null) {
            let movementVector = this.getMovementVectorToTarget(this.target.getPos());

            if (this.movement < 1) {
                this.movement += this.speed;
            } else if (!world.checkNeighbour(this.getPos(), movementVector)) {
                this.movement = 0.0;
                world.moveObjectOnGridInDirection(this, movementVector);
            }
        }
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
    //TODO: remove squirrels
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        this.speed = 0.1;

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
        while (this.targetPos == null) {
            const randomPoint = new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4).add(this.getPos());
            if (world.grid.checkIfInGrid(randomPoint) && !world.checkPos(randomPoint)) {
                this.targetPos = world.getCellCenter(randomPoint);
            }
        }

        this.movement += this.speed;
        const movementVector = this.getMovementVectorToTarget(this.targetPos);
        if (this.movement >= 1 && !world.checkNeighbour(this.getPos(), movementVector)) {
            world.moveObjectOnGridInDirection(this, movementVector);
            this.movement = 0.0;
        }

        if (this.checkIfTargetReached(this.targetPos)) {
            this.targetPos = null;
            this.switchState(this.squirrelStates.Planting);
        }
    }

    running() {

    }

    planting() {
        const neighbourPos = world.getNeighbourPos(this.getPos(), new THREE.Vector3(0,0,1).applyEuler(this.getRot()));

        const newTree = new Tree(neighbourPos, new THREE.Vector3(), treeMaterial);
        if (world.grid.checkIfInGrid(neighbourPos) && !world.checkPos(neighbourPos)) {
            world.instantiateObject(newTree);
        }

        this.switchState(this.squirrelStates.Idle);
    }
}

class Human extends ObjectBases.MovableObjectBase {
    //TODO: implement storage area for storing the wood and food humans harvest, implement 5x5 grid reservation for house+wheat fields, implement human needs and behavior
    //humans should stop killing animals and harvesting wood when they have enough resources in the stockpile, the lesser the resources the more likely they should be to hunt/harvest
    constructor(pos, rotation, material) {
        super(pos, rotation, material);
        this.health = 100;
        this.speed = 0.1;

        this.selectable = true;

        // const cube = new THREE.BoxGeometry(world.getCellSize(), world.getCellSize(), world.getCellSize()).translate(0,world.getCellSize()/2,0);
        // this.mesh = new THREE.Mesh(cube, material);

        this.mesh = meshes.human.clone();

        this.setPos(pos);
        this.setRot(rotation);

        this.movement = 0.0;
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

        if (this.target != null && this.checkIfNextToTarget(this.target.getPos())) {
            this.target.applyDamage(2);
        } else if (this.target != null) {
            let movementVector = this.getMovementVectorToTarget(this.target.getPos());

            if (this.movement < 1) {
                this.movement += this.speed;
            } else if (!world.checkNeighbour(this.getPos(), movementVector)) {
                this.movement = 0.0;
                world.moveObjectOnGridInDirection(this, movementVector);
                // console.log("Human is moving towards tree. Current Pos: " + pos.x + ", " + pos.y + ", " + pos.z);
            }
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