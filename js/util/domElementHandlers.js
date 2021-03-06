import * as Objects from "../world/Objects.js";
import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as Materials from "../world/Materials.js";

// document.getElementById("saveButton").addEventListener("click", () => {
//     saveTemplate()
// });
//
// document.getElementById("loadButton").addEventListener("click", () => {
//     loadTemplate()
// });

document.getElementById("brush").addEventListener("change", () => {
    brushChange()
});

document.getElementById("eraser").addEventListener("change", () => {
    eraserChange()
});

document.getElementById("templateList").addEventListener("change", () => {
    templateChange()
});

document.getElementById("timescale-slider").addEventListener("change", () => {
    simulationSpeedChange();
});

document.getElementById("stop-sim-button").addEventListener("click", () => {
    simulationToggle();
});

document.getElementById("waterShaders").addEventListener("change", () => {
    waterShaderChange();
});

document.getElementById("terrainShaders").addEventListener("change", () => {
    terrainShaderChange();
});

document.getElementById("pathfindingAlgorithm").addEventListener("change", () => {
    pathfindingChange();
});

function waterShaderChange() {
    switch (document.getElementById("waterShaders").value) {
        case "cuteShader":
            water.material = Materials.customWaterMaterial;
            break;
        case "toonShader":
            water.material = Materials.customWaterMaterial2;
            break;
        case "turbulance":
            water.material = Materials.customWaterMaterial3;
            break;
        case "caustics":
            water.material = Materials.customWaterMaterial4;
            break;
    }
}

function terrainShaderChange() {
    switch (document.getElementById("terrainShaders").value) {
        case "naturalShader":
            terrainObject.mesh.material = Materials.planeCustomMat;
            break;
        case "frensel":
            terrainObject.mesh.material = Materials.planeCustomMat2;
            break;
        case "third":
            terrainObject.mesh.material = Materials.planeAltMat;
            break;
        case "fourth":
            terrainObject.mesh.material = Materials.planeCustomMat3;
            break;
    }
}

function pathfindingChange() {
    switch (document.getElementById("pathfindingAlgorithm").value) {
        case "astar":
            worker.terminate();
            worker = new Worker("./js/util/AStar.js", {type: "module"});
            break;
        case "dijkstra":
            worker.terminate();
            worker = new Worker("./js/util/Dijkstra.js", {type: "module"});
            break;
    }
}

function simulationToggle() {
    document.getElementById("stop-sim-button").innerText = isSimActive ? "Start Simulation" : "Pause Simulation";
    isSimActive = !isSimActive;
}

function simulationSpeedChange() {
    simulation.timeScale = document.getElementById("timescale-slider").value;
}

document.getElementById("aggressiveness-slider").addEventListener("change", () => {
    parameters.simulation.humanAggressiveness = document.getElementById("aggressiveness-slider").value;

    world.objects.forEach((obj) => {
        if (obj instanceof Objects.Human) {
            obj.updateAccordingToAggressiveness();
        }
    })
});

function brushChange() {
    if (document.getElementById("brush").checked) {
        document.getElementById("eraser").checked = false;
        drawMode.brush = true;
        drawMode.eraser = false;
        orbitControls.enabled = false;
        mousePicker.isActive = false;
    } else {
        drawMode.brush = false;
        orbitControls.enabled = true;
        mousePicker.isActive = true;
    }

}

function eraserChange() {
    if (document.getElementById("eraser").checked) {
        document.getElementById("brush").checked = false;
        drawMode.eraser = true;
        drawMode.brush = false;
        orbitControls.enabled = false;
        mousePicker.isActive = false;
    } else {
        drawMode.eraser = false;
        orbitControls.enabled = true;
        mousePicker.isActive = true;
    }
}

