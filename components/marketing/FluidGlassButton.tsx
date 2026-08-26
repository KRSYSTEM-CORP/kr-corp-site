"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

// Ported from the Framer component at framer.com/m/Fluid-Glass-Button —
// same Three.js shader (pill-shaped SDF, fbm liquid warp on hover, a star
// field, and a click "surge" that pulses out from the pointer), stripped of
// the Framer canvas machinery (property controls, static-renderer case).

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
varying vec2 vUv;
uniform float uTime;
uniform float uHover;
uniform float uClick;
uniform vec3 uBaseColor;
uniform vec3 uGlassColor;
uniform vec2 uResolution;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
        f += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
    }
    return f;
}

void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= aspect;

    vec2 center = vec2(0.5);
    vec2 dirToCenter = normalize(vUv - center + vec2(0.0001));
    float distToCenter = length(vUv - center);

    float r = 1.0;
    vec2 b = vec2(max(aspect - 1.0, 0.0), 0.0);
    vec2 d = abs(p) - b;
    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
    float innerDist = clamp(abs(dist), 0.0, 1.0);

    float t = uTime;
    vec2 noiseUv = vUv * vec2(2.0, 1.0);
    vec2 warp = vec2(fbm(noiseUv + t * 0.5), fbm(noiseUv + t * 0.5 + 12.34)) * mix(0.0, 0.4, uHover);
    warp -= dirToCenter * uClick * 0.25 * smoothstep(0.8, 0.0, distToCenter);

    float n1 = fbm(noiseUv + warp + vec2(t, 0.0));
    float n2 = fbm(noiseUv + warp + vec2(n1, t * 1.2));

    float rimWidth = mix(0.15, 0.35, n2) * mix(1.0, 1.4, uHover);
    rimWidth += uClick * 0.15;
    float rim = smoothstep(rimWidth, 0.0, innerDist);

    float specDist = abs(innerDist - 0.12 + n1 * 0.08);
    float specular = smoothstep(0.03, 0.0, specDist);

    float rightBias = smoothstep(0.2, 1.0, vUv.x);
    rim *= mix(0.6, 1.5, rightBias);
    specular *= mix(0.5, 2.0, rightBias);

    vec2 starUv = vUv * vec2(aspect * 6.0, 6.0);
    starUv.x -= uTime * 0.2;
    starUv.y += sin(uTime * 0.5 + starUv.x) * mix(0.2, 0.6, uHover);
    starUv += dirToCenter * uClick * 1.5;

    vec2 id = floor(starUv);
    vec2 gv = fract(starUv) - 0.5;
    float nStar = hash(id);
    float star = 0.0;
    float starThreshold = mix(0.94, 0.86, uHover);

    if (nStar > starThreshold) {
        float sizeMod = mix(0.5, 2.5, hash(id + 13.37));
        vec2 localWiggle = vec2(
            sin(uTime * 2.0 + nStar * 50.0),
            cos(uTime * 2.3 + nStar * 40.0)
        ) * 0.25 * uHover;
        float starDist = length(gv - localWiggle) * sizeMod;
        star = smoothstep(0.12, 0.0, starDist);
        star += smoothstep(0.25, 0.0, starDist) * 0.3;
        float twinklePhase = uTime * mix(5.0, 15.0, hash(id + 42.0));
        star *= sin(twinklePhase + nStar * 100.0) * 0.5 + 0.5;
        star *= smoothstep(0.05, 0.2, innerDist);
    }

    vec3 color = uBaseColor;
    float innerLiquid = smoothstep(0.2, 0.9, n2) * (1.0 - innerDist) * mix(0.2, 0.45, uHover);
    color += uGlassColor * innerLiquid;
    color += uGlassColor * rim * mix(0.6, 1.2, uHover);
    color += vec3(1.0) * specular * mix(0.8, 2.0, uHover);
    color += vec3(1.0) * star * mix(0.8, 1.5, uHover);

    color += uGlassColor * rim * uClick * 0.8;
    color += vec3(1.0) * specular * uClick * 1.5;
    color += uGlassColor * exp(-distToCenter * 6.0) * uClick * 0.6;

    color *= smoothstep(1.5, 0.2, length(vUv - 0.5));

    gl_FragColor = vec4(color, 1.0);
}
`;

export function FluidGlassButton({
  text,
  href,
  onClick,
  baseColor = "#0a0912",
  glassColor = "#a78bfa",
  className = "",
}: {
  text: string;
  href?: string;
  onClick?: () => void;
  baseColor?: string;
  glassColor?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const hoverRef = useRef(0);
  const clickRef = useRef(0);
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uClick: { value: 0 },
    uBaseColor: { value: new THREE.Color(baseColor) },
    uGlassColor: { value: new THREE.Color(glassColor) },
    uResolution: { value: new THREE.Vector2(1, 1) },
  });

  useEffect(() => {
    uniformsRef.current.uBaseColor.value.set(baseColor);
    uniformsRef.current.uGlassColor.value.set(glassColor);
  }, [baseColor, glassColor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: uniformsRef.current,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId = 0;
    let timeAccumulator = 0;
    let lastTime = performance.now();
    let isIntersecting = false;
    let currentHoverValue = 0;
    let currentClickValue = 0;

    const renderLoop = (time: number) => {
      animationFrameId = requestAnimationFrame(renderLoop);
      if (!isIntersecting) {
        lastTime = time;
        return;
      }
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      currentHoverValue = THREE.MathUtils.lerp(currentHoverValue, hoverRef.current, delta * 4);
      if (clickRef.current > 0) {
        currentClickValue = clickRef.current;
        clickRef.current = 0;
      }
      currentClickValue = THREE.MathUtils.lerp(currentClickValue, 0, delta * 6);
      const currentSpeed = THREE.MathUtils.lerp(0.15, 0.6, currentHoverValue);
      timeAccumulator += delta * currentSpeed;
      uniformsRef.current.uTime.value = timeAccumulator;
      uniformsRef.current.uHover.value = currentHoverValue;
      uniformsRef.current.uClick.value = currentClickValue;
      renderer.render(scene, camera);
    };
    animationFrameId = requestAnimationFrame(renderLoop);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        uniformsRef.current.uResolution.value.set(width, height);
      }
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) isIntersecting = entry.isIntersecting;
    });
    intersectionObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  const handleMouseDown = useCallback(() => {
    clickRef.current = 1;
    if (outerRef.current) outerRef.current.style.transform = "scale(0.96)";
  }, []);
  const handleMouseUp = useCallback(() => {
    if (outerRef.current) outerRef.current.style.transform = "scale(1)";
  }, []);
  const handleMouseEnter = useCallback(() => {
    hoverRef.current = 1;
    if (outerRef.current) outerRef.current.style.zIndex = "10";
  }, []);
  const handleMouseLeave = useCallback(() => {
    hoverRef.current = 0;
    if (outerRef.current) {
      outerRef.current.style.transform = "scale(1)";
      outerRef.current.style.zIndex = "1";
    }
  }, []);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    borderRadius: 999,
    cursor: "pointer",
    padding: "0.9rem 1.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    backgroundColor: baseColor,
    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.15), 0 10px 30px -10px rgba(0,0,0,0.5)",
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), z-index 0s",
    zIndex: 1,
    textDecoration: "none",
    outline: "none",
    border: "none",
    margin: 0,
    fontFamily: "inherit",
  };

  const content = (
    <>
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, zIndex: 0, borderRadius: 999, overflow: "hidden", pointerEvents: "none" }}
      />
      <span
        style={{
          position: "relative",
          zIndex: 1,
          color: "white",
          pointerEvents: "none",
          textAlign: "center",
          fontWeight: 600,
          // The shader can wash most of the pill toward white on hover (its
          // rim + specular + star terms are additive), so the label needs a
          // dark shadow — not a light glow — to stay legible at that peak.
          textShadow: "0 1px 3px rgba(0,0,0,0.85), 0 0 14px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        ref={outerRef as React.RefObject<HTMLAnchorElement>}
        className={className}
        style={containerStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      ref={outerRef as React.RefObject<HTMLButtonElement>}
      className={className}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
