# Guía de Diseño UI/UX — Intro a la IA
> Referencia para humanos y agentes de IA trabajando en sesiones 05–15.
> Basada en los estándares establecidos en sesiones 01–04.

---

## Estructura de archivos

```
curso_IA/
├── _quarto.yml                         # Config global: navbar, tema, CSS global
├── styles/
│   ├── sesion.css                      # CSS GLOBAL — cargado automáticamente en todas las páginas
│   └── sessions/
│       ├── sesion-01.css               # CSS específico de S1 (layouts únicos de esa sesión)
│       ├── sesion-02.css               # CSS específico de S2
│       └── ...                         # una por sesión
├── interactives/
│   ├── sesion-01.js                    # JS interactivo de S1 (ES modules)
│   ├── sesion-02.js
│   └── ...
└── sesiones/
    ├── sesion-01.qmd
    ├── sesion-02.qmd
    └── ...
```

**Regla cardinal:** `styles/sesion.css` contiene todos los componentes reutilizables. Los archivos `sesion-XX.css` solo contienen layouts y componentes únicos de esa sesión. **No duplicar** en sesion-XX.css lo que ya existe en sesion.css.

---

## Encabezado obligatorio de cada .qmd

Los primeros ~35 líneas de cada sesión siguen este orden fijo:

```yaml
---
title: "Sesión N: [Título]"
format:
  html:
    toc: true
    toc-depth: 2
    number-sections: false
---
```

Seguido del **banner** (ver sección Banner), luego:

```html
```{=html}
<link rel="stylesheet" href="../styles/sessions/sesion-XX.css">
<script type="module" src="../interactives/sesion-XX.js"></script>
```
```

Nota: sesiones 01–04 usan `type="module"`; algunos skeletons posteriores usan `defer`. Usar `type="module"` como estándar.

---

## Variables CSS globales (`:root` en `styles/sesion.css`)

```css
:root {
  --c-primary:        #2780e3;   /* azul marca — botones, links, bordes de énfasis */
  --c-primary-hover:  #1a6fc4;   /* hover del azul primario */
  --c-accent:         #0ea5e9;   /* azul cielo — gradientes, detalles secundarios */
  --c-navy:           #1a365d;   /* azul marino oscuro — títulos, texto de énfasis */
  --c-text:           #334155;   /* texto cuerpo principal */
  --c-text-secondary: #475569;   /* texto secundario / párrafos de apoyo */
  --c-muted:          #64748b;   /* texto terciario / metadatos */
  --c-border:         #e2e8f0;   /* borde gris neutro estándar */
  --c-border-blue:    #dbeafe;   /* borde azul suave — cards temáticas */
  --c-bg-blue:        #f0f7ff;   /* fondo azul muy suave */
  --c-gray-50:        #f8fafc;   /* fondo gris casi blanco — banners, backgrounds */
  --c-gray-400:       #94a3b8;   /* texto deshabilitado / tick labels de SVG */
  --radius:           8px;       /* radio de borde base */
}
```

**Color adicional — azul aciano (cornflower) `#6495ED`:**
No está en `:root` pero es parte del sistema de color. Se usa para interactivos de tipo "ranking" y "no supervisado". Si se necesita en sesion-XX.css, referenciarlo como valor fijo `#6495ED`.

---

## Tipografía

Tres fuentes cargadas en `styles/sesion.css` (Google Fonts):

| Fuente | Uso | Peso |
|--------|-----|------|
| **Atkinson Hyperlegible** | Cuerpo — `body, p, li, td, th` | 400, 700 |
| **Space Grotesk** | Titulares — `h1, h2, h3, h4` | 700 |
| **Fraunces** | Decorativo — `.reflexion-heading`, `.reflexion-num`, `.central-idea` (comillas) | 700–800 |

---

## Sistema de color para interactivos (demo tones)

Cada interactive `demo-shell` lleva una clase de tono que sobreescribe `--demo-accent`:

| Clase | Color | Hex | Uso |
|-------|-------|-----|-----|
| `.demo-tone-supervised` | Azul primario | `#2780e3` | Aprendizaje supervisado, álgebra |
| `.demo-tone-ranking` | Azul aciano | `#6495ED` | Sistemas de recomendación |
| `.demo-tone-unsupervised` | Azul aciano | `#6495ED` | Aprendizaje no supervisado |
| `.demo-tone-rl` | Ámbar | `#f59e0b` | Aprendizaje por refuerzo (Mario) |

