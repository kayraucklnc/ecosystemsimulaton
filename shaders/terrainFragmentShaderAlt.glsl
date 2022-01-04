struct PointLight {
    vec3 color;
    vec3 position;
    float distance;
};
#if NUM_POINT_LIGHTS > 0
uniform PointLight pointLights[NUM_POINT_LIGHTS];
#endif

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main() {

    vec4 addedLights = vec4(0.0,
    0.0,
    0.0,
    1.0);

    #if NUM_POINT_LIGHTS > 0
    for (int l = 0; l < NUM_POINT_LIGHTS; l++) {
        vec3 distanceVec = vPosition - pointLights[l].position;
        vec3 lightDirection = normalize(distanceVec);
        float attuanation = 0.0;
        if (float(pointLights[l].distance) >= length(distanceVec)){
            attuanation = pow((1.0 - (length(distanceVec) / float(pointLights[l].distance))), 2.0);
        }

        addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) * (pointLights[l].color * attuanation);
    }
    #endif

    addedLights = max(vec4(0.3), addedLights);
    addedLights = min(vec4(1.5), addedLights);

    gl_FragColor = vec4(0.8, 0.3, 0.3, 1.)*addedLights;
}