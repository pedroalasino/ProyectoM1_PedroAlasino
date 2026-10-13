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
const saveBtn = document.getElementById('save-btn');
const savedList = document.getElementById('saved-list');
const savedEmpty = document.getElementById('saved-empty');
const toast = document.getElementById('toast');

const TOAST_DURATION_MS = 2000;
const MAX_SAVED_PALETTES = 12;
const STORAGE_KEY_STATE = 'colorfly-current-state';
const STORAGE_KEY_SAVED = 'colorfly-saved-palettes';
const VALID_SIZES = ['6', '8', '9'];
const VALID_FORMATS = ['hex', 'hsl', 'rgba'];

// La paleta actual: un array de objetos { h, s, l, locked }.
// Es la "fuente de verdad": el DOM siempre se dibuja a partir de este array.
let palette = [];
// Paletas favoritas: array de objetos { id, colors: [{ h, s, l }] }
let savedPalettes = [];
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
    card.classList.toggle('color-card--locked', color.locked);
    // Los colores bloqueados no cambian, así que no tiene sentido volver a animarlos
    card.classList.toggle('color-card--entering', animate && !color.locked);

    // La muestra es un <button>: se puede activar con mouse, Enter o Espacio.
    // data-action y data-index le dicen al listener delegado qué hacer y sobre qué color.
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.classList.add('color-card__swatch');
    swatch.dataset.action = 'copy';
    swatch.dataset.index = index;
    swatch.setAttribute('aria-label', `Copiar color ${code}`);
    // Único estilo aplicado desde JS: el color es dinámico y no puede definirse en style.css
    swatch.style.backgroundColor = formatColor(color, 'hex');

    const info = document.createElement('div');
    info.classList.add('color-card__info');

    const codeText = document.createElement('code');
    codeText.classList.add('color-card__code');
    codeText.textContent = code;

    const lockBtn = document.createElement('button');
    lockBtn.type = 'button';
    lockBtn.classList.add('color-card__lock');
    lockBtn.dataset.action = 'lock';
    lockBtn.dataset.index = index;
    updateLockButton(lockBtn, color.locked, index);

    info.append(codeText, lockBtn);
    card.append(swatch, info);
    return card;
}

/**
 * Sincroniza el botón de candado con el estado del color.
 * aria-pressed indica a los lectores de pantalla que es un botón de dos estados.
 */
function updateLockButton(button, locked, index) {
    button.textContent = locked ? '🔒' : '🔓';
    button.setAttribute('aria-pressed', String(locked));
    button.setAttribute('aria-label', `${locked ? 'Desbloquear' : 'Bloquear'} color ${index + 1}`);
    button.title = locked ? 'Desbloquear color' : 'Bloquear color';
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
 * Recorre cada posición: si ya hay un color bloqueado ahí, se conserva;
 * si no, se reemplaza por uno aleatorio. Esto también resuelve el cambio de
 * tamaño: al pasar de 9 a 6 se descartan las últimas posiciones.
 */
function generatePalette() {
    const size = Number(sizeSelect.value);

    palette = Array.from({ length: size }, (_, index) => {
        const current = palette[index];
        return current && current.locked ? current : generateRandomColor();
    });

    renderPalette(true);
    saveCurrentState();
}

/* --------------------------------------------------------------------------
   6. Acciones sobre las tarjetas: copiar y bloquear
   -------------------------------------------------------------------------- */

/**
 * Copia el código del color en el formato que se está mostrando.
 * navigator.clipboard devuelve una Promesa: con async/await esperamos
 * el resultado y, si falla (permisos, navegador viejo), avisamos en el toast.
 */
async function copyColor(index) {
    const code = formatColor(palette[index], formatSelect.value);

    try {
        await navigator.clipboard.writeText(code);
        showToast(`Copiado: ${code}`);
    } catch (error) {
        showToast('No se pudo copiar. Probá de nuevo.');
    }
}

/**
 * Bloquea o desbloquea un color. Actualiza solo esa tarjeta (en vez de
 * redibujar todo) para no perder el foco del teclado ni repetir animaciones.
 */
function toggleLock(index, button) {
    const color = palette[index];
    color.locked = !color.locked;

    button.closest('.color-card').classList.toggle('color-card--locked', color.locked);
    updateLockButton(button, color.locked, index);
    saveCurrentState();
    showToast(color.locked ? 'Color bloqueado' : 'Color desbloqueado');
}

/* --------------------------------------------------------------------------
   7. Persistencia en localStorage
   localStorage solo guarda texto: JSON.stringify convierte los objetos en texto
   al guardar y JSON.parse los reconstruye al leer.
   -------------------------------------------------------------------------- */

/**
 * Lee y parsea una clave de localStorage. Si no existe, está corrupta o el
 * navegador bloquea el acceso (modo privado), devuelve el valor por defecto.
 */
function readFromStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
}