**Regla:** Cualquier interactivo que originalmente era azul (no el de Mario que es ámbar) debe usar `#6495ED` (cornflower) o `#2780e3` (brand blue) según el tono apropiado — **nunca** `#0ea5e9` (sky blue) como color primario de un interactivo.

---

## Regla: Quarto callouts → `.callout-card` ✅ AUTOMATIZABLE

**Nunca usar** `::: {.callout-note}`, `::: {.callout-tip}`, `::: {.callout-important}`, ni ningún bloque callout de Quarto. Sustituir siempre por un `{=html}` block con `.callout-card`.

### Estructura

```html
```{=html}
<div class="callout-card">
  <h5 class="callout-card-title">[Título del callout]</h5>
  <p>[Contenido en párrafos, listas, etc.]</p>
</div>
```
```

**Reglas de estilo:**
- Fondo: `#ffffff` (blanco sólido)
- Borde: `1.5px solid var(--c-border)` — sin colores especiales por tipo
- Título `.callout-card-title`: siempre en `#6495ED` (cornflower blue), `font-size: 0.88rem`, `font-weight: 700`
- Sin franjas laterales de color, sin iconos de tipo (⚠ ℹ 💡), sin fondo de color

**Si el callout contiene una tabla Markdown**, convertirla a HTML con clase `.callout-card-table` (definida en `sesion.css`).

**Si el callout contiene bloques `{=html}` anidados**, integrar ese HTML directamente dentro del `<div class="callout-card">` en un único bloque `{=html}`.

### Conversión de tipo de callout

Todos los tipos (`note`, `tip`, `important`, `warning`, `caution`) se convierten al mismo componente `.callout-card`. El tipo original no afecta el resultado visual.

---

## Componentes reutilizables (todos en `sesion.css`)

---

### 1. Banner de sesión ✅ AUTOMATIZABLE

Aparece al inicio de **todas** las sesiones, justo después del YAML frontmatter. Es idéntico en estructura; solo cambian: bloque, número de progreso, fecha y duración.

```html
```{=html}
<div class="sesion-banner">
  <div>
    <span class="sesion-block-pill">[BLOQUE_PILL]</span>
  </div>
  <div class="sesion-progress-wrap">
    <div class="sesion-progress-bar">
      <div class="sesion-progress-fill sesion-progress-fill-[N]"></div>
    </div>
    <span class="sesion-progress-label">[N] de 15</span>
  </div>
  <div class="sesion-meta">
    <span class="sesion-meta-chip"><svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> [FECHA]</span>
    <span class="sesion-meta-chip"><svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 45 minutos</span>
    <a href="../syllabus.html">Ver programa completo →</a>
  </div>
</div>
```
```

**Valores de `[BLOQUE_PILL]` según sesión:**

| Sesiones | Texto del pill |
|----------|----------------|
| S1–S6 | `Bloque 1 · Fundamentos + Ética` |
| S7–S11 | `Bloque 2 · Herramientas Prácticas` |
| S12–S15 | `Bloque 3 · Creación, Aplicaciones y Futuro` |

**Clase de progreso (`sesion-progress-fill-N`):** Usar el número de sesión literal, ej. `sesion-progress-fill-7`. Clases del 1 al 15 están definidas en `sesion.css`.

**Fechas del calendario 2026:**

| S | Fecha |
|---|-------|
| 5 | 2 de junio de 2026 |
| 6 | 9 de junio de 2026 |
| 7 | 16 de junio de 2026 |
| 8 | 23 de junio de 2026 |
| 9 | 30 de junio de 2026 |
| 10 | 7 de julio de 2026 |
| 11 | 14 de julio de 2026 |
| 12 | 21 de julio de 2026 |
| 13 | 28 de julio de 2026 |
| 14 | 4 de agosto de 2026 |
| 15 | 11 de agosto de 2026 |

**Importante:** usar iconos SVG en `.sesion-meta-chip`, NO emojis (📅 ⏱). Las sesiones 01–04 usan SVG. Las skeletons de sesiones posteriores tienen emojis — corregir al completar.

---

### 2. Video / placeholder de video

Sesiones con video publicado usan `.video-capsule` con un iframe de YouTube (canal ML4PP). `[ID]` son los 11 caracteres después de `youtu.be/`:

