/**
 * Pixel-dissolve engine for the hero words (space theme retired — cells are
 * now solid bone, like print lifting off the page).
 *
 * Two passes over one uniform set:
 *  1. Base quad: the words as a mosaic of solid cells (from a canvas-drawn
 *     text mask of the live DOM letters). Fades in as scroll starts —
 *     the crisp DOM text hands off to the mosaic — then launched cells
 *     disappear from it.
 *  2. Instanced quads: launched cells flying up-right, right-edge first,
 *     shrinking and fading.
 *
 * Plain three.js; disposed completely (StrictMode-safe).
 */
import {
  CanvasTexture,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

export interface DissolveUniforms {
  uMask: { value: CanvasTexture | null };
  uRes: { value: [number, number] };
  uMaskRect: { value: [number, number, number, number] };
  uTime: { value: number };
  /** Hero exit progress 0..1 — handoff, mosaic gaps, launches. */
  uScroll: { value: number };
  uCell: { value: number };
  /** Cell color (bone), linear-ish RGB. */
  uColor: { value: [number, number, number] };
}

const COMMON = /* glsl */ `
  precision highp float;

  uniform sampler2D uMask;
  uniform vec2 uRes;
  uniform vec4 uMaskRect;
  uniform float uTime;
  uniform float uScroll;
  uniform float uCell;
  uniform vec3 uColor;

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  // Right-edge-first launch threshold for a mosaic cell.
  float launchThreshold(vec2 cellId, float cellsX) {
    float xNorm = clamp(cellId.x / max(cellsX, 1.0), 0.0, 1.0);
    float n = hash21(cellId + 7.3) * 0.30;
    return 0.08 + (1.0 - xNorm) * 0.62 + n;
  }

  // Subtle per-cell tone variance — print grain, not noise.
  vec3 cellColor(vec2 cellId) {
    float v = (hash21(cellId + 2.7) - 0.5) * 0.10;
    return uColor * (1.0 + v);
  }
`;

const BASE_VERT = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BASE_FRAG = /* glsl */ `
  void main() {
    vec2 px = gl_FragCoord.xy;
    vec2 rel = px - uMaskRect.xy;
    vec2 muv = rel / uMaskRect.zw;
    if (muv.x < 0.0 || muv.x > 1.0 || muv.y < 0.0 || muv.y > 1.0) discard;

    // handoff: crisp DOM text -> mosaic, as scroll begins
    float on = smoothstep(0.004, 0.03, uScroll);
    if (on <= 0.0) discard;

    vec2 cellId = floor(rel / uCell);
    vec2 quantPx = uMaskRect.xy + (cellId + 0.5) * uCell;
    vec2 quv = clamp((quantPx - uMaskRect.xy) / uMaskRect.zw, 0.0, 1.0);
    float mCell = step(0.5, texture2D(uMask, quv).a);

    // gaps grow as the word breaks apart
    float gapW = 0.05 + 0.06 * smoothstep(0.03, 0.3, uScroll);
    vec2 lc = fract(rel / uCell);
    float gap = step(gapW, lc.x) * step(lc.x, 1.0 - gapW) * step(gapW, lc.y) * step(lc.y, 1.0 - gapW);

    float cellsX = uMaskRect.z / uCell;
    float th = launchThreshold(cellId, cellsX);
    float gone = step(th, uScroll);

    float alpha = mCell * gap * (1.0 - gone) * on;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(cellColor(cellId), alpha);
  }
`;

const CELL_VERT = /* glsl */ `
  attribute vec2 aCellPos;
  attribute vec2 aCellId;
  attribute float aRand;
  varying vec2 vCellId;
  varying float vT;

  void main() {
    vCellId = aCellId;
    float cellsX = uMaskRect.z / uCell;
    float th = launchThreshold(aCellId, cellsX);
    float t = clamp((uScroll - th) / 0.32, 0.0, 1.0);
    vT = t;

    float isOn = step(0.0001, t) * (1.0 - step(1.0, t));
    vec2 dir = normalize(vec2(0.5 + fract(aRand * 13.7) * 0.8, 0.7 + fract(aRand * 29.3) * 0.9));
    float dist = (100.0 + fract(aRand * 47.1) * 220.0) * (uRes.y / 900.0);
    float eased = 1.0 - pow(1.0 - t, 2.1);
    vec2 center = aCellPos + dir * eased * dist;

    float ang = (aRand - 0.5) * 6.0 * t;
    float ca = cos(ang);
    float sa = sin(ang);
    float scale = uCell * (1.0 - 0.85 * eased) * isOn;
    vec2 corner = position.xy * scale;
    corner = vec2(corner.x * ca - corner.y * sa, corner.x * sa + corner.y * ca);

    vec2 ndc = ((center + corner) / uRes) * 2.0 - 1.0;
    gl_Position = vec4(ndc, 0.0, 1.0);
  }
`;

const CELL_FRAG = /* glsl */ `
  varying vec2 vCellId;
  varying float vT;

  void main() {
    if (vT <= 0.0 || vT >= 1.0) discard;
    gl_FragColor = vec4(cellColor(vCellId), 1.0 - vT);
  }
`;

export class DissolveScene {
  readonly uniforms: DissolveUniforms;
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

    // bone #E5DED2 in 0..1
    this.uniforms = {
      uMask: { value: null },
      uRes: { value: [1, 1] },
      uMaskRect: { value: [0, 0, 1, 1] },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uCell: { value: 13 },
      uColor: { value: [229 / 255, 222 / 255, 210 / 255] },
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
    this.uniforms.uCell.value = Math.round(12 * dpr);

    this.drawMask(rect, dpr);
    this.buildCells();
    this.renderer.compile(this.scene, this.camera);
  }

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

    const glX = (left - canvasRect.left) * dpr - pads;
    const glYTop = (top - canvasRect.top) * dpr - pads;
    const glY = this.uniforms.uRes.value[1] - (glYTop + mh);
    this.uniforms.uMaskRect.value = [glX, glY, mw, mh];
  }

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
        const mx = Math.min(mw - 1, Math.round((cx + 0.5) * cell));
        const myTop = Math.min(mh - 1, Math.round((rows - cy - 0.5) * cell));
        const a = data[(myTop * mw + mx) * 4 + 3];
        if (a < 96) continue;
        pos.push(rx + (cx + 0.5) * cell, ry + (cy + 0.5) * cell);
        ids.push(cx, cy);
        rand.push(Math.abs((Math.sin(cx * 127.1 + cy * 311.7) * 43758.5453) % 1));
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
    geo.setAttribute("aRand", new InstancedBufferAttribute(new Float32Array(rand), 1));
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
