import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as Objects from "../world/Objects.js"
import {GridLayer} from "./Grid.js";
import * as ObjectBases from "../world/ObjectBases.js";
import {LivingObjectBase} from "../world/ObjectBases.js";

class World {
    static maxLivingType = null;
    static maxLiving = 10;

    constructor(scene, grid) {
        this.scene = scene;
        // scene.fog = new THREE.FogExp2(0xFFFFFF, 0.09);
        this.objects = [];
        this.fillerObjects = [];
        this.lights = [];

        this.grid = grid;

        this.meshIdToObject = new Map();

        this.parentObject = new THREE.Object3D();
        this.scene.add(this.parentObject);

        this.generalParent = new THREE.Object3D();
        this.parentObject.add(this.generalParent);

        this.gridParent = new THREE.Object3D();
        this.parentObject.add(this.gridParent);

        this.lastPureMatrixCreatedFrame = -1;
        this.lastPureMatrix = null;
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

    getPure2DMatrix(layer = GridLayer.Surface) {
        if (frameCount - this.lastPureMatrixCreatedFrame < 2) {
            return this.lastPureMatrix;
        }

        let matrix2d = [];
        for (let i = 0; i < world.grid.matrix[layer].length; i++) {
            let temp = [];
            for (let j = 0; j < world.grid.matrix[layer][i].length; j++) {
                if (world.grid.matrix[layer][i][j] != null) {
                    temp.push(world.grid.matrix[layer][i][j].constructor.name);
                } else {
                    temp.push(null);
                }
            }
            matrix2d.push(temp)
        }

        this.lastPureMatrixCreatedFrame = frameCount;
        this.lastPureMatrix = matrix2d;
        return matrix2d;
    }

    getPathFromPure2DMatrix(array) {
        let path = [];
        for (let i = 0; i < array.length; i++) {
            path.push(world.grid.getIndexPos(array[i].i, array[i].j));
        }
        return path;
    }

    createLine(from, to, height = 0, color = "#ffffff") {
        const points = [];
        // let inHeight = world.getNormalVector(from).multiplyScalar(height);
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
        return this.gridParent.children;
    }

    getObjectOfMesh(mesh) {
        return this.meshIdToObject.get(mesh.id);
    }

    isObjectOnGrid(object) {
        return object._onLayer != null;
    }

    cameraLookDir() {
        let vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(camera.rotation, camera.rotation.order);
        return vector;
    }

    getCellSize() {
        return this.grid.cellSize;
    }

    getCellCenter(pos) {
        return this.grid.getGridPos(pos);
    }

    checkPos(pos, layer = GridLayer.Surface) {
        return this.grid.checkGrid(pos, layer);
    }

    getPos(pos, layer = GridLayer.Surface) {
        return this.grid.getPos(pos, layer);
    }

    getNeighbourPos(pos, direction) {
        return this.grid.getGridInDirection(pos, direction);
    }

    checkNeighbour(pos, direction, layer = GridLayer.Surface) {
        let neighbourPos = this.getNeighbourPos(pos, direction);
        return this.grid.checkGrid(neighbourPos, layer);
    }

    getNeighbour(pos, direction, layer = GridLayer.Surface) {
        let neighbourPos = this.getNeighbourPos(pos, direction);
        return this.grid.getPos(neighbourPos, layer);
    }

    fixObjectPos(object, withPos = true) {
        let gridCenter = null;
        if (withPos) {
            gridCenter = this.grid.getGridPos(object.getPos());
        } else {
            let layer = this.grid.getObjectLayer(object);
            if (layer instanceof Array) {
                layer = layer[0];
            }
            let mx = this.grid.matrix[layer];
            for (let i = 0; i < mx.length; i++) {
                for (let j = 0; j < mx[i].length; j++) {
                    if (mx[i][j] === object) {
                        gridCenter = this.grid.getIndexPos(i, j);
                        break;
                    }
                }
                if (gridCenter != null) break;
            }

            if (gridCenter == null) {
                return;
            }
        }
        let newPos = (new THREE.Vector3().copy(gridCenter));
        object.setPos(newPos);
        if (object.overrideRot) {
            let normal = this.getNormalVector(gridCenter);
            var up = new THREE.Vector3(0, 1, 0);
            object.mesh.quaternion.setFromUnitVectors(up, normal.clone());
        }

        const objectLayer = this.grid.getObjectLayer(object);

        switch (objectLayer) {
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

    increaseLivingCount(o) {
        let typeName = o.constructor.name;
        if (datamap.has(typeName)) {
            datamap.set(typeName, datamap.get(typeName) + 1);
        } else {
            datamap.set(typeName, 1);
        }

        let currentLiving = datamap.get(typeName);
        if (currentLiving > World.maxLiving) {
            World.maxLivingType = typeName;
            World.maxLiving = currentLiving;
        }
    }

    instantiateObjectOnGrid(object, layer = GridLayer.Surface) {
        let pos = object.getPos();
        if (this.checkPos(pos)) {
            object.onDelete();
            return false;
        } else {
            this.fixObjectPos(object);
            if (object instanceof ObjectBases.WorldLargeObject && (layer === GridLayer.Surface || layer === GridLayer.Ground)) {
                object._onLayer = [GridLayer.Surface, GridLayer.Ground];
                this.grid.setPos(object.getPos(), object, GridLayer.Surface);
                this.grid.setPos(object.getPos(), object, GridLayer.Ground);
            } else {
                if (object._onLayer != null && layer === GridLayer.Surface) {
                    layer = object._onLayer;
                }
                object._onLayer = layer;
                this.grid.setPos(object.getPos(), object, layer);
            }
        }

        this.gridParent.add(object.mesh);
        let objectList;
        if (object instanceof Objects.FillerObject || object instanceof Objects.LargeFillerObject) {
            objectList = this.fillerObjects;
        } else {
            objectList = this.objects;
        }
        objectList.push(object);

        this.meshIdToObject.set(object.mesh.id, object);

        if (object instanceof ObjectBases.LivingObjectBase) {
            this.increaseLivingCount(object);
        }

        return true;
    }

    //Returns whether the placement was successful
    instantiateObject(object, onGrid = true) {
        if (onGrid) {
            return this.instantiateObjectOnGrid(object);
        }

        this.generalParent.add(object.mesh);
        this.objects.push(object);

        this.meshIdToObject.set(object.mesh.id, object);
        if (object instanceof ObjectBases.LivingObjectBase) {
            this.increaseLivingCount(object);
        }
        return true;
    }

    getMaxLiving() {
        return World.maxLiving;
    }

    deleteObject(object) {
        if (object instanceof ObjectBases.LivingObjectBase) {
            let typeName = object.constructor.name;
            datamap.set(typeName, datamap.get(typeName) - 1);
            if (World.maxLivingType === typeName) {
                let newMaxType = null;
                let newMax = -1;
                for (let currentKey of datamap.entries()) {
                    let currentValue = datamap.get(currentKey);
                    if (currentValue > newMax) {
                        newMax = currentValue;
                        newMaxType = currentKey;
                    }
                }

                World.maxLivingType = newMaxType;
                World.maxLiving = newMax;
            }

        }

        let pos = object.getPos();
        let objectLayer = this.grid.getObjectLayer(object);
        if (this.grid.checkIfInGrid(pos) && objectLayer != null) {
            let deleteOnLayers = [];
            if (objectLayer instanceof Array) {
                deleteOnLayers = objectLayer;
            } else {
                deleteOnLayers.push(objectLayer);
            }
            for (let layer of deleteOnLayers) {
                this.grid.clearPos(pos, layer);
            }
        }

        let objectList;
        if (object instanceof Objects.FillerObject || object instanceof Objects.LargeFillerObject) {
            objectList = this.fillerObjects;
        } else {
            objectList = this.objects;
        }
        const indexOf = objectList.indexOf(object);
        if (indexOf != -1) {
            objectList.splice(indexOf, 1);
        }

        if (this.isObjectOnGrid(object)) {
            this.gridParent.remove(object.mesh);
            object._onLayer = null;
        } else {
            this.generalParent.remove(object.mesh);
        }

        this.meshIdToObject.delete(object.mesh.id);

        object.onDelete();
    }

    clearObjects() {
        for (let i = this.gridParent.children.length - 1; i >= 0; i--) {
            const o = this.gridParent.children[i];
            const obj = this.getObjectOfMesh(o);
            this.deleteObject(obj);
        }
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
            try {
                x.update();
            } catch (e) {
                console.error(e);
            }

        });
    }

    // checkFunc: Gets grid position and object on grid as arguments.
    fillAtAllGrid(checkFunc, resetOld = false) {
        for (let layer = 1; layer <= 2; layer++) {
            for (let i = 0; i < this.grid.widthInGrid; i++) {
                for (let j = 0; j < this.grid.widthInGrid; j++) {
                    let gridPos = this.grid.getIndexPos(i, j);
                    let objectAtPos = this.getPos(gridPos, layer);

                    if (resetOld && objectAtPos instanceof Objects.LargeFillerObject) {
                        if (this.getObjectOfMesh(objectAtPos.mesh)) {
                            this.deleteObject(objectAtPos);
                        } else {
                            this.grid.clearPos(gridPos, layer);
                        }
                    }

                    if (checkFunc(gridPos, objectAtPos)) {
                        const largeFiller = new Objects.LargeFillerObject(new THREE.Vector3().add(gridPos), new THREE.Vector3(0, 0, 0), null);
                        this.instantiateObjectOnGrid(largeFiller, GridLayer.Surface);
                    }
                }
            }
        }
    }
}

export {World};