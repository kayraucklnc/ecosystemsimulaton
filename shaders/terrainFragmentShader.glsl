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
uniform sampler2D perlinMap;
uniform float maxTerrainHeight;

uniform vec3 fogColor;
uniform float fogDensity;
uniform float u_time;

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 rand3(vec3 co) {
    vec2 newCo = vec2(co.x, co.z);
    return vec3(rand(newCo), rand(newCo * 2.0), rand(newCo * 3.0));
}

//-----------------------
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
float snoise(vec3 p, bool useNewMethod) {

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

    if (useNewMethod) {
        d.x = dot(rand3(s), x);
        d.y = dot(rand3(s + i1), x1);
        d.z = dot(rand3(s + i2), x2);
        d.w = dot(rand3(s + 1.0), x3);
    } else {
        d.x = dot(random3(s), x);
        d.y = dot(random3(s + i1), x1);
        d.z = dot(random3(s + i2), x2);
        d.w = dot(random3(s + 1.0), x3);
    }

    w *= w;
    w *= w;
    d *= w;

    return dot(d, vec4(52.0));
}
//-----------------------

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
    int terrainType;
    vec3 terrainColor;
    float height = float(worldPosition.y) / float(maxTerrainHeight);
    float perlinOne = snoise(vec3(vUv, 1.0) * 150.0, true);
    float perlinTwo = snoise(vec3(vUv, 1.0) * 10.0, true);
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

    norm = texture2D(groundNormalMap, vUv * repeatFactor).rgb;
    norm = vec3(1.0 - norm.r, 1.0 - norm.g, norm.b);
    norm = norm * 2.0 - 1.0;
    norm = normalize(TBN * norm);


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

    gl_FragColor = vec4(terrainColor, 1.);

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
    addedLights = min(vec4(1.2), addedLights);

    gl_FragColor.xyz = (gl_FragColor * addedLights).xyz;

    //--------- Fog -------------
    //    float depth = gl_FragCoord.z / gl_FragCoord.w;
    //
    //    const float LOG2 = 1.442695;
    //    float fogNoise = snoise(worldPosition*0.05 + vec3(u_time/1.5, 0, 0), false) + 1.0;
    //    float fogFactor = exp2(- fogDensity * fogDensity * depth * depth * LOG2 * fogNoise);
    //    fogFactor = (1.0 - clamp(fogFactor, 0.0, 1.0));
    //
    //    gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);
    //-----------------------


}