```html
```{=html}
<div class="video-capsule">
  <iframe src="https://www.youtube-nocookie.com/embed/[ID]" title="[Título del video]" width="640" height="360" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>
```
```

- `youtube-nocookie.com` evita cookies de seguimiento hasta que el estudiante reproduce el video.
- No quitar `referrerpolicy`: sin él, YouTube puede negarse a reproducir el video incrustado.
- El video en YouTube debe permitir la inserción (Studio → Detalles → Mostrar más → "Permitir inserción").

Sesiones pendientes de video usan `.video-placeholder`:

```html
```{=html}
<div class="video-placeholder">
  <span class="vp-icon">▶</span>
  <p class="vp-title">Video: [Título de la sesión]</p>
</div>
```
```

Siempre seguido de la nota complementaria:

```html
<p class="capsule-complement-note">Los videos y el texto de esta sesión son complementarios. Los videos amplían el contexto histórico y conceptual; el texto va a los mecanismos y te pone a interactuar con ellos. Encontrarás ideas en los videos que el texto no repite exactamente. ¡Disfruta de esta dinámica!</p>
```

---

### 3. Sección "Para reflexionar" ✅ AUTOMATIZABLE (estructura); contenido = humano

Aparece cerca del final de la sesión, antes de "La idea central" y "Recursos".

```html
```{=html}
<span class="reflexion-kicker">Reflexión · 5 min</span>
<h3 class="reflexion-heading">Actividad de reflexión</h3>
<ol class="reflexion-list">
  <li class="reflexion-item">
    <span class="reflexion-num" aria-hidden="true">01</span>
    <p class="reflexion-q"><strong>[Pregunta en negrita]</strong> [Texto de apoyo que invita a la reflexión personal.]</p>
  </li>
  <li class="reflexion-item">
    <span class="reflexion-num" aria-hidden="true">02</span>
    <p class="reflexion-q"><strong>[Pregunta en negrita]</strong> [Texto de apoyo.]</p>
  </li>
  <li class="reflexion-item">
    <span class="reflexion-num" aria-hidden="true">03</span>
    <p class="reflexion-q"><strong>[Pregunta en negrita]</strong> [Texto de apoyo.]</p>
  </li>
  <li class="reflexion-item">
    <span class="reflexion-num" aria-hidden="true">04</span>
    <p class="reflexion-q"><strong>[Pregunta en negrita]</strong> [Texto de apoyo.]</p>
  </li>
</ol>
<p class="reflexion-close">No hay respuestas correctas o incorrectas. El objetivo es que empieces a ver [X] con otros ojos.</p>
```
```

**Guía de contenido para el humano:** 3–4 preguntas. La primera suele ser de conexión personal ("¿en tu vida...?"), la segunda de analogía ("¿en qué se parece...?"), la tercera de aplicación ("¿cuándo usarías...?"), y la cuarta de síntesis ("Explícalo en dos oraciones"). El cierre `reflexion-close` siempre termina con la frase sobre "ver con otros ojos".

---

### 4. "La idea central de esta sesión" ✅ AUTOMATIZABLE (estructura); contenido = humano

Va después de "Para reflexionar", antes de "Recursos".

```html
```{=html}
<div class="central-idea">
  <span class="central-idea-label">Idea central · Sesión [N]</span>
  <p class="central-idea-text">[1–3 oraciones que resumen el concepto clave de la sesión. Usar <strong>negrita</strong> para los términos más importantes.]</p>
</div>
```
```

---

### 5. "Recursos para explorar más sobre el tema" ✅ AUTOMATIZABLE (estructura); URLs/descripciones = humano

Siempre con el encabezado Markdown `### Recursos para explorar más sobre el tema`, seguido del bloque HTML.

```html
```{=html}
<ul class="resource-list">
  <li class="resource-list-item">
    <a class="resource-list-link" href="[URL]" target="_blank" rel="noopener">[Nombre del recurso] <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
    <p class="resource-list-desc">[Una oración que explica qué es y por qué vale la pena.]</p>
  </li>
  <!-- repetir para 3–5 recursos -->
</ul>
```
```

El SVG del icono de enlace externo es siempre el mismo; copiar tal cual. No usar texto "(link externo)" ni otros reemplazos.

---

### 6. Navegación entre sesiones ✅ AUTOMATIZABLE

