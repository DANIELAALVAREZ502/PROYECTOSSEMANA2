export const CONFIG = {
  LONGITUD_PALABRA: 5, // letras por palabra
  INTENTOS_MAXIMOS: 6, // intentos por partida
  MODULO_GENERADOR: 2147483647, // valores posibles del generador
  MULTIPLICADOR_GENERADOR: 48271, // factor del generador
  DESPLAZAMIENTO_SEMILLA: 1, // unidades para evitar una semilla nula
  INDICE_INICIAL: 0, // posición inicial en listas
  INDICE_NO_ENCONTRADO: -1, // posición que indica que una letra no existe
} as const

export type ColorPista = 'verde' | 'amarillo' | 'gris'

export type ResultadoPartida = 'sin_iniciar' | 'en_curso' | 'ganada' | 'perdida'

export interface Intento {
  palabra: string
  pistas: ColorPista[]
}

export interface EstadoJuego {
  palabraSecreta: string | null
  intentos: Intento[]
  resultado: ResultadoPartida
}

export const DICCIONARIO: readonly string[] = [
  'ABRIL', 'AGUAS', 'AMIGO', 'ARBOL', 'ARENA', 'AROMA', 'AVION', 'BARCO',
  'BEBER', 'BESOS', 'BLUSA', 'BOLSA', 'BRISA', 'CABLE', 'CALOR', 'CAMPO',
  'CANTO', 'CARTA', 'CASAS', 'CIELO', 'CLASE', 'CLAVO', 'COCHE', 'COLOR',
  'COMER', 'COPIA', 'CORAL', 'COSAS', 'CREMA', 'CUERO', 'DATOS', 'DESEO',
  'DULCE', 'ERROR', 'ETAPA', 'FELIZ', 'FERIA', 'FIRMA', 'FLORA', 'FONDO',
  'FORMA', 'FRESA', 'FRUTA', 'GAFAS', 'GANAR', 'GENTE', 'GOLPE', 'GRANO',
  'GRITO', 'GRUPO', 'HIELO', 'HIJOS', 'HOGAR', 'HONOR', 'HUEVO', 'IDEAL',
  'IGUAL', 'JABON', 'JOVEN', 'JUEGO', 'JULIO', 'LARGO', 'LEJOS', 'LIBRO',
  'LUGAR', 'MADRE', 'MAGIA', 'MANGO', 'MANOS', 'MARCA', 'MARZO', 'MENTE',
  'METRO', 'MIEDO', 'MIRAR', 'MONTE', 'MORIR', 'MOTOS', 'MUJER', 'MUNDO',
  'NARIZ', 'NEGRO', 'NIÑEZ', 'NOCHE', 'NOTAS', 'NUEVO', 'NUNCA', 'OBRAS',
  'OLIVA', 'ORDEN', 'PADRE', 'PAPEL', 'PARTE', 'PASAR', 'PASTA', 'PECHO',
  'PERRO', 'PESAR', 'PIEZA', 'PISTA', 'PLANO', 'PLATO', 'PLAZA', 'POEMA',
  'PRIMO', 'PULSO', 'REGLA', 'REINA', 'RITMO', 'ROBAR', 'RODAR', 'RUMBO',
  'SABER', 'SABOR', 'SACAR', 'SALIR', 'SALTO', 'SALUD', 'SEÑAL', 'SERIE',
  'SILLA', 'SITIO', 'SUELO', 'SUEÑO', 'TABLA', 'TAREA', 'TARDE', 'TARTA',
  'TECHO', 'TEMOR', 'TINTA', 'TOCAR', 'TOMAR', 'TRATO', 'TRIGO', 'UNICA',
  'UNIDO', 'USADO', 'VALOR', 'VAPOR', 'VASOS', 'VECES', 'VERDE', 'VIAJE',
  'VIENE', 'VISTA', 'VITAL', 'VIVIR', 'VUELO',
]

const SIMBOLO_PROTEGIDO_ENE = '\uE000'

function normalizarPalabra(palabra: string): string {
  return palabra
    .trim()
    .toLocaleUpperCase('es')
    .replace(/Ñ/g, SIMBOLO_PROTEGIDO_ENE)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(new RegExp(SIMBOLO_PROTEGIDO_ENE, 'g'), 'Ñ')
}

