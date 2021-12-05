import {GLTFLoader} from "../library/three.js-r135/examples/jsm/loaders/GLTFLoader.js";

function loadObject(resolve, path) {
    let loader = new GLTFLoader().setPath('../../models/');
    loader.load(path, function (e) {
        resolve(e.scene.children[0]);
    });
}

export {loadObject}