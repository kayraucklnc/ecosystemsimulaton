const gui = new dat.GUI();

const planeScale = gui.add(parameters.plane, 'scale', 1, 20);
const noiseScale = gui.add(parameters.plane, 'noiseScale', 0.6, 3);
const resolution = gui.add(parameters.plane, 'resolution', 4, 100);