---
name: Kinetic Obsidian
colors:
  surface: '#111415'
  surface-dim: '#111415'
  surface-bright: '#37393b'
  surface-container-lowest: '#0c0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#282a2c'
  surface-container-highest: '#323537'
  on-surface: '#e1e2e4'
  on-surface-variant: '#c7c6ca'
  inverse-surface: '#e1e2e4'
  inverse-on-surface: '#2e3132'
  outline: '#919094'
  outline-variant: '#46464a'
  surface-tint: '#c8c6c7'
  primary: '#c8c6c7'
  on-primary: '#313031'
  primary-container: '#0b0b0c'
  on-primary-container: '#7b797a'
  inverse-primary: '#5f5e5f'
  secondary: '#e0c298'
  on-secondary: '#402d0f'
  secondary-container: '#584323'
  on-secondary-container: '#ceb188'
  tertiary: '#c8c5cb'
  on-tertiary: '#303034'
  tertiary-container: '#0b0b0f'
  on-tertiary-container: '#7b797e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e3'
  primary-fixed-dim: '#c8c6c7'
  on-primary-fixed: '#1c1b1c'
  on-primary-fixed-variant: '#474647'
  secondary-fixed: '#fedeb2'
  secondary-fixed-dim: '#e0c298'
  on-secondary-fixed: '#281800'
  on-secondary-fixed-variant: '#584323'
  tertiary-fixed: '#e4e1e7'
  tertiary-fixed-dim: '#c8c5cb'
  on-tertiary-fixed: '#1b1b1f'
  on-tertiary-fixed-variant: '#47464b'
  background: '#111415'
  on-background: '#e1e2e4'
  surface-variant: '#323537'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
The brand personality is high-performance, exclusive, and technologically advanced. It targets a premium fitness demographic that values precision, strength, and a seamless digital-to-physical experience.

The design style utilizes **Dark Glassmorphism** with a **Minimalist** structural foundation. This is achieved through deep obsidian surfaces, subtle light-leaks, and translucent layers that create a sense of depth and "native" mobile sophistication. The interface should feel like a high-end physical gym space: dimly lit, focused, and punctuated by premium metallic accents.

## Colors
This design system employs a "Luxury Dark" palette. The primary background is a deep obsidian to minimize eye strain and maximize the pop of the gold accents. 

- **Primary Background**: Use `--bg-obsidian` for the main canvas.
- **Surface Elevation**: Use `--bg-card` for primary containers and `--bg-tertiary` for active or pressed states.
- **Accents**: The Gold accent is reserved for primary actions, progress indicators, and premium branding moments.
- **Glow & Glass**: Apply `accent_glow` as a soft backdrop-filter or outer glow to highlight active performance metrics or featured CTA buttons.

## Typography
The typography strategy contrasts high-impact display faces with highly legible functional text. 

- **Headings**: Use `Outfit` for all headlines. Large display sizes should use the "ExtraBold" (800) weight with tight tracking to convey strength.
- **Body**: Use `Inter` for all reading and data entry. Stick to "Medium" (500) for UI labels to ensure legibility against dark backgrounds.
- **Captions & Labels**: All-caps labels with slight letter-spacing should be used for secondary metadata or category tags to maintain a technical, clean aesthetic.

## Layout & Spacing
The layout follows a strict 4px baseline grid to ensure mathematical precision in the "Kinetic" data displays. 

- **Grid**: Use a 12-column grid for desktop and a 4-column grid for mobile.
- **Margins**: Mobile layouts should use a standard 20px side margin to provide breathing room on edge-to-edge displays.
- **Rhythm**: Use `lg` (24px) for vertical section spacing and `md` (16px) for internal card padding.
- **Mobile-First**: Prioritize thumb-driven navigation; ensure interactive elements are at least 44px in height.

## Elevation & Depth
Depth is created through transparency and border treatments rather than traditional heavy shadows.

- **Layer 0 (Base)**: `#0B0B0C` (Flat).
- **Layer 1 (Cards)**: `#121214` with a 1px solid border of `rgba(197, 168, 128, 0.12)`.
- **Layer 2 (Modals/Popovers)**: `#19191D` with a `backdrop-filter: blur(12px)`.
- **Interactions**: On hover or active state, cards should gain a subtle `box-shadow: 0 0 20px rgba(197, 168, 128, 0.05)` to simulate an inner glow.

## Shapes
The shape language is "Refined-Industrial." While the brand is aggressive, the UI uses rounded corners to feel modern and premium. 

- **Standard Elements**: 0.5rem (8px) for buttons and input fields.
- **Container Elements**: 1rem (16px) for large cards and dashboard modules.
- **Status Pills**: Fully rounded (pill-shaped) to distinguish them from structural elements.

## Components
- **Buttons**:
    - *Primary*: Background Gold (#C5A880), Text Obsidian (#0B0B0C), Semi-bold.
    - *Secondary*: Transparent background, 1px Gold border, Gold text.
- **Cards**: Use the `bg_card` color. Header sections within cards should have a subtle bottom border.
- **Input Fields**: Background `#19191D`, no border by default, 1px Gold border on focus. Text color `#F3F4F6`.
- **Progress Bars**: Track color `#19191D`, Fill color Gold (#C5A880) with a subtle glow effect (`accent_glow`).
- **Chips/Badges**: Small text, uppercase, using semantic colors (Success/Error) with 10% opacity backgrounds of the same hue.
- **Data Viz**: Charts should use Gold for primary data lines and Muted Grey for grid lines. High-contrast labels in `Inter` Medium.