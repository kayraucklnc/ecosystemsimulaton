import * as THREE from "../library/three.js-r135/build/three.module.js";

let vShader;
let fShader;
let terrainFShader;
let sunFShader;

const planeMat = new THREE.MeshPhongMaterial({
    color: 0x3bdb43,
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
});

let planeCustomMat = null;
let treeMaterial = null;
let humanMaterial = null;
let wallMaterial = null;
let squirrelMaterial = null;
let lightIndicatorMaterial = null;

function createAllMaterials() {
    vShader = shaders["vertexShader"];
    fShader = shaders["fragmentShader"];
    terrainFShader = shaders["terrainFragmentShader"];
    sunFShader = shaders["sunFragmentShader"];

    let planeMatUniforms = THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
            repeatFactor: {value: textures.dirtNormalMap.repeatFactor},
            groundNormalMap: {value: null},
            snowNormalMap: {value: null},
            perlinMap: {value: null},
            maxTerrainHeight: {value: parameters.plane.heightMultiplier},
            fogColor: {value: new THREE.Color(0x61757d)},
            fogDensity: {type: "f", value: 0.014},
            u_time: {type: "f", value: 0},
        }
    ]);
    planeMatUniforms.groundNormalMap.value = textures.dirtNormalMap.texture;
    planeMatUniforms.snowNormalMap.value = textures.snowNormalMap.texture;
    planeMatUniforms.perlinMap.value = textures.perlinNoiseMap.texture;
    planeCustomMat = new THREE.ShaderMaterial({
        uniforms: planeMatUniforms,
        vertexShader: vShader,
        fragmentShader: terrainFShader,
        side: THREE.DoubleSide,
        lights: true,
        fog: true,
    });

    // planeCustomMat = new THREE.MeshPhongMaterial({
    //     normalMap: textures.terrainNormalMap,
    //     color: 0x3bdb43,
    //     side: THREE.DoubleSide,
    //     flatShading: THREE.FlatShading,
    // });

    treeMaterial = new THREE.ShaderMaterial({
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

    humanMaterial = new THREE.ShaderMaterial({
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

    wallMaterial = new THREE.ShaderMaterial({
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

    squirrelMaterial = new THREE.ShaderMaterial({
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

    lightIndicatorMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib["lights"],
            {
                color: {type: "c", value: new THREE.Color(0xd0d624)},
            },
        ]),
        vertexShader: vShader,
        fragmentShader: sunFShader,
        side: THREE.DoubleSide,
        lights: true,
    });
}

export {
    createAllMaterials,
    lightIndicatorMaterial,
    squirrelMaterial,
    humanMaterial,
    treeMaterial,
    planeMat,
    planeCustomMat,
    wallMaterial,
};