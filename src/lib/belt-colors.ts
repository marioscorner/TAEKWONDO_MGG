// src/lib/belt-colors.ts
/**
 * Utilidades para cinturones de Taekwondo
 */

export const BELTS = [
  'Blanco',
  'Blanco-Amarillo',
  'Amarillo',
  'Amarillo-Naranja',
  'Naranja',
  'Naranja-Verde',
  'Verde',
  'Verde-Azul',
  'Azul',
  'Azul-Rojo',
  'Rojo',
  'Negro 1º dan',
  'Negro 2º dan',
  'Negro 3º dan',
  'Negro 4º dan',
  'Negro 5º dan',
  'Negro 6º dan',
  'Negro 7º dan',
  'Negro 8º dan',
  'Negro 9º dan',
] as const;

export type BeltType = typeof BELTS[number];

/**
 * Obtiene el color de texto para un cinturón
 */
export function getBeltTextColor(belt: string | null | undefined): string {
  if (!belt) return 'text-gray-400';
  
  // Cinturones negros (todos los danes)
  if (belt.startsWith('Negro')) {
    return 'text-gray-900 dark:text-gray-100';
  }
  
  switch (belt) {
    case 'Rojo':
      return 'text-red-600';
    case 'Azul-Rojo':
      return 'text-purple-600';
    case 'Azul':
      return 'text-blue-600';
    case 'Verde-Azul':
      return 'text-cyan-600';
    case 'Verde':
      return 'text-green-600';
    case 'Naranja-Verde':
      return 'text-lime-600';
    case 'Naranja':
      return 'text-orange-600';
    case 'Amarillo-Naranja':
      return 'text-amber-600';
    case 'Amarillo':
      return 'text-yellow-600';
    case 'Blanco-Amarillo':
      return 'text-yellow-400';
    case 'Blanco':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Obtiene el badge CSS para un cinturón
 */
export function getBeltBadgeClass(belt: string | null | undefined): string {
  if (!belt) return 'bg-gray-100 text-gray-800';
  
  // Cinturones negros (todos los danes)
  if (belt.startsWith('Negro')) {
    return 'bg-black text-white';
  }
  
  switch (belt) {
    case 'Rojo':
      return 'bg-red-500 text-white';
    case 'Azul-Rojo':
      return 'bg-gradient-to-r from-blue-500 to-red-500 text-white';
    case 'Azul':
      return 'bg-blue-500 text-white';
    case 'Verde-Azul':
      return 'bg-gradient-to-r from-green-500 to-blue-500 text-white';
    case 'Verde':
      return 'bg-green-500 text-white';
    case 'Naranja-Verde':
      return 'bg-gradient-to-r from-orange-500 to-green-500 text-white';
    case 'Naranja':
      return 'bg-orange-500 text-white';
    case 'Amarillo-Naranja':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
    case 'Amarillo':
      return 'bg-yellow-400 text-gray-800';
    case 'Blanco-Amarillo':
      return 'bg-gradient-to-r from-gray-100 to-yellow-400 text-gray-800';
    case 'Blanco':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Obtiene el índice del cinturón (para ordenar por nivel)
 */
export function getBeltLevel(belt: string | null | undefined): number {
  if (!belt) return -1;
  const index = BELTS.indexOf(belt as BeltType);
  // Si no está en la lista pero es un cinturón negro, devolver un índice alto
  if (index === -1 && belt.startsWith('Negro')) {
    return BELTS.length; // Después de todos los cinturones
  }
  return index;
}

/**
 * Verifica si es un cinturón completo (no es medio cinturón)
 */
export function isFullBelt(belt: string | null | undefined): boolean {
  if (!belt) return false;
  // Los cinturones negros con dan son cinturones completos
  if (belt.startsWith('Negro')) return true;
  // Los demás no son completos si tienen guión
  return !belt.includes('-');
}

