import * as THREE from './vendor/three.module.js';

// Small, real-time CPU projection renderer for environments without WebGL.
// The scene graph and simulation are unchanged. This deliberately implements
// only the Mesh/Line/Sprite subset used by the two Playlab prototypes.
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const channel = value => Math.round(255 * clamp(value <= .0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - .055, 0, 1));
const colorCache = new WeakMap();
function materialColor(material, light = 1) {
  const c = material.color || WHITE;
  const e = material.emissive;
  const ei = material.emissiveIntensity ?? 1;
  const bucket = Math.round(light * 32);
  const signature = `${c.r},${c.g},${c.b},${e?.r || 0},${e?.g || 0},${e?.b || 0},${ei}`;
  let cache = colorCache.get(material);
  if (!cache || cache.signature !== signature) {
    cache = { signature, shades: new Map() };
    colorCache.set(material, cache);
  }
  if (!cache.shades.has(bucket)) {
    const l = bucket / 32;
    cache.shades.set(bucket, `rgb(${channel(c.r * l + (e?.r || 0) * ei)},${channel(c.g * l + (e?.g || 0) * ei)},${channel(c.b * l + (e?.b || 0) * ei)})`);
  }
  return cache.shades.get(bucket);
}
const WHITE = new THREE.Color(0xffffff);

export class SoftwareRenderer {
  constructor(options = {}) {
    this.domElement = options.canvas || document.createElement('canvas');
    this.domElement.dataset.renderer = 'software';
    this._ctx = this.domElement.getContext('2d', { alpha: options.alpha === true });
    if (!this._ctx) throw new Error('Canvas 2D is unavailable.');
    this._width = 1;
    this._height = 1;
    this._ratio = 1;
    this._clear = new THREE.Color(0x101820);
    this._clearAlpha = options.alpha ? 0 : 1;
    this._vp = new THREE.Matrix4();
    this._projected = new WeakMap();
    this._pool = [];
    this._commands = [];
    this._used = 0;
    this._disposed = false;
    this.shadowMap = { enabled: false, type: THREE.PCFSoftShadowMap };
    this.outputColorSpace = THREE.SRGBColorSpace;
    this.toneMapping = THREE.NoToneMapping;
    this.toneMappingExposure = 1;
    this.autoClear = true;
    this.isSoftwareRenderer = true;
    this.info = { render: { calls: 0, triangles: 0, lines: 0, points: 0 } };
  }

