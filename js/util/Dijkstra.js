import * as THREE from "../library/three.js-r135/build/three.module.js";
import {PriorityQueue} from "../library/datastructures-js/priority-queue/priorityQueue.js";

onmessage = function (oEvent) {
    let matrix = oEvent.data.matrix;
    let closestArr = oEvent.data.closestArr;

    class Node {
        constructor() {
            this.position = null;
            this.cameFrom = null;

            this.distFromStart = Infinity;
            this.costOfGrid = Infinity;
        }
    }

    function recreatePQueue(pQueue) {
        let arrayOfQueue = pQueue.toArray();
        pQueue.clear();
        for (let item of arrayOfQueue) {
            pQueue.enqueue(item, item.costOfGrid);
        }
        return pQueue;
    }

    function getVectorHash(idx) {
        return idx.i + "," + idx.j;
    }

    function checkIfInGrid(neighbourGrid) {
        return (neighbourGrid.i >= 0 && neighbourGrid.j >= 0 && neighbourGrid.i < matrix.length && neighbourGrid.j < matrix.length)
    }

    function isGridFull(neighbourGrid) {
        return matrix[neighbourGrid.i][neighbourGrid.j] != null;
    }

    function idxEquals(neighbourGrid, targetGrid) {
        return (neighbourGrid.i === targetGrid.i && neighbourGrid.j === targetGrid.j);
    }

    function idxDist(targetGrid, neighbourGrid) {
        return Math.pow(neighbourGrid.i - targetGrid.i, 2) + Math.pow(neighbourGrid.j - targetGrid.j, 2);
    }

    function getNeighbourPos(targetGrid, neighbourVector) {
        return {i: targetGrid.i + neighbourVector.i, j: targetGrid.j + neighbourVector.j};
    }

    function findPath(_startingGrid, _closestArr) {
        let startingGrid = _startingGrid;
        let targetGrid = _closestArr;

        const neighbours = [
            {i: 1, j: 0},
            {i: -1, j: 0},
            {i: 0, j: 1},
            {i: 0, j: -1},
        ];
        let enclosed = 0;
        for (let neighbourVector of neighbours) {
            let neighbourGrid = getNeighbourPos(targetGrid, neighbourVector);
            if (!checkIfInGrid(neighbourGrid) || isGridFull(neighbourGrid)) {
                enclosed += 1;
            }
        }
        if (enclosed == 4) {
            return null;
        }

        /* world.getCellCenter Gets center position of the grid in world coordinates (THREE.Vector3).
         * world.getCellSize Returns the width of the each grid.
         * world.getNeighbourPos Gets the neighbour's grid center in the given direction of the given pos.
         * world.checkIfInGrid Checks if given vector is in world grid.
         * world.checkPos Checks if there is any object in given position.
        */
        let openNodes = new PriorityQueue({
            compare: (n1, n2) => {
                if (n1.costOfGrid > n2.costOfGrid) return 1;
                if (n1.costOfGrid < n2.costOfGrid) return -1;
                return 0;
            }
        });	// Nodes that haven't been visited yet.
        let openNodesSet = new Set();
        let closedNodesSet = new Set();	// Nodes that have already been visited.

        let gridToNode = new Map();

        //Start from the starting node
        let firstNode = new Node();
        firstNode.position = startingGrid;
        firstNode.distFromStart = 0;
        firstNode.costOfGrid = firstNode.distFromStart;
        gridToNode.set(getVectorHash(startingGrid), firstNode);

        openNodes.enqueue(firstNode, firstNode.costOfGrid);
        openNodesSet.add(firstNode);

        //Keep getting best node until the destination point is reached.
        let currentNode = null;
        while (!openNodes.isEmpty()) {
            currentNode = openNodes.dequeue();

            if (idxEquals(currentNode.position, targetGrid)) {
                break;
            }

            openNodesSet.delete(currentNode);
            closedNodesSet.add(currentNode);

            //Grab all visible neighbors of the current best node
            const neighbourVectors = [
                {i: 1, j: 0},
                {i: -1, j: 0},
                {i: 0, j: 1},
                {i: 0, j: -1},
            ];

            //iterate through all the neighbors of the current best node
            // G: dist from start   H: dist to target (0)   F: cost (sum)

            for (let neighbourVector of neighbourVectors) {
                let neighbourGrid = getNeighbourPos(currentNode.position, neighbourVector);
                if (!checkIfInGrid(neighbourGrid) || (!(idxEquals(neighbourGrid, targetGrid))) && isGridFull(neighbourGrid)) {
                    continue;
                }

                let neighbourNode = null;
                if (gridToNode.has(getVectorHash(neighbourGrid))) {
                    neighbourNode = gridToNode.get(getVectorHash(neighbourGrid));
                } else {
                    neighbourNode = new Node();
                    neighbourNode.position = neighbourGrid;
                    gridToNode.set(getVectorHash(neighbourGrid), neighbourNode);
                }

                if (closedNodesSet.has(neighbourNode)) {
                    continue;
                }

                let distFromStartValue = currentNode.distFromStart + idxDist(currentNode.position, neighbourGrid);
                let gScoreIsBest = false;

                //if currentNode is not in the openNodes array calculate its G, H and F values
                if (!openNodesSet.has(neighbourNode)) {
                    gScoreIsBest = true;

                    openNodes.enqueue(neighbourNode, neighbourNode.costOfGrid);
                    openNodesSet.add(neighbourNode);

                } else if (distFromStartValue < neighbourNode.distFromStart) {
                    gScoreIsBest = true;
                }

                if (gScoreIsBest) {
                    //Distance from the starting node to the neighbor
                    neighbourNode.distFromStart = distFromStartValue;

                    //Total Cost
                    neighbourNode.costOfGrid = neighbourNode.distFromStart;
                    neighbourNode.cameFrom = currentNode;

                    openNodes = recreatePQueue(openNodes);
                }
            }
        }

        let path = null;
        if (idxEquals(currentNode.position, targetGrid)) {
            path = [];
            let currNode = currentNode;

            //retrieve the parents of each of the nodes, beginning with the final node to retrieve the shortest path
            while (currNode.cameFrom) {
                path.push(currNode.position);
                currNode = currNode.cameFrom;
            }
            path = path.reverse();
        }

        return path;
    }


    let closest = null;
    let closestPath = null;

    for (let i = 0; i < Math.min(15, closestArr.length); i++) {
        closest = closestArr[i];

        let path = findPath(oEvent.data.thisPos, closestArr[i]);
        if (path != null) {
            closestPath = path;
            break;
        }
    }
    postMessage({path: closestPath, nowId: oEvent.data.nowId});
};