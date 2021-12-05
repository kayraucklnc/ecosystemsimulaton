import * as THREE from "../library/three.js-r135/build/three.module.js";

class Node {
    constructor() {
        this.position = null;
        this.cameFrom = null;

        this.distFromStart = Infinity;
        this.distToTarget = Infinity;
        this.costOfGrid = Infinity;
    }
}

function areVectorsEqual(v1, v2, epsilon = Number.EPSILON) {
    return ( ( Math.abs( v1.x - v2.x ) < epsilon ) && ( Math.abs( v1.y - v2.y ) < epsilon ) && ( Math.abs( v1.z - v2.z ) < epsilon ) );
}

function getVectorHash(vec) {
    return vec.x +","+ vec.y + "," + vec.z;
}

function findPath(startingPos, targetPos) {
    let openNodes = [];	// Nodes that haven't been visited yet.
    let closedNodes = [];	// Nodes that have already been visited.
    const startingGrid = world.getCellCenter(startingPos);
    const targetGrid = world.getCellCenter(targetPos);

    let gridToNode = new Map();

    //Start from the starting node
    let firstNode = new Node();
    firstNode.position = startingGrid;
    firstNode.distFromStart = 0;
    firstNode.distToTarget = startingGrid.distanceTo(targetGrid);
    firstNode.costOfGrid = firstNode.distFromStart + firstNode.distToTarget;
    gridToNode.set(getVectorHash(startingGrid), firstNode);
    openNodes.push(firstNode);

    //Keep getting best node until the destination point is reached.
    let currentNode = null;
    while(openNodes.length > 0) {
        // Choose the lowest one.
        let lowestIndex = null;
        let lowF = Infinity;

        //Loop through the open nodes around the starting target
        for (let i = 0; i < openNodes.length; i++) {
            let tempNode = openNodes[i];

            //get the node within open list that has the lowest F value
            if (tempNode.costOfGrid < lowF) {
                lowF = tempNode.costOfGrid;
                lowestIndex = i;
            }
        }

        currentNode = openNodes[lowestIndex];

        if (areVectorsEqual(currentNode.position, targetGrid, 0.2)) {
            break;
        }

        openNodes.splice(lowestIndex, 1);
        closedNodes.push(currentNode);

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

            if(!world.checkIfInGrid(neighbourGrid) || world.checkPos(neighbourGrid)) {
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

            if(containsNode(closedNodes, neighbourNode)) {
                continue;
            }

            let distFromStartValue = currentNode.distFromStart + currentNode.position.distanceTo(neighbourGrid);
            let gScoreIsBest = false;

            //if currentNode is not in the openNodes array calculate its G, H and F values
            if (!containsNode(openNodes, neighbourNode)) {
                gScoreIsBest = true;

                //Distance from the neighbor to the target node
                neighbourNode.distToTarget = targetGrid.distanceTo(neighbourGrid);
                openNodes.push(neighbourNode);

            } else if (distFromStartValue < neighbourNode.distFromStart) {
                gScoreIsBest = true;
            }

            if (gScoreIsBest) {
                //Distance from the starting node to the neighbor
                neighbourNode.distFromStart = distFromStartValue;

                //Total Cost
                neighbourNode.costOfGrid = neighbourNode.distFromStart + neighbourNode.distToTarget;
                neighbourNode.cameFrom = currentNode;
            }
        }
    }

    let path = null;
    if (areVectorsEqual(currentNode.position, targetGrid, 0.2)) {
        path = [];
        let currNode = currentNode;

        //retrieve the parents of each of the nodes, beginning with the final node to retrieve the shortest path
        while (currNode.cameFrom) {
            path.push(currNode.position);
            currNode = currentNode.cameFrom;
        }
        path = path.reverse();
    }

    return path;
}

/*
Checks to see if a waypoint is contained within a given array
*/
function containsNode(A, searchValue)
{
    for (let j = 0; j < A.length; j++)
    {
        if (areVectorsEqual(A[j].position, searchValue.position, 0.2)) {
            return true;
        }
    }
    return false;
}

export {findPath};