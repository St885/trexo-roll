// Ball.js — La bola TREXoRoll: esfera blanca con emblema de T-Rex que gira al rodar.
// Vive como hijo del grupo del tablero, así se inclina visualmente junto a él.

import * as THREE from 'three';
import { PHYS } from '../utils/constants.js';
import { makeBallTexture } from './textures.js';
import { getBall, DEFAULT_BALL } from '../data/balls.js';

export class Ball {
  constructor(ballDef) {
    this.ballDef = ballDef || getBall(DEFAULT_BALL);
    const geo = new THREE.SphereGeometry(PHYS.BALL_RADIUS, 48, 32);
    const mat = new THREE.MeshStandardMaterial({
      map: makeBallTexture(this.ballDef),
      roughness: 0.25,
      metalness: 0.05,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.position.set(0, PHYS.BALL_RADIUS, 0);
    this._spinAxis = new THREE.Vector3();
    this._q = new THREE.Quaternion();
  }

  /** Cambia la apariencia de la bola (color + cara de dino). */
  setSkin(ballDef) {
    if (!ballDef) return;
    this.ballDef = ballDef;
    const old = this.mesh.material.map;
    this.mesh.material.map = makeBallTexture(ballDef);
    this.mesh.material.needsUpdate = true;
    if (old) old.dispose();
  }

  /** Coloca la bola en coordenadas del plano del tablero. */
  setPlanePosition(x, z, y = PHYS.BALL_RADIUS) {
    this.mesh.position.set(x, y, z);
  }

  /** Hace girar la bola de forma coherente con su velocidad de rodadura. */
  roll(vx, vz, dt) {
    const speed = Math.hypot(vx, vz);
    if (speed < 1e-3) return;
    // Eje horizontal perpendicular a la velocidad.
    this._spinAxis.set(vz, 0, -vx).normalize();
    const angle = (speed * dt) / PHYS.BALL_RADIUS;
    this._q.setFromAxisAngle(this._spinAxis, angle);
    this.mesh.quaternion.premultiply(this._q);
  }

  /** Reinicio visual al inicio del nivel. */
  reset(x, z) {
    this.mesh.position.set(x, PHYS.BALL_RADIUS, z);
    this.mesh.quaternion.identity();
    this.mesh.scale.set(1, 1, 1);
    this.mesh.visible = true;
  }
}
