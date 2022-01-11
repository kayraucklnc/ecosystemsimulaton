// #version 300 es
precision mediump float;

in vec4 tangent;

out vec2 vUv;
out vec3 vNormal;
out vec3 vPosition;
out vec3 vTangent;

out vec3 worldPosition;
out mat3 TBN;
flat out vec4 vColor;

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