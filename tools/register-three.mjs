// register-three.mjs — Registra el hook que resuelve 'three' al archivo vendorizado.
// Se carga con: node --import ./tools/register-three.mjs <script>
import { register } from 'node:module';
register('./three-resolve-hook.mjs', import.meta.url);
