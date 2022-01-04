attribute vec4 tangent;
uniform float v_time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vTangent;

varying vec3 worldPosition;
varying mat3 TBN;

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

void main() {
    vUv = uv;
    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    // Normal Mapping
    vTangent = tangent.xyz;
    vec3 vBitangent = cross(normal, vTangent);
    TBN = mat3(modelViewMatrix * mat4(mat3(vTangent, vBitangent, normal)));


    //    ----------- gl_pos ---------------
    float scale = 0.02;
    vec3 color = vec3(0.);

    vec3 c = voronoi2(vec3(worldPosition.xz * scale, 0));
    c = vec3(length(c.x));

    // isolines
    color = c.x*(0.5 + 0.2*sin(120.0*c.x + v_time * -2.0))*vec3(1.0);

    vec3 offset =  vec3(0.0, sin(color.x)*0.4, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + offset, 1.0);
    //    ----------- gl_pos ---------------
}