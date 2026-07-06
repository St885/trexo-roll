// settings-smoke.mjs — Verifica los ajustes booleanos persistidos (audio + joystick) SIN
// navegador. En particular, el joystick OPCIONAL (v0.25.4): por defecto OFF, se alterna y
// persiste, y sobrevive a «Reiniciar progreso» (es una preferencia, no progreso).
//
// Uso:  node tools/settings-smoke.mjs

// localStorage en memoria (determinista; Node no lo trae fiable).
globalThis.localStorage = (() => { const m = new Map(); return {
  getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() }; })();

const { getSettings, setSetting, resetProgress, setStars, getTotalStars } = await import('../src/utils/storage.js');

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

console.log('\n[Joystick opcional — por defecto OFF]');
ok(getSettings().showJoystick === false, 'showJoystick por defecto = false (control principal = arrastre táctil)');

console.log('\n[Alternar y persistir]');
setSetting('showJoystick', true);
ok(getSettings().showJoystick === true, 'activar joystick → showJoystick = true (persistido)');
setSetting('showJoystick', false);
ok(getSettings().showJoystick === false, 'desactivar joystick → showJoystick = false');

console.log('\n[Audio sigue funcionando]');
setSetting('sfxOn', false); setSetting('musicOn', false);
ok(getSettings().sfxOn === false && getSettings().musicOn === false, 'sfxOn/musicOn togglean como antes');
setSetting('sfxOn', true);
ok(getSettings().sfxOn === true, 'sfxOn vuelve a true');

console.log('\n[Clave desconocida se ignora]');
setSetting('hackFlag', true);
ok(getSettings().hackFlag === undefined, 'setSetting ignora claves no permitidas');

console.log('\n[Reiniciar progreso conserva la preferencia de joystick]');
setSetting('showJoystick', true);
setStars(1, 3);
resetProgress();
ok(getTotalStars() === 0, 'resetProgress borra el progreso (estrellas = 0)');
ok(getSettings().showJoystick === true, 'resetProgress CONSERVA showJoystick (es preferencia, no progreso)');

console.log(`\n${fails === 0 ? '✅ Ajustes (audio + joystick) OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
