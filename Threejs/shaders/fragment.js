export default /*glsl*/ `

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPattern;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDisplace;
uniform float uSpread;
uniform float uNoise;

#define PI 3.14159265358979
#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3) {
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

// ? Perlin noise
float pnoise(vec3 p) {
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    vec3 w = pf * pf * (3. - 2.0 * pf);
    return 	mix(
        		mix(
                	mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))),
                        dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                       	w.x),
                	mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))),
                        dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                       	w.x),
                	w.z),
        		mix(
                    mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))),
                        dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                       	w.x),
                   	mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))),
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                       	w.x),
                	w.z),
    			w.y);
}

void main() {
  float uDisplace = 0.0;
  float uSpread = 0.0;
  float uNoise = 0.0; 

  vec3 a, q, p, gradient, dir;
  float b, dist;
  dir = normalize(vPosition);  // Normalize direction vector for raymarching
  p = vec3(0., 0., -7.);  // Initial point for raymarching

  vec3 raymarchColor = (dir + 1.0) * 0.5;  // Adjust raymarch color to a 0-1 range
  raymarchColor *= pnoise(raymarchColor * 2.0 + uTime * 0.3) * 2.0;  // Apply noise effect

  // Pattern generation using Perlin noise and UV coordinates
  float pat = pnoise(vec3(vUv * uNoise, sin(uTime) * 1.4)) * uDisplace;
  float proximity = abs(vUv.x - (.5 + sin(uTime) / (12.0 * uSpread)));

  vec3 full = pat * vec3(clamp(0.23 * uSpread - proximity, 0.0, 1.0));
  vec3 newPosition = vPosition + vNormal * full; 

  vec3 patternColor = vec3(0.3, cos(uTime * 0.5) * 0.5 + 0.5, sin(uTime * 0.5) * 0.5 + 0.5) / vec3(0.1);
  vec3 finalColor = -vec3(pnoise(vec3(1.0 - newPosition.z * 100.0 + uTime)) * 80.0) * (0.01 - full) * patternColor;

  // Combine raymarch and pattern effects
  vec3 color = mix(raymarchColor, finalColor, 0.5);  // Mix both effects with 50% blend
  gl_FragColor = vec4(color, 1.0);  // Set final fragment color
}





/*


void main() {

  float uDisplace = 1.4;
  float uSpread = 1.1;
  float uNoise = 10.; 

  //float noise = pnoise(vec3(vPosition.z * 50.0));
  //vec3 color = vec3(noise) * vec3(0.3, cos(uTime * 0.5) * 0.5 + 0.5, sin(uTime * 0.5) * 0.5 + 0.5);
  //vec3 purpleColor = vec3(0.498, 0.2039, 0.8314) / vec3(0.4941, 0.4941, 0.051);

  float pat = pnoise(vec3(vUv * uNoise , sin(uTime) * 1.4 )) * uDisplace ;
  float proximity = abs(vUv.x - (.5 + sin(uTime)/(12. * uSpread ) ));


  vec3 full = pat * vec3(clamp(.23 * uSpread  - proximity , 0., 1.));
  vec3 newPosition = vPosition + vNormal * full; 
  vec3 col = vec3(0.3, cos(uTime * 0.5) * 0.5 + 0.5, sin(uTime * 0.5) * 0.5 + 0.5) / vec3(0.1);
  vec3 color = -vec3(pnoise(vec3(1. - newPosition.z * 35.))*40.) * (.01 -full) * col;
  gl_FragColor = vec4(color , 1.0);
}
  */
`;