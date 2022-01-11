in vec4 tangent;

out vec2 vUv;
out vec3 vNormal;
out vec3 vPosition;
out vec3 vTangent;
out vec3 u_norm;

out vec3 worldPosition;
out mat3 TBN;

out vec3 camPos;

void main() {
    vUv = uv;

    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

    camPos = inverse(viewMatrix)[3].xyz;
    u_norm = (modelMatrix * vec4(normal, 1.0)).xyz;

    // Normal Mapping
    vTangent = tangent.xyz;
    vec3 vBitangent = cross(normal, vTangent);
    TBN = mat3(modelViewMatrix * mat4(mat3(vTangent, vBitangent, normal)));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}