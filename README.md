# Generador de Paletas Interactivo - Colorfly Studio

Proyecto Integrador M1 - Pedro Alasino

Aplicación web estática que genera paletas de colores aleatorias para agilizar las propuestas de branding de Colorfly Studio. Hecha con HTML, CSS y JavaScript vanilla, sin librerías ni frameworks.

- Demo: https://pedroalasino.github.io/ProyectoM1_PedroAlasino/
- Repositorio: https://github.com/pedroalasino/ProyectoM1_PedroAlasino

## Funcionalidades

- Botón "Generar paleta".
- Selector para elegir 6, 8 o 9 colores.
- Colores aleatorios generados en HSL y convertidos a HEX.
- Selector para alternar el código de cada color entre HEX y HSL.
- Mensaje temporal (toast) como respuesta a cada acción.

Extras:

- Bloqueo de colores con el candado.
- Copiar el código al hacer clic sobre un color.
- Guardado de paletas en localStorage.
- Animaciones sutiles.

## Instrucciones de uso

1. Elegí la cantidad de colores y el formato del código (HEX o HSL).
2. Hacé clic en "Generar paleta".
3. Hacé clic en un color para copiar su código.
4. Usá el candado para mantener un color cuando generes una paleta nueva.
5. Con "Guardar paleta" la agregás a la lista de guardadas. Hacé clic en una guardada para cargarla, o en la X para borrarla.

## Cómo ejecutarlo

```bash
git clone https://github.com/pedroalasino/ProyectoM1_PedroAlasino.git
```

No necesita instalar nada: alcanza con abrir `index.html` en el navegador o usar Live Server en VS Code.

## Cómo desplegarlo

1. Subir el proyecto a un repositorio público de GitHub (`git push -u origin main`).
2. En el repositorio, ir a Settings > Pages.
3. En Source, elegir "Deploy from a branch", la rama `main` y la carpeta `/ (root)`, y hacer clic en Save.
4. A los pocos minutos, la app queda publicada en `https://usuario.github.io/nombre-del-repo/`.

## Decisiones técnicas

- HTML semántico (`header`, `main`, `section`, `footer`), un solo `h1` y labels asociados a cada `select`.
- CSS en una hoja externa, con variables en `:root`, `box-sizing: border-box`, Flexbox para los controles y Grid para la paleta.
- Clases en kebab-case con convención BEM.
- JavaScript con `const`/`let` e igualdad estricta (`===`).
- Los colores se generan en HSL con `Math.random()` y `Math.floor()`, y se convierten a HEX con una función propia.
- El DOM se actualiza con `addEventListener`, `textContent` y `classList`.
- Las paletas se guardan en localStorage con `JSON.stringify` y se leen con `JSON.parse`.
- Accesibilidad: foco visible, contraste suficiente, `aria-label` en los botones y mensajes anunciados a lectores de pantalla (`aria-live`).

## Estructura

```
ProyectoM1_PedroAlasino/
├── index.html
├── style.css
├── script.js
├── README.md
└── documentacion/
    ├── capturas/       capturas del flujo principal de la app
    ├── capturas-ia/    capturas de la conversación con la IA
    └── uso-ia.md       prompts utilizados y sus resultados
```

## Uso de IA

Usé Claude como asistente, con un prompt armado según la plantilla de prompt experto vista en clase. Le pedí que me guiara paso a paso: primero el HTML, después el CSS y por último el JavaScript. Revisé y probé cada parte en el navegador.

El detalle de los prompts y sus resultados está en `documentacion/uso-ia.md`.
