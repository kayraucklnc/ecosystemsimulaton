// import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import * as THREE from "../library/three.js-r135/build/three.module.js";

const vShader = document.getElementById("vertexShader").text;
const fShader = document.getElementById("fragmentShader").text;

const treeMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
            color: {type: "c", value: new THREE.Color(0x1e692e)},
        },
    ]),
    vertexShader: vShader,
    fragmentShader: fShader,
    side: THREE.DoubleSide,
    lights: true,
});

const planeMat = new THREE.MeshPhongMaterial({
    color: 0x3bdb43,
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
});


const humanMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
            color: {type: "c", value: new THREE.Color(0xd1bb71)},
        },
    ]),
    vertexShader: vShader,
    fragmentShader: fShader,
    side: THREE.DoubleSide,
    lights: true,
});

const wallMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
            color: {type: "c", value: new THREE.Color(0x696969)},
        },
    ]),
    vertexShader: vShader,
    fragmentShader: fShader,
    side: THREE.DoubleSide,
    lights: true,
});

const squirrelMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
            color: {type: "c", value: new THREE.Color(0x5c3324)},
        },
    ]),
    vertexShader: vShader,
    fragmentShader: fShader,
    side: THREE.DoubleSide,
    lights: true,
});

const lightIndicatorMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
            color: {type: "c", value: new THREE.Color(0xd0d624)},
        },
    ]),
    vertexShader: vShader,
    fragmentShader: fShader,
    side: THREE.DoubleSide,
    lights: true,
});

export {lightIndicatorMaterial, squirrelMaterial, humanMaterial, treeMaterial, planeMat, wallMaterial};