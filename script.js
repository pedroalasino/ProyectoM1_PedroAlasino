/* ==========================================================================
   Generador de Paletas · Colorfly Studio
   Lógica de la aplicación
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Generación de colores aleatorios
   Cada color se guarda en HSL (h, s, l) porque permite controlar el tono,
   la saturación y la luminosidad por separado; HEX se calcula a partir de él.
   -------------------------------------------------------------------------- */

/**
 * Devuelve un entero aleatorio entre min y max (ambos incluidos).
 * Math.random() da un decimal en [0, 1); al multiplicarlo por la cantidad de
 * valores posibles y redondear hacia abajo con Math.floor obtenemos 0..(n-1),
 * y sumando min lo desplazamos al rango buscado.
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Crea un color aleatorio en HSL.
 * La saturación y la luminosidad están acotadas a propósito: así se evitan
 * grises apagados y colores casi blancos o casi negros.
 */
function generateRandomColor() {
    return {
        h: getRandomInt(0, 359),   // tono: posición en el círculo cromático (grados)
        s: getRandomInt(45, 90),   // saturación (%)
        l: getRandomInt(30, 75)    // luminosidad (%)
    };
}

/* --------------------------------------------------------------------------
   2. Conversión de formatos (HSL -> RGB -> HEX)
   -------------------------------------------------------------------------- */

/**
 * Convierte HSL a RGB con la fórmula estándar de la especificación CSS Color 4.
 * Devuelve cada canal como entero entre 0 y 255.
 */
function hslToRgb(h, s, l) {
    const saturation = s / 100;
    const lightness = l / 100;
    const amplitude = saturation * Math.min(lightness, 1 - lightness);

    // Cada canal (n = 0 rojo, 8 verde, 4 azul) se calcula desplazando el tono en el círculo
    const channel = (n) => {
        const k = (n + h / 30) % 12;
        const value = lightness - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(value * 255);
    };

    return { r: channel(0), g: channel(8), b: channel(4) };
}

/** Convierte un canal 0-255 a dos dígitos hexadecimales (ej: 10 -> "0a"). */
function toHexPair(value) {
    return value.toString(16).padStart(2, '0');
}

function toHex(color) {
    const { r, g, b } = hslToRgb(color.h, color.s, color.l);
    return `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`.toUpperCase();
}

function toHsl(color) {
    return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
}

/* --------------------------------------------------------------------------
   3. Referencias al DOM
   -------------------------------------------------------------------------- */
const paletteGrid = document.getElementById('palette-grid');
const sizeSelect = document.getElementById('palette-size');
const generateBtn = document.getElementById('generate-btn');
const toast = document.getElementById('toast');

const TOAST_DURATION_MS = 2000;

let toastTimeoutId = null;

/* --------------------------------------------------------------------------
   4. Microfeedback (toast)
   -------------------------------------------------------------------------- */

/**
 * Muestra un mensaje temporal. Como el contenedor tiene aria-live="polite",
 * los lectores de pantalla también lo anuncian.
 */
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('toast--visible');

    // Si llega un mensaje nuevo antes de que se oculte el anterior, reiniciamos el temporizador
    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
        toast.classList.remove('toast--visible');
    }, TOAST_DURATION_MS);
}

/* --------------------------------------------------------------------------
   5. Renderizado de la paleta
   -------------------------------------------------------------------------- */

/**
 * Crea el <li> de una tarjeta de color. Se usa createElement + textContent
 * (y no innerHTML) para no interpretar nunca texto como HTML.
 */
function createColorCard(color) {
    const hex = toHex(color);

    const card = document.createElement('li');
    card.classList.add('color-card');

    const swatch = document.createElement('div');
    swatch.classList.add('color-card__swatch');
    // Único estilo aplicado desde JS: el color es dinámico y no puede definirse en style.css
    swatch.style.backgroundColor = hex;

    const info = document.createElement('div');
    info.classList.add('color-card__info');

    const hexText = document.createElement('code');
    hexText.classList.add('color-card__code');
    hexText.textContent = hex;

    const hslText = document.createElement('code');
    hslText.classList.add('color-card__code', 'color-card__code--secondary');
    hslText.textContent = toHsl(color);

    info.append(hexText, hslText);
    card.append(swatch, info);
    return card;
}

/**
 * Genera una paleta nueva del tamaño elegido en el <select> y la dibuja.
 */
function generatePalette() {
    const size = Number(sizeSelect.value);
    const cards = [];

    for (let i = 0; i < size; i++) {
        cards.push(createColorCard(generateRandomColor()));
    }

    // replaceChildren borra las tarjetas anteriores y agrega las nuevas en un solo paso
    paletteGrid.replaceChildren(...cards);
}

/* --------------------------------------------------------------------------
   6. Eventos
   -------------------------------------------------------------------------- */
generateBtn.addEventListener('click', () => {
    generatePalette();
    showToast('¡Nueva paleta generada!');
});

sizeSelect.addEventListener('change', (event) => {
    generatePalette();
    showToast(`Paleta de ${event.target.value} colores generada`);
});

/* --------------------------------------------------------------------------
   7. Inicio
   -------------------------------------------------------------------------- */
generatePalette();
