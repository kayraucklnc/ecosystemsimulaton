precision mediump float;


attribute vec4 tangent;
//attribute vec3 a_color;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vTangent;

varying vec3 worldPosition;
varying mat3 TBN;
flat varying vec4 vColor;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vUv = uv;

    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

    // Normal Mapping
    vTangent = tangent.xyz;
    vec3 vBitangent = cross(normal, vTangent);
    TBN = mat3(modelViewMatrix * mat4(mat3(vTangent, vBitangent, normal)));

    vColor.r = clamp(rand(worldPosition.xy), 0.8, 1.0);
    vColor.g = clamp(rand(worldPosition.xy), 0.8, 1.0);
    vColor.b = clamp(rand(worldPosition.xy), 0.8, 1.0);
    vColor.w = 1.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}