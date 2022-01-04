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

uniform vec3 fogColor;
uniform float fogDensity;
uniform float u_time;

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

    #define NUM_OCTAVES 12

float fbm (in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec3 p =  worldPosition;
    //----------- Lights -----------------
    vec3 norm = vNormal;
    vec4 addedLights = vec4(0.0,
    0.0,
    0.0,
    1.0);

    #if NUM_POINT_LIGHTS > 0
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
        #endif

    addedLights = max(vec4(0.3), addedLights);
    addedLights = min(vec4(1), addedLights);
    //----------- Lights -----------------


    //    --------------------- Shader
    p.xz *= 0.6;
    p.y += (sin(u_time*0.1));
    p.y += u_time*0.2;

    vec3 color = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm(p.xz + 1.684*u_time);
    q.y = fbm(p.xz + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm(p.xz + 1.0*q + vec2(1.7, 9.2)+ 0.626*u_time);
    r.y = fbm(p.xz + 1.0*q + vec2(8.3, 2.8)+ 0.626*u_time);

    float f = fbm(p.xz+r);

    color = mix(vec3(0.151, 0.240, 0.667),
    vec3(0.209, 0.328, 0.667),
    clamp((f*f)*4.0, 0.0, 1.0));

    color = mix(color,
    vec3(0.205, 0.391, 0.780),
    clamp(length(q), 0.0, 1.0));

    color = mix(color,
    vec3(0.370, 0.981, 1.000),
    clamp(length(r.x), 0.0, 1.0));

    if (length(color) < 0.4){
        color = mix(color, color + normalize(color) * 0.1, 1.0-length(color));
    }

    gl_FragColor = vec4(color + 0.1, 1.) * addedLights;
    //    --------------------- Shader


    //--------- Fog -------------
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    const float LOG2 = 1.442695;
    float fogNoise = snoise(worldPosition*0.05 + vec3(u_time/1.5, 0, 0)) + 1.0;
    float fogFactor = exp2(- fogDensity * fogDensity * depth * depth * LOG2 * fogNoise);
    fogFactor = (1.0 - clamp(fogFactor, 0.0, 1.0));
    gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);
    //-----------------------
}