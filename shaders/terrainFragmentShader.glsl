
precision mediump float;

struct PointLight {
    vec3 color;
    vec3 position;
    float distance;
};
uniform PointLight pointLights[NUM_POINT_LIGHTS];

varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 color;
varying vec2 vUv;
varying vec3 vTangent;

varying vec3 worldPosition;
varying mat3 TBN;

uniform float repeatFactor;
uniform sampler2D groundNormalMap;
uniform sampler2D snowNormalMap;
uniform sampler2D perlinMap;
uniform float maxTerrainHeight;

uniform vec3 fogColor;
uniform float fogDensity;
uniform float u_time;

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

//-----------------------
//    SAFA AL SANA RANDOM LIBRARY BABYSU
vec3 random3(vec3 c) {
    float j = 4096.0*sin(dot(c, vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0*j);
    j *= .125;
    r.x = fract(512.0*j);
    j *= .125;
    r.y = fract(512.0*j);
    return r-0.5;
}

const float F3 =  0.3333333;
const float G3 =  0.1666667;
float snoise(vec3 p) {

    vec3 s = floor(p + dot(p, vec3(F3)));
    vec3 x = p - s + dot(s, vec3(G3));

    vec3 e = step(vec3(0.0), x - x.yzx);
    vec3 i1 = e*(1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy*(1.0 - e);

    vec3 x1 = x - i1 + G3;
    vec3 x2 = x - i2 + 2.0*G3;
    vec3 x3 = x - 1.0 + 3.0*G3;

    vec4 w, d;

    w.x = dot(x, x);
    w.y = dot(x1, x1);
    w.z = dot(x2, x2);
    w.w = dot(x3, x3);

    w = max(0.6 - w, 0.0);

    d.x = dot(random3(s), x);
    d.y = dot(random3(s + i1), x1);
    d.z = dot(random3(s + i2), x2);
    d.w = dot(random3(s + 1.0), x3);

    w *= w;
    w *= w;
    d *= w;

    return dot(d, vec4(52.0));
}
//-----------------------

void main() {
    int terrainType;
    vec3 terrainColor;
    float height = float(worldPosition.y) / float(maxTerrainHeight);
    float perlinOne = (snoise(vec3(vUv, 1.0) * 150.0));
    float perlinTwo = (snoise(vec3(vUv, 1.0) * 10.0));
    float heightWithRandMinor = height - perlinOne * 0.05;
    float heightWithRandMajor = heightWithRandMinor - perlinTwo * 0.3;
    if (heightWithRandMinor < -0.28) {
        terrainType = 1;
    } else if (heightWithRandMajor < -0.2) {
        terrainType = 4;
    } else if (heightWithRandMajor < 0.1) {
        terrainType = 2;
    } else if (heightWithRandMajor < 0.2) {
        terrainType = 6;
    } else if (heightWithRandMajor < 0.3) {
        terrainType = 5;
    } else if (heightWithRandMajor < 0.49) {
        terrainType = 0;
    } else {
        terrainType = 3;
    }

    vec3 norm;
    /*if (terrainType == 3) {
        norm = texture2D(snowNormalMap, vUv * 5.0).rgb;
    } else {
        norm = texture2D(groundNormalMap, vUv * repeatFactor).rgb;
    }*/

    norm = texture2D(groundNormalMap, vUv * repeatFactor).rgb;
    norm = vec3(1.0 - norm.r, 1.0 - norm.g, norm.b);
    norm = norm * 2.0 - 1.0;
    norm = normalize(TBN * norm);


//    float perlin = snoise(vec3(vUv, 1.0) * 20.0) + 0.5;
//    float perlintwox = snoise(vec3(vUv, 1.0) * 200.0) + 0.5;
//    float result = perlin + perlintwox / 5.0;
//    if (heightWithRand < 0.4 && result < 0.25) { // Dirt
//        terrainType = 0;
//    }

    switch (terrainType) {
        case 0: // Dirt
            terrainColor = vec3(0.21568627451, 0.17254901961, 0.14509803922);
            break;
        case 1:  // Sand
            terrainColor = vec3(0.97647058824, 0.84705882353, 0.51764705882);
            break;
        case 2:  // Ground
            terrainColor = vec3(0.06666666667, 0.48627450980, 0.07450980392);
            break;
        case 3: // Snow
            terrainColor = vec3(0.87450980392, 0.90980392157, 0.94117647059);
            break;
        case 4: // Light Grass
            terrainColor = vec3(0.38431372549, 0.57647058824, 0.09019607843);
            break;
        case 5: // Dark Mud
            terrainColor = vec3(0.12941176471, 0.12941176471, 0.12941176471);
            break;
        case 6: // Dark Grass
            terrainColor = vec3(0.13333333333, 0.27843137255, 0.14509803922);
            break;
    }

    vec4 addedLights = vec4(0.0,
    0.0,
    0.0,
    1.0);
    for (int l = 0; l < NUM_POINT_LIGHTS; l++) {
        vec3 distanceVec = vPosition - pointLights[l].position;
        distanceVec = distanceVec * 2.0;
        float lightDistance = float(pointLights[l].distance);
        vec3 lightDirection = normalize(distanceVec);
        float attuanation = 0.0;
        if (lightDistance >= length(distanceVec)){
            attuanation = pow((1.0 - (length(distanceVec) / lightDistance)), 2.0);
        }

        addedLights.rgb += clamp(dot(-lightDirection, norm), 0.0, 1.0) * (pointLights[l].color * attuanation);
    }
    addedLights = max(vec4(0.3), addedLights);
    addedLights = min(vec4(1.5), addedLights);

    gl_FragColor = vec4(terrainColor, 1.) * addedLights;


    //--------- Fog -------------
    float depth = gl_FragCoord.z / gl_FragCoord.w;

    const float LOG2 = 1.442695;
    float fogNoise = snoise(worldPosition*0.05 + vec3(u_time/1.5,0,0)) + 1.0;
    float fogFactor = exp2(- fogDensity * fogDensity * depth * depth * LOG2 * fogNoise);
    fogFactor = (1.0 - clamp(fogFactor, 0.0, 1.0));

    gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);

    //-----------------------
}