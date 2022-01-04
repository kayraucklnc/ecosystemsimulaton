import {GLTFLoader} from "../library/three.js-r135/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../library/three.js-r135/build/three.module.js";

function loadObjectMeshes(resolve) {
    let treePromise = new Promise((resolve, reject) => {
        loadObject(resolve, "tree.glb");
    });
    let humanPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "human.glb");
    });
    let grassPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "grass.glb");
    });
    let wheatPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "wheat.glb");
    });
    let pigPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "pig.glb");
    });
    let wolfPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "wolf.glb");
    });
    let rabbitPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "rabbit.glb");
    });
    let foxPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "fox.glb");
    });
    let eaglePromise = new Promise((resolve, reject) => {
        loadObject(resolve, "eagle.glb");
    });
    let stockpilePromise = new Promise((resolve, reject) => {
        loadObject(resolve, "stockpile.glb");
    });
    let housePromise = new Promise((resolve, reject) => {
        loadObject(resolve, "house.glb")
    })

    Promise.all([treePromise, humanPromise, grassPromise, wheatPromise, pigPromise, wolfPromise, rabbitPromise, foxPromise, eaglePromise, stockpilePromise, housePromise]).then((mesh) => {
        meshes.tree = mesh[0];
        meshes.human = mesh[1];
        meshes.grass = mesh[2];
        meshes.wheat = mesh[3];
        meshes.pig = mesh[4];
        meshes.wolf = mesh[5];
        meshes.rabbit = mesh[6];
        meshes.fox = mesh[7];
        meshes.eagle = mesh[8];
        meshes.stockpile = mesh[9];
        meshes.house = mesh[10];
        resolve();
    });
}

function loadObject(resolve, path) {
    let loader = new GLTFLoader().setPath('../../models/');
    loader.load(path, function (e) {
        resolve(e.scene.children[0]);
    });
}

function loadTextures(resolve) {
    let texturePromises = [];
    texturePromises.push(new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = "";
        loader.load("textures/terrain_n_map2.png", (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            let repeating = 7;
            texture.repeat.set(repeating, repeating);
            textures.dirtNormalMap = {
                texture: texture,
                repeatFactor: repeating
            }
            resolve(texture);
        });
    }));

    texturePromises.push(new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = "";
        loader.load("textures/indir.jfif", (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            let repeating = 10;
            texture.repeat.set(repeating, repeating);
            textures.snowNormalMap = {
                texture: texture,
                repeatFactor: repeating
            }
            resolve(texture);
        });
    }));

    texturePromises.push(new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = "";
        loader.load("textures/perlin_noise.png", (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            let repeating = 10;
            texture.repeat.set(repeating, repeating);
            textures.perlinNoiseMap = {
                texture: texture,
                repeatFactor: repeating
            }
            resolve(texture);
        });
    }));

    Promise.all(texturePromises).then((texture) => {
        resolve();
    });
}

function loadShaders(resolve) {
    let shaderFilePath = "/shaders/";
    let fileNames = [
        "vertexShader.glsl",
        "fragmentShader.glsl",
        "terrainFragmentShader.glsl",
        "sunFragmentShader.glsl",
        "customWaterShader.glsl",
        "customWaterShader2.glsl",
        "customWaterShader3.glsl",
        "terrainFragmentShaderAlt.glsl"
    ];

    let loadShaderPromises = [];
    const loader = new THREE.FileLoader();
    for (let fileName of fileNames) {
        let path = shaderFilePath + fileName;
        loadShaderPromises.push(new Promise((resolve, reject) => {
            loader.load(path, function (data) {
                shaders[fileName.split(".glsl")[0]] = data;
                resolve();
            })
        }));
    }

    Promise.all(loadShaderPromises).then(() => {
        resolve();
    })
}

function loadData(resolve) {
    let loadDataPromises = [];
    loadDataPromises.push(new Promise((resolve, reject) => {
        loadObjectMeshes(resolve);
    }));

    loadDataPromises.push(new Promise((resolve, reject) => {
        loadTextures(resolve);
    }));

    loadDataPromises.push(new Promise((resolve, reject) => {
        loadShaders(resolve);
    }));

    Promise.all(loadDataPromises).then(() => {
        resolve();
    })
}

export {loadData};