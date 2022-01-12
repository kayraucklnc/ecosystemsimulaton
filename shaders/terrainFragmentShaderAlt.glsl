// #version 300 es
precision mediump float;

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

uniform sampler2D perlinMap;

flat in vec4 vColor;
in vec3 vNormal;
in vec3 vPosition;
uniform vec3 color;
in vec2 vUv;
in vec3 vTangent;

in vec3 worldPosition;
in mat3 TBN;

uniform float repeatFactor;
uniform sampler2D groundNormalMap;
uniform sampler2D snowNormalMap;
uniform float maxTerrainHeight;

uniform vec3 fogColor;
uniform float fogDensity;
uniform float u_time;
float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}
void main() {

    vec3 U = dFdx(vPosition);
    vec3 V = dFdy(vPosition);
    vec3 N = normalize(cross(U, V));

    int terrainType;
    vec3 terrainColor;
    float height = float(worldPosition.y) / float(maxTerrainHeight);
    if (height < -0.28) {
        terrainType = 1;
    } else if (height < -0.2) {
        terrainType = 4;
    } else if (height < 0.1) {
        terrainType = 2;
    } else if (height < 0.2) {
        terrainType = 6;
    } else if (height < 0.3) {
        terrainType = 5;
    } else if (height < 0.49) {
        terrainType = 0;
    } else {
        terrainType = 3;
    }

    switch (terrainType) {
        case 0:// Dirt
        terrainColor = vec3(0.21568627451, 0.17254901961, 0.14509803922);
        break;
        case 1:// Sand
        terrainColor = vec3(0.97647058824, 0.84705882353, 0.51764705882);
        break;
        case 2:// Ground
        terrainColor = vec3(0.06666666667, 0.48627450980, 0.07450980392);
        break;
        case 3:// Snow
        terrainColor = vec3(0.87450980392, 0.90980392157, 0.94117647059);
        break;
        case 4:// Light Grass
        terrainColor = vec3(0.38431372549, 0.57647058824, 0.09019607843);
        break;
        case 5:// Dark Mud
        terrainColor = vec3(0.12941176471, 0.12941176471, 0.12941176471);
        break;
        case 6:// Dark Grass
        terrainColor = vec3(0.13333333333, 0.27843137255, 0.14509803922);
        break;
    }

    vec3 norm;

    norm = texture2D(groundNormalMap, vUv * repeatFactor).rgb;
    norm = vec3(1.0 - norm.r, 1.0 - norm.g, norm.b);
    norm = norm * 2.0 - 1.0;
    norm = normalize(TBN * norm);

    vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);


    #if NUM_SPOT_LIGHTS > 0
    for (int l = 0; l < NUM_SPOT_LIGHTS; l++) {
        vec3 distanceVec = vPosition - spotLights[l].position;
        distanceVec = distanceVec * 2.0;
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
    addedLights = min(vec4(1.5), addedLights);

    gl_FragColor.xyz = (gl_FragColor * addedLights).xyz;


    addedLights = max(vec4(0.3), addedLights);
    addedLights = min(vec4(1.5), addedLights);

    gl_FragColor = vec4(terrainColor.rgb, 1.0);
    gl_FragColor.xyz = (gl_FragColor * vColor).xyz;
    gl_FragColor.xyz = (gl_FragColor * addedLights).xyz;
}