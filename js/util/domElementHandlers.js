import * as Objects from "../world/Objects.js";
import * as THREE from "../library/three.js-r135/build/three.module.js";
import * as Materials from "../world/Materials.js";

document.getElementById("saveButton").addEventListener("click", () => {
    saveTemplate()
});
document.getElementById("loadButton").addEventListener("click", () => {
    loadTemplate()
});
document.getElementById("brush").addEventListener("change", () => {
    brushChange()
});
document.getElementById("eraser").addEventListener("change", () => {
    eraserChange()
});

function simulationToggle(){
    document.getElementById("stop-sim-button").innerText = isSimActive ? "Start Simulation" : "Pause Simulation";
    isSimActive = !isSimActive;
}

function simulationSpeedChange() {
    simulation.timeScale = document.getElementById("timescale-slider").value;
}

function brushChange() {
    if (document.getElementById("brush").checked) {
        document.getElementById("eraser").checked = false;
        drawMode.brush = true;
        drawMode.eraser = false;
        orbitControls.enabled = false;
        mousePicker.isActive = false;
    }else {
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
    }else {
        drawMode.eraser = false;
        orbitControls.enabled = true;
        mousePicker.isActive = true;
    }
}

function saveTemplate() {
    let toSave = {arr: [], scale: parameters.plane.scale,}


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
            } arr1.push(arr2);
        } toSave.arr.push(arr1);
    }

    console.log(JSON.stringify(toSave));
    download("template.json",JSON.stringify(toSave));

    //console.log(world.grid.matrix[1]);

    //
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
    console.log(parsedData);
    /* let length = parsedData["arr"]["length"];
     for (let i = 0; i < length; i++) {
         for (let y = 0; y < length; y++) {
             console.log(i);
             console.log(parsedData["matrix"][1][i]);
         }
     }*/
    console.log(parsedData.arr);

    if (A == cons.name) {
        let treeObject = new Objects.Tree(world.grid.get, new THREE.Vector3(0, 0), Materials.treeMaterial);
        world.instantiateObject(treeObject);
    }


}