/** Guarda un valor en localStorage. Si falla, la app sigue funcionando sin persistir. */
function writeToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('No se pudo guardar en localStorage:', error);
    }
}

/** Verifica que un dato leído de localStorage tenga forma de color válido. */
function isValidColor(color) {
    return color !== null
        && typeof color === 'object'
        && Number.isInteger(color.h)
        && Number.isInteger(color.s)
        && Number.isInteger(color.l);
}

/** Guarda la paleta actual (con sus candados) y la configuración de los selects. */
function saveCurrentState() {
    writeToStorage(STORAGE_KEY_STATE, {
        size: sizeSelect.value,
        format: formatSelect.value,
        palette: palette
    });
}

/**
 * Restaura el último estado. Devuelve true si había una paleta válida para mostrar.
 */
function restoreCurrentState() {
    const state = readFromStorage(STORAGE_KEY_STATE, null);
    if (state === null || typeof state !== 'object') {
        return false;
    }

    if (VALID_FORMATS.includes(state.format)) {
        formatSelect.value = state.format;
    }

    const isValidPalette = VALID_SIZES.includes(state.size)
        && Array.isArray(state.palette)
        && state.palette.length === Number(state.size)
        && state.palette.every(isValidColor);

    if (!isValidPalette) {
        return false;
    }

    sizeSelect.value = state.size;
    palette = state.palette.map(({ h, s, l, locked }) => ({ h, s, l, locked: locked === true }));
    return true;
}

/* --------------------------------------------------------------------------
   8. Paletas guardadas (favoritas)
   -------------------------------------------------------------------------- */