  setPixelRatio(ratio) {
    this._ratio = clamp(Number(ratio) || 1, .5, 1.5);
    this.setSize(this._width, this._height, false);
  }
  getPixelRatio() { return this._ratio; }
  setSize(width, height, updateStyle = true) {
    this._width = Math.max(1, Number(width) || 1);
    this._height = Math.max(1, Number(height) || 1);
    const w = Math.max(1, Math.round(this._width * this._ratio));
    const h = Math.max(1, Math.round(this._height * this._ratio));
    if (this.domElement.width !== w) this.domElement.width = w;
    if (this.domElement.height !== h) this.domElement.height = h;
    if (updateStyle) {
      this.domElement.style.width = `${this._width}px`;
      this.domElement.style.height = `${this._height}px`;
    }
  }
  getSize(target = new THREE.Vector2()) { return target.set(this._width, this._height); }
  getDrawingBufferSize(target = new THREE.Vector2()) { return target.set(this.domElement.width, this.domElement.height); }
  getContext() { return this._ctx; }
  setClearColor(color, alpha = 1) { this._clear.set(color); this._clearAlpha = alpha; }
  getClearColor(target = new THREE.Color()) { return target.copy(this._clear); }
  setClearAlpha(alpha) { this._clearAlpha = alpha; }
  getClearAlpha() { return this._clearAlpha; }
  clear() {
    const ctx = this._ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, this.domElement.width, this.domElement.height);
    if (this._clearAlpha > 0) {
      ctx.globalAlpha = this._clearAlpha;
      ctx.fillStyle = `#${this._clear.getHexString()}`;
      ctx.fillRect(0, 0, this.domElement.width, this.domElement.height);
    }
    ctx.globalAlpha = 1;
  }
  dispose() { this._disposed = true; this._pool.length = 0; this._commands.length = 0; }

  _command(type, object, material, depth) {
    const command = this._pool[this._used] || (this._pool[this._used] = {});
    this._used++;
    command.type = type;
    command.object = object;
    command.material = material;
    command.depth = depth;
    command.priority = (object.renderOrder || 0) + (material.depthTest === false ? 100000 : 0);
    this._commands.push(command);
    return command;
  }

  _vertices(object) {
    const position = object.geometry.attributes.position;
    let data = this._projected.get(object);
    if (!data || data.length !== position.count * 8) {
      data = new Float64Array(position.count * 8);
      this._projected.set(object, data);
    }
    const m = object.matrixWorld.elements;
    const p = this._vp.elements;
    const w2 = this._width / 2, h2 = this._height / 2;
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
      const wx = m[0] * x + m[4] * y + m[8] * z + m[12];
      const wy = m[1] * x + m[5] * y + m[9] * z + m[13];
      const wz = m[2] * x + m[6] * y + m[10] * z + m[14];
      minY = Math.min(minY, wy); maxY = Math.max(maxY, wy);
      const cw = p[3] * wx + p[7] * wy + p[11] * wz + p[15];
      const invW = 1 / cw, o = i * 8;
      data[o] = ((p[0] * wx + p[4] * wy + p[8] * wz + p[12]) * invW + 1) * w2;
      data[o + 1] = (1 - (p[1] * wx + p[5] * wy + p[9] * wz + p[13]) * invW) * h2;
      data[o + 2] = (p[2] * wx + p[6] * wy + p[10] * wz + p[14]) * invW;
      data[o + 3] = cw;
      data[o + 4] = wx;
      data[o + 5] = wy;
      data[o + 6] = wz;
      data[o + 7] = 0;
    }
    // Ground and its decals must precede moving objects: centroid-only painter
    // sorting would otherwise let one enormous floor triangle cover a player.
    data.groundPriority = maxY <= .18 && maxY - minY < .81 ? -1000 + maxY * 10 : null;
    return data;
  }

  _mesh(object) {
    const geometry = object.geometry;
    if (!geometry?.attributes.position) return;
    const data = this._vertices(object), indices = geometry.index;
    const count = indices ? indices.count : geometry.attributes.position.count;
    const start = Math.max(0, geometry.drawRange.start || 0);
    const end = Math.min(count, start + geometry.drawRange.count);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const groups = Array.isArray(object.material) && geometry.groups.length ? geometry.groups : [{ start, count: end - start, materialIndex: 0 }];
    for (const group of groups) {
      const mat = materials[group.materialIndex || 0];
      if (!mat || mat.visible === false || mat.opacity <= 0) continue;
      const from = Math.max(start, group.start), to = Math.min(end, group.start + group.count);
      for (let i = from; i + 2 < to; i += 3) {
        const ai = indices ? indices.getX(i) : i;
        const bi = indices ? indices.getX(i + 1) : i + 1;
        const ci = indices ? indices.getX(i + 2) : i + 2;
        const a = ai * 8, b = bi * 8, c = ci * 8;
        if (data[a + 3] <= 0 || data[b + 3] <= 0 || data[c + 3] <= 0) continue;
        if ((data[a + 2] < -1 && data[b + 2] < -1 && data[c + 2] < -1) || (data[a + 2] > 1 && data[b + 2] > 1 && data[c + 2] > 1)) continue;
        if (Math.max(data[a], data[b], data[c]) < 0 || Math.min(data[a], data[b], data[c]) > this._width || Math.max(data[a + 1], data[b + 1], data[c + 1]) < 0 || Math.min(data[a + 1], data[b + 1], data[c + 1]) > this._height) continue;
        const area = (data[b] - data[a]) * (data[c + 1] - data[a + 1]) - (data[b + 1] - data[a + 1]) * (data[c] - data[a]);
        if (Math.abs(area) < .015) continue;
        if ((mat.side === THREE.FrontSide && area >= 0) || (mat.side === THREE.BackSide && area <= 0)) continue;
        const command = this._command('triangle', object, mat, (data[a + 2] + data[b + 2] + data[c + 2]) / 3);
        if (data.groundPriority !== null && mat.depthTest !== false) command.priority += data.groundPriority;
        command.vertices = data;
        command.a = a; command.b = b; command.c = c;
        command.ai = ai; command.bi = bi; command.ci = ci;
        let shade = 1;
        if (!mat.isMeshBasicMaterial && !mat.isMeshNormalMaterial) {
          const ux = data[b + 4] - data[a + 4], uy = data[b + 5] - data[a + 5], uz = data[b + 6] - data[a + 6];
          const vx = data[c + 4] - data[a + 4], vy = data[c + 5] - data[a + 5], vz = data[c + 6] - data[a + 6];
          let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
          const length = Math.hypot(nx, ny, nz) || 1;
          const side = area < 0 ? 1 : -1;
          nx = nx / length * side; ny = ny / length * side; nz = nz / length * side;
          shade = .64 + .31 * Math.max(0, -.35 * nx + .82 * ny + .45 * nz) + .05 * Math.max(0, ny);
        }
        command.textureShade = !mat.isMeshBasicMaterial && !mat.transparent ? clamp(shade, .55, 1) : 1;
        command.color = materialColor(mat, shade);
      }
    }
  }

  _line(object) {
    const geometry = object.geometry;
    if (!geometry?.attributes.position) return;
    const mat = Array.isArray(object.material) ? object.material[0] : object.material;
    if (!mat || mat.visible === false || mat.opacity <= 0) return;
    const vertices = this._vertices(object), indices = geometry.index;
    const count = indices ? indices.count : geometry.attributes.position.count;
    const start = geometry.drawRange.start || 0, end = Math.min(count, start + geometry.drawRange.count);
    const step = object.isLineSegments ? 2 : 1;
    for (let i = start; i + 1 < end; i += step) {
      const a = (indices ? indices.getX(i) : i) * 8, b = (indices ? indices.getX(i + 1) : i + 1) * 8;
      if (vertices[a + 3] <= 0 || vertices[b + 3] <= 0 || (vertices[a + 2] > 1 && vertices[b + 2] > 1)) continue;
      const command = this._command('line', object, mat, (vertices[a + 2] + vertices[b + 2]) / 2 - .00002);
      if (vertices.groundPriority !== null && mat.depthTest !== false) command.priority += vertices.groundPriority;
      command.vertices = vertices; command.a = a; command.b = b;
      command.color = materialColor(mat);
    }
  }

  _sprite(object, camera) {
    const mat = object.material;
    if (!mat || mat.visible === false || mat.opacity <= 0) return;
    const world = object.matrixWorld.elements, vp = this._vp.elements;
    const x = world[12], y = world[13], z = world[14];
    const w = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
    if (w <= 0) return;
    const depth = (vp[2] * x + vp[6] * y + vp[10] * z + vp[14]) / w;
    if (depth < -1 || depth > 1) return;
    const command = this._command('sprite', object, mat, depth);
    command.x = ((vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / w + 1) * this._width / 2;
    command.y = (1 - (vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / w) * this._height / 2;
    const sx = Math.hypot(world[0], world[1], world[2]), sy = Math.hypot(world[4], world[5], world[6]);
    command.width = Math.abs(camera.projectionMatrix.elements[0] * sx / w * this._width / 2);
    command.height = Math.abs(camera.projectionMatrix.elements[5] * sy / w * this._height / 2);
    command.color = materialColor(mat);
  }

  _textureTriangle(command, image) {
    const uv = command.object.geometry.attributes.uv;
    if (!uv || !image?.width || !image?.height) return false;
    const ctx = this._ctx, d = command.vertices;
    const { a, b, c, ai, bi, ci } = command;
    const flipY = command.material.map.flipY !== false;
    const u1 = uv.getX(ai) * image.width, v1 = (flipY ? 1 - uv.getY(ai) : uv.getY(ai)) * image.height;
    const u2 = uv.getX(bi) * image.width, v2 = (flipY ? 1 - uv.getY(bi) : uv.getY(bi)) * image.height;
    const u3 = uv.getX(ci) * image.width, v3 = (flipY ? 1 - uv.getY(ci) : uv.getY(ci)) * image.height;
    const determinant = u1 * (v2 - v3) + u2 * (v3 - v1) + u3 * (v1 - v2);
    if (Math.abs(determinant) < .000001) return false;
    const x1 = d[a], y1 = d[a + 1], x2 = d[b], y2 = d[b + 1], x3 = d[c], y3 = d[c + 1];
    const aa = (x1 * (v2 - v3) + x2 * (v3 - v1) + x3 * (v1 - v2)) / determinant;
    const bb = (y1 * (v2 - v3) + y2 * (v3 - v1) + y3 * (v1 - v2)) / determinant;
    const cc = (x1 * (u3 - u2) + x2 * (u1 - u3) + x3 * (u2 - u1)) / determinant;
    const dd = (y1 * (u3 - u2) + y2 * (u1 - u3) + y3 * (u2 - u1)) / determinant;
    const ee = (x1 * (u2 * v3 - u3 * v2) + x2 * (u3 * v1 - u1 * v3) + x3 * (u1 * v2 - u2 * v1)) / determinant;
    const ff = (y1 * (u2 * v3 - u3 * v2) + y2 * (u3 * v1 - u1 * v3) + y3 * (u1 * v2 - u2 * v1)) / determinant;
    ctx.save();
    ctx.clip();
    ctx.transform(aa, bb, cc, dd, ee, ff);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
    return true;
  }

  render(scene, camera) {
    if (this._disposed) return;
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    this._vp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this._used = 0;
    this._commands.length = 0;
    scene.traverseVisible(object => {
      if (!camera.layers.test(object.layers)) return;
      if (object.isMesh) this._mesh(object);
      else if (object.isLine) this._line(object);
      else if (object.isSprite) this._sprite(object, camera);
    });
    this._commands.sort((a, b) => a.priority - b.priority || b.depth - a.depth);
    if (this.autoClear) {
      const saved = this._clear;
      if (scene.background?.isColor) this._clear = scene.background;
      this.clear();
      this._clear = saved;
    }
    const ctx = this._ctx;
    ctx.setTransform(this._ratio, 0, 0, this._ratio, 0, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const stats = this.info.render;
    stats.calls = 0; stats.triangles = 0; stats.lines = 0;
    for (const command of this._commands) {
      const mat = command.material, d = command.vertices;
      ctx.globalAlpha = clamp(mat.opacity ?? 1, 0, 1);
      if (command.type === 'triangle') {
        const { a, b, c } = command;
        ctx.beginPath();
        ctx.moveTo(d[a], d[a + 1]); ctx.lineTo(d[b], d[b + 1]); ctx.lineTo(d[c], d[c + 1]); ctx.closePath();
        if (mat.wireframe) {
          ctx.strokeStyle = command.color; ctx.lineWidth = mat.wireframeLinewidth || .7;
          ctx.setLineDash([]); ctx.stroke();
        } else {
          const image = mat.map?.source?.data || mat.map?.image;
          if (!image || !this._textureTriangle(command, image)) {
            ctx.fillStyle = command.color; ctx.fill();
          } else if (command.textureShade < .985) {
            // The opaque painted surfaces need the same directional depth as
            // solid materials. Alpha decals keep their exact transparent edges.
            ctx.globalAlpha = (mat.opacity ?? 1) * (1 - command.textureShade);
            ctx.fillStyle = '#1c233b'; ctx.fill();
          }
        }
        stats.triangles++;
      } else if (command.type === 'line') {
        ctx.beginPath(); ctx.moveTo(d[command.a], d[command.a + 1]); ctx.lineTo(d[command.b], d[command.b + 1]);
        ctx.strokeStyle = command.color; ctx.lineWidth = mat.linewidth || 1;
        ctx.setLineDash(mat.isLineDashedMaterial ? [5, 4] : []); ctx.stroke();
        stats.lines++;
      } else if (command.type === 'sprite') {
        const image = mat.map?.source?.data || mat.map?.image;
        const center = command.object.center;
        const x = command.x - command.width * (center?.x ?? .5);
        const y = command.y - command.height * (1 - (center?.y ?? .5));
        if (image?.width && image?.height) ctx.drawImage(image, x, y, command.width, command.height);
        else { ctx.fillStyle = command.color; ctx.fillRect(x, y, command.width, command.height); }
      }
      stats.calls++;
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
  }
}

export default SoftwareRenderer;
