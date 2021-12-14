import * as THREE from "../library/three.js-r135/build/three.module.js";
import {PriorityQueue} from "../library/datastructures-js/priority-queue/priorityQueue.js";

class Node {
    constructor() {
        this.position = null;
        this.cameFrom = null;

        this.distFromStart = Infinity;
        this.distToTarget = Infinity;
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

function getVectorHash(vec) {
    return vec.x + "," + vec.y + "," + vec.z;
}

function findPath(startingPos, targetPos) {
    //TODO: 4tarafı kapalıysa hiç bakmasın

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
    const startingGrid = world.getCellCenter(startingPos);
    const targetGrid = world.getCellCenter(targetPos);

    let gridToNode = new Map();

    //Start from the starting node
    let firstNode = new Node();
    firstNode.position = startingGrid;
    firstNode.distFromStart = 0;
    firstNode.distToTarget = startingGrid.distanceToSquared(targetGrid);
    firstNode.costOfGrid = firstNode.distFromStart + firstNode.distToTarget;
    gridToNode.set(getVectorHash(startingGrid), firstNode);

    openNodes.enqueue(firstNode, firstNode.costOfGrid);
    openNodesSet.add(firstNode);

    //Keep getting best node until the destination point is reached.
    let currentNode = null;
    while (!openNodes.isEmpty()) {
        currentNode = openNodes.dequeue();

        if (currentNode.position.equals(targetGrid)) {
            break;
        }

        openNodesSet.delete(currentNode);
        closedNodesSet.add(currentNode);

        //Grab all visible neighbors of the current best node
        const neighbourVectors = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, -1),
        ];

        //iterate through all the neighbors of the current best node
        // G: dist from start   H: dist to target   F: cost (sum)

        for (let neighbourVector of neighbourVectors) {
            let neighbourGrid = world.getNeighbourPos(currentNode.position, neighbourVector);
            if (!world.checkIfInGrid(neighbourGrid) || (!neighbourGrid.equals(targetGrid)) && world.checkPos(neighbourGrid)) {
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

            let distFromStartValue = currentNode.distFromStart + currentNode.position.distanceToSquared(neighbourGrid);
            let gScoreIsBest = false;

            //if currentNode is not in the openNodes array calculate its G, H and F values
            if (!openNodesSet.has(neighbourNode)) {
                gScoreIsBest = true;

                //Distance from the neighbor to the target node
                neighbourNode.distToTarget = targetGrid.distanceToSquared(neighbourGrid);

                openNodes.enqueue(neighbourNode, neighbourNode.costOfGrid);
                openNodesSet.add(neighbourNode);

            } else if (distFromStartValue < neighbourNode.distFromStart) {
                gScoreIsBest = true;
            }

            if (gScoreIsBest) {
                //Distance from the starting node to the neighbor
                neighbourNode.distFromStart = distFromStartValue;

                //Total Cost
                neighbourNode.costOfGrid = neighbourNode.distFromStart + neighbourNode.distToTarget;
                neighbourNode.cameFrom = currentNode;

                openNodes = recreatePQueue(openNodes);
            }
        }
    }

    let path = null;
    if (currentNode.position.equals(targetGrid)) {
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

export {findPath};