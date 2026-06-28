# euler-theme CSS architecture rework

Handoff document for Claude Code. This summarises a full design session on modernising euler-theme's CSS architecture. Read everything before touching any files.

---

## What euler-theme is

A **distributable, opinionated CSS library** — compiled once, imported as a single CSS file into multiple downstream projects. Consumers do `<link rel="stylesheet" href="euler-theme.css">` and get the full visual system with no further configuration. It is not a framework to be customised by the consumer; it is a finished theme.

Repository: https://github.com/quaggaone/euler-theme  
Preview: https://quaggaone.github.io/euler-theme

Current stack:
- **SCSS** for authoring (nesting, variables, mixins)
- **Bootstrap 5** as the base (grid, reset, component primitives)
- **BEM** class naming (`.elr-card__body`, `.elr-card--link`)
- **Eleventy (11ty)** with Nunjucks templates as a component preview/dev site — this is intentional and should be kept. Nunjucks macros/includes make the preview site DRY and easy to maintain.
- `sass` CLI for compilation, `npm-run-all` to parallelise watch tasks
- Git tags + `package.json` semver for versioning — correct approach, keep it

Current `package.json` scripts:
```json
"start": "npm-run-all build:sass --parallel watch:*",
"build": "npm-run-all build:*",
"dist": "npm-run-all dist:*",
"watch:sass": "sass --watch --style=compressed --source-map --embed-sources --no-error-css src/scss/:_site/assets/themes/euler/css/",
"build:sass": "sass --style=compressed --source-map --embed-sources --no-error-css src/scss/:_site/assets/themes/euler/css/",
"dist:sass": "sass --style=compressed --source-map --embed-sources --no-error-css src/scss/:dist/css/",
"watch:eleventy": "eleventy --serve",
"build:eleventy": "eleventy"
```

---

## Why a rework

### The core problem with the current setup

Bootstrap is designed to be customised by the *consumer*. euler-theme customises it as the *producer* and ships the result. This creates several problems:

1. **Specificity fights.** Bootstrap ships its own specificity. Overrides require more specific selectors or `!important`. The current code works around this with SCSS placeholder hacks (see below).
2. **Bootstrap bleed.** Every downstream project inherits Bootstrap's reset, utility classes, JS component assumptions, and class naming — even if they only need one euler-theme component.
3. **`@extend` coupling.** `@extend .card` and `@extend .card-body` tie euler-theme's output structure to Bootstrap's internal class names. A Bootstrap version bump can silently break things.
4. **Specificity workaround in card.scss** — this is the most visible symptom:

```scss
// this "double declaration" is necessary to support easy overrides by parent
// blocks and then reoverrides by the specific element. both the parent block
// definition and the actual block have a two class specificity (0-2-0)
// therefore the more important definition needs to be lower in the cascade.
@at-root %parent-override-elr-card--transparent {
  #{$block}__container { --bs-card-bg: transparent; }
}

&#{&}--transparent {
  #{$block}__container { --bs-card-bg: transparent; }
}
```

This entire pattern exists because there is no explicit cascade layer control. `@layer` makes it unnecessary.

### Why BEM's role has changed

BEM was invented to solve CSS's flat global namespace — long class names (`block__element--modifier`) made collisions unlikely through naming discipline. It was a workaround for a missing platform feature.

That feature now exists: `@scope` and `@layer` are native CSS. BEM's *thinking* is not wrong, but its role in the rework changes:

- **Keep:** flat modifier class names (`.elr-card--link`) — these are the public API consumers use
- **Drop:** `__element` child selectors — replaced by `@scope` containment
- **Drop:** specificity management through naming — replaced by `@layer` order

---

## The new architecture

### Three native CSS primitives that replace most of the current complexity

**`@layer`** — explicit cascade control. Rules in later-declared layers always win over earlier layers, regardless of specificity. One declaration at the top of the entry file sets the entire cascade contract:

```css
@layer reset, tokens, components, modifiers, utilities;
```

