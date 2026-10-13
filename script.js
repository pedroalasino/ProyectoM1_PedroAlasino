/* ==========================================================================
   Generador de Paletas · Colorfly Studio
   Lógica de la aplicación
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Generación de colores aleatorios
   Cada color se guarda en HSL (h, s, l) porque permite controlar el tono,
   la saturación y la luminosidad por separado; HEX y RGBA se calculan a partir de él.
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
 * grises apagados y colores casi blancos o casi negros, que rara vez sirven
 * en una propuesta de branding.
 */
function generateRandomColor() {
    return {
        h: getRandomInt(0, 359),   // tono: posición en el círculo cromático (grados)
        s: getRandomInt(45, 90),   // saturación (%)
        l: getRandomInt(30, 75),   // luminosidad (%)
        locked: false
    };
}

/* --------------------------------------------------------------------------
   2. Conversión de formatos (HSL -> RGB -> HEX / RGBA)
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

/**
 * Devuelve el código del color como texto en el formato pedido: "hex", "hsl" o "rgba".
 */
function formatColor(color, format) {
    const { h, s, l } = color;

    if (format === 'hsl') {
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    const { r, g, b } = hslToRgb(h, s, l);

    if (format === 'rgba') {
        return `rgba(${r}, ${g}, ${b}, 1)`;
    }

    return `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`.toUpperCase();
}

/* --------------------------------------------------------------------------
   3. Referencias al DOM y estado de la aplicación
   -------------------------------------------------------------------------- */
const paletteGrid = document.getElementById('palette-grid');
const sizeSelect = document.getElementById('palette-size');
const formatSelect = document.getElementById('color-format');
const generateBtn = document.getElementById('generate-btn');
const toast = document.getElementById('toast');

const TOAST_DURATION_MS = 2000;

// La paleta actual: un array de objetos { h, s, l, locked }.
// Es la "fuente de verdad": el DOM siempre se dibuja a partir de este array.
let palette = [];
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
function createColorCard(color, index, animate) {
    const code = formatColor(color, formatSelect.value);

    const card = document.createElement('li');
    card.classList.add('color-card');
    card.classList.toggle('color-card--entering', animate);

    // La muestra es un <button>: se puede activar con mouse, Enter o Espacio
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.classList.add('color-card__swatch');
    swatch.dataset.index = index;
    swatch.setAttribute('aria-label', `Copiar color ${code}`);
    // Único estilo aplicado desde JS: el color es dinámico y no puede definirse en style.css
    swatch.style.backgroundColor = formatColor(color, 'hex');

    const info = document.createElement('div');
    info.classList.add('color-card__info');

    const codeText = document.createElement('code');
    codeText.classList.add('color-card__code');
    codeText.textContent = code;

    info.append(codeText);
    card.append(swatch, info);
    return card;
}

/**
 * Dibuja toda la paleta. Con animate = true las tarjetas entran con animación.
 */
function renderPalette(animate) {
    const cards = palette.map((color, index) => createColorCard(color, index, animate));
    paletteGrid.replaceChildren(...cards);
}

/**
 * Genera una paleta nueva del tamaño elegido en el <select>.
 */
function generatePalette() {
    const size = Number(sizeSelect.value);
    palette = Array.from({ length: size }, () => generateRandomColor());
    renderPalette(true);
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

// Cambiar el formato no cambia los colores: solo vuelve a dibujar los códigos
formatSelect.addEventListener('change', (event) => {
    renderPalette(false);
    showToast(`Mostrando códigos en ${event.target.value.toUpperCase()}`);
});

// Atajo: barra espaciadora para generar, solo si el foco no está en un control
// (en un botón o select, Espacio ya tiene su propia función)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();   // evita que la página haga scroll
        generateBtn.click();
    }
});

/* --------------------------------------------------------------------------
   7. Inicio
   -------------------------------------------------------------------------- */
generatePalette();
