let scene, camera;
let isSimActive = true;
let world = null;
let water;
let terrainObject;
let frameCount = 0;

let worker = new Worker("./js/util/AStar.js", {type: "module"});

let raycaster;
let orbitControls = null;
let mousePicker = null;

let renderer = null;

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
        width: 340,
        height: innerHeight * 0.80,
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
    width: innerWidth - chartSettings.chartSize.width - rigthBar.width,
    height: innerHeight,
};

let meshes = {
    tree: null,
    human: null,
    grass: null,
    wheat: null,
    pig: null,
    wolf: null,
    rabbit: null,
    fox: null,
    eagle: null,
    stockpile: null,
    house: null
}

let textures = {
    dirtNormalMap: null,
    snowNormalMap: null,
    perlinNoiseMap: null,
    skybox_ft: null,
    skybox_bk: null,
    skybox_up: null,
    skybox_dn: null,
    skybox_rt: null,
    skybox_lf: null
}

let shaders = {}