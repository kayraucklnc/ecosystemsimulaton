attribute vec4 tangent;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vTangent;

varying vec3 worldPosition;
varying mat3 TBN;
void main() {
    vUv = uv;

    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

    // Normal Mapping
    vTangent = tangent.xyz;
    vec3 vBitangent = cross(normal, vTangent);
    TBN = mat3(modelViewMatrix * mat4(mat3(vTangent, vBitangent, normal)));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}