Va al final de cada sesión, después de los recursos.

```html
```{=html}
<nav class="sesion-nav">
  <a href="sesion-[N-1].html" class="sesion-nav-btn prev">
    <span class="nav-label">← Anterior</span>
    <span class="nav-title">S[N-1]: [Título de la sesión anterior]</span>
  </a>
  <div class="sesion-nav-center">
    <div class="sesion-nav-dots">
      <!-- 15 spans: 'published' para sesiones ya publicadas antes de esta,
           'active' para la sesión actual, sin clase para las futuras -->
      <span class="sesion-nav-dot published" title="Sesión 1"></span>
      <span class="sesion-nav-dot published" title="Sesión 2"></span>
      <!-- ... -->
      <span class="sesion-nav-dot active" title="Sesión [N]"></span>
      <span class="sesion-nav-dot" title="Sesión [N+1]"></span>
      <!-- ... hasta Sesión 15 -->
    </div>
    <span class="sesion-nav-progress">Sesión [N] de 15</span>
  </div>
  <a href="sesion-[N+1].html" class="sesion-nav-btn next">
    <span class="nav-label">Siguiente →</span>
    <span class="nav-title">S[N+1]: [Título de la sesión siguiente]</span>
  </a>
</nav>
```
```

Si es la primera sesión, el botón `prev` lleva class `disabled` y `href="#"`. Si es la última, igual para `next`.

---

## Arquitectura de interactivos JS (demo-shell)

Todo interactivo JS sigue esta estructura HTML en el `.qmd`:

```html
```{=html}
<div class="demo-wrap">
  <div class="demo-shell demo-tone-[TONO]" id="[id-unico]">

    <!-- Encabezado del interactivo -->
    <div class="demo-shell-head">
      <div class="demo-shell-copy">
        <p class="demo-eyebrow">[Categoría del interactivo, ej. "Aprendizaje supervisado"]</p>
        <h4 class="demo-title">[Título del reto o actividad]</h4>
        <p class="demo-copy">[1–2 oraciones explicando qué hace el usuario.]</p>
      </div>
    </div>

    <!-- Área de visualización -->
    <div class="demo-stage">
      <div class="demo-stage-preview">
        <!-- Previsualización estática antes de que el usuario inicie (opcional).
             Si no se usa, añadir clase 'demo-shell-live-only' al demo-shell. -->
      </div>
      <div class="demo-stage-live">
        <!-- El JS inyecta el contenido interactivo aquí -->
      </div>
    </div>

    <!-- Controles -->
    <div class="demo-footer">
      <p id="[id]-status" class="demo-status"></p>
      <div class="demo-actions">
        <button id="[id]-start" class="demo-btn demo-btn-primary">Ver animación</button>
        <button id="[id]-reset" class="btn-restart" disabled>Reiniciar</button>
      </div>
    </div>

  </div>
</div>
```
```

**Si el interactivo no tiene preview y va directo al estado activo**, usar `demo-shell-live-only`:
```html
<div class="demo-shell demo-tone-[TONO] demo-shell-live-only" id="...">
```

**El JS correspondiente** (`interactives/sesion-XX.js`) es un ES module. Estructura típica:
- Espera `DOMContentLoaded` o usa `document.readyState`
- Selecciona elementos por `id`
- Maneja el botón de inicio y el de reiniciar
- Usa `requestAnimationFrame` para animaciones

---

## Estándar de scatter plots SVG

Todos los scatter plots siguen el mismo estilo visual para consistencia cross-sesión.

### Contenedor CSS (`.scatter-frame`)

```css
.scatter-frame {
  border: 1px solid var(--c-border, #e2e8f0);
  border-radius: 16px;
  background: #ffffff;           /* blanco sólido, NO gradientes grises */
  padding: 1rem 1.25rem;
  max-width: 360px;
  margin: 1.4rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  overflow: visible;             /* crítico: evita que border-radius corte el hover */
}
.scatter-frame svg {
  display: block;
  max-width: 100%;
  height: auto;
  overflow: visible;             /* permite que scale() del hover se renderice */
}
```

### Hover de puntos de datos

```css
.scatter-dot {
  transition: transform 0.18s ease, filter 0.18s ease;
  transform-box: fill-box;
  transform-origin: center;
  cursor: pointer;
}
.scatter-dot:hover {
  transform: scale(1.4);
  filter: drop-shadow(0 0 6px rgba(15, 23, 42, 0.32));
}
```

