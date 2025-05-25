2.0.0-alpha.7 []
---
- BREAKING `elr-grid` `row-cols` modifier now to apply on the container (not block root class)
  - class has been renamed (now `elr-grid__container--modifier`)
  - class is applied to `elr-grid__container` instead of `elr-grid`
  - added explicit `--row-cols-1` modifier
  - WHY: this fixes nesting issues with modals containing grids. (neccessary because of MODX implementation and usage -> "layer 3 content")
- ADDED `elr-grid` modifier: `row-cols-6` & `blog-style` (centered column at 50% width)

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