This replaces: `!important`, doubled class selectors (`&#{&}`), SCSS placeholder specificity tricks, source-order management.

**`@scope`** — native component containment. Limits where a block of CSS applies, defined by a root element:

```css
@scope (.elr-card) {
  .body  { display: flex; flex-direction: column; }
  .title { font-size: var(--elr-card-title-size); }
}
```

`.body` here only matches elements inside `.elr-card`. No class prefixing needed inside the scope. No `#{$block}` gymnastics. Specificity of `.body` inside `@scope` is just `.body` — the scope root does not add to it.

`@scope` also supports a lower boundary (styles stop bleeding into nested subcomponents):
```css
@scope (.elr-card) to (.elr-card__footer) { … }
```

This is something descendant selectors cannot do at all.

**CSS custom properties** — runtime theming. Replace SCSS `$variables` with `--elr-*` custom properties. They work at runtime (no recompile needed), can be overridden per-page by consumers, and cascade naturally.

```css
:root {
  --elr-color-primary: #AD0040;
  --elr-card-bg: var(--elr-color-surface);
  --elr-radius: 0.5rem;
}
```

SCSS variables can still be used during authoring if preferred — they compile away. But anything that needs to be themeable at runtime should be a CSS custom property.

### Drop Bootstrap as a CSS dependency

Keep Bootstrap JS if consumers need dropdown/modal/tooltip behaviour. Drop Bootstrap CSS entirely. Build components from scratch against CSS custom properties.

What you lose: pre-built component HTML+CSS. What you gain: no specificity fights, no Bootstrap class names in consumer projects, smaller output, no `@extend` coupling, no risk from Bootstrap version bumps.

**Grid replacement:** CSS Grid natively. Bootstrap's grid is 12-column flexbox with breakpoint classes — replicable in ~50 lines. More importantly, consider **container queries** instead of viewport breakpoints:

```css
@container (min-width: 400px) {
  .elr-card { flex-direction: row; }
}
```

Components respond to their container's width, not viewport assumptions. Better for a distributed library where you don't know the page layout context.

---

## File structure

```
src/
  euler-theme.css       ← entry point, only @imports and the @layer declaration
  tokens.css            ← all CSS custom properties (:root { --elr-* })
  reset.css             ← modern-normalize or custom reset
  components/
    card.css
    button.css
    navbar.css
    badge.css
    …
  utilities.css         ← optional, one-off helpers
dist/
  css/
    euler-theme.css     ← compiled output (what consumers import)
```

### Entry file pattern

```css
/* euler-theme.css */
@layer reset, tokens, components, modifiers, utilities;

@import "reset.css"             layer(reset);
@import "tokens.css"            layer(tokens);
@import "components/card.css"   layer(components);
@import "components/button.css" layer(components);
/* … */
@import "utilities.css"         layer(utilities);
```

`@layer` names are **global and additive**. If ten files all write `@layer components { }`, they all contribute to the same bucket. The bucket order is set once by the declaration in the entry file. This means modifiers can live in the same file as their component — the layer declaration in the entry point guarantees correct cascade priority regardless of file structure.

### Component file pattern

Each component file contains both base styles and modifier styles, in two separate layer blocks:

```css
/* components/card.css */

@layer components {
  @scope (.elr-card) {
    :scope {
      background: var(--elr-card-bg);
      border-radius: var(--elr-radius);
      margin-bottom: 1rem;
    }

    .media {
      position: relative;
      width: 100%;
    }

    .body {
      display: flex;
      flex-direction: column;
      padding: 1rem;
    }

    .title {
      font-size: var(--elr-card-title-size);
    }
  }
}

@layer modifiers {
  @scope (.elr-card--link) {
    :scope { cursor: pointer; }
    :scope:hover { background: var(--elr-card-bg-hover); }
    .link-indicator { display: inline-block; }
  }

  @scope (.elr-card--bg-media) {
    .media {
      position: absolute;
      inset: 0;
      height: 100%;
      width: 100%;
    }
    .body {
      z-index: 2;
      justify-content: end;
    }
  }
}
```

