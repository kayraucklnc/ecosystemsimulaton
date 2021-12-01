

class Grid {
    constructor(scene, width) {
        this.gridWidth = 0.5;

        this.scene = scene;
        this.matrix = [];
        for (let i = 0; i < width; i++) {
            let matrixRow = [];
            for (let j = 0; j < width; j++) {
                matrixRow.push(null);
            }
            this.matrix.push(matrixRow);
        }
    }

    // Gets a Three.Vector2 and returns the Vector3 that points the center of grid.
    getGridPos(pos) {
        
    }

    // Gets a Three.Vector2 and returns the object there.
    getPos(pos) {

    }

    // Gets a Three.Vector2 and returns if there is object there.
    checkGrid(pos) {

    }

    // Gets a Three.Vector2 and returns if included in grid.
    checkIfInGrid(pos) {

    }
}