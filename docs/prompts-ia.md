# Registro de prompts · Uso de IA

Registro completo de los prompts usados para desarrollar el proyecto con **Claude (Claude Code en VS Code)**, siguiendo la *Plantilla de Prompt Experto* vista en clase.

---

## Prompt 1 · Master Prompt

Preparé el prompt en dos versiones. La primera era una versión resumida de la consigna. La segunda (la que usé) la mejoré para incluir todas las normas técnicas explicadas en clase.

```text
PROMPT MASTER EXPERTO: DESARROLLO GUIADO PASO A PASO DEL PROYECTO INTEGRADOR M1 (COLORFLY STUDIO)

[CONTEXTO]
Actúas como un Desarrollador/a Frontend Junior encargado por Colorfly Studio (agencia de branding)
para construir un MVP funcional de una aplicación web estática e interactiva que genera paletas de
colores aleatorias para acelerar propuestas creativas. Se deben aplicar rigurosamente todas las
explicaciones de clase sobre HTML5 semántico, CSS3 moderno (Box Model, Flexbox/Grid, variables CSS),
JavaScript Vanilla (manipulación del DOM, eventos, objeto Math), accesibilidad web (WCAG), versionado
profesional con Git/GitHub y despliegue en GitHub Pages.

[OBJETIVO]
Diseñar, implementar y documentar la aplicación web "Generador de Paletas Interactivo", garantizando
el cumplimiento del alcance funcional mínimo obligatorio (MVP), las consideraciones de accesibilidad,
las buenas prácticas de maquetado/código, los puntos extra (extra credits) y la estructura de
entregable requerida.

[REQUISITOS Y NORMAS TÉCNICAS EXPLICADAS EN CLASE]

1. ESTRUCTURA HTML5 SEMÁNTICA Y ACCESIBILIDAD:
   - Etiquetas semánticas (<header>, <main>, <section>, <article>, <nav>, <footer>), evitando la "divitis".
   - <!DOCTYPE html>, lang="es" y <meta charset="UTF-8"> para evitar mojibake.
   - Un solo <h1> y jerarquía lineal de títulos (h1 -> h2 -> h3).
   - Botón principal "Generar paleta" y <select> de tamaño (6, 8 o 9) con <label for>.
   - Contraste WCAG (4.5:1 texto normal, 3:1 grande), foco visible, alt/aria-labels.
   - Etiquetas cerradas, minúsculas y atributos entre comillas.

2. ESTILOS VISUALES Y MAQUETADO CSS3:
   - Solo hoja externa style.css vía <link>. Prohibidos estilos inline y bloques <style>.
   - Reset: *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
   - Variables CSS en :root (colores, grises, sombras, fuentes, espaciados).
   - Flexbox (justify-content, align-items, gap, flex-wrap) o Grid (repeat, minmax, fr).
   - Clases por propósito en kebab-case / BEM (.bloque__elemento--modificador).
   - Unidades relativas: rem (fuentes/espaciado), em (padding de componentes), % o fr (layouts).

3. LÓGICA Y MANIPULACIÓN DEL DOM (JavaScript Vanilla):
   - script.js externo con 'defer'.
   - const y let; PROHIBIDO var. Igualdad estricta (===).
   - Math.random() + Math.floor() para generar colores en HSL y HEX/RGBA.
   - getElementById / querySelector, addEventListener ('click', 'change') usando event.target,
     textContent para el contenido y classList.add/remove/toggle para los estilos.
   - Microfeedback visible (toast, tooltip o mensaje temporal).
   - Extras: copiar HEX al portapapeles, bloqueo (lock) individual, localStorage, animaciones CSS.

4. VERSIONADO (Git & GitHub):
   - git init con rama main; commits atómicos con mensajes semánticos imperativos.
   - Repositorio remoto ProyectoM1_NombreEstudiante; git push -u origin main.

5. DESPLIEGUE EN GITHUB PAGES:
   - Settings > Pages, rama main, carpeta / (root).
   - Sin rutas absolutas locales ni diferencias de mayúsculas/minúsculas.

6. DOCUMENTACIÓN:
   - README.md con título, descripción, decisiones técnicas, instalación y link a la demo.
   - Uso de IA según la Plantilla de Prompt Experto (Contexto, Objetivo, Instrucciones,
     Restricciones, Formato, Ejemplos, Iteraciones y Aprendizajes) con capturas.

[RESTRICCIONES TÉCNICAS ABSOLUTAS]
- Solo JavaScript Vanilla. Prohibidos frameworks y librerías (Bootstrap, Tailwind, React, jQuery, Axios...).
- Prohibidas las llamadas de red (fetch/axios): la app debe ser 100% estática.

[FORMATO Y METODOLOGÍA DE SALIDA]
Actúa como un tutor/asistente técnico senior. No entregues todo el código en un solo bloque.
Guíame paso a paso (módulo por módulo), explicando las decisiones técnicas según lo enseñado en
clase y pidiendo mi confirmación antes de avanzar al siguiente módulo.
```

**Resultado:** la IA armó la estructura de archivos (`index.html`, `style.css`, `script.js`, `evidencias/`) y el HTML semántico. Explicó cada decisión y pidió confirmación. Propuso sumar un selector de formato HEX/HSL/RGBA.

---

## Prompt 2 · Confirmación del Paso 1

```text
Pedro Alasino, hacé como está explicado en clase
```

**Resultado:** inicializó el repositorio Git en la rama `main` e hizo el primer commit (`feat: agrega estructura HTML semántica y archivos base`). Después desarrolló el Paso 2 (CSS): variables en `:root`, reset de box model, Flexbox para los controles, Grid para la paleta, foco visible, contraste WCAG y animaciones con `prefers-reduced-motion`.

---

## Prompt 3 · Completar el proyecto

```text
Vos terminalo, hacelo completo
```

**Resultado:**
- Completó el JavaScript en commits atómicos:
  - generación de colores y conversión de formatos;
  - render de tarjetas y toast;
  - copiar al portapapeles y bloqueo;
  - persistencia en `localStorage` y paletas guardadas.
- Verificó cada parte:
  - chequeo de sintaxis con `node --check`;
  - búsqueda de `var`, `==` y estilos inline;
  - prueba automatizada en Chrome: bloquear, regenerar, cambiar tamaño, guardar, recargar la página, cargar, eliminar y copiar.
- Generó las capturas de `evidencias/`.

### Iteración detectada en la revisión

Al revisar las capturas apareció un bug visual: los códigos HSL largos se cortaban en medio de un número (`hsl(324, 4` / `5%, 52%)`). La causa era `word-break: break-all`. Se reemplazó por `overflow-wrap: break-word`, que solo corta en los espacios, y se registró como un commit aparte: `fix: evita que los códigos HSL y RGBA se corten en medio de un número`.

---

## Aprendizajes sobre el uso de la IA

1. **La estructura del prompt importa.** Las restricciones explícitas ("sin frameworks", "sin fetch") se respetaron en todo el proyecto sin tener que repetirlas.
2. **Pedir explicaciones y no solo código** convirtió a la IA en un tutor. Cada paso vino con el *por qué*, conectado con lo visto en clase.
3. **Siempre hay que verificar.** El código compilaba y "funcionaba", pero hubo un detalle visual que solo se vio al mirar el resultado en el navegador.
4. **Los commits atómicos hacen visible el proceso.** El historial de Git muestra cómo creció la app, funcionalidad por funcionalidad.
