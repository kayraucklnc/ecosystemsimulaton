function simulationToggle(){
    let text = isSimActive ? "Start Simulation" : "Pause Simulation";
    document.getElementById("stop-sim-button").innerText = text;
    isSimActive = !isSimActive;
}

function simulationSpeedChange(){
    simulation.timeScale = document.getElementById("timescale-slider").value;
}