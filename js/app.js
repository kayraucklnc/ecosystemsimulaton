let raycaster;
let terrainObject;
let frameCount = 0;
let world = null;
let orbitControls = null;
let mousePicker = null;
let isSimActive = true;
let renderer = null;
let water;
let drawMode = {
    brush: false,
    eraser: false,
};
let datamap = new Map();
let mouse = {
    x: undefined,
    y: undefined,
};
let simulation = {
    timeScale: 20,
};
let chartSettings = {
    chartSize: {
        width: 320,
        height: innerHeight * 0.82,
    },
    viewWindow: {
        max: 200,
        min: 0
    }
};

let rigthBar = {
    width: 320,
};

let canvasSize = {
    width: innerWidth - chartSettings.chartSize.width-rigthBar.width,
    height: innerHeight,
};

let meshes = {
    tree: null,
    human: null,
}

let textures = {
    dirtNormalMap: null,
    snowNormalMap: null,
    perlinNoiseMap: null
}