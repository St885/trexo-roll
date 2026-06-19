// three-resolve-hook.mjs — Hook de resolución de módulos para herramientas Node.
// Resuelve el specifier 'three' al archivo vendorizado (como hace el importmap del navegador).
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'three') {
    return {
      url: new URL('../libs/three.module.js', import.meta.url).href,
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}
