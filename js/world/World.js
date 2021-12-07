import * as THREE from "../library/three.js-r135/build/three.module.js";

import * as Objects from "../world/Objects.js"
import * as ObjectBases from "../world/ObjectBases.js";

class World {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.lights = [];

        this.grid = null;

        this.meshIdToObject = new Map();

        this.parentObject = new THREE.Object3D();
        this.scene.add(this.parentObject);
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    randomFloatFromInterval(min, max) { // min and max included 
        return (Math.random() * (max - min) + min);
    }

    createLine(from, to, height = 0, color = "#ffffff") {
        const points = [];
        let inHeight = world.getNormalVector(from).multiplyScalar(height);
        //TODO: Should height be from normal vec?
        // points.push(new THREE.Vector3().addVectors(inHeight, from));
        // points.push(new THREE.Vector3().addVectors(inHeight, to));
        points.push(new THREE.Vector3(0, height, 0).add(from));
        points.push(new THREE.Vector3(0, height, 0).add(to));
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        let line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
            color: color,
            linewidth: 12,
        }));
        return line;
    }

    getObjectOfMesh(mesh) {
        return this.meshIdToObject.get(mesh.id);
    }


    getCellSize() {
        return this.grid.cellSize;
    }

    getCellCenter(pos) {
        return this.grid.getGridPos(pos);
    }

    checkPos(pos) {
        return this.grid.checkGrid(pos);
    }

    getPos(pos) {
        return this.grid.getPos(pos);
    }

    getNeighbourPos(pos, direction) {
        return this.grid.getGridInDirection(pos, direction);
    }

    checkNeighbour(pos, direction) {
        let neighbourPos = this.getNeighbourPos(pos, direction);
        return this.grid.checkGrid(neighbourPos);
    }

    getNeighbour(pos, direction) {
        let neighbourPos = this.getNeighbourPos(pos, direction);
        return this.grid.getPos(neighbourPos);
    }


    fixObjectPos(object) {
        let gridCenter = this.grid.getGridPos(object.getPos());
        let newPos = (new THREE.Vector3().copy(gridCenter));
        object.setPos(newPos);
        if (!(object instanceof Objects.Wall)) {
            let normal = this.getNormalVector(gridCenter);
            var up = new THREE.Vector3(0, 1, 0);
            object.mesh.quaternion.setFromUnitVectors(up, normal.clone());
        }

    }


    checkIfInGrid(pos) {
        return this.grid.checkIfInGrid(pos);
    }

    getNormalVector(gridCenter) {
        let vecOne = (new THREE.Vector3()).addVectors(gridCenter, (new THREE.Vector3(this.getCellSize() / 2.0, 0, 0)));
        vecOne.y = this.grid.terrain.getHeight(new THREE.Vector2(vecOne.x, vecOne.z));
        let vecTwo = (new THREE.Vector3()).addVectors(gridCenter, (new THREE.Vector3(0, 0, this.getCellSize() / 2.0)));
        vecTwo.y = this.grid.terrain.getHeight(new THREE.Vector2(vecTwo.x, vecTwo.z));
        vecOne.sub(gridCenter);
        vecTwo.sub(gridCenter);
        let crossed = new THREE.Vector3(vecOne.y * vecTwo.z - (vecTwo.y * vecOne.z), vecOne.z * vecTwo.x - (vecTwo.z * vecOne.x), vecOne.x * vecTwo.y - (vecTwo.x * vecOne.y));
        if (crossed.y < 0) {
            crossed.negate();
        }

        return crossed.normalize();
    }


    //Returns whether the placement was successful
    instantiateObject(object, onGrid = true) {
        //TODO: Grid üzerindekiler ayrı alınabilmeli
        let pos = object.getPos();
        if (onGrid) {
            if (this.checkPos(pos)) {
                this.deleteObject(this.grid.getPos(pos));
                return false;
            } else {
                this.fixObjectPos(object);
                this.grid.setPos(object.getPos(), object);
            }
        }

        this.parentObject.add(object.mesh);
        this.objects.push(object);

        this.meshIdToObject.set(object.mesh.id, object);
        return true;
    }

    getMaxLiving(){
        return Math.max(...datamap.values());
    }
    
    deleteObject(object) {
        if(object instanceof ObjectBases.LivingObjectBase){
            let typeName = object.constructor.name;
            datamap.set(typeName, datamap.get(typeName) - 1);
            ObjectBases.LivingObjectBase.maxLiving = Math.max(datamap.get(typeName), ObjectBases.LivingObjectBase.maxLiving);
        }

        let pos = object.getPos();
        if (this.grid.checkIfInGrid(pos) && this.grid.getPos(pos) === object) {
            this.grid.clearPos(pos);
        }
        const indexOf = this.objects.indexOf(object);
        if (indexOf != -1) {
            this.objects.splice(indexOf, 1);

        }

        this.parentObject.remove(object.mesh);
        this.meshIdToObject.delete(object.mesh.id);
    }

    moveObjectOnGrid(object, pos) {
        this.grid.clearPos(object.getPos());

        let neighbourToReplace = this.getPos(pos);
        if (neighbourToReplace != null) {
            this.deleteObject(neighbourToReplace);
        }

        this.grid.setPos(pos, object);

        object.setPos(this.grid.getGridPos(pos));
        this.fixObjectPos(object);
    }

    moveObjectOnGridInDirection(object, direction) {
        this.moveObjectOnGrid(object, this.getNeighbourPos(object.getPos(), direction));
    }


    instantiateLight(light) {
        this.scene.add(light);
        this.lights.push(light);
    }

    deleteLight(object) {
        const indexOf = this.lights.indexOf(object);
        if (indexOf != -1) {
            this.lights.splice(indexOf, 1);
        }
        this.scene.remove(object);
    }

    update() {
        this.objects.forEach((x) => {
            x.update();
        });
    }
}

export {World};