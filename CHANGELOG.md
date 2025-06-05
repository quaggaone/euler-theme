2.0.0-alpha.10 [2025-06-05]
---
- FIXED `elr-header--bg-media-medium` background color in dark mode
- FIX make `elr-card` titles smaller for high-column grids
- FIX `elr-accordion` button `font-width` to support custom formatting

2.0.0-alpha.9 [2025-05-30]
---
- FIX `elr-card` layout (text spacing and media handling)
- ADDED `elr-grid` modifier: `row-cols-5`
- ADDED `elr-card__logo` class for company logos on cards
- CHANGE look of links (`elr-link()` mixin)
- CHANGE removed borders/padding on `elr-cta`
- ADDED `elr-header` height modifier classes
- ADDED `elr-header` `--bg-media-medium` option (with colored bg on text-box)

2.0.0-alpha.8 [2025-05-28]
---
- CHANGE renamed section gap modifier to `section-spacer`
- ADDED many images' `aspect-ratio` and `object-fit` now adjustable through global modifiers or CSS variables

2.0.0-alpha.7 [2025-05-27]
---
- CHANGE removed `card` padding around media
- FIX image aspect-ratio not working on `card` media
- BREAKING `elr-grid` `row-cols` modifier now to apply on the container (not block root class)
  - class has been renamed (now `elr-grid__container--modifier`)
  - class is applied to `elr-grid__container` instead of `elr-grid`
  - added explicit `--row-cols-1` modifier
  - WHY: this fixes nesting issues with modals containing grids. (neccessary because of MODX implementation and usage -> "layer 3 content")
- ADDED `elr-grid` modifier: `row-cols-6` & `blog-style` (centered column at 50% width)
- CHANGE all `headings` to a condensed font-family
- ADDED section gaps global modifier classes (`margin-bottom`)

2.0.0-alpha.6 [2025-03-24]
---
- refined modal
- converted footer
- added map germany

2.0.0-alpha.5 [2025-03-23]
---
- general layout refinements
- added book metadata (bottom)
- adjusted hero layout for blogs

2.0.0-alpha.4 [2025-03-23]
---
- added meta layout inside header for blog articles
- added pill-group
- added meta table
- adjusted layout-card approach

2.0.0-alpha.3 [2025-03-22]
---
- added page layout card

1.0.1 []
---
- adjusted dev configuration for preview in `/euler-theme/` subfolder

1.0.0 [2025-03-10]
---
- rename to euler
