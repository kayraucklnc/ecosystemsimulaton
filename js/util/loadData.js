import {GLTFLoader} from "../library/three.js-r135/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../library/three.js-r135/build/three.module.js";

function loadObjectMeshes(resolve) {
    let treePromise = new Promise((resolve, reject) => {
        loadObject(resolve, "tree.glb");
    });
    let humanPromise = new Promise((resolve, reject) => {
        loadObject(resolve, "human.glb");
    });

    Promise.all([treePromise, humanPromise]).then((mesh) => {
        meshes.tree = mesh[0];
        meshes.human = mesh[1];

        resolve();
    });
}

function loadTextures(resolve) {
    let texturePromises = [];
    texturePromises.push(new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = "";
        loader.load( "textures/terrain_n_map2.png", (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            let repeating = 7;
            texture.repeat.set( repeating, repeating );
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
        loader.load( "textures/indir.jfif", (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            let repeating = 10;
            texture.repeat.set( repeating, repeating );
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
        loader.load( "textures/perlin_noise.png", (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            let repeating = 10;
            texture.repeat.set( repeating, repeating );
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

function loadObject(resolve, path) {
    let loader = new GLTFLoader().setPath('../../models/');
    loader.load(path, function (e) {
        resolve(e.scene.children[0]);
    });
}

export {loadObjectMeshes, loadTextures, loadObject};