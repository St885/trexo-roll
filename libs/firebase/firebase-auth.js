// firebase-auth.js — PLACEHOLDER (no es el SDK real). Ver README.md y firebase-app.js.
// SDK objetivo: Firebase Web modular v10.12.2 (firebase-auth.js). Sin claves ni tokens.

export const __PLACEHOLDER__ = true;

function notVendored() {
  throw new Error('[firebase-vendor] SDK no vendorizado. Coloca el firebase-auth.js real en libs/firebase/ (ver README.md).');
}

export function getAuth() { notVendored(); }
export function createUserWithEmailAndPassword() { notVendored(); }
export function signInWithEmailAndPassword() { notVendored(); }
export function signOut() { notVendored(); }
export function sendPasswordResetEmail() { notVendored(); }
export function updateProfile() { notVendored(); }
export function onAuthStateChanged() { notVendored(); }