function saveTemplate() {
    console.log(world.grid.matrix);
    let toSave = {arr: [], param: parameters}

    for (let i = 0; i < world.grid.matrix.length; i++) {
        let arr1 = [];
        for (let j = 0; j < world.grid.matrix[i].length; j++) {
            let arr2 = [];
            for (let k = 0; k < world.grid.matrix[i][j].length; k++) {
                if (world.grid.matrix[i][j][k] == null) {
                    arr2.push(null);
                } else {
                    arr2.push(world.grid.matrix[i][j][k].constructor.name);
                }
            }
            arr1.push(arr2);
        }
        toSave.arr.push(arr1);
    }

    console.log(JSON.stringify(toSave));
    download("template.json", JSON.stringify(toSave));
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

async function loadTemplate() {
    let [fileHandle] = await window.showOpenFilePicker();
    let fileData = await fileHandle.getFile();
    let text = await fileData.text();
    let parsedData = JSON.parse(text);

    loadFileToMap(parsedData);
}

async function openTemplate(fileName) {
    let text = readTextFile(fileName);
    let parsedData = JSON.parse(text);

    loadFileToMap(parsedData);
}

function templateChange() {
    switch (document.getElementById("templateList").value) {
        case "Template1":
            openTemplate("./templates/default_template.json");
            break;
        case "Template2":
            openTemplate("./templates/smaller_default_template.json");
            break;
        case "Template3":
            openTemplate("./templates/human_plains_template.json");
            break;
        case "Template4":
            openTemplate("./templates/wolf_hills_template.json");
            break;
        case "Template5":
            openTemplate("./templates/cow_fjords_template.json");
            break;
        case "Template6":
            openTemplate("./templates/barren_plains_template.json");
            break;
    }
    ;
}

function loadFileToMap(parsedData) {
    world.clearObjects();

    if (parsedData.param != null) {
        parameters = Object.assign({}, parsedData.param);
    }
    world.grid.terrain.changePlaneGeometry(parameters);

    for (let i = 0; i < parsedData.arr.length; i++) {
        for (let j = 0; j < parsedData.arr[i].length; j++) {
            for (let k = 0; k < parsedData.arr[i][j].length; k++) {
                if (parsedData.arr[i][j][k] != null) {
                    switch (parsedData.arr[i][j][k]) {
                        case "Wall":
                            let wallObject = new Objects.Wall(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.wallMaterial);
                            world.instantiateObject(wallObject);
                            break;
                        case "Human":
                            let humanObject = new Objects.Human(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.humanMaterial);
                            world.instantiateObject(humanObject);
                            break;
                        case "Tree":
                            let treeObject = new Objects.Tree(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(treeObject);
                            break;
                        case "Pig":
                            let pigObject = new Objects.Pig(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(pigObject);
                            break;
                        case "Wolf":
                            let wolfObject = new Objects.Wolf(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(wolfObject);
                            break;
                        case "Rabbit":
                            let rabbitObject = new Objects.Rabbit(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(rabbitObject);
                            break;
                        case "Grass":
                            let grassObject = new Objects.Grass(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(grassObject);
                            break;
                        case "LargeFillerObject":
                            let fillerObject = new Objects.LargeFillerObject(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.wallMaterial);
                            world.instantiateObject(fillerObject);
                            break;
                        case "Wheat":
                            let wheatObject = new Objects.Wheat(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(wheatObject);
                            break;
                        case "Fox":
                            let foxObject = new Objects.Fox(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(foxObject);
                            break;
                        case "Cow":
                            let cowObject = new Objects.Cow(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(cowObject);
                            break;
                        case "Squirrel":
                            let squirrelObject = new Objects.Squirrel(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(squirrelObject);
                            break;
                        case "House":
                            let houseObject = new Objects.House(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.treeMaterial);
                            world.instantiateObject(houseObject);
                            break;
                        case "FillerObject":
                            let fillerObject2 = new Objects.FillerObject(world.grid.getIndexPos(j, k), new THREE.Vector3(0, 0), Materials.wallMaterial);
                            world.instantiateObject(fillerObject2);
                            break;
                    }
                }
            }
        }
    }
}

function readTextFile(file) {
    var txt;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                txt = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return txt;
}