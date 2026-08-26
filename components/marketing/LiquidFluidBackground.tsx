"use client";

import { useEffect, useRef } from "react";

// Ported from the Framer component at framer.com/m/Liquid-Fluid — the
// classic WebGL Navier-Stokes fluid simulation (advection, curl/vorticity,
// pressure projection, splat) with bloom and sunrays, stripped of the
// Framer property controls, keyboard shortcuts/toast UI, and window-level
// pointer listeners (which fired sim splats on every mousemove anywhere on
// the page, not just over the effect). Rescoped to the section it lives in:
// pointer tracking only fires within that section, and the sim pauses via
// IntersectionObserver while scrolled out of view, since this is meant to
// sit behind one section's content, not run full-tilt for the page's whole
// lifetime like the original always did.

const BRAND_COLORS = [
  { r: 0x43 / 255, g: 0x3d / 255, b: 0xdd / 255 },
  { r: 0x7e / 255, g: 0x2a / 255, b: 0xc0 / 255 },
  { r: 0xe2 / 255, g: 0x09 / 255, b: 0x8c / 255 },
];
const BRAND_INTENSITY = 0.18;

const SIM_RESOLUTION = 64;
const DYE_RESOLUTION = 512;
const DENSITY_DISSIPATION = 1.6;
const VELOCITY_DISSIPATION = 1.47;
const PRESSURE = 0.42;
const PRESSURE_ITERATIONS = 8;
const CURL = 11;
const SPLAT_RADIUS = 0.14;
const SPLAT_FORCE = 6000;
const BLOOM_ITERATIONS = 6;
const BLOOM_RESOLUTION = 256;
const BLOOM_INTENSITY = 0.47;
const BLOOM_THRESHOLD = 0.22;
const BLOOM_SOFT_KNEE = 0.7;
const SUNRAYS_RESOLUTION = 196;
const SUNRAYS_WEIGHT = 0.5;
const AUTOPLAY_INTERVAL_MS = 3200;
const AUTOPLAY_COUNT = 4;

function generateColor() {
  const c = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
  return { r: c.r * BRAND_INTENSITY, g: c.g * BRAND_INTENSITY, b: c.b * BRAND_INTENSITY };
}

