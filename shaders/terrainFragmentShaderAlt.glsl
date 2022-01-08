precision mediump float;

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
varying vec3 worldPosition;
uniform float maxTerrainHeight;
uniform sampler2D perlinMap;

flat in vec4 vColor;


void main() {

    vec3 U = dFdx(vPosition);
    vec3 V = dFdy(vPosition);
    vec3 N = normalize(cross(U,V));

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


    vec4 addedLights = vec4(0.0,
    0.0,
    0.0,
    1.0);

    vec3 addedLightsDirection;
    #if NUM_POINT_LIGHTS > 0
    for (int l = 0; l < NUM_POINT_LIGHTS; l++) {
        vec3 distanceVec = vPosition - pointLights[l].position;
        vec3 lightDirection = normalize(distanceVec);
        float attuanation = 0.0;
        if (float(pointLights[l].distance) >= length(distanceVec)){
            attuanation = pow((1.0 - (length(distanceVec) / float(pointLights[l].distance))), 2.0);
        }

        addedLights.rgb += clamp(dot(-lightDirection, N), 0.0, 1.0) * (pointLights[l].color * attuanation);
    }
    #endif


    addedLights = max(vec4(0.3), addedLights);
    addedLights = min(vec4(1.5), addedLights);

    gl_FragColor = vec4(terrainColor.rgb, 1.0);
    gl_FragColor.xyz = (gl_FragColor * vColor).xyz;
    gl_FragColor.xyz = (gl_FragColor * addedLights).xyz;
}