export function crearGeneradorConSemilla(semilla: number): () => number {
  if (!Number.isSafeInteger(semilla)) {
    throw new RangeError('La semilla debe ser un número entero seguro.')
  }

  const rangoSemilla = CONFIG.MODULO_GENERADOR - CONFIG.DESPLAZAMIENTO_SEMILLA
  let estado = semilla % rangoSemilla
  if (estado < CONFIG.INDICE_INICIAL) {
    estado += rangoSemilla
  }
  estado += CONFIG.DESPLAZAMIENTO_SEMILLA

  return () => {
    estado = (estado * CONFIG.MULTIPLICADOR_GENERADOR) % CONFIG.MODULO_GENERADOR
    return estado / CONFIG.MODULO_GENERADOR
  }
}

export function crearEstadoJuego(): EstadoJuego {
  return {
    palabraSecreta: null,
    intentos: [],
    resultado: 'sin_iniciar',
  }
}

export function esPalabraValida(palabra: string): boolean {
  const palabraNormalizada = normalizarPalabra(palabra)
  return (
    palabraNormalizada.length === CONFIG.LONGITUD_PALABRA &&
    /^[A-ZÑ]+$/u.test(palabraNormalizada) &&
    DICCIONARIO.includes(palabraNormalizada)
  )
}

function elegirPalabra(semilla: number): string {
  const generarNumero = crearGeneradorConSemilla(semilla)
  const indice = Math.floor(generarNumero() * DICCIONARIO.length)
  return DICCIONARIO[indice]
}

export function iniciarPartida(estado: EstadoJuego, semilla: number): boolean {
  if (estado.resultado !== 'sin_iniciar' || !Number.isSafeInteger(semilla)) {
    return false
  }

  estado.palabraSecreta = elegirPalabra(semilla)
  estado.intentos = []
  estado.resultado = 'en_curso'
  return true
}

export function reiniciarPartida(estado: EstadoJuego, semilla: number): boolean {
  if (!Number.isSafeInteger(semilla)) {
    return false
  }

  estado.palabraSecreta = elegirPalabra(semilla)
  estado.intentos = []
  estado.resultado = 'en_curso'
  return true
}

function calcularPistas(palabraSecreta: string, intento: string): ColorPista[] {
  const pistas: ColorPista[] = Array.from(
    { length: CONFIG.LONGITUD_PALABRA },
    () => 'gris',
  )
  const letrasRestantes = palabraSecreta.split('')

  for (
    let indice = CONFIG.INDICE_INICIAL;
    indice < CONFIG.LONGITUD_PALABRA;
    indice += CONFIG.DESPLAZAMIENTO_SEMILLA
  ) {
    if (intento[indice] === palabraSecreta[indice]) {
      pistas[indice] = 'verde'
      letrasRestantes[indice] = ''
    }
  }

  for (
    let indice = CONFIG.INDICE_INICIAL;
    indice < CONFIG.LONGITUD_PALABRA;
    indice += CONFIG.DESPLAZAMIENTO_SEMILLA
  ) {
    if (pistas[indice] === 'verde') {
      continue
    }

    const indiceLetra = letrasRestantes.indexOf(intento[indice])
    if (indiceLetra !== CONFIG.INDICE_NO_ENCONTRADO) {
      pistas[indice] = 'amarillo'
      letrasRestantes[indiceLetra] = ''
    }
  }

  return pistas
}

export function adivinarPalabra(estado: EstadoJuego, palabra: string): boolean {
  if (
    estado.resultado !== 'en_curso' ||
    estado.palabraSecreta === null ||
    !esPalabraValida(palabra) ||
    estado.intentos.length >= CONFIG.INTENTOS_MAXIMOS
  ) {
    return false
  }

  const palabraNormalizada = normalizarPalabra(palabra)
  estado.intentos.push({
    palabra: palabraNormalizada,
    pistas: calcularPistas(estado.palabraSecreta, palabraNormalizada),
  })

  if (palabraNormalizada === estado.palabraSecreta) {
    estado.resultado = 'ganada'
  } else if (estado.intentos.length >= CONFIG.INTENTOS_MAXIMOS) {
    estado.resultado = 'perdida'
  }

  return true
}

export function obtenerCuadritoCompartible(estado: EstadoJuego): string {
  if (estado.resultado !== 'ganada' && estado.resultado !== 'perdida') {
    return ''
  }

  const simbolos: Record<ColorPista, string> = {
    verde: '🟩',
    amarillo: '🟨',
    gris: '⬛',
  }

  return estado.intentos
    .map((intento) => intento.pistas.map((pista) => simbolos[pista]).join(''))
    .join('\n')
}
