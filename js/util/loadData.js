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
    let terrainNormalPromise = new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = "";
        loader.load( "textures/terrain_normal_map.jpg", (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set( 4, 4 );
            resolve(texture);
        });
    });

    Promise.all([terrainNormalPromise]).then((texture) => {
        textures.terrainNormalMap = texture[0];

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