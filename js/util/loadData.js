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

    Promise.all([treePromise, humanPromise, grassPromise, wheatPromise, pigPromise, wolfPromise, rabbitPromise, foxPromise, eaglePromise]).then((mesh) => {
        meshes.tree = mesh[0];
        meshes.human = mesh[1];
        meshes.grass = mesh[2];
        meshes.wheat = mesh[3];
        meshes.pig = mesh[4];
        meshes.wolf = mesh[5];
        meshes.rabbit = mesh[6];
        meshes.fox = mesh[7];
        meshes.eagle = mesh[8];
        resolve();
    });
}

function loadTextures(resolve) {
    let terrainNormalPromise = new Promise((resolve, reject) => {
        const texture = new THREE.TextureLoader().load( "textures/terrain_normal_map.jpg", (tex) => {
            resolve(tex);
        });
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 4, 4 );
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