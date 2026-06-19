// footprint.js — Geometría lógica del tablero.
// Define la "huella" jugable (dónde puede estar la bola sin caer) como la unión
// de formas primitivas. La misma definición la usa BoardBuilder para renderizar,
// así el render y la física siempre coinciden.
//
// Sistema de coordenadas: plano local del tablero. x → derecha, z → hacia la cámara.
// Origen en el centro del tablero. Unidades del mundo (~metros).

/**
 * @typedef {{type:'rect', x:number, z:number, w:number, d:number}} RectShape
 * @typedef {{type:'circle', x:number, z:number, r:number}} CircleShape
 * @typedef {{type:'poly', points:Array<[number,number]>}} PolyShape
 * @typedef {RectShape|CircleShape|PolyShape} Shape
 */

/** ¿El punto (x,z) está dentro de una forma concreta? */
function insideShape(shape, x, z) {
  switch (shape.type) {
    case 'rect':
      return (
        x >= shape.x - shape.w / 2 &&
        x <= shape.x + shape.w / 2 &&
        z >= shape.z - shape.d / 2 &&
        z <= shape.z + shape.d / 2
      );
    case 'circle': {
      const dx = x - shape.x;
      const dz = z - shape.z;
      return dx * dx + dz * dz <= shape.r * shape.r;
    }
    case 'poly':
      return pointInPolygon(shape.points, x, z);
    default:
      return false;
  }
}

/** Point-in-polygon por ray casting. points: [[x,z], ...]. */
export function pointInPolygon(points, x, z) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0];
    const zi = points[i][1];
    const xj = points[j][0];
    const zj = points[j][1];
    const intersect =
      zi > z !== zj > z &&
      x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * La huella del tablero es la unión de varias formas. El punto es válido si
 * está dentro de AL MENOS una forma.
 * @param {Shape[]} shapes
 */
export function isInsideFootprint(shapes, x, z) {
  for (const shape of shapes) {
    if (insideShape(shape, x, z)) return true;
  }
  return false;
}

/** Bounding box aproximado de la huella (para encuadrar cámara / decoración). */
export function footprintBounds(shapes) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const s of shapes) {
    if (s.type === 'rect') {
      minX = Math.min(minX, s.x - s.w / 2); maxX = Math.max(maxX, s.x + s.w / 2);
      minZ = Math.min(minZ, s.z - s.d / 2); maxZ = Math.max(maxZ, s.z + s.d / 2);
    } else if (s.type === 'circle') {
      minX = Math.min(minX, s.x - s.r); maxX = Math.max(maxX, s.x + s.r);
      minZ = Math.min(minZ, s.z - s.r); maxZ = Math.max(maxZ, s.z + s.r);
    } else if (s.type === 'poly') {
      for (const [px, pz] of s.points) {
        minX = Math.min(minX, px); maxX = Math.max(maxX, px);
        minZ = Math.min(minZ, pz); maxZ = Math.max(maxZ, pz);
      }
    }
  }
  return { minX, maxX, minZ, maxZ, width: maxX - minX, depth: maxZ - minZ };
}
