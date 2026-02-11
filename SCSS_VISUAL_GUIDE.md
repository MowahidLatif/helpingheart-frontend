# SCSS Architecture Visual Guide

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MAIN.SCSS (Entry Point)                     │
│                    Imports everything in order                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. ABSTRACTS (Design Tokens)                                        │
│    ┌──────────────────────────────────────────────────────┐         │
│    │ Variables: Colors, Spacing, Typography, Breakpoints  │         │
│    │ Mixins: Media queries, Flexbox, Buttons, Cards       │         │
│    │ Functions: Calculations, Color manipulation          │         │
│    └──────────────────────────────────────────────────────┘         │
│    💡 Used by: Everything below                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. BASE (Global Defaults)                                           │
│    ┌──────────────────────────────────────────────────────┐         │
│    │ Reset: Modern CSS reset for consistency              │         │
│    │ Typography: Headings, paragraphs, links              │         │
│    └──────────────────────────────────────────────────────┘         │
│    💡 Applied globally to all pages                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. THEMES (Visual Identity)                                         │
│    ┌──────────────────────────────────────────────────────┐         │
│    │ Default: CSS Custom Properties (--color-primary...)  │         │
│    │ Dark Mode: Optional dark theme (ready to extend)     │         │
│    └──────────────────────────────────────────────────────┘         │
│    💡 Easily switch themes dynamically                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. LAYOUTS (Page Structure)                                         │
│    ┌──────────────────────────────────────────────────────┐         │
│    │ Grid: 12-column responsive grid system               │         │
│    │ Dashboard: Sidebar + Main content layout             │         │
│    │ Page: Header, Content, Footer structure              │         │
│    └──────────────────────────────────────────────────────┘         │
│    💡 Structural foundation for pages                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. COMPONENTS (Reusable UI)                                         │
│    ┌──────────────────────────────────────────────────────┐         │
│    │ Buttons: .btn, .btn-primary, .btn-lg...              │         │
│    │ Cards: .card, .card-header, .card-hover...           │         │
│    │ Forms: .form-input, .form-label, .form-error...      │         │
│    │ Modal: .modal, .modal-backdrop, .modal-header...     │         │
│    │ Navigation: .navbar, .sidebar-nav...                 │         │
│    │ Table: .table, .table-responsive...                  │         │
│    └──────────────────────────────────────────────────────┘         │
│    💡 Building blocks for your interface                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. PAGES (Page-Specific)                                            │
│    ┌──────────────────────────────────────────────────────┐         │
│    │ Dashboard: .dashboard-stats, .stat-card...           │         │
│    │ Auth: .auth-page, .auth-card, .auth-form...          │         │
│    │ Campaign: .campaign-list, .campaign-card...          │         │
│    └──────────────────────────────────────────────────────┘         │
│    💡 Specific to individual page types                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. UTILS (Utility Classes)                                          │
│    ┌──────────────────────────────────────────────────────┐         │
│    │ Spacing: .mt-lg, .p-xl, .mx-auto...                  │         │
│    │ Display: .d-flex, .d-grid, .d-none...                │         │
│    │ Text: .text-center, .text-primary, .font-bold...     │         │
│    │ Layout: .w-full, .flex-between, .grid-cols-3...      │         │
│    └──────────────────────────────────────────────────────┘         │
│    💡 Quick styling without custom CSS                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Responsive Flow (Desktop First)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DESKTOP (1200px+)                           │
│                        ▲ Start here (base)                          │
│  Write your styles for desktop first:                               │
│  .container { width: 1200px; font-size: 16px; }                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ @include respond-below(tablet)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TABLET (max 992px)                           │
│                      ▲ Adjust for tablet                            │
│  .container { width: 90%; font-size: 15px; }                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ @include respond-below(mobile)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MOBILE (max 600px)                           │
│                      ▲ Optimize for mobile                          │
│  .container { width: 100%; font-size: 14px; }                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## How Files Connect

```
Your Component
      │
      ├─→ Import main.scss (global styles)
      │   └─→ All base, layouts, components available
      │
      └─→ Import MyComponent.module.scss (scoped styles)
          └─→ @use '../styles/abstracts' (access mixins/variables)
              └─→ Use: $color-primary, @include respond-below()
```

---

## Usage Patterns

### Pattern 1: Utility Classes Only
```tsx
<div className="container mt-lg">
  <h1 className="text-center text-primary">Title</h1>
  <button className="btn btn-primary">Click</button>
</div>
```
✅ Quick, no custom CSS needed

### Pattern 2: Component Module
```tsx
// Component.tsx
import styles from './Component.module.scss';

<div className={styles.customCard}>...</div>
```

```scss
// Component.module.scss
@use '../styles/abstracts' as *;

.customCard {
  @include card-base;
  @include hover-lift;
}
```
✅ Scoped, reusable, maintainable

### Pattern 3: Mixed (Recommended)
```tsx
<div className={`${styles.customCard} mt-lg shadow-md`}>
  <h2 className="text-primary mb-sm">Title</h2>
  <button className="btn btn-primary w-full">Action</button>
</div>
```
✅ Best of both worlds

---

## Folder Organization Logic

```
abstracts/     → Design system (variables, mixins, functions)
                 Import these in components for access to tokens
                 
base/          → Global defaults (reset, typography)
                 Applied automatically, no classes needed
                 
themes/        → Color schemes (default, dark)
                 CSS custom properties for dynamic themes
                 
layouts/       → Structure (grid, dashboard, page)
                 .container, .grid, .dashboard-layout...
                 
components/    → Reusable UI (.btn, .card, .modal...)
                 Use these classes or extend with modules
                 
pages/         → Page-specific (.auth-page, .campaign-list...)
                 Only for unique page patterns
                 
utils/         → Quick helpers (.mt-lg, .text-center...)
                 Use liberally for rapid development
```

---

## Decision Tree: Where Does My Style Go?

```
Is it a design value (color, spacing, font)?
├─ YES → abstracts/_variables.scss
└─ NO ↓

Is it a reusable pattern (button, card)?
├─ YES → components/_component-name.scss
└─ NO ↓

Is it page structure (grid, layout)?
├─ YES → layouts/_layout-name.scss
└─ NO ↓

Is it specific to one page type?
├─ YES → pages/_page-name.scss
└─ NO ↓

Is it a quick utility (margin, padding)?
├─ YES → utils/_utilities.scss (or use existing utility class)
└─ NO ↓

Is it truly component-specific?
└─ YES → Create YourComponent.module.scss
```

---

## Quick Reference

### Most Used Mixins
```scss
@include respond-below(tablet)    // Media query
@include respond-below(mobile)    // Media query
@include button-base              // Button styling
@include card-base                // Card styling
@include flex-center              // Flexbox centering
@include container                // Responsive container
@include text-truncate            // Ellipsis overflow
@include hover-lift               // Hover animation
```

### Most Used Utilities
```
.container          .mt-lg           .text-center
.card               .p-xl            .text-primary
.btn btn-primary    .flex-between    .d-flex
.form-input         .grid-cols-3     .w-full
.modal              .rounded         .shadow-md
```

### Most Used Variables
```scss
$color-primary      $spacing-md      $font-size-base
$color-success      $spacing-lg      $font-size-h1
$color-danger       $spacing-xl      $breakpoint-tablet
$color-background   $grid-gap        $breakpoint-mobile
```

---

**This visual guide should help you navigate the SCSS architecture!**

For implementation details, see:
- `src/styles/README.md` - Full documentation
- `SCSS_QUICK_START.md` - Quick start guide
- `SCSS_IMPLEMENTATION_SUMMARY.md` - What was built
