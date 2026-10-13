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