### Anatomía del SVG interno

```
viewBox: variable según contenido (ej. "0 0 260 200")

Capas en orden (de abajo a arriba):
1. Grid lines:        stroke="#e5eef7"  stroke-width="1"
2. Ejes (x, y):       stroke="#cbd5e1"  stroke-width="2"
3. Tick marks:        stroke="#cbd5e1"  stroke-width="1"  largo 3–4px
4. Tick labels:       font-size="7"    fill="#94a3b8"
5. Puntos de datos:   class="scatter-dot"  r=5–7
6. Frontera/líneas:   stroke="#f59e0b"  (ámbar para fronteras de decisión)
7. Leyenda:           posicionada en la parte baja, por debajo de los ejes
```

**Reglas específicas:**
- No usar texto de etiquetas dentro del área del gráfico (ej. "gato", "no gato" sobre los puntos) — usar solo la leyenda externa
- Si hay zonas coloreadas (clasificación), mantener `opacity ≤ 0.15` o eliminarlas del todo
- Errores de clasificación: un único rectángulo punteado (`stroke-dasharray="3 2"`) que englobe todos los puntos erróneos, más una sola X roja en la esquina superior derecha del rectángulo

---

## Orden estándar de secciones en un .qmd

```
1. YAML frontmatter
2. Banner de sesión          [html]
3. Link CSS + script JS      [html]
4. ## Video                  [html: .video-capsule o .video-placeholder]
5. ---
6. Nota complementaria       [html: .capsule-complement-note]
7. ---
8. ### Introducción
   [contenido: texto + interactivos + SVGs + CSS cards]
9. ### [Sección temática 1]
   [contenido]
10. ### [Sección temática N]
    [contenido]
11. ---
12. ### Para reflexionar      [html: estructura estándar]
13. ---
14. ### La idea central...    [html: .central-idea]
15. ---
16. ### Recursos para explorar [html: .resource-list]
17. ---
18. Navegación entre sesiones  [html: .sesion-nav]
```

---

## Qué puede hacer un agente de IA en un solo pase

Las siguientes secciones son **completamente mecánicas** y pueden generarse o corregirse automáticamente a partir del número de sesión, sin necesidad de input humano sobre el contenido:

1. **Banner completo** — bloque pill, clase de progreso, número de sesión, fecha del calendario, link al syllabus, iconos SVG de calendario y reloj
2. **Estructura vacía de "Para reflexionar"** — kicker, heading, lista con 4 ítems skeleton, closing text. El *contenido* de las preguntas lo escribe el humano.
3. **Estructura vacía de "La idea central"** — label con número de sesión. El *texto* lo escribe el humano.
4. **Estructura de "Recursos"** con 3–4 ítems skeleton con el SVG de enlace externo correcto. Las *URLs y descripciones* las pone el humano.
5. **Navegación entre sesiones** — todos los dots, URLs, títulos (conocidos del `_quarto.yml`), progreso
6. **Corrección de emojis a SVG** en `.sesion-meta-chip`
7. **Link de CSS y script JS** con la ruta correcta según número de sesión

Lo que **requiere criterio humano** para cada sesión:
- El contenido y estructura pedagógica de las secciones temáticas
- Las preguntas de reflexión (conectadas al tema específico)
- El texto de la idea central
- Los recursos (URLs relevantes y sus descripciones)
- El diseño de cada interactivo JS (qué hace, cómo funciona, qué muestra)
- Los diagramas SVG y CSS cards específicos del tema

---

## Notas de consistencia cross-página

- **No usar emojis como iconos UI** — usar SVG (Heroicons/Lucide inline). Emojis solo en contenido textual cuando el tema lo amerite.
- **Fondo de cards:** siempre `#ffffff` sólido o el gradient de `demo-shell`. Nunca `#f8fafc` dentro de un scatter plot.
- **Azul primario de interactivos:** `#6495ED` (cornflower) para ranking/unsupervised; `#2780e3` (brand) para supervised; `#f59e0b` (amber) para RL.
- **`overflow: visible`** es obligatorio en cualquier contenedor flex/grid con `border-radius` que contenga SVG con efectos hover `scale()`.
- **Todos los títulos de sesión** en el navbar están definidos en `_quarto.yml` — no cambiarlos manualmente en los `.qmd`.
