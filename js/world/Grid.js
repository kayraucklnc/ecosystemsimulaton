// import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import * as THREE from "../library/three.js-r135/build/three.module.js";

Object.assign(THREE.PlaneBufferGeometry.prototype, {
    toGrid: function() {
        let segmentsX = this.parameters.widthSegments || 1;
        let segmentsY = this.parameters.heightSegments || 1;
        let indices = [];
        for (let i = 0; i < segmentsY + 1; i++) {
            let index11 = 0;
            let index12 = 0;
            for (let j = 0; j < segmentsX; j++) {
                index11 = (segmentsX + 1) * i + j;
                index12 = index11 + 1;
                let index21 = index11;
                let index22 = index11 + (segmentsX + 1);
                indices.push(index11, index12);
                if (index22 < ((segmentsX + 1) * (segmentsY + 1) - 1)) {
                    indices.push(index21, index22);
                }
            }
            if ((index12 + segmentsX + 1) <= ((segmentsX + 1) * (segmentsY + 1) - 1)) {
                indices.push(index12, index12 + segmentsX + 1);
            }
        }
        this.setIndex(indices);
        return this;
    }
});

class Grid {
    // Gets the scene, terrain object and width grid count for the new grid.
    constructor(scene, terrain, widthInGrid) {
        world.grid = this;

        this.gridVisible = parameters.plane.gridVisible;

        this.scene = scene;
        this.terrain = terrain;
        terrain.grid = this;
        this.widthInGrid = widthInGrid;

        this.mesh = null;

        this.minPoint = null
        this.maxPoint = null;
        this.cellSize = null;

        this.matrix = [];
        for (let i = 0; i < this.widthInGrid; i++) {
            let matrixRow = [];
            for (let j = 0; j < this.widthInGrid; j++) {
                matrixRow.push(null);
            }
            this.matrix.push(matrixRow);
        }

        this.createGridGeometry(parameters);
    }

    setGridVisible(toSet) {
        if (toSet != this.gridVisible) {
            this.gridVisible = toSet;
            this.createGridGeometry();
        }
    }

    createGridGeometry() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }

        this.terrain.mesh.geometry.computeBoundingBox();
        const box = this.terrain.mesh.geometry.boundingBox;
        this.minPoint = new THREE.Vector3().copy(box.min);
        this.maxPoint = new THREE.Vector3().copy(box.max);
        this.cellSize = (box.max.x - box.min.x) / this.widthInGrid;

        if (this.gridVisible) {
            this.mesh = new THREE.LineSegments(
                new THREE.PlaneBufferGeometry( (box.max.x - box.min.x), (box.max.y - box.min.y), this.widthInGrid, this.widthInGrid ).toGrid(),
                // TODO ÖZEL MATERIAL
                new THREE.LineBasicMaterial( {
                    color: 0x636363
                } )
            );

            const vertexArray = this.mesh.geometry.attributes.position.array;
            const length = vertexArray.length;
            for (let i = 0; i < length; i += 3) {
                let x = vertexArray[i];
                let y = vertexArray[i+1];
                vertexArray[i+2] = this.terrain.getHeight(new THREE.Vector2(x, -y));
            }

            this.mesh.rotation.x = this.mesh.rotation.x - Math.PI / 2;
            this.scene.add(this.mesh);
        }
    }

    getGridIndex(pos) {
        let i = Math.floor((pos.x - this.minPoint.x) / this.cellSize);
        let j = Math.floor((pos.z - this.minPoint.y) / this.cellSize);
        return {i, j};
    }

    // Gets a Three.Vector3 and returns the Vector3 that points the center of grid.
    getGridPos(pos) {
        let {i, j} = this.getGridIndex(pos);
        let x = this.minPoint.x + i * this.cellSize + this.cellSize/2;
        let z = this.minPoint.y + j * this.cellSize + this.cellSize/2;
        let result = new THREE.Vector3(x, this.terrain.getHeight(new THREE.Vector2(x, z)), z);
        return result;
    }

    getGridInDirection(pos, direction) {
        let otherGridVec = direction.normalize().multiplyScalar(this.cellSize);
        return this.getGridPos(new THREE.Vector3().addVectors(pos, otherGridVec));
    }

    // Gets a Three.Vector3 and returns the object there.
    getPos(pos) {
        let {i, j} = this.getGridIndex(pos);
        return this.matrix[i][j];
    }


    // Gets a Three.Vector3 and Object. Puts the object into the appropriate position.
    setPos(pos, object) {
        let {i, j} = this.getGridIndex(pos);
        this.matrix[i][j] = object;
    }

    clearPos(pos) {
        this.setPos(pos, null);
    }


    // Gets a Three.Vector3 and returns if there is an object there.
    checkGrid(pos) {
        let result = this.getPos(pos);
        return result != null;
    }

    // Gets a Three.Vector3 and returns if included in grid.
    checkIfInGrid(pos) {
        let {i, j} = this.getGridIndex(pos);
        return i >= 0 && j >= 0 && i < this.widthInGrid && j < this.widthInGrid;
    }

    checkIfAtBorder(pos) {
        let {i, j} = this.getGridIndex(pos);
        return i == 0 || j == 0 || i == this.widthInGrid - 1 || j == this.widthInGrid - 1;
    }
}

export {Grid};