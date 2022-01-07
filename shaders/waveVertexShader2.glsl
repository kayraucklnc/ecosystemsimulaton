precision mediump float;

attribute vec4 tangent;
uniform float u_time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vTangent;

varying vec3 worldPosition;
varying mat3 TBN;

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

vec3 coolShit(vec3 gel){
    float reel = snoise(vec3(gel.x, gel.y, 0.0));

    vec3 anan = vec3(sin(gel.x + reel), sin(gel.y), cos(gel.z));
    vec3 baban = vec3(sin(gel.y), sin(gel.y), cos(gel.z));
    return anan + baban;
}


void main() {
    vUv = uv;
    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    // Normal Mapping
    vTangent = tangent.xyz;
    vec3 vBitangent = cross(normal, vTangent);
    TBN = mat3(modelViewMatrix * mat4(mat3(vTangent, vBitangent, normal)));


    //    ----------- gl_pos ---------------
    float scale = 0.8;
    vec3 color = vec3(0.);

    vec2 phase = vec2(-u_time * 2.0);
    vec3 c = coolShit(vec3((worldPosition.xz + phase)  * scale, u_time*3.0));
    vec3 c2 = coolShit(vec3((worldPosition.xz + 0.0) * scale * 0.02, u_time*3.0));
    c = c + c2;

    c = vec3(length(c.x));
    color = c.x*(0.4 + 0.03*sin(12.0*c.x + u_time * 5.0))*vec3(0.4);


    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(0.0, color.x, 0.0), 1.0);

    vec3 t_normal = (transpose(inverse(mat4(1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, color.x,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1))) * vec4(normal, 1.0)).xyz;

    vNormal = (modelViewMatrix * vec4(t_normal, 0.0)).xyz;
    //    ----------- gl_pos ---------------
}