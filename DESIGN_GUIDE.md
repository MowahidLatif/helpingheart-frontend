# Donation Platform — Design Guide

A single source of truth for colors, typography, spacing, and design tokens.

---

## 1. Color Palette

### Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#27374D` | Buttons, links, active states, key CTAs |
| Secondary | `#526D82` | Secondary buttons, borders, badges |
| Accent | `#9DB2BF` | Highlights, hover states, icons |

### Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background (Light) | `#DDE6ED` | Page background, light mode |
| Background Light (Light) | `#F1F5F9` | Cards, elevated surfaces |
| Background Elevated (Light) | `#FFFFFF` | Modals, dropdowns |
| Background (Dark) | `#1A1F2E` | Page background, dark mode |
| Background Light (Dark) | `#242B3D` | Cards, elevated surfaces |
| Background Elevated (Dark) | `#2D3548` | Modals, dropdowns |

### Text Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Primary | `#27374D` | `#F1F5F9` | Headings, body text |
| Secondary | `#526D82` | `#9DB2BF` | Supporting text, captions |
| Disabled | `#9CA3AF` | `#6B7280` | Placeholder, disabled controls |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#059669` | Success messages, positive states |
| Error | `#DC2626` | Errors, destructive actions |
| Warning | `#D97706` | Warnings, caution |
| Info | `#0284C7` | Informational messages |

---

## 2. Typography

### Font Families

| Role | Stack | Fallbacks |
|------|-------|-----------|
| Heading | `'Inter'`, `'Plus Jakarta Sans'` | `system-ui`, `sans-serif` |
| Body | `'Inter'`, `'Source Sans 3'` | `system-ui`, `sans-serif` |
| Monospace | `'JetBrains Mono'`, `'Fira Code'` | `'Courier New'`, `monospace` |

**CDN / import examples:**
```css
/* Inter - headings & body */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* JetBrains Mono - code, IDs */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

### Font Sizes

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| h1 | `2.5rem` (40px) | 1.2 | Page titles |
| h2 | `2rem` (32px) | 1.25 | Section headings |
| h3 | `1.5rem` (24px) | 1.3 | Subsection headings |
| h4 | `1.25rem` (20px) | 1.35 | Card titles, small headings |
| h5 | `1.125rem` (18px) | 1.4 | Labels, minor headings |
| h6 | `1rem` (16px) | 1.45 | Small labels |
| body | `1rem` (16px) | 1.5 | Body text |
| body-sm | `0.875rem` (14px) | 1.5 | Secondary text |
| small | `0.75rem` (12px) | 1.5 | Captions, badges |
| caption | `0.6875rem` (11px) | 1.4 | Fine print |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| regular | `400` | Body text |
| medium | `500` | Emphasis, labels |
| semibold | `600` | Subheadings, buttons |
| bold | `700` | Headings, strong emphasis |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| tight | `1.2` | Large headings |
| snug | `1.25` | Headings |
| normal | `1.5` | Body text |
| relaxed | `1.75` | Long-form content |
| loose | `2` | Spacious layouts |

---

## 3. Space System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| xs | `4px` | Icon gaps, tight spacing |
| sm | `8px` | Inline gaps, small padding |
| md | `16px` | Default padding, gaps |
| lg | `24px` | Section spacing |
| xl | `32px` | Large sections |
| 2xl | `48px` | Major sections |
| 3xl | `64px` | Page sections |
| 4xl | `96px` | Hero/landing spacing |
| 5xl | `128px` | Large vertical rhythm |

---

## 4. Implementation Reference

### CSS Custom Properties (for theme switching)

```css
:root {
  /* Brand */
  --color-primary: #27374D;
  --color-secondary: #526D82;
  --color-accent: #9DB2BF;

  /* Light mode (default) */
  --color-bg: #DDE6ED;
  --color-bg-light: #F1F5F9;
  --color-bg-elevated: #FFFFFF;
  --color-text-primary: #27374D;
  --color-text-secondary: #526D82;
  --color-text-disabled: #9CA3AF;
}

[data-theme="dark"] {
  --color-bg: #1A1F2E;
  --color-bg-light: #242B3D;
  --color-bg-elevated: #2D3548;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #9DB2BF;
  --color-text-disabled: #6B7280;
}
```

### SCSS Variables (sync with `_variables.scss`)

```scss
// Brand
$color-primary: #27374D;
$color-secondary: #526D82;
$color-accent: #9DB2BF;

// Light mode backgrounds
$color-bg: #DDE6ED;
$color-bg-light: #F1F5F9;
$color-bg-elevated: #FFFFFF;

// Dark mode backgrounds
$color-bg-dark: #1A1F2E;
$color-bg-light-dark: #242B3D;
$color-bg-elevated-dark: #2D3548;

// Text
$color-text-primary: #27374D;
$color-text-secondary: #526D82;
$color-text-disabled: #9CA3AF;

// Typography
$font-family-heading: 'Inter', system-ui, sans-serif;
$font-family-body: 'Inter', 'Source Sans 3', system-ui, sans-serif;
$font-family-mono: 'JetBrains Mono', 'Courier New', monospace;

$font-size-h1: 2.5rem;
$font-size-h2: 2rem;
$font-size-h3: 1.5rem;
$font-size-h4: 1.25rem;
$font-size-h5: 1.125rem;
$font-size-h6: 1rem;
$font-size-body: 1rem;
$font-size-body-sm: 0.875rem;
$font-size-small: 0.75rem;
$font-size-caption: 0.6875rem;

$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

$line-height-tight: 1.2;
$line-height-snug: 1.25;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
$line-height-loose: 2;

// Spacing (4px base)
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
$spacing-3xl: 64px;
$spacing-4xl: 96px;
$spacing-5xl: 128px;
```

---

## 5. Quick Reference

| Category | Tokens |
|----------|--------|
| Primary color | `#27374D` |
| Secondary color | `#526D82` |
| Accent color | `#9DB2BF` |
| Background (light) | `#DDE6ED` |
| Background (dark) | `#1A1F2E` |
| Font (heading) | Inter / Plus Jakarta Sans |
| Font (body) | Inter / Source Sans 3 |
| Font (mono) | JetBrains Mono |
| Base spacing | 4px |
| Spacing scale | xs(4), sm(8), md(16), lg(24), xl(32), 2xl(48), 3xl(64), 4xl(96), 5xl(128) |