Note: the `__element` BEM suffix is gone inside `@scope`. `.body` instead of `.elr-card__body`. The scope root provides the containment that BEM naming previously provided. The modifier class names on the root element (`.elr-card--link`) are kept — these are the consumer-facing API.

---

## Toolchain

No changes needed to the build pipeline. The existing `sass` CLI + `npm-run-all` setup is correct for a CSS library. Vite is not needed.

One fix needed in `package.json`:

```json
"main": "dist/css/euler-theme.css",
"style": "dist/css/euler-theme.css"
```

Currently `"main": "index.js"` which points to a nonexistent file. The `style` field is the npm convention for CSS packages.

PostCSS + autoprefixer can be added as a pipeline step between sass and dist output if needed, but for `@layer` and `@scope` (which need no vendor prefixes) it is not required.

---

## Migration approach

Suggested incremental order — each step is independently shippable:

1. **Add the `@layer` declaration** to the top of the existing SCSS entry file. Wrap Bootstrap's import in `@layer bootstrap`, your theme in `@layer components`. Immediate cascade control, nothing else changes.
2. **Fix `package.json`** — correct the `main` and `style` fields.
3. **Replace SCSS `$variables` with CSS custom properties** for anything consumer-visible. Keep SCSS variables for internal authoring convenience if preferred.
4. **Migrate one component** (card is the most complex — good test case) to the new `@layer components` + `@scope` pattern without Bootstrap `@extend`.
5. **Drop Bootstrap CSS dependency** once all components are migrated. Keep Bootstrap JS if needed for interactive behaviour.
6. **Add container queries** as a grid replacement, starting with the most layout-sensitive components.

---

## Dual output

euler-theme compiles to two CSS files. the consumer imports whichever fits their context.

```
dist/css/
  euler-theme-bare.css  ← tokens + reset + base element styles only
  euler-theme.css       ← tokens + reset + base + components + modifiers + utilities
```

- import `euler-theme-bare.css` → global bare element styles only. for markdown/prose output contexts (mkdocs, pandoc, hugo etc.) where no component classes are needed.
- import `euler-theme.css` → full system. includes the base element styles plus all components.
- no `$selector-mode` variable, no branching logic. base always targets HTML tags directly. the two files differ only in what they include, not how they target elements.

there is no classed variant of the base element layer. the use case for `.elr-h1` as a standalone class does not exist in practice — partial element styling is handled by `@scope` on a container component, not by adding classes to every heading.

### Entry files

```scss
// src/scss/euler-theme-bare.scss
@use 'tokens';
@use 'reset';
@use 'base/typography';
// stops here — no components
```

```scss
// src/scss/euler-theme.scss
@use 'tokens';
@use 'reset';
@use 'base/typography';
@use 'components/card';
@use 'components/button';
// … all components
```

### Base element partial

Targets HTML tags directly. No mixin toggling, no variable branching — just tag selectors in `@layer base`.

```scss
// src/scss/base/_typography.scss

@layer base {
  h1 { font-size: var(--elr-h1-size); font-weight: var(--elr-font-weight-bold); line-height: 1.2; }
  h2 { font-size: var(--elr-h2-size); }
  h3 { font-size: var(--elr-h3-size); }
  p  { line-height: var(--elr-line-height); margin-bottom: var(--elr-spacing-md); }
  a  { color: var(--elr-color-link); text-decoration: underline; }
  ul, ol { padding-left: 1.5rem; }
  blockquote { border-left: 3px solid var(--elr-color-primary); padding-left: 1rem; }
  code { font-family: var(--elr-font-mono); font-size: 0.875em; }
  // h4, h5, h6, li, pre, hr, img, table, thead, tbody, tr, th, td, strong, em, del …
}
```

### What base elements to include

Only elements that markdown-to-HTML tools output. Target list:

`h1` `h2` `h3` `h4` `h5` `h6` `p` `a` `ul` `ol` `li` `blockquote` `code` `pre` `hr` `img` `table` `thead` `tbody` `tr` `th` `td` `strong` `em` `del`

