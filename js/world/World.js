import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as Objects from "../world/Objects.js"
import {GridLayer} from "./Grid.js";
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

    getObjects() {
        return this.parentObject.children;
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

    checkPos(pos, layer=GridLayer.Surface) {
        return this.grid.checkGrid(pos, layer);
    }

    getPos(pos, layer=GridLayer.Surface) {
        return this.grid.getPos(pos, layer);
    }

    getNeighbourPos(pos, direction) {
        return this.grid.getGridInDirection(pos, direction);
    }

    checkNeighbour(pos, direction, layer=GridLayer.Surface) {
        let neighbourPos = this.getNeighbourPos(pos, direction);
        return this.grid.checkGrid(neighbourPos, layer);
    }

    getNeighbour(pos, direction, layer=GridLayer.Surface) {
        let neighbourPos = this.getNeighbourPos(pos, direction);
        return this.grid.getPos(neighbourPos, layer);
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

        const objectLayer = this.grid.getObjectLayer(object);

        switch(objectLayer) {
            case 0:
                object.setPos(newPos.add(new THREE.Vector3(0, -2, 0)));
                break;
            case 3:
                object.setPos(newPos.add(new THREE.Vector3(0, 3, 0)));
                break;
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

    instantiateObjectOnGrid(object, layer=GridLayer.Surface) {
        let pos = object.getPos();
        if (this.checkPos(pos)) {
            this.deleteObject(this.grid.getPos(pos, layer));
            return false;
        } else {
            this.fixObjectPos(object);
            if (object instanceof ObjectBases.WorldLargeObject && (layer === GridLayer.Surface || layer === GridLayer.Ground)) {
                this.grid.setPos(object.getPos(), object, GridLayer.Surface);
                this.grid.setPos(object.getPos(), object, GridLayer.Ground);
            } else {
                this.grid.setPos(object.getPos(), object, layer);
            }
        }

        this.parentObject.add(object.mesh);
        this.objects.push(object);

        this.meshIdToObject.set(object.mesh.id, object);

        object._onLayer = layer;

        return true;
    }

    //Returns whether the placement was successful
    instantiateObject(object, onGrid=true) {
        if (onGrid) {
            return this.instantiateObjectOnGrid(object);
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
        let objectLayer = this.grid.getObjectLayer(object);
        if (this.grid.checkIfInGrid(pos) && objectLayer && this.grid.getPos(pos, objectLayer) === object) {
            this.grid.clearPos(pos, objectLayer);
        }

        const indexOf = this.objects.indexOf(object);
        if (indexOf != -1) {
            this.objects.splice(indexOf, 1);

        }

        this.parentObject.remove(object.mesh);

        this.meshIdToObject.delete(object.mesh.id);

        object._onLayer = null;
    }

    moveObjectOnGrid(object, pos) {
        let objectLayer = this.grid.getObjectLayer(object);
        this.grid.clearPos(object.getPos(), objectLayer);

        let neighbourToReplace = this.getPos(pos, objectLayer);
        if (neighbourToReplace != null) {
            this.deleteObject(neighbourToReplace);
        }

        this.grid.setPos(pos, object, objectLayer);

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