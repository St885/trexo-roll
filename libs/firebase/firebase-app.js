// firebase-app.js — PLACEHOLDER (no es el SDK real).
//
// El juego usa el SDK de Firebase VENDORIZADO en esta carpeta. Hasta que coloques los
// archivos reales (npm run fetch:firebase, o manualmente — ver README.md), este placeholder
// mantiene la estructura lista y el juego en MODO DEMO (firebaseClient detecta __PLACEHOLDER__
// y no intenta inicializar Firebase). No contiene claves, tokens ni nada sensible.
//
// SDK objetivo: Firebase Web modular v10.12.2 (firebase-app.js).

export const __PLACEHOLDER__ = true;

function notVendored() {
  throw new Error('[firebase-vendor] SDK no vendorizado. Coloca el firebase-app.js real en libs/firebase/ (ver README.md).');
}

export function initializeApp() { notVendored(); }
export function getApp() { notVendored(); }
export function getApps() { return []; }