Do not include structural/layout elements (`div`, `section`, `article`, `nav`, `main`) — no meaningful prose style, would conflict with layout concerns.

### Layer order

```css
@layer reset, tokens, base, components, modifiers, utilities;
```

`base` sits below `components` and `modifiers` — a component can always override a base element style without specificity tricks.

---

## Spacing tokens

CSS vars are only used where a value needs to be consumer-adjustable at runtime. spacers are an internal authoring tool — they compile away entirely as SCSS, no runtime cost, no indirection.

```scss
// src/scss/_tokens.scss
$spacers: (
  1: 0.25rem,
  2: 0.5rem,
  3: 1rem,
  4: 1.5rem,
  5: 3rem,
) !default;
```

`!default` allows a consuming SCSS file to override the map before importing without forking the file.

used directly in components via `map.get`:

```scss
@use 'tokens' as t;
@use 'sass:map';

.body {
  padding-inline: map.get(t.$spacers, 3);
  padding-block: map.get(t.$spacers, 2);
  gap: map.get(t.$spacers, 2);
}
```

**open question:** whether to add semantic aliases on top of the numeric scale (`$space-sm`, `$space-md` etc.) or just use `map.get` directly in components. both work — decision deferred.

---

## CSS var vs SCSS var decision rule

only promote a token to a CSS custom property when there is a real reason a consumer needs to override it at runtime. everything else stays as a SCSS variable and compiles away.

| token type | var type | reason |
|---|---|---|
| spacers | SCSS | internal scale, no runtime override needed |
| colors | CSS | consumers may want dark mode, brand overrides |
| font sizes | CSS | consumers may want to adjust typography |
| border radius | CSS | consumers may want to restyle components |
| font families | CSS | consumers may swap fonts |
| breakpoints | SCSS | only used in `@media` queries, CSS vars don't work there |
| z-index scale | SCSS | internal stacking, no consumer reason to touch |
| transition durations | CSS | motion preferences, reduced-motion overrides |

---

## RFS

RFS is its own npm package independent of Bootstrap — `npm install rfs`, `@use 'rfs'` in SCSS. the Bootstrap dependency is not required to keep using it.

alternative: a single SCSS function wrapping `clamp()` directly:

```scss
@function fluid($size) {
  @return clamp(#{$size * 0.75}, #{$size * 0.5} + 1.5vw, #{$size});
}

// usage
h1 { font-size: fluid(3rem); }
```

RFS does more than this — configurable base and factor, unitless value handling, rem/px conversion. if the existing RFS behaviour felt right, keep it as a standalone dependency. if a simpler curve is sufficient, the custom function removes a dependency entirely. decision deferred until token values are established.

---

## Key decisions summary

| Decision | Choice | Reason |
|---|---|---|
| Keep 11ty | Yes | Nunjucks macros make the preview site DRY; it's a feature not overhead |
| Keep sass CLI pipeline | Yes | Sufficient for a CSS library; Vite adds no value here |
| Drop Bootstrap CSS | Yes | Specificity fights, consumer bleed, `@extend` coupling |
| Keep Bootstrap JS | Optional | Only if consumers need dropdown/modal/tooltip behaviour |
| BEM modifier classes on root | Keep | `.elr-card--link` is the consumer API |
| BEM `__element` classes inside component | Drop | Replaced by `@scope` containment |
| Versioning strategy | Git tags + semver | Correct; content-hashed filenames are for app pipelines not library distribution |
| One file per component | Yes | Self-contained, easy to add/remove, clear ownership |
| Modifiers in same file as component | Yes | `@layer` handles cascade priority regardless of file location |
| Two compiled outputs | `euler-theme-bare.css` + `euler-theme.css` | Consumer imports one or both; no markup requirements |
| Base element selector strategy | Always HTML tags, never classes | No real use case for `.elr-h1`; partial styling handled by `@scope` on containers |
| Base element scope | Markdown-output elements only | Avoids conflict with layout/structural elements |
