
struct SpotLight {
    vec3 color;
    vec3 position;
    float distance;
    vec3 direction;
    float coneCos;
    float penumbraCos;
};

#if NUM_SPOT_LIGHTS > 0
uniform SpotLight spotLights[NUM_SPOT_LIGHTS];
#endif

in vec3 vNormal;
in vec3 vPosition;
uniform vec3 color;
in vec2 vUv;

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
    //----------- Lights -----------------
    vec3 norm = vNormal;
    vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);


    #if NUM_SPOT_LIGHTS > 0
    for (int l = 0; l < NUM_SPOT_LIGHTS; l++) {
        vec3 distanceVec = vPosition - spotLights[l].position;
        float lightDistance = float(spotLights[l].distance);
        vec3 lightDirection = normalize(distanceVec);
        float attuanation = 0.0;
        if (lightDistance >= length(distanceVec)){
            attuanation = pow((1.0 - (length(distanceVec) / lightDistance)), 2.0);
        }

        vec3 surfaceToLightDirection = normalize(distanceVec);
        vec3 u_lightDirection = spotLights[l].direction;
        float dotFromDirection = dot(surfaceToLightDirection, -u_lightDirection);
        if (dotFromDirection >= spotLights[l].coneCos) {
            addedLights.rgb += mix(vec3(0.0, 0.0, 0.0), dot(-lightDirection, norm) * (spotLights[l].color * attuanation), map(dotFromDirection, spotLights[l].coneCos, 1.0, 0.15, 1.0));
        }
    }
        #endif

    addedLights = max(vec4(0.1), addedLights);
    addedLights = min(vec4(1.2), addedLights);

    gl_FragColor = vec4(color, 1.)*addedLights;
}