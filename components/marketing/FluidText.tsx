"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Ported from the Framer WebGL component at framer.com/m/FluidImage — same
// shader (curl-noise flow field + cursor trail + domain-warped gradient
// overlay), but re-purposed to run over a text texture we render ourselves
// (canvas 2D, in the site's own heading font) instead of a photo, so it can
// stand in for a plain <h1> as an interactive "liquid" headline.

const TRAIL_LENGTH = 12;
const NOISE_SIZE = 256;

const BLUE: [number, number, number] = [0x43 / 255, 0x3d / 255, 0xdd / 255];
const VIOLET: [number, number, number] = [0x7e / 255, 0x2a / 255, 0xc0 / 255];
const PINK: [number, number, number] = [0xe2 / 255, 0x09 / 255, 0x8c / 255];
const EFFECT_COLORS: [number, number, number][] = [BLUE, VIOLET, PINK, VIOLET];

const RADIUS = 0.4;
const STRENGTH = 0.9;
const DISTORTION = 0.45;
const HUE_SHIFT = 0.5;
const COLOR_CYCLE = 0.05;
const SPEED = 0.4;
const PERSISTENCE = 0.97;
const POINTER_SMOOTH = 0.08;
const MAX_DPR = 2;

function generateNoiseTexture(): Uint8Array {
  const size = NOISE_SIZE;
  const data = new Uint8Array(size * size * 4);
  let seed = 48271;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const angle = rand() * Math.PI * 2;
      data[idx] = ((Math.cos(angle) * 0.5 + 0.5) * 255) | 0;
      data[idx + 1] = ((Math.sin(angle) * 0.5 + 0.5) * 255) | 0;
      data[idx + 2] = (rand() * 255) | 0;
      data[idx + 3] = 255;
    }
  }
  return data;
}

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uNoiseTex;
uniform vec3 uEffectColor1;
uniform vec3 uEffectColor2;
uniform vec3 uEffectColor3;
uniform vec3 uEffectColor4;
uniform float uRadius;
uniform float uStrength;
uniform float uSpeed;
uniform float uDistortion;
uniform float uHueShift;
uniform float uColorCycle;
uniform vec2 uTrail[${TRAIL_LENGTH}];
uniform vec2 uTrailVelocities[${TRAIL_LENGTH}];
uniform float uTrailStrengths[${TRAIL_LENGTH}];
uniform float uBurst;
uniform vec2 uBurstPos;

vec4 sampleImageTexture(vec2 uv) {
    vec2 clampedUv = clamp(uv, 0.0, 1.0);
    vec4 sampleColor = texture2D(uTexture, clampedUv);
    float inBounds = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    float alpha = sampleColor.a * inBounds;
    vec3 rgb = alpha > 0.0001 ? sampleColor.rgb / max(sampleColor.a, 0.0001) : vec3(0.0);
    return vec4(rgb, alpha);
}

vec2 noiseTexCoord(vec2 i) {
    return (floor(mod(i, 256.0)) + 0.5) / 256.0;
}

float gnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    vec2 g00 = texture2D(uNoiseTex, noiseTexCoord(i)).rg * 2.0 - 1.0;
    vec2 g10 = texture2D(uNoiseTex, noiseTexCoord(i + vec2(1.0, 0.0))).rg * 2.0 - 1.0;
    vec2 g01 = texture2D(uNoiseTex, noiseTexCoord(i + vec2(0.0, 1.0))).rg * 2.0 - 1.0;
    vec2 g11 = texture2D(uNoiseTex, noiseTexCoord(i + vec2(1.0, 1.0))).rg * 2.0 - 1.0;
    return mix(mix(dot(g00, f - vec2(0.0, 0.0)), dot(g10, f - vec2(1.0, 0.0)), u.x),
               mix(dot(g01, f - vec2(0.0, 1.0)), dot(g11, f - vec2(1.0, 1.0)), u.x), u.y);
}

mat2 rot(float a) {
    float c = cos(a); float s = sin(a);
    return mat2(c, -s, s, c);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = rot(0.37);
    for (int i = 0; i < 4; i++) {
        v += a * gnoise(p);
        p = r * p * 2.0 + vec2(13.7, 31.5);
        a *= 0.5;
    }
    return v;
}

vec2 curlNoise(vec2 p) {
    float eps = 0.1;
    float n1 = gnoise(p + vec2(0.0, eps));
    float n2 = gnoise(p - vec2(0.0, eps));
    float n3 = gnoise(p + vec2(eps, 0.0));
    float n4 = gnoise(p - vec2(eps, 0.0));
    float dFdy = (n1 - n2) / (2.0 * eps);
    float dFdx = (n3 - n4) / (2.0 * eps);
    return vec2(dFdy, -dFdx);
}

vec3 rgb2hsl(vec3 c) {
    float mx = max(max(c.r, c.g), c.b);
    float mn = min(min(c.r, c.g), c.b);
    float l = (mx + mn) * 0.5;
    if (mx == mn) return vec3(0.0, 0.0, l);
    float d = mx - mn;
    float s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
    float h;
    if (mx == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
    return vec3(h, s, l);
}

float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0 / 2.0) return q;
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    return p;
}

vec3 hsl2rgb(vec3 hsl) {
    if (hsl.y == 0.0) return vec3(hsl.z);
    float q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - hsl.z * hsl.y;
    float p = 2.0 * hsl.z - q;
    return vec3(hue2rgb(p, q, hsl.x + 1.0 / 3.0), hue2rgb(p, q, hsl.x), hue2rgb(p, q, hsl.x - 1.0 / 3.0));
}

void main() {
    vec2 uv = vUv;
    vec2 texUv = vec2(uv.x, 1.0 - uv.y);
    float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
    float time = uTime * uSpeed;

    vec2 aspect = vec2(canvasAspect, 1.0);
    vec2 p = uv * aspect;
    float radiusScaled = uRadius * max(canvasAspect, 1.0);

    vec2 flowField = curlNoise(p * 2.0 + time * 0.3);

    float hoverDist = distance(p, uPointer * aspect);
    float hoverT = 1.0 - smoothstep(0.0, radiusScaled, hoverDist);
    float hoverInfluence = hoverT * hoverT * hoverT * uPointerActive * uStrength;
    float orbCore = pow(hoverT, 1.8) * uPointerActive;
    float orbHalo = pow(hoverT, 0.8) * uPointerActive;
    float orbRing = smoothstep(0.12, 0.58, hoverT) * (1.0 - smoothstep(0.58, 0.92, hoverT)) * uPointerActive;
    float orbPulse = (0.5 + 0.5 * sin(uTime * 1.2)) * (0.12 + 0.2 * orbCore);

    float trailInfluence = 0.0;
    vec2 totalSwirl = vec2(0.0);
    for (int i = 0; i < ${TRAIL_LENGTH}; i++) {
        float trailStr = uTrailStrengths[i];
        if (trailStr < 0.001) continue;
        vec2 trailPos = uTrail[i] * aspect;
        vec2 toTrail = p - trailPos;
        float dist = length(toTrail);
        float t = 1.0 - smoothstep(0.0, radiusScaled, dist);
        float influence = t * t * t * trailStr;
        float noiseOff = gnoise(uv * 5.0 + time * 0.4 + float(i) * 1.7) * uDistortion;
        influence *= (1.0 + noiseOff * 0.6);
        trailInfluence += influence;
        vec2 vel = uTrailVelocities[i];
        float velMag = length(vel);
        vec2 tangent = vec2(-toTrail.y, toTrail.x);
        float vortexStr = influence * velMag * 2.0;
        totalSwirl += tangent / max(dist, 0.02) * vortexStr * uDistortion * 0.4;
        if (velMag > 0.001) totalSwirl += vel * influence * uDistortion * 0.3;
        totalSwirl += flowField * influence * uDistortion * 0.25;
    }
    trailInfluence = clamp(trailInfluence, 0.0, 1.0) * uStrength * uPointerActive;

    vec2 burstSwirl = vec2(0.0);
    float burstInfluence = 0.0;
    if (uBurst > 0.001) {
        float burstDist = distance(p, uBurstPos * aspect);
        float burstExpand = 1.0 + (1.0 - uBurst) * 2.0;
        float burstRadius = radiusScaled * burstExpand;
        float burstT = 1.0 - smoothstep(0.0, burstRadius, burstDist);
        burstInfluence = burstT * burstT * uBurst * uBurst * uStrength;
        vec2 burstDir = p - uBurstPos * aspect;
        float bdLen = length(burstDir);
        if (bdLen > 0.001) burstDir /= bdLen;
        burstSwirl = burstDir * burstInfluence * uDistortion * 0.8 + flowField * burstInfluence * uDistortion * 0.3;
    }

    float combined = clamp(hoverInfluence + trailInfluence + burstInfluence, 0.0, 1.0);

    vec2 swirlUv = totalSwirl * 0.5 * uPointerActive + burstSwirl * 0.5;
    swirlUv += flowField * hoverInfluence * 0.03;
    vec2 smudgedTexUv = texUv + swirlUv;
    vec4 smudgedColor = sampleImageTexture(smudgedTexUv);

    vec2 warpedImageUv = uv - swirlUv;
    float inImage = smoothstep(-0.005, 0.0, warpedImageUv.x) * smoothstep(-0.005, 0.0, 1.0 - warpedImageUv.x)
                  * smoothstep(-0.005, 0.0, warpedImageUv.y) * smoothstep(-0.005, 0.0, 1.0 - warpedImageUv.y);

    vec3 hueShifted = smudgedColor.rgb;
    vec3 hsl = rgb2hsl(smudgedColor.rgb);
    float noiseHue = fbm(uv * 3.0 + time * 0.3);
    hsl.x = fract(hsl.x + uHueShift * combined * (0.5 + noiseHue * 0.5));
    hsl.y = min(1.0, hsl.y + combined * 0.6);
    hsl.z = clamp(hsl.z + combined * 0.1, 0.0, 1.0);
    hueShifted = hsl2rgb(hsl);

    vec3 c1hsl = rgb2hsl(uEffectColor1);
    c1hsl.x = fract(c1hsl.x + uTime * uColorCycle);
    vec3 cycledColor1 = hsl2rgb(c1hsl);
    vec3 c2hsl = rgb2hsl(uEffectColor2);
    c2hsl.x = fract(c2hsl.x + uTime * uColorCycle * 0.73);
    vec3 cycledColor2 = hsl2rgb(c2hsl);
    vec3 c3hsl = rgb2hsl(uEffectColor3);
    c3hsl.x = fract(c3hsl.x + uTime * uColorCycle * 1.17);
    vec3 cycledColor3 = hsl2rgb(c3hsl);
    vec3 c4hsl = rgb2hsl(uEffectColor4);
    c4hsl.x = fract(c4hsl.x + uTime * uColorCycle * 0.53);
    vec3 cycledColor4 = hsl2rgb(c4hsl);

    vec2 warpCoord = uv * 2.5 + (totalSwirl * uPointerActive + burstSwirl) * 4.0;
    float warpLayer = fbm(warpCoord + time * 0.15);
    float gradientT = fbm(warpCoord + warpLayer * 0.5 + time * 0.1);
    float gt = clamp(gradientT * 0.5 + 0.5, 0.0, 1.0);
    gt = gt * gt * (3.0 - 2.0 * gt);
    float premiumShift = (fbm(uv * 1.6 + flowField * 0.9 + time * 0.08) * 0.5 + 0.5) - 0.5;
    gt = clamp(gt + premiumShift * (0.08 * orbHalo + 0.05 * orbRing), 0.0, 1.0);

    float seg = gt * 3.0;
    vec3 gradientColor;
    if (seg < 1.0) gradientColor = mix(cycledColor1, cycledColor2, seg);
    else if (seg < 2.0) gradientColor = mix(cycledColor2, cycledColor3, seg - 1.0);
    else gradientColor = mix(cycledColor3, cycledColor4, seg - 2.0);

    float swirlMag = length(totalSwirl * uPointerActive + burstSwirl);
    float distortionBand = clamp(orbRing * 1.15 + burstInfluence * 0.5 + trailInfluence * 0.35, 0.0, 1.0);
    float gradientMix = smoothstep(0.02, 0.72, combined * 0.28 + orbHalo * 0.3 + swirlMag * 1.4);
    vec3 premiumGradientColor = mix(gradientColor, vec3(1.0), 0.18 * orbCore + 0.06 * orbPulse);
    vec3 premiumHueShifted = mix(hueShifted, smudgedColor.rgb, 0.18 * (1.0 - orbHalo));
    vec3 effectColor = mix(premiumHueShifted, premiumGradientColor, gradientMix * (0.78 + 0.22 * orbHalo));

    float imageMix = clamp(combined * 0.55 + orbCore * 0.2 + orbHalo * 0.15, 0.0, 1.0);
    vec3 imageBlend = mix(smudgedColor.rgb, effectColor, imageMix);
    vec3 finalColor = mix(effectColor, imageBlend, inImage);
    float glow = clamp(orbHalo * 0.55 + orbCore * orbCore * 0.45 + distortionBand * 0.18, 0.0, 1.0);
    vec3 outerGlowColor = mix(gradientColor, premiumGradientColor, 0.5);
    finalColor += outerGlowColor * glow * (0.16 + 0.08 * orbPulse);
    finalColor += vec3(1.0) * orbCore * 0.045;
    finalColor = clamp(finalColor, 0.0, 1.0);

    float alpha = inImage * smudgedColor.a;
    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) || "Unknown shader compile error";
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create shader program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) || "Unknown program link error";
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

type Line = { text: string; gradient?: boolean };

const TEXTURE_WIDTH = 2200;

function drawTextTexture(lines: Line[], fontFamily: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const measureCtx = canvas.getContext("2d")!;
  let fontSize = 260;
  const maxLineWidth = TEXTURE_WIDTH * 0.94;
  for (;;) {
    measureCtx.font = `700 ${fontSize}px ${fontFamily}`;
    const widest = Math.max(...lines.map((l) => measureCtx.measureText(l.text).width));
    if (widest <= maxLineWidth || fontSize <= 40) break;
    fontSize -= 4;
  }
  const lineHeight = fontSize * 1.14;
  const verticalPadding = fontSize * 0.3;
  canvas.width = TEXTURE_WIDTH;
  canvas.height = Math.round(lines.length * lineHeight + verticalPadding * 2);

  const ctx = canvas.getContext("2d")!;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, i) => {
    const y = verticalPadding + lineHeight * i + lineHeight / 2;
    if (line.gradient) {
      const gradient = ctx.createLinearGradient(TEXTURE_WIDTH * 0.1, 0, TEXTURE_WIDTH * 0.9, 0);
      gradient.addColorStop(0, "#433DDD");
      gradient.addColorStop(0.5, "#7E2AC0");
      gradient.addColorStop(1, "#E2098C");
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = "#f3f1f9";
    }
    ctx.fillText(line.text, TEXTURE_WIDTH / 2, y);
  });
  return canvas;
}

export function FluidText({
  lines,
  as = "h1",
  className = "",
  headingClassName = "",
}: {
  lines: Line[];
  as?: "h1" | "h2";
  className?: string;
  headingClassName?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const Tag = as;

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const host = hostRef.current;
    const probe = probeRef.current;
    if (!host || !probe) return;

    let cancelled = false;
    let raf = 0;
    let rafRunning = false;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) return;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      const fontFamily = getComputedStyle(probe).fontFamily;
      const textCanvas = drawTextTexture(lines, fontFamily);
      // Set synchronously via the DOM, not React state — cw/ch below are
      // read from host.clientWidth/Height in this same tick, before a
      // state-driven re-render would ever have had a chance to apply it.
      host.style.aspectRatio = `${textCanvas.width} / ${textCanvas.height}`;
      host.appendChild(canvas);

      let program: WebGLProgram;
      let loc: Record<string, WebGLUniformLocation | null>;
      try {
        program = createProgram(gl);
        gl.useProgram(program);
        const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        loc = {
          uResolution: gl.getUniformLocation(program, "uResolution"),
          uPointer: gl.getUniformLocation(program, "uPointer"),
          uPointerActive: gl.getUniformLocation(program, "uPointerActive"),
          uTime: gl.getUniformLocation(program, "uTime"),
          uTexture: gl.getUniformLocation(program, "uTexture"),
          uNoiseTex: gl.getUniformLocation(program, "uNoiseTex"),
          uEffectColor1: gl.getUniformLocation(program, "uEffectColor1"),
          uEffectColor2: gl.getUniformLocation(program, "uEffectColor2"),
          uEffectColor3: gl.getUniformLocation(program, "uEffectColor3"),
          uEffectColor4: gl.getUniformLocation(program, "uEffectColor4"),
          uRadius: gl.getUniformLocation(program, "uRadius"),
          uStrength: gl.getUniformLocation(program, "uStrength"),
          uSpeed: gl.getUniformLocation(program, "uSpeed"),
          uDistortion: gl.getUniformLocation(program, "uDistortion"),
          uHueShift: gl.getUniformLocation(program, "uHueShift"),
          uColorCycle: gl.getUniformLocation(program, "uColorCycle"),
          uTrail: gl.getUniformLocation(program, "uTrail"),
          uTrailVelocities: gl.getUniformLocation(program, "uTrailVelocities"),
          uTrailStrengths: gl.getUniformLocation(program, "uTrailStrengths"),
          uBurst: gl.getUniformLocation(program, "uBurst"),
          uBurstPos: gl.getUniformLocation(program, "uBurstPos"),
        };

        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        const noiseTex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, noiseTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, NOISE_SIZE, NOISE_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, generateNoiseTexture());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.activeTexture(gl.TEXTURE0);
      } catch {
        return;
      }

      let cw = Math.max(1, host.clientWidth);
      let ch = Math.max(1, host.clientHeight);
      let lastPw = 0;
      let lastPh = 0;

      const targetPointer = { x: 0.5, y: 0.5 };
      const smoothPointer = { x: 0.5, y: 0.5 };
      const prevSmooth = { x: 0.5, y: 0.5 };
      const pointerVelocity = { x: 0, y: 0 };
      let pointerInside = false;
      let pointerActiveFade = 0;
      let burstValue = 0;
      const burstPos = { x: 0.5, y: 0.5 };
      const trail = Array.from({ length: TRAIL_LENGTH }, () => ({ x: -1, y: -1, vx: 0, vy: 0, strength: 0 }));
      const trailFlat = new Float32Array(TRAIL_LENGTH * 2);
      const trailVelFlat = new Float32Array(TRAIL_LENGTH * 2);
      const trailStrengths = new Float32Array(TRAIL_LENGTH);
      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

      const onPointerMove = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        targetPointer.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        targetPointer.y = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
        pointerInside = true;
        ensureRAF();
      };
      const onPointerLeave = () => {
        pointerInside = false;
        ensureRAF();
      };
      const onPointerDown = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        burstPos.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        burstPos.y = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
        burstValue = 1;
        ensureRAF();
      };
      host.addEventListener("pointermove", onPointerMove);
      host.addEventListener("pointerleave", onPointerLeave);
      host.addEventListener("pointerdown", onPointerDown);

      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          cw = Math.max(1, Math.floor(entry.contentRect.width));
          ch = Math.max(1, Math.floor(entry.contentRect.height));
        }
        ensureRAF();
      });
      ro.observe(host);

      const start = performance.now();
      let lastFrameTime = start;

      function ensureRAF() {
        if (!rafRunning && !cancelled) {
          rafRunning = true;
          lastFrameTime = performance.now();
          raf = window.requestAnimationFrame(render);
        }
      }

      function render(now: number) {
        if (cancelled) {
          rafRunning = false;
          return;
        }
        const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
        lastFrameTime = now;
        const dtScale = dt * 60;

        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        const pw = Math.floor(cw * dpr);
        const ph = Math.floor(ch * dpr);
        if (pw !== lastPw || ph !== lastPh) {
          canvas.width = pw;
          canvas.height = ph;
          gl!.viewport(0, 0, pw, ph);
          lastPw = pw;
          lastPh = ph;
        }

        const smoothK = 1 - Math.pow(1 - clamp(POINTER_SMOOTH, 0.01, 1), dtScale);
        prevSmooth.x = smoothPointer.x;
        prevSmooth.y = smoothPointer.y;
        smoothPointer.x += (targetPointer.x - smoothPointer.x) * smoothK;
        smoothPointer.y += (targetPointer.y - smoothPointer.y) * smoothK;

        const rawVx = dt > 0 ? (smoothPointer.x - prevSmooth.x) / dt : 0;
        const rawVy = dt > 0 ? (smoothPointer.y - prevSmooth.y) / dt : 0;
        const velDecay = Math.pow(0.5, dtScale);
        pointerVelocity.x = pointerVelocity.x * velDecay + rawVx * (1 - velDecay);
        pointerVelocity.y = pointerVelocity.y * velDecay + rawVy * (1 - velDecay);

        const fadeTarget = pointerInside ? 1 : 0;
        const fadeK = 1 - Math.pow(1 - 0.1, dtScale);
        pointerActiveFade += (fadeTarget - pointerActiveFade) * fadeK;

        if (burstValue > 0.001) {
          burstValue *= Math.pow(0.94, dtScale);
          if (burstValue < 0.001) burstValue = 0;
        }

        const trailDecay = Math.pow(PERSISTENCE, dtScale);
        for (let i = 0; i < TRAIL_LENGTH; i++) trail[i].strength *= trailDecay;
        const dx = smoothPointer.x - trail[0].x;
        const dy = smoothPointer.y - trail[0].y;
        if (pointerInside && dx * dx + dy * dy > 5e-5) {
          for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
            trail[i].x = trail[i - 1].x;
            trail[i].y = trail[i - 1].y;
            trail[i].vx = trail[i - 1].vx;
            trail[i].vy = trail[i - 1].vy;
            trail[i].strength = trail[i - 1].strength;
          }
          trail[0].x = smoothPointer.x;
          trail[0].y = smoothPointer.y;
          trail[0].vx = pointerVelocity.x * dt;
          trail[0].vy = pointerVelocity.y * dt;
          trail[0].strength = 1;
        } else if (pointerInside) {
          trail[0].x = smoothPointer.x;
          trail[0].y = smoothPointer.y;
          trail[0].vx = pointerVelocity.x * dt;
          trail[0].vy = pointerVelocity.y * dt;
          trail[0].strength = 1;
        }

        for (let i = 0; i < TRAIL_LENGTH; i++) {
          trailFlat[i * 2] = trail[i].x;
          trailFlat[i * 2 + 1] = trail[i].y;
          trailVelFlat[i * 2] = trail[i].vx;
          trailVelFlat[i * 2 + 1] = trail[i].vy;
          trailStrengths[i] = trail[i].strength;
        }

        gl!.uniform2f(loc.uResolution, pw, ph);
        gl!.uniform2f(loc.uPointer, smoothPointer.x, smoothPointer.y);
        gl!.uniform1f(loc.uPointerActive, pointerActiveFade);
        gl!.uniform1f(loc.uTime, (now - start) * 0.001);
        gl!.uniform1i(loc.uTexture, 0);
        gl!.uniform1i(loc.uNoiseTex, 1);
        gl!.uniform3f(loc.uEffectColor1, ...EFFECT_COLORS[0]);
        gl!.uniform3f(loc.uEffectColor2, ...EFFECT_COLORS[1]);
        gl!.uniform3f(loc.uEffectColor3, ...EFFECT_COLORS[2]);
        gl!.uniform3f(loc.uEffectColor4, ...EFFECT_COLORS[3]);
        gl!.uniform1f(loc.uRadius, RADIUS);
        gl!.uniform1f(loc.uStrength, STRENGTH);
        gl!.uniform1f(loc.uSpeed, SPEED);
        gl!.uniform1f(loc.uDistortion, DISTORTION);
        gl!.uniform1f(loc.uHueShift, HUE_SHIFT);
        gl!.uniform1f(loc.uColorCycle, COLOR_CYCLE);
        gl!.uniform2fv(loc.uTrail, trailFlat);
        gl!.uniform2fv(loc.uTrailVelocities, trailVelFlat);
        gl!.uniform1fv(loc.uTrailStrengths, trailStrengths);
        gl!.uniform1f(loc.uBurst, burstValue);
        gl!.uniform2f(loc.uBurstPos, burstPos.x, burstPos.y);

        gl!.enable(gl!.BLEND);
        gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);
        gl!.clearColor(0, 0, 0, 0);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
        gl!.drawArrays(gl!.TRIANGLES, 0, 3);

        let allDecayed = pointerActiveFade < 0.001 && burstValue < 0.001;
        if (allDecayed) {
          for (let i = 0; i < TRAIL_LENGTH; i++) {
            if (trailStrengths[i] > 0.001) {
              allDecayed = false;
              break;
            }
          }
        }
        if (!pointerInside && allDecayed) {
          rafRunning = false;
          return;
        }
        raf = window.requestAnimationFrame(render);
      }

      ensureRAF();
      setReady(true);

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(raf);
        host.removeEventListener("pointermove", onPointerMove);
        host.removeEventListener("pointerleave", onPointerLeave);
        host.removeEventListener("pointerdown", onPointerDown);
        ro.disconnect();
        if (canvas.parentElement === host) host.removeChild(canvas);
      };
    });

    return () => {
      cancelled = true;
    };
  }, [lines]);

  return (
    <div className={className}>
      <span ref={probeRef} className="sr-only font-heading font-bold" aria-hidden="true">
        Ag
      </span>
      <Tag className={ready ? "sr-only" : headingClassName}>
        {lines.map((l) => l.text).join(" ")}
      </Tag>
      <div ref={hostRef} aria-hidden="true" className="relative w-full" />
    </div>
  );
}
