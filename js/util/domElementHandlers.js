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
        for (let y = 0; y < world.grid.matrix[i].length; y++) {
            if (world.grid.matrix[i][y] == null) {
                toSave.arr.push(null);
            } else {
                toSave.arr.push(world.grid.matrix[i][y].constructor.name);
            }
        }
    }
    console.log(JSON.stringify(toSave));
    //  download("template.json",JSON.stringify({ matrix: world.grid.matrix }));

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

    let length = parsedData["matrix"]["length"];
    for (let i = 0; i < length; i++) {
        for (let y = 0; y < length; y++) {
            console.log(i);
            console.log(parsedData["matrix"][1][i]);
        }
    }


}