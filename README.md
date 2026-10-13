# Generador de Paletas Interactivo - Colorfly Studio

Proyecto Integrador M1 - Pedro Alasino

Aplicación web estática que genera paletas de colores aleatorias para agilizar las propuestas de branding de Colorfly Studio. Hecha con HTML, CSS y JavaScript vanilla, sin librerías ni frameworks.

- Demo: https://pedroalasino.github.io/ProyectoM1_PedroAlasino/
- Repositorio: https://github.com/pedroalasino/ProyectoM1_PedroAlasino

## Funcionalidades

- Botón "Generar paleta".
- Selector para elegir 6, 8 o 9 colores.
- Colores aleatorios generados en HSL y convertidos a HEX/RGBA.
- Código de cada color visible en su tarjeta.
- Mensaje temporal (toast) como respuesta a cada acción.

## Instalación

```bash
git clone https://github.com/pedroalasino/ProyectoM1_PedroAlasino.git
```

No necesita instalar nada: alcanza con abrir `index.html` en el navegador o usar Live Server en VS Code.

## Decisiones técnicas

- HTML semántico (`header`, `main`, `section`, `footer`), un solo `h1` y labels asociados a cada `select`.
- CSS en una hoja externa, con variables en `:root`, `box-sizing: border-box`, Flexbox para los controles y Grid para la paleta.
- Clases en kebab-case con convención BEM.
- JavaScript con `const`/`let` e igualdad estricta (`===`).
- Los colores se generan con `Math.random()` y `Math.floor()`.
- El DOM se actualiza con `addEventListener`, `textContent` y `classList`.
- Accesibilidad: foco visible, contraste suficiente y `aria-label` en los botones.

## Uso de IA

Usé Claude como asistente, con un prompt armado según la plantilla de prompt experto vista en clase (contexto, objetivo, instrucciones, restricciones y formato). Le pedí que me guiara paso a paso: primero el HTML, después el CSS y por último el JavaScript.

Al revisar el resultado en el navegador encontré que los códigos de color se cortaban en medio de un número, y lo corregí en un commit aparte.

Aprendí que la IA ayuda a avanzar más rápido, pero hay que revisar y probar todo lo que genera. Los prompts completos están en `docs/prompts-ia.md` y las capturas, en `evidencias/`.
