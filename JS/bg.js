/* OMAN SOUNDS — background shader.
   Raymarched O/S symbol + gyroid (the original brand shader),
   inverted for the dark theme, with glitch slice bursts, scanlines,
   grain and mouse parallax. Self-contained WebGL — no libraries. */

(function () {
  'use strict';

  var canvas = document.getElementById('bg');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { canvas.style.display = 'none'; return; }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var VERT = [
    'attribute vec2 aPos;',
    'void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 iResolution;',
    'uniform float iTime;',
    'uniform vec2 iMouse;',
    '',
    'const int STEPS = 10;',
    '',
    'mat2 Rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }',
    '',
    'float hash(float n){ return fract(sin(n*127.1)*43758.5453); }',
    '',
    '// IQ https://iquilezles.org/',
    'float smin(float d1, float d2, float k){',
    '  float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);',
    '  return mix(d2, d1, h) - k*h*(1.0-h);',
    '}',
    'float Smax(float d1, float d2, float k){',
    '  float h = clamp(0.5 - 0.5*(d2-d1)/k, 0.0, 1.0);',
    '  return mix(d2, d1, h) + k*h*(1.0-h);',
    '}',
    '// HG_SDF https://mercury.sexy/hg_sdf',
    'float fCapsule(vec3 p, float r, float c){',
    '  return mix(length(p.xz)-r, length(vec3(p.x, abs(p.y)-c, p.z))-r, step(c, abs(p.y)));',
    '}',
    'float fTorus(vec3 p, float smallRadius, float largeRadius){',
    '  return length(vec2(length(p.xy)-largeRadius, p.z)) - smallRadius;',
    '}',
    '',
    '// Oman symbol SDF',
    'float OS(vec3 p){',
    '  const float k = -0.5;',
    '  float c = cos(k*p.y), s = sin(k*p.y);',
    '  mat2 m = mat2(c,-s,s,c);',
    '  vec3 q = vec3(m*p.xy, p.z);',
    '  float Capsule = fCapsule(vec3(q.x+0.3, q.y, q.z), 0.13, 0.8);',
    '  float Torus = fTorus(p, 0.18, 1.0);',
    '  return smin(Torus, Capsule, 0.08);',
    '}',
    '',
    'float map(vec3 p){',
    '  float t = iTime*0.5;',
    '  t += sin(iTime*0.7)*0.3 + 0.5;',
    '  vec3 pt = p;',
    '  pt.xz *= Rot(t*0.59 - 1.0);',
    '  pt.xy *= Rot(t*0.62 + 1.0);',
    '  pt.yz *= Rot(t*0.47 - 1.0);',
    '  float symbol = OS(pt);',
    '  vec3 pg = p;',
    '  float sg = 1.3;',
    '  pg.z += t;',
    '  float gyr = abs(dot(sin(pg*sg), cos(pg.zxy*sg)))/sg - 0.6;',
    '  gyr = Smax(gyr, symbol-0.1, 0.2);',
    '  return min(symbol, gyr);',
    '}',
    '',
    'vec3 getNormal(vec3 p){',
    '  vec3 eps = vec3(0.1, 0.0, 0.0);',
    '  return normalize(vec3(map(p+eps.xyy), map(p+eps.yxy), map(p+eps.yyx)));',
    '}',
    '',
    'void main(){',
    '  vec2 uv = (gl_FragCoord.xy*2.0 - iResolution.xy) / iResolution.y;',
    '',
    '  // --- glitch: horizontal slice displacement bursts ---',
    '  float tick = floor(iTime*2.2);',
    '  float burst = step(0.93, hash(tick + 0.37));',
    '  float row = floor(uv.y*22.0);',
    '  float rowRnd = hash(row + tick*7.13);',
    '  float shift = (rowRnd - 0.5) * 0.55 * burst * step(0.72, rowRnd);',
    '  uv.x += shift;',
    '',
    '  vec3 ro = vec3(iMouse*0.25, -1.5);',
    '  vec3 rd = normalize(vec3(uv, 0.8));',
    '  vec3 p = ro;',
    '  float t = 0.0;',
    '  for (int i=0; i<STEPS; i++){',
    '    float d = map(p);',
    '    t += d;',
    '    p += d*rd;',
    '    if (t < 0.001 || t > 500.0) break;',
    '  }',
    '',
    '  vec3 normal = getNormal(p);',
    '  normal *= normal;',
    '  normal = normalize(normal);',
    '  vec3 col = vec3(normal);',
    '',
    '  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.5));',
    '  float diffuse = clamp(dot(normal, lightDir), 0.5, 1.0);',
    '  float spec = clamp(dot(reflect(lightDir, normal), vec3(0.0,0.0,-1.0)), 0.0, 1.0);',
    '  spec = pow(spec, 2.0);',
    '  vec3 lights = vec3(diffuse) + 2.0*spec;',
    '  col = abs(abs(col - vec3(1.0)) - vec3(1.0));',
    '  col = col*(diffuse + 0.65) + vec3(spec);',
    '  col *= lights;',
    '  col = pow(col, vec3(1.0/2.2));',
    '  float g = length(col)/1.8;',
    '',
    '  // --- invert for dark theme: structure glows out of black ---',
    '  float b = 1.0 - clamp(g, 0.0, 1.0);',
    '  b = b*0.9 + 0.02;',
    '',
    '  // cool tint, chromatic tint on glitched rows',
    '  vec3 tint = vec3(0.82, 0.92, 1.0);',
    '  vec3 glitchTint = mix(vec3(0.0, 0.94, 1.0), vec3(1.0, 0.17, 0.82), step(0.5, hash(row+2.7)));',
    '  tint = mix(tint, glitchTint, min(abs(shift)*14.0, 0.85));',
    '  vec3 outCol = b*tint;',
    '',
    '  // scanlines + grain + vignette',
    '  outCol *= 0.94 + 0.06*sin(gl_FragCoord.y*1.7);',
    '  outCol += (hash(dot(gl_FragCoord.xy, vec2(12.9898,78.233)) + fract(iTime)*61.7) - 0.5)*0.05;',
    '  float vig = 1.0 - 0.45*dot(uv*0.55, uv*0.55);',
    '  outCol *= vig;',
    '',
    '  gl_FragColor = vec4(outCol, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.style.display = 'none'; return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = 'none'; return; }
  gl.useProgram(prog);

  // fullscreen triangle
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'iResolution');
  var uTime = gl.getUniformLocation(prog, 'iTime');
  var uMouse = gl.getUniformLocation(prog, 'iMouse');

  // raymarching is per-pixel heavy — render at capped resolution
  function resize() {
    var scale = Math.min(1, 1600 / Math.max(window.innerWidth, 1)) * 0.75;
    canvas.width = Math.max(1, Math.floor(window.innerWidth * scale));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  var mouseX = 0, mouseY = 0, mx = 0, my = 0;
  window.addEventListener('pointermove', function (e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  var running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running && !reducedMotion) requestAnimationFrame(frame);
  });

  var start = performance.now();

  function draw(t) {
    mx += (mouseX - mx) * 0.04;
    my += (mouseY - my) * 0.04;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame() {
    if (!running) return;
    draw((performance.now() - start) / 1000);
    requestAnimationFrame(frame);
  }

  if (reducedMotion) {
    draw(12.0); // single still frame
    window.addEventListener('resize', function () { draw(12.0); });
  } else {
    requestAnimationFrame(frame);
  }
})();