export function LiquidFluidBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function getWebGLContext(canvas: HTMLCanvasElement) {
      const params: WebGLContextAttributes = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
      let gl = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
      const isWebGL2 = !!gl;
      if (!isWebGL2) {
        gl = (canvas.getContext("webgl", params) || canvas.getContext("experimental-webgl", params)) as WebGL2RenderingContext | null;
      }
      if (!gl) return null;
      let halfFloat: OES_texture_half_float | null = null;
      let supportLinearFiltering;
      if (isWebGL2) {
        gl.getExtension("EXT_color_buffer_float");
        supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
      } else {
        halfFloat = gl.getExtension("OES_texture_half_float");
        supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
      }
      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;

      function supportRenderTextureFormat(internalFormat: number, format: number, type: number) {
        const texture = gl!.createTexture();
        gl!.bindTexture(gl!.TEXTURE_2D, texture);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
        const fbo = gl!.createFramebuffer();
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
        gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
        return gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) === gl!.FRAMEBUFFER_COMPLETE;
      }
      function getSupportedFormat(internalFormat: number, format: number, type: number): { internalFormat: number; format: number } | null {
        if (!supportRenderTextureFormat(internalFormat, format, type)) {
          if (internalFormat === (gl as WebGL2RenderingContext).R16F) return getSupportedFormat((gl as WebGL2RenderingContext).RG16F, (gl as WebGL2RenderingContext).RG, type);
          if (internalFormat === (gl as WebGL2RenderingContext).RG16F) return getSupportedFormat((gl as WebGL2RenderingContext).RGBA16F, gl!.RGBA, type);
          return null;
        }
        return { internalFormat, format };
      }
      let formatRGBA, formatRG, formatR;
      if (isWebGL2) {
        const gl2 = gl as WebGL2RenderingContext;
        formatRGBA = getSupportedFormat(gl2.RGBA16F, gl2.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl2.RG16F, gl2.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl2.R16F, gl2.RED, halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
      }
      if (!formatRGBA) return null;
      if (!formatRG) formatRG = formatRGBA;
      if (!formatR) formatR = formatRGBA;
      return { gl, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } };
    }

    const ctx = getWebGLContext(canvas);
    if (!ctx) {
      console.error("LiquidFluid: getWebGLContext returned null");
      return;
    }
    const { gl, ext } = ctx;
    const linearFiltering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    const baseVertexShader = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`;
    const simpleVertexShader = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`;
    const clearShader = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;
    const colorShader = `
      precision mediump float;
      uniform vec4 color;
      void main () { gl_FragColor = color; }`;
    const displayShaderSource = `
      precision highp float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uTexture, uBloom, uSunrays, uDithering;
      uniform vec2 ditherScale, texelSize;
      vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        float diffuse = clamp(dot(n, vec3(0.0, 0.0, 1.0)) + 0.7, 0.7, 1.0);
        c *= diffuse;
        #endif
        #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
        #endif
        #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
        #ifdef BLOOM
        bloom *= sunrays;
        #endif
        #endif
        #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
        #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }`;
    const bloomPrefilterShader = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform vec3 curve;
      uniform float threshold;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
      }`;
    const bloomBlurShader = `
      precision mediump float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uTexture;
      void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        gl_FragColor = sum * 0.25;
      }`;
    const bloomFinalShader = `
      precision mediump float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uTexture;
      uniform float intensity;
      void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        gl_FragColor = sum * 0.25 * intensity;
      }`;
    const sunraysMaskShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
      }`;
    const sunraysShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float weight;
      #define ITERATIONS 16
      void main () {
        float Density = 0.3, Decay = 0.95, Exposure = 0.7;
        vec2 coord = vUv;
        vec2 dir = (vUv - 0.5) * (1.0 / float(ITERATIONS)) * Density;
        float illuminationDecay = 1.0;
        float color = texture2D(uTexture, vUv).a;
        for (int i = 0; i < ITERATIONS; i++) {
          coord -= dir;
          color += texture2D(uTexture, coord).a * illuminationDecay * weight;
          illuminationDecay *= Decay;
        }
        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
      }`;
    const splatShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio, radius;
      uniform vec3 color;
      uniform vec2 point;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
      }`;
    const advectionShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity, uSource;
      uniform vec2 texelSize, dyeTexelSize;
      uniform float dt, dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        gl_FragColor = bilerp(uSource, coord, dyeTexelSize) / (1.0 + dissipation * dt);
      }`;
    const divergenceShader = `
      precision mediump float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) L = -C.x;
        if (vR.x > 1.0) R = -C.x;
        if (vT.y > 1.0) T = -C.y;
        if (vB.y < 0.0) B = -C.y;
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }`;
    const curlShader = `
      precision mediump float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }`;
    const vorticityShader = `
      precision highp float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity, uCurl;
      uniform float curl, dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force = force / (length(force) + 0.0001) * curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
        gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
      }`;
    const pressureShader = `
      precision mediump float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure, uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
      }`;
    const gradientSubtractShader = `
      precision mediump float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure, uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`;

    function compileShader(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error("LiquidFluid shader compile error:", gl!.getShaderInfoLog(shader));
      }
      return shader;
    }
    function createProgram(vertSrc: string, fragSrc: string) {
      const program = gl!.createProgram()!;
      gl!.attachShader(program, compileShader(gl!.VERTEX_SHADER, vertSrc));
      gl!.attachShader(program, compileShader(gl!.FRAGMENT_SHADER, fragSrc));
      gl!.linkProgram(program);
      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
        console.error("LiquidFluid program link error:", gl!.getProgramInfoLog(program));
      }
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = gl!.getActiveUniform(program, i)!;
        uniforms[info.name] = gl!.getUniformLocation(program, info.name);
      }
      return {
        program,
        uniforms,
        bind() {
          gl!.useProgram(this.program);
        },
      };
    }
    function createDisplayProgram(keywords: string[]) {
      const src = keywords.map((k) => `#define ${k}\n`).join("") + displayShaderSource;
      return createProgram(baseVertexShader, src);
    }

    const programs = {
      clear: createProgram(simpleVertexShader, clearShader),
      color: createProgram(simpleVertexShader, colorShader),
      display: createDisplayProgram(["SHADING", "BLOOM", "SUNRAYS"]),
      bloomPrefilter: createProgram(simpleVertexShader, bloomPrefilterShader),
      bloomBlur: createProgram(baseVertexShader, bloomBlurShader),
      bloomFinal: createProgram(baseVertexShader, bloomFinalShader),
      sunraysMask: createProgram(simpleVertexShader, sunraysMaskShader),
      sunrays: createProgram(simpleVertexShader, sunraysShader),
      splat: createProgram(simpleVertexShader, splatShader),
      advection: createProgram(simpleVertexShader, advectionShader),
      divergence: createProgram(baseVertexShader, divergenceShader),
      curl: createProgram(baseVertexShader, curlShader),
      vorticity: createProgram(baseVertexShader, vorticityShader),
      pressure: createProgram(baseVertexShader, pressureShader),
      gradientSubtract: createProgram(baseVertexShader, gradientSubtractShader),
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    type FBO = { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number; texelSizeX: number; texelSizeY: number; attach(id: number): number };
    function blit(target: FBO | null) {
      if (target == null) {
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      } else {
        gl!.viewport(0, 0, target.width, target.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
      }
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    }
    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
      gl!.activeTexture(gl!.TEXTURE0);
      const texture = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
      gl!.viewport(0, 0, w, h);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      return {
        texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          return id;
        },
      };
    }
    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
        get read() { return fbo1; }, set read(v: FBO) { fbo1 = v; },
        get write() { return fbo2; }, set write(v: FBO) { fbo2 = v; },
        swap() { [fbo1, fbo2] = [fbo2, fbo1]; },
      };
    }

    const ditheringTexture = (() => {
      const bayer = [0,48,12,60,3,51,15,63,32,16,44,28,35,19,47,31,8,56,4,52,11,59,7,55,40,24,36,20,43,27,39,23,2,50,14,62,1,49,13,61,34,18,46,30,33,17,45,29,10,58,6,54,9,57,5,53,42,26,38,22,41,25,37,21];
      const data = new Uint8Array(64 * 3);
      for (let i = 0; i < 64; i++) {
        const v1 = Math.floor((bayer[i] / 64) * 255);
        data[i * 3] = data[i * 3 + 1] = data[i * 3 + 2] = v1;
      }
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 8, 8, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
      return { texture, width: 8, height: 8, attach(id: number) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; } };
    })();

    canvas.width = canvas.offsetWidth || 800;
    canvas.height = canvas.offsetHeight || 600;
    function getResolution(resolution: number) {
      let ar = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
      if (ar < 1) ar = 1 / ar;
      const min = Math.round(resolution);
      const max = Math.round(resolution * ar);
      return gl!.drawingBufferWidth > gl!.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
    }
    const simRes = getResolution(SIM_RESOLUTION);
    const dyeRes = getResolution(DYE_RESOLUTION);
    const bloomRes = getResolution(BLOOM_RESOLUTION);
    const sunRes = getResolution(SUNRAYS_RESOLUTION);
    const { formatRGBA, formatRG, formatR, halfFloatTexType } = ext;
    const dye = createDoubleFBO(dyeRes.width, dyeRes.height, formatRGBA!.internalFormat, formatRGBA!.format, halfFloatTexType, linearFiltering);
    const velocity = createDoubleFBO(simRes.width, simRes.height, formatRG!.internalFormat, formatRG!.format, halfFloatTexType, linearFiltering);
    const divergence = createFBO(simRes.width, simRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl.NEAREST);
    const curl = createFBO(simRes.width, simRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl.NEAREST);
    const pressure = createDoubleFBO(simRes.width, simRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl.NEAREST);
    const bloomFramebuffers: FBO[] = [];
    for (let i = 0; i < BLOOM_ITERATIONS; i++) {
      const w = bloomRes.width >> i;
      const h = bloomRes.height >> i;
      if (w < 2 || h < 2) break;
      bloomFramebuffers.push(createFBO(w, h, formatRGBA!.internalFormat, formatRGBA!.format, halfFloatTexType, linearFiltering));
    }
    const bloomOutput = createFBO(bloomRes.width, bloomRes.height, formatRGBA!.internalFormat, formatRGBA!.format, halfFloatTexType, linearFiltering);
    const sunraysTemp = createFBO(sunRes.width, sunRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, linearFiltering);
    const sunrays = createFBO(sunRes.width, sunRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, linearFiltering);

    let currentFluidColor = generateColor();
    let inactivityTimer: ReturnType<typeof setTimeout> | undefined;
    const INACTIVITY_DELAY = 2000;

    type Pointer = { id: number; texcoordX: number; texcoordY: number; prevTexcoordX: number; prevTexcoordY: number; deltaX: number; deltaY: number; down: boolean; moved: boolean; color: { r: number; g: number; b: number } };
    const pointers: Pointer[] = [{ id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, down: false, moved: false, color: currentFluidColor }];

    function correctRadius(r: number) {
      const ar = canvas!.width / canvas!.height;
      return ar > 1 ? r * ar : r;
    }
    function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
      const p = programs.splat;
      p.bind();
      gl!.uniform1i(p.uniforms.uTarget, velocity.read.attach(0));
      gl!.uniform1f(p.uniforms.aspectRatio, canvas!.width / canvas!.height);
      gl!.uniform2f(p.uniforms.point, x, y);
      gl!.uniform3f(p.uniforms.color, dx, dy, 0);
      gl!.uniform1f(p.uniforms.radius, correctRadius(SPLAT_RADIUS / 100));
      blit(velocity.write);
      velocity.swap();
      gl!.uniform1i(p.uniforms.uTarget, dye.read.attach(0));
      gl!.uniform3f(p.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }
    function splatPointer(pointer: Pointer) {
      splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX * SPLAT_FORCE, pointer.deltaY * SPLAT_FORCE, pointer.color);
    }

    let visible = false;
    let autoplayTimer: ReturnType<typeof setInterval> | undefined;
    function scheduleAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => {
        if (!visible) return;
        for (let i = 0; i < AUTOPLAY_COUNT; i++) {
          const color = generateColor();
          color.r *= 10; color.g *= 10; color.b *= 10;
          splat(Math.random(), Math.random(), 800 * (Math.random() - 0.5), 800 * (Math.random() - 0.5), color);
        }
      }, AUTOPLAY_INTERVAL_MS);
    }

    function multipleSplats(amount: number) {
      for (let i = 0; i < amount; i++) {
        const color = generateColor();
        color.r *= 10; color.g *= 10; color.b *= 10;
        splat(Math.random(), Math.random(), 1000 * (Math.random() - 0.5), 1000 * (Math.random() - 0.5), color);
      }
    }
    multipleSplats(6);
    scheduleAutoplay();

    function step(dt: number) {
      gl!.disable(gl!.BLEND);
      programs.curl.bind();
      gl!.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);
      programs.vorticity.bind();
      gl!.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1));
      gl!.uniform1f(programs.vorticity.uniforms.curl, CURL);
      gl!.uniform1f(programs.vorticity.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();
      programs.divergence.bind();
      gl!.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);
      programs.clear.bind();
      gl!.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0));
      gl!.uniform1f(programs.clear.uniforms.value, PRESSURE);
      blit(pressure.write);
      pressure.swap();
      programs.pressure.bind();
      gl!.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }
      programs.gradientSubtract.bind();
      gl!.uniform2f(programs.gradientSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach(0));
      gl!.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();
      programs.advection.bind();
      gl!.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform2f(programs.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(programs.advection.uniforms.uSource, velocity.read.attach(0));
      gl!.uniform1f(programs.advection.uniforms.dt, dt);
      gl!.uniform1f(programs.advection.uniforms.dissipation, VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();
      gl!.uniform2f(programs.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      gl!.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1));
      gl!.uniform1f(programs.advection.uniforms.dissipation, DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function applyBloom(source: FBO) {
      if (bloomFramebuffers.length < 2) return;
      gl!.disable(gl!.BLEND);
      const knee = BLOOM_THRESHOLD * BLOOM_SOFT_KNEE + 0.0001;
      programs.bloomPrefilter.bind();
      gl!.uniform3f(programs.bloomPrefilter.uniforms.curve, BLOOM_THRESHOLD - knee, knee * 2, 0.25 / knee);
      gl!.uniform1f(programs.bloomPrefilter.uniforms.threshold, BLOOM_THRESHOLD);
      gl!.uniform1i(programs.bloomPrefilter.uniforms.uTexture, source.attach(0));
      blit(bloomFramebuffers[0]);
      programs.bloomBlur.bind();
      let last = bloomFramebuffers[0];
      for (let i = 1; i < bloomFramebuffers.length; i++) {
        gl!.uniform2f(programs.bloomBlur.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl!.uniform1i(programs.bloomBlur.uniforms.uTexture, last.attach(0));
        blit(bloomFramebuffers[i]);
        last = bloomFramebuffers[i];
      }
      gl!.blendFunc(gl!.ONE, gl!.ONE);
      gl!.enable(gl!.BLEND);
      for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
        gl!.uniform2f(programs.bloomBlur.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl!.uniform1i(programs.bloomBlur.uniforms.uTexture, last.attach(0));
        gl!.viewport(0, 0, bloomFramebuffers[i].width, bloomFramebuffers[i].height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, bloomFramebuffers[i].fbo);
        gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
        last = bloomFramebuffers[i];
      }
      gl!.disable(gl!.BLEND);
      programs.bloomFinal.bind();
      gl!.uniform2f(programs.bloomFinal.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
      gl!.uniform1i(programs.bloomFinal.uniforms.uTexture, last.attach(0));
      gl!.uniform1f(programs.bloomFinal.uniforms.intensity, BLOOM_INTENSITY);
      blit(bloomOutput);
    }
    function blur(target: FBO, temp: FBO, iterations: number) {
      programs.bloomBlur.bind();
      for (let i = 0; i < iterations; i++) {
        gl!.uniform2f(programs.bloomBlur.uniforms.texelSize, 1 / target.width, 1 / target.height);
        gl!.uniform1i(programs.bloomBlur.uniforms.uTexture, target.attach(0));
        blit(temp);
        gl!.uniform2f(programs.bloomBlur.uniforms.texelSize, 1 / temp.width, 1 / temp.height);
        gl!.uniform1i(programs.bloomBlur.uniforms.uTexture, temp.attach(0));
        blit(target);
      }
    }
    function applySunrays(source: FBO, mask: FBO, destination: FBO) {
      gl!.disable(gl!.BLEND);
      programs.sunraysMask.bind();
      gl!.uniform1i(programs.sunraysMask.uniforms.uTexture, source.attach(0));
      blit(mask);
      programs.sunrays.bind();
      gl!.uniform1f(programs.sunrays.uniforms.weight, SUNRAYS_WEIGHT);
      gl!.uniform1i(programs.sunrays.uniforms.uTexture, mask.attach(0));
      blit(destination);
      blur(destination, mask, 1);
    }

    function render(target: FBO | null) {
      applyBloom(dye.read);
      applySunrays(dye.read, sunraysTemp, sunrays);
      // Transparent clear rather than the original's opaque black fill —
      // this sits over the section's own CSS gradient background, so only
      // the fluid's own dye should paint, not a black rectangle behind it.
      if (target == null) {
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      } else {
        gl!.viewport(0, 0, target.width, target.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
      }
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.disable(gl!.BLEND);
      gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.enable(gl!.BLEND);
      const prog = programs.display;
      prog.bind();
      gl!.uniform2f(prog.uniforms.texelSize, 1 / gl!.drawingBufferWidth, 1 / gl!.drawingBufferHeight);
      gl!.uniform1i(prog.uniforms.uTexture, dye.read.attach(0));
      gl!.uniform1i(prog.uniforms.uBloom, bloomOutput.attach(1));
      gl!.uniform1i(prog.uniforms.uDithering, ditheringTexture.attach(2));
      gl!.uniform2f(prog.uniforms.ditherScale, gl!.drawingBufferWidth / ditheringTexture.width, gl!.drawingBufferHeight / ditheringTexture.height);
      gl!.uniform1i(prog.uniforms.uSunrays, sunrays.attach(3));
      blit(target);
    }

    function updatePointerDownData(pointer: Pointer, id: number, posX: number, posY: number) {
      pointer.id = id;
      pointer.down = true;
      pointer.moved = false;
      pointer.texcoordX = posX / canvas!.width;
      pointer.texcoordY = 1 - posY / canvas!.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0;
      pointer.deltaY = 0;
      pointer.color = generateColor();
    }
    function updatePointerMoveData(pointer: Pointer, posX: number, posY: number) {
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas!.width;
      pointer.texcoordY = 1 - posY / canvas!.height;
      const ar = canvas!.width / canvas!.height;
      pointer.deltaX = (pointer.texcoordX - pointer.prevTexcoordX) * (ar < 1 ? ar : 1);
      pointer.deltaY = (pointer.texcoordY - pointer.prevTexcoordY) / (ar > 1 ? ar : 1);
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    }

    const host = canvas.parentElement!;
    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const pointer = pointers[0];
      pointer.color = currentFluidColor;
      updatePointerMoveData(pointer, e.clientX - rect.left, e.clientY - rect.top);
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        currentFluidColor = generateColor();
        pointer.color = currentFluidColor;
      }, INACTIVITY_DELAY);
    }
    function onPointerDown(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      updatePointerDownData(pointers[0], -1, e.clientX - rect.left, e.clientY - rect.top);
    }
    function onPointerUp() {
      pointers[0].down = false;
    }
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointerleave", () => {
      currentFluidColor = generateColor();
      pointers[0].color = currentFluidColor;
    });

    let lastUpdateTime = Date.now();
    let animId = 0;
    function calcDeltaTime() {
      const now = Date.now();
      const dt = Math.min((now - lastUpdateTime) / 1000, 0.016666);
      lastUpdateTime = now;
      return dt;
    }
    function applyInputs() {
      pointers.forEach((p) => {
        if (p.moved) {
          p.moved = false;
          splatPointer(p);
        }
      });
    }
    function update() {
      if (visible) {
        const dt = calcDeltaTime();
        applyInputs();
        step(dt);
        render(null);
      } else {
        lastUpdateTime = Date.now();
      }
      animId = requestAnimationFrame(update);
    }
    update();

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
    };
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
    });
    intersectionObserver.observe(host);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(inactivityTimer);
      clearInterval(autoplayTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      gl!.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
