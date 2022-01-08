import * as THREE from "../library/three.js-r135/build/three.module.js";

let vShader;
let vShaderWave;
let vShaderWave2;
let terrainVertexAlt;
let fShader;
let terrainFShader;
let terrainFShader2;
let terrainFShader3;
let customWaterFShader;
let customWaterFShader2;
let customWaterFShader3;
let customWaterFShader4;

let sunFShader;

const planeMat = new THREE.MeshPhongMaterial({
    color: 0x3bdb43,
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
});
let planeCustomMat = null;
let planeCustomMat2 = null;
let planeCustomMat3 = null;
let planeAltMat = null;
let treeMaterial = null;
let humanMaterial = null;
let wallMaterial = null;
let squirrelMaterial = null;
let lightIndicatorMaterial = null;
let customWaterMaterial = null;
let customWaterMaterial2 = null;
let customWaterMaterial3 = null;
let customWaterMaterial4 = null;
let skyboxMaterial = [];
let terrainFShaderAlt = null;

function createAllMaterials() {
    vShader = shaders["vertexShader"];
    vShaderWave = shaders["waveVertexShader"];
    vShaderWave2 = shaders["waveVertexShader2"];
    fShader = shaders["fragmentShader"];
    terrainFShader = shaders["terrainFragmentShader"];
    terrainFShader2 = shaders["terrainFragmentShader2"];
    terrainFShader3 = shaders["terrainFragmentShader3"];
    sunFShader = shaders["sunFragmentShader"];
    customWaterFShader = shaders["customWaterShader"];
    customWaterFShader2 = shaders["customWaterShader2"];
    customWaterFShader3 = shaders["customWaterShader3"];
    customWaterFShader4 = shaders["customWaterShader4"];
    terrainFShaderAlt = shaders["terrainFragmentShaderAlt"];
    terrainVertexAlt = shaders["terrainVertexShaderAlt"];


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

    planeCustomMat2 = new THREE.ShaderMaterial({
        uniforms: planeMatUniforms,
        vertexShader: vShader,
        fragmentShader: terrainFShader2,
        side: THREE.DoubleSide,
        lights: true,
        fog: true,
    });

    planeCustomMat3 = new THREE.ShaderMaterial({
        uniforms: planeMatUniforms,
        vertexShader: vShader,
        fragmentShader: terrainFShader3,
        side: THREE.DoubleSide,
        lights: true,
        fog: true,
    });

    planeAltMat = new THREE.ShaderMaterial({
        uniforms: planeMatUniforms,
        vertexShader: terrainVertexAlt,
        fragmentShader: terrainFShaderAlt,
        side: THREE.DoubleSide,
        lights: true,
        fog: false,
        vertexColors: true,
        wireframe: false,
    });

    customWaterMaterial = new THREE.ShaderMaterial({
        uniforms: planeMatUniforms,
        vertexShader: vShaderWave,
        fragmentShader: customWaterFShader,
        side: THREE.DoubleSide,
        lights: true,
        fog: true,
    });

    customWaterMaterial2 = new THREE.ShaderMaterial({
        uniforms: planeMatUniforms,
        vertexShader: vShaderWave,
        fragmentShader: customWaterFShader2,
        side: THREE.DoubleSide,
        lights: true,
        fog: true,
    });

    customWaterMaterial3 = new THREE.ShaderMaterial({
        uniforms: planeMatUniforms,
        vertexShader: vShaderWave2,
        fragmentShader: customWaterFShader3,
        side: THREE.DoubleSide,
        lights: true,
        fog: true,
    });

    customWaterMaterial4 = new THREE.ShaderMaterial({
        uniforms: planeMatUniforms,
        vertexShader: vShaderWave2,
        fragmentShader: customWaterFShader4,
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

    skyboxMaterial.push(new THREE.MeshBasicMaterial({map: textures.skybox_ft.texture}));
    skyboxMaterial.push(new THREE.MeshBasicMaterial({map: textures.skybox_bk.texture}));
    skyboxMaterial.push(new THREE.MeshBasicMaterial({map: textures.skybox_up.texture}));
    skyboxMaterial.push(new THREE.MeshBasicMaterial({map: textures.skybox_dn.texture}));
    skyboxMaterial.push(new THREE.MeshBasicMaterial({map: textures.skybox_lf.texture}));
    skyboxMaterial.push(new THREE.MeshBasicMaterial({map: textures.skybox_rt.texture}));

    for (let k = 0; k < 6; k++)
        skyboxMaterial[k].side = THREE.BackSide;
}

export {
    createAllMaterials,
    lightIndicatorMaterial,
    squirrelMaterial,
    humanMaterial,
    treeMaterial,
    planeMat,
    planeCustomMat,
    planeCustomMat2,
    planeCustomMat3,
    planeAltMat,
    wallMaterial,
    customWaterMaterial,
    customWaterMaterial2,
    customWaterMaterial3,
    customWaterMaterial4,
    skyboxMaterial
};