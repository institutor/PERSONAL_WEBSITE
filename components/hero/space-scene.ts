/**
 * The hero's WebGL system — "the universe lives inside the type."
 *
 * Two draw passes over one shared uniform set:
 *  1. Base fullscreen quad: the space scene. Drives the whole intro
 *     (aperture opens from center → blurs → covers screen → noise-dissolve
 *     collapse until space survives only inside the JIEWEN text mask) and,
 *     on scroll, quantizes the mask into mosaic cells and hides launched ones.
 *  2. Instanced cell quads: the dissipating squares. Each glyph cell launches
 *     right-edge-first as you scroll, flying up-right while carrying the
 *     patch of nebula it showed at launch (its space UV is frozen at its
 *     launch threshold).
 *
 * Plain three.js, no react-three-fiber: one imperative scene, torn down
 * completely in dispose() (StrictMode-safe).
 */
import {
  CanvasTexture,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from "three";

export interface SpaceUniforms {
  uSpace: { value: Texture | null };
  uSpaceBlur: { value: Texture | null };
  uMask: { value: Texture | null };
  uRes: { value: [number, number] };
  uMaskRect: { value: [number, number, number, number] };
  uTexAspect: { value: number };
  uTime: { value: number };
  /** Aperture: 0 closed → ~1.15 covers screen. */
  uCover: { value: number };
  /** Sharp↔blurred space crossfade. */
  uBlurMix: { value: number };
  /** 0 = space fullscreen, 1 = space only inside letters. */
  uReveal: { value: number };
  /** Letters punched dark out of the fullscreen space (pre-collapse stage). */
  uPunch: { value: number };
  /** Ken Burns zoom on the space texture. */
  uTexZoom: { value: number };
  /** Hero exit progress 0..1 — mosaic morph + cell launches + UV drift. */
  uScroll: { value: number };
  /** Mosaic cell size in device px. */
  uCell: { value: number };
  /** Global canvas opacity multiplier (intro fade-in). */
  uAlpha: { value: number };
}

const COMMON = /* glsl */ `
  precision highp float;

  uniform sampler2D uSpace;
  uniform sampler2D uSpaceBlur;
  uniform sampler2D uMask;
  uniform vec2 uRes;
  uniform vec4 uMaskRect; // x, y (bottom-left, GL px), w, h
  uniform float uTexAspect;
  uniform float uTime;
  uniform float uCover;
  uniform float uBlurMix;
  uniform float uReveal;
  uniform float uPunch;
  uniform float uTexZoom;
  uniform float uScroll;
  uniform float uCell;
  uniform float uAlpha;

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    return 0.6 * vnoise(p) + 0.4 * vnoise(p * 2.7 + 11.3);
  }

  // Space texture sample with cover fit + zoom + scroll drift.
  vec3 spaceColor(vec2 screenPx, float scrollAt) {
    vec2 uv = screenPx / uRes;
    float arC = uRes.x / uRes.y;
    vec2 s = (arC < uTexAspect) ? vec2(arC / uTexAspect, 1.0) : vec2(1.0, uTexAspect / arC);
    vec2 suv = (uv - 0.5) * s / uTexZoom + 0.5;
    // the background shifts inside the words as you scroll
    suv += vec2(scrollAt * 0.16, scrollAt * -0.05);
    suv = (suv - 0.5) / (1.0 + scrollAt * 0.35) + 0.5;
    vec3 sharp = texture2D(uSpace, suv).rgb;
    vec3 blur = texture2D(uSpaceBlur, suv).rgb;
    return mix(sharp, blur, uBlurMix);
  }

  // Right-edge-first launch threshold for a mosaic cell.
  float launchThreshold(vec2 cellId, float cellsX) {
    float xNorm = clamp(cellId.x / max(cellsX, 1.0), 0.0, 1.0);
    float n = hash21(cellId + 7.3) * 0.30;
    return 0.10 + (1.0 - xNorm) * 0.62 + n;
  }
`;

const BASE_VERT = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BASE_FRAG = /* glsl */ `
  ${"" /* COMMON injected at build */}
  void main() {
    vec2 px = gl_FragCoord.xy;
    vec2 uv = px / uRes;

    // ---- aperture rect from center (the intro "enlarges from the middle").
    // Widescreen slit that grows; soft 2px edge. uCover ≥ 1.7 covers fully.
    vec2 d = abs(uv - 0.5);
    vec2 edge = 2.0 / uRes;
    float inX = 1.0 - smoothstep(0.5 * uCover - edge.x, 0.5 * uCover, d.x);
    float inY = 1.0 - smoothstep(0.5 * uCover * 0.62 - edge.y, 0.5 * uCover * 0.62, d.y);
    float aperture = inX * inY;

    // ---- text mask, with mosaic quantization as you scroll ----
    float mosaic = smoothstep(0.02, 0.3, uScroll);
    vec2 rel = px - uMaskRect.xy;
    vec2 cellId = floor(rel / uCell);
    vec2 quantPx = uMaskRect.xy + (cellId + 0.5) * uCell;
    vec2 muvSmooth = rel / uMaskRect.zw;
    vec2 muvCell = (quantPx - uMaskRect.xy) / uMaskRect.zw;
    float inRect = step(0.0, muvSmooth.x) * step(muvSmooth.x, 1.0) * step(0.0, muvSmooth.y) * step(muvSmooth.y, 1.0);
    float mSmooth = texture2D(uMask, clamp(muvSmooth, 0.0, 1.0)).a * inRect;
    float mCell = step(0.5, texture2D(uMask, clamp(muvCell, 0.0, 1.0)).a) * inRect;

    // gaps between cells as the mosaic forms
    vec2 lc = fract(rel / uCell);
    float gapW = 0.08 * mosaic;
    float gap = step(gapW, lc.x) * step(lc.x, 1.0 - gapW) * step(gapW, lc.y) * step(lc.y, 1.0 - gapW);

    float mask = mix(mSmooth, mCell * gap, mosaic);

    // launched cells leave the base pass (the instances fly them away)
    float cellsX = uMaskRect.z / uCell;
    float th = launchThreshold(cellId, cellsX);
    float gone = smoothstep(th, th + 0.02, uScroll) * mosaic * inRect;
    mask *= 1.0 - gone;

    // ---- the collapse: fullscreen space dissolves away except in letters ----
    float n = fbm(uv * 7.0 + uTime * 0.04);
    float cut = smoothstep(n - 0.28, n + 0.28, uReveal * 1.56 - 0.28);
    float keep = max(mask, 1.0 - cut);

    vec3 col = spaceColor(px, uScroll * 0.999);
    // pre-collapse: the letters punch DARK out of the fullscreen nebula,
    // then fill back in as the surroundings dissolve — a clean inversion.
    col *= mix(1.0, 0.05, mSmooth * uPunch);
    // subtle darkening vignette while fullscreen so the moment feels graded
    float vig = 1.0 - 0.30 * (1.0 - uReveal) * smoothstep(0.2, 0.75, length(uv - 0.5));
    col *= vig;

    float alpha = keep * aperture * uAlpha;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

const CELL_VERT = /* glsl */ `
  attribute vec2 aCellPos;   // cell center, GL px
  attribute vec2 aCellId;
  attribute float aRand;
  varying vec2 vLocal;
  varying vec2 vCellPos;
  varying float vT;
  varying float vTh;

  void main() {
    vCellPos = aCellPos;
    float cellsX = uMaskRect.z / uCell;
    float th = launchThreshold(aCellId, cellsX);
    float t = clamp((uScroll - th) / 0.30, 0.0, 1.0);
    vT = t;
    vTh = th;
    vLocal = position.xy + 0.5;

    float isOn = step(0.0001, t);
    vec2 dir = normalize(vec2(0.55 + fract(aRand * 13.7) * 0.7, 0.75 + fract(aRand * 29.3) * 0.8));
    float dist = (90.0 + fract(aRand * 47.1) * 190.0) * (uRes.y / 900.0);
    float eased = 1.0 - pow(1.0 - t, 2.2);
    vec2 center = aCellPos + dir * eased * dist;

    float ang = (aRand - 0.5) * 5.0 * t;
    float ca = cos(ang);
    float sa = sin(ang);
    float scale = uCell * (1.0 - 0.82 * eased) * isOn;
    vec2 corner = position.xy * scale;
    corner = vec2(corner.x * ca - corner.y * sa, corner.x * sa + corner.y * ca);

    vec2 px = center + corner;
    vec2 ndc = (px / uRes) * 2.0 - 1.0;
    gl_Position = vec4(ndc, 0.0, 1.0);
  }
`;

const CELL_FRAG = /* glsl */ `
  varying vec2 vLocal;
  varying vec2 vCellPos;
  varying float vT;
  varying float vTh;

  void main() {
    if (vT <= 0.0 || vT >= 1.0) discard;
    // the square carries the exact patch of space it showed at launch:
    // sample at its ORIGINAL cell position with scroll frozen at threshold
    vec2 patchPx = vCellPos + (vLocal - 0.5) * uCell;
    vec3 col = spaceColor(patchPx, vTh);
    float alpha = (1.0 - vT) * uAlpha;
    gl_FragColor = vec4(col, alpha);
  }
`;

export interface SpaceSceneHooks {
  onReady?: () => void;
}

export class SpaceScene {
  readonly uniforms: SpaceUniforms;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private baseMesh: Mesh;
  private cellMesh: Mesh | null = null;
  private maskCanvas = document.createElement("canvas");
  private disposed = false;
  private letterEls: HTMLElement[] = [];
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, letterEls: HTMLElement[]) {
    this.canvas = canvas;
    this.letterEls = letterEls;
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);

    this.uniforms = {
      uSpace: { value: null },
      uSpaceBlur: { value: null },
      uMask: { value: null },
      uRes: { value: [1, 1] },
      uMaskRect: { value: [0, 0, 1, 1] },
      uTexAspect: { value: 1920 / 1111 },
      uTime: { value: 0 },
      uCover: { value: 0 },
      uBlurMix: { value: 0 },
      uReveal: { value: 0 },
      uPunch: { value: 0 },
      uTexZoom: { value: 1.06 },
      uScroll: { value: 0 },
      uCell: { value: 13 },
      uAlpha: { value: 0 },
    };

    const baseGeo = new PlaneGeometry(2, 2);
    const baseMat = new ShaderMaterial({
      uniforms: this.uniforms as unknown as ShaderMaterial["uniforms"],
      vertexShader: BASE_VERT,
      fragmentShader: COMMON + BASE_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.baseMesh = new Mesh(baseGeo, baseMat);
    this.baseMesh.frustumCulled = false;
    this.scene.add(this.baseMesh);
  }

  async load(): Promise<void> {
    const loader = new TextureLoader();
    const [sharp, blur] = await Promise.all([
      loader.loadAsync("/textures/nebula.webp"),
      loader.loadAsync("/textures/nebula-blur.webp"),
    ]);
    for (const t of [sharp, blur]) {
      t.colorSpace = SRGBColorSpace;
      t.minFilter = LinearMipmapLinearFilter;
      t.magFilter = LinearFilter;
      t.generateMipmaps = true;
    }
    if (this.disposed) {
      sharp.dispose();
      blur.dispose();
      return;
    }
    this.uniforms.uSpace.value = sharp;
    this.uniforms.uSpaceBlur.value = blur;
  }

  /** Size the GL canvas, redraw the text mask from live DOM metrics, rebuild cells. */
  layout(): void {
    if (this.disposed) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(2, Math.round(rect.width));
    const h = Math.max(2, Math.round(rect.height));
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.uniforms.uRes.value = [w * dpr, h * dpr];
    this.uniforms.uCell.value = Math.round(13 * dpr);

    this.drawMask(rect, dpr);
    this.buildCells();
    // shader warm-up so the first visible frame never hitches
    this.renderer.compile(this.scene, this.camera);
  }

  /** Rasterize the DOM letters into the mask texture (canvas-space). */
  private drawMask(canvasRect: DOMRect, dpr: number): void {
    const pads = 4 * dpr;
    const rects = this.letterEls.map((el) => el.getBoundingClientRect());
    const left = Math.min(...rects.map((r) => r.left));
    const right = Math.max(...rects.map((r) => r.right));
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));

    const mw = Math.max(2, Math.round((right - left) * dpr) + pads * 2);
    const mh = Math.max(2, Math.round((bottom - top) * dpr) + pads * 2);
    this.maskCanvas.width = mw;
    this.maskCanvas.height = mh;
    const ctx = this.maskCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, mw, mh);
    ctx.fillStyle = "#fff";

    for (const el of this.letterEls) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      ctx.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * dpr}px ${cs.fontFamily}`;
      ctx.textBaseline = "alphabetic";
      const ch = el.textContent ?? "";
      const m = ctx.measureText(ch);
      const inkW = m.actualBoundingBoxRight + m.actualBoundingBoxLeft;
      const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const x = (r.left - left) * dpr + pads + ((r.width * dpr - inkW) / 2 + m.actualBoundingBoxLeft);
      const y = (r.top - top) * dpr + pads + (r.height * dpr - inkH) / 2 + m.actualBoundingBoxAscent;
      ctx.fillText(ch, x, y);
    }

    const tex = new CanvasTexture(this.maskCanvas);
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.generateMipmaps = false;
    this.uniforms.uMask.value?.dispose();
    this.uniforms.uMask.value = tex;

    // mask rect in GL pixel coords (origin bottom-left)
    const glX = (left - canvasRect.left) * dpr - pads;
    const glYTop = (top - canvasRect.top) * dpr - pads;
    const glY = this.uniforms.uRes.value[1] - (glYTop + mh);
    this.uniforms.uMaskRect.value = [glX, glY, mw, mh];
  }

  /** One instanced quad per glyph-covering mosaic cell. */
  private buildCells(): void {
    const ctx = this.maskCanvas.getContext("2d")!;
    const { width: mw, height: mh } = this.maskCanvas;
    const data = ctx.getImageData(0, 0, mw, mh).data;
    const cell = this.uniforms.uCell.value;
    const [rx, ry] = [this.uniforms.uMaskRect.value[0], this.uniforms.uMaskRect.value[1]];
    const cols = Math.ceil(mw / cell);
    const rows = Math.ceil(mh / cell);

    const pos: number[] = [];
    const ids: number[] = [];
    const rand: number[] = [];
    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        // sample the cell center in mask space (mask canvas is y-down)
        const mx = Math.min(mw - 1, Math.round((cx + 0.5) * cell));
        const myTop = Math.min(mh - 1, Math.round((rows - cy - 0.5) * cell));
        const a = data[(myTop * mw + mx) * 4 + 3];
        if (a < 96) continue;
        pos.push(rx + (cx + 0.5) * cell, ry + (cy + 0.5) * cell);
        ids.push(cx, cy);
        rand.push((Math.sin(cx * 127.1 + cy * 311.7) * 43758.5453) % 1);
      }
    }

    if (this.cellMesh) {
      this.scene.remove(this.cellMesh);
      this.cellMesh.geometry.dispose();
      (this.cellMesh.material as ShaderMaterial).dispose();
      this.cellMesh = null;
    }
    if (pos.length === 0) return;

    const base = new PlaneGeometry(1, 1);
    const geo = new InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute("position", base.getAttribute("position"));
    geo.setAttribute("uv", base.getAttribute("uv"));
    geo.setAttribute("aCellPos", new InstancedBufferAttribute(new Float32Array(pos), 2));
    geo.setAttribute("aCellId", new InstancedBufferAttribute(new Float32Array(ids), 2));
    geo.setAttribute("aRand", new InstancedBufferAttribute(new Float32Array(rand.map(Math.abs)), 1));
    geo.instanceCount = pos.length / 2;

    const mat = new ShaderMaterial({
      uniforms: this.uniforms as unknown as ShaderMaterial["uniforms"],
      vertexShader: COMMON + CELL_VERT,
      fragmentShader: COMMON + CELL_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.cellMesh = new Mesh(geo, mat);
    this.cellMesh.frustumCulled = false;
    this.scene.add(this.cellMesh);
  }

  render(timeSec: number): void {
    if (this.disposed) return;
    this.uniforms.uTime.value = timeSec;
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.disposed = true;
    this.uniforms.uSpace.value?.dispose();
    this.uniforms.uSpaceBlur.value?.dispose();
    this.uniforms.uMask.value?.dispose();
    this.baseMesh.geometry.dispose();
    (this.baseMesh.material as ShaderMaterial).dispose();
    if (this.cellMesh) {
      this.cellMesh.geometry.dispose();
      (this.cellMesh.material as ShaderMaterial).dispose();
    }
    this.renderer.dispose();
  }
}