/** Crea el <li> de una paleta guardada: franjas de color + botón para eliminarla. */
function createSavedPaletteItem(savedPalette) {
    const item = document.createElement('li');
    item.classList.add('saved-palette');

    const hexCodes = savedPalette.colors.map((color) => formatColor(color, 'hex'));

    const loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.classList.add('saved-palette__load');
    loadBtn.dataset.action = 'load';
    loadBtn.dataset.id = savedPalette.id;
    loadBtn.setAttribute('aria-label', `Cargar paleta guardada: ${hexCodes.join(', ')}`);
    loadBtn.title = 'Cargar esta paleta';

    hexCodes.forEach((hex) => {
        const swatch = document.createElement('span');
        swatch.classList.add('saved-palette__swatch');
        swatch.style.backgroundColor = hex;
        loadBtn.append(swatch);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.classList.add('saved-palette__delete');
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = savedPalette.id;
    deleteBtn.setAttribute('aria-label', 'Eliminar paleta guardada');
    deleteBtn.title = 'Eliminar';
    deleteBtn.textContent = '✕';

    item.append(loadBtn, deleteBtn);
    return item;
}

function renderSavedPalettes() {
    savedList.replaceChildren(...savedPalettes.map(createSavedPaletteItem));
    // El mensaje de "lista vacía" solo se muestra cuando no hay paletas
    savedEmpty.hidden = savedPalettes.length > 0;
}

/** Convierte una lista de colores en texto comparable, para detectar duplicados. */
function paletteToKey(colors) {
    return colors.map((color) => formatColor(color, 'hex')).join('-');
}

function saveCurrentPalette() {
    const colors = palette.map(({ h, s, l }) => ({ h, s, l }));
    const key = paletteToKey(colors);

    const alreadySaved = savedPalettes.some((saved) => paletteToKey(saved.colors) === key);
    if (alreadySaved) {
        showToast('Esta paleta ya está guardada');
        return;
    }

    // La más reciente va primero; si se supera el máximo, se descarta la más vieja
    savedPalettes = [{ id: Date.now(), colors }, ...savedPalettes].slice(0, MAX_SAVED_PALETTES);
    writeToStorage(STORAGE_KEY_SAVED, savedPalettes);
    renderSavedPalettes();
    showToast('Paleta guardada');
}

function loadSavedPalette(id) {
    const savedPalette = savedPalettes.find((saved) => saved.id === id);
    if (savedPalette === undefined) {
        return;
    }

    palette = savedPalette.colors.map(({ h, s, l }) => ({ h, s, l, locked: false }));
    sizeSelect.value = String(palette.length);
    renderPalette(true);
    saveCurrentState();
    showToast('Paleta cargada');
}

function deleteSavedPalette(id) {
    savedPalettes = savedPalettes.filter((saved) => saved.id !== id);
    writeToStorage(STORAGE_KEY_SAVED, savedPalettes);
    renderSavedPalettes();
    showToast('Paleta eliminada');
}

/** Carga las favoritas descartando cualquier entrada con un formato inesperado. */
function restoreSavedPalettes() {
    const stored = readFromStorage(STORAGE_KEY_SAVED, []);
    if (!Array.isArray(stored)) {
        return;
    }

    savedPalettes = stored.filter((saved) => saved !== null
        && Number.isInteger(saved.id)
        && Array.isArray(saved.colors)
        && VALID_SIZES.includes(String(saved.colors.length))
        && saved.colors.every(isValidColor));
}

/* --------------------------------------------------------------------------
   9. Eventos
   -------------------------------------------------------------------------- */
generateBtn.addEventListener('click', () => {
    generatePalette();

    const lockedCount = palette.filter((color) => color.locked).length;
    showToast(lockedCount === 0
        ? '¡Nueva paleta generada!'
        : `¡Nueva paleta generada! (${lockedCount} bloqueado${lockedCount === 1 ? '' : 's'})`);
});

// Delegación de eventos: un solo listener en la grilla atiende los clics de
// todas las tarjetas, incluso las que se crean después. closest() sube desde
// el elemento clickeado hasta encontrar el botón con data-action.
paletteGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (button === null) {
        return;
    }

    const index = Number(button.dataset.index);

    if (button.dataset.action === 'copy') {
        copyColor(index);
    } else if (button.dataset.action === 'lock') {
        toggleLock(index, button);
    }
});

sizeSelect.addEventListener('change', (event) => {
    generatePalette();
    showToast(`Paleta de ${event.target.value} colores generada`);
});

// Cambiar el formato no cambia los colores: solo vuelve a dibujar los códigos
formatSelect.addEventListener('change', (event) => {
    renderPalette(false);
    saveCurrentState();
    showToast(`Mostrando códigos en ${event.target.value.toUpperCase()}`);
});

saveBtn.addEventListener('click', saveCurrentPalette);

// Misma técnica de delegación que en la grilla de colores
savedList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (button === null) {
        return;
    }

    const id = Number(button.dataset.id);

    if (button.dataset.action === 'load') {
        loadSavedPalette(id);
    } else if (button.dataset.action === 'delete') {
        deleteSavedPalette(id);
    }
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
   10. Inicio
   Si hay una paleta guardada de la visita anterior se restaura tal cual;
   si no, se genera una nueva.
   -------------------------------------------------------------------------- */
restoreSavedPalettes();
renderSavedPalettes();

if (restoreCurrentState()) {
    renderPalette(true);
} else {
    generatePalette();
}
