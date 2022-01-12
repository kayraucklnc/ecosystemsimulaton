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

uniform vec3 fogColor;
uniform float fogDensity;
uniform float u_time;

const float F3 =  0.3333333;
const float G3 =  0.1666667;

vec3 hash(vec3 x){
    x = vec3(dot(x, vec3(127.1, 311.7, 74.7)),
    dot(x, vec3(269.5, 183.3, 246.1)),
    dot(x, vec3(113.5, 271.9, 124.6)));

    return fract(sin(x)*43758.5453123);
}

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

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
    vec2(12.9898, 78.233)))*
    43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
    (c - a)* u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}
float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}
void main() {
    vec3 p =  worldPosition;

    //baslancg
    float time = u_time * 0.2 + 23.0;
    vec2 uv = p.xz * 0.08;

    #ifdef SHOW_TILING
    vec2 pr = mod(uv*6.28318530718*2.0, 6.28318530718)-250.0;
    #else
    vec2 pr = mod(uv*6.28318530718, 6.28318530718)-250.0;
    #endif
    vec2 i = vec2(pr);
    float c = 1.0;
    float inten = 0.005;

    for (int n = 0; n < 5; n++)
    {
        float t = time * (1.0 - (3.5 / float(n+1)));
        i = pr + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0/length(vec2(pr.x / (sin(i.x+t)/inten), pr.y / (cos(i.y+t)/inten)));
    }
    c /= float(5);
    c = 1.17-pow(c, 1.4);
    vec3 clr = vec3(pow(abs(c), 8.0));
    clr = clamp(clr + vec3(0.0, 0.35, 0.5), 0.0, 1.0);

    #ifdef SHOW_TILING
    vec2 pixel = 2.0 / (0.2, 0.2);
    uv *= 2.0;

    float f = floor(mod(u_time * 0.5, 2.0));// Flash value.
    vec2 first = step(pixel, uv) * f;// Rule out first screen pixels and flash.
    uv  = step(fract(uv) * 5.0, pixel) * 0.2;// Add one line of pixels per tile.
    clr = mix(clr, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y);// Yellow line

    #endif
    gl_FragColor = vec4(clr, 1.0);
    //sonucc

    //----------- Lights -----------------
    vec3 norm = vNormal;
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
    //----------- Lights -----------------


    //--------- Fog -------------
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    const float LOG2 = 1.442695;
    float fogNoise = snoise(worldPosition*0.05 + vec3(u_time/1.5, 0, 0)) + 1.0;
    float fogFactor = exp2(- fogDensity * fogDensity * depth * depth * LOG2 * fogNoise);
    fogFactor = (1.0 - clamp(fogFactor, 0.0, 1.0));
    gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);

}

