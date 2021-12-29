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

vec3 hash(vec3 x)
{
    x = vec3(dot(x, vec3(127.1, 311.7, 74.7)),
    dot(x, vec3(269.5, 183.3, 246.1)),
    dot(x, vec3(113.5, 271.9, 124.6)));

    return fract(sin(x)*43758.5453123);
}

vec3 voronoi2(in vec3 x)
{
    vec3 p = floor(x);
    vec3 f = fract(x);

    float id = 0.0;
    vec2 res = vec2(100.0);
    for (int k=-1; k<=1; k++)
    for (int j=-1; j<=1; j++)
    for (int i=-1; i<=1; i++)
    {
        vec3 b = vec3(float(i), float(j), float(k));
        vec3 r = vec3(b) - f + hash(p + b);
        float d = dot(r, r);

        if (d < res.x)
        {
            id = dot(p+b, vec3(1.0, 57.0, 113.0));
            res = vec2(d, res.x);
        }
        else if (d < res.y)
        {
            res.y = d;
        }
    }

    return vec3(sqrt(res), abs(id));
}

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
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

vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))))*43758.5453);
}

vec3 voronoi(in vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);

    // first pass: regular voronoi
    vec2 mg, mr;
    float md = 8.0;
    //    for (int j= -1; j <= 1; j++) {
    //        for (int i= -1; i <= 1; i++) {
    //            vec2 g = vec2(float(i), float(j));
    //            vec2 o = random2(n + g);
    //            o = 0.5 + 0.5*sin(6.2831*o);
    //
    //            vec2 r = g + o - f;
    //            float d = dot(r, r);
    //
    //            if (d<md) {
    //                md = d;
    //                mr = r;
    //                mg = g;
    //            }
    //        }
    //    }

    // second pass: distance to borders
    md = 8.0;
    for (int j= -2; j <= 2; j++) {
        for (int i= -2; i <= 2; i++) {
            vec2 g = mg + vec2(float(i), float(j));
            vec2 o = random2(n + g);
            o = 0.5 + 0.5*sin(u_time + 6.2831*o);

            vec2 r = g + o - f;

            if (dot(mr-r, mr-r)>0.00001) {
                md = min(md, dot(0.5*(mr+r), normalize(r-mr)));
            }
        }
    }
    return vec3(md, mr);
}
//------------------------------

void main() {
    //    vec3 p =  worldPosition + vec3(u_time / 2.0, u_time, 0.0);
    vec3 p =  worldPosition;
    //----------- Lights -----------------
    vec3 norm = vNormal;
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
    //----------- Lights -----------------


    //----------- Voronoi -----------------
    vec3 color = vec3(0.);
    vec3 c = voronoi(p.xz / 2.0);
    float scale = 1.5;
    float scale2 = 0.45;
    float a = snoise(p.xyz / scale) * scale2;
    float b = snoise(p.xyz / scale) * scale2;

    vec3 newVor = voronoi2(vec3(p.xz * 0.4, u_time));
    color = vec3(length(newVor.x));
    float clen = smoothstep(0.0, 1.5, color.x);
    color = mix(vec3(0.347, 0.702, 1.000), vec3(0.645, 0.942, 1.000), clen);
    color = mix(vec3(0.808, 0.911, 1.000), color, smoothstep(0.02 + a, 0.03 + b, c.x));
    gl_FragColor = vec4(color, 1.0) * min(addedLights, 1.0);
    //----------- Voronoi -----------------


    //--------- Fog -------------
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    const float LOG2 = 1.442695;
    float fogNoise = snoise(worldPosition*0.05 + vec3(u_time/1.5, 0, 0)) + 1.0;
    float fogFactor = exp2(- fogDensity * fogDensity * depth * depth * LOG2 * fogNoise);
    fogFactor = (1.0 - clamp(fogFactor, 0.0, 1.0));
    gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);
    //-----------------------
}