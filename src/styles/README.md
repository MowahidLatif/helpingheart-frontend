# SCSS Architecture Documentation

## 📁 Folder Structure

```
src/styles/
├── abstracts/          # Variables, mixins, functions (design tokens)
│   ├── _variables.scss # Colors, spacing, breakpoints, typography
│   ├── _mixins.scss    # Reusable SCSS mixins (media queries, utilities)
│   ├── _functions.scss # SCSS functions for calculations
│   └── _index.scss     # Forward all abstracts
│
├── base/               # Global defaults and resets
│   ├── _reset.scss     # Modern CSS reset
│   ├── _typography.scss# Base typography styles
│   └── _index.scss     # Forward all base styles
│
├── layouts/            # Page structure and layout patterns
│   ├── _grid.scss      # Grid system and flexbox utilities
│   ├── _dashboard.scss # Dashboard-specific layout
│   ├── _page.scss      # General page layouts
│   └── _index.scss     # Forward all layouts
│
├── components/         # Reusable UI components
│   ├── _button.scss    # Button styles and variants
│   ├── _card.scss      # Card component
│   ├── _form.scss      # Form inputs and controls
│   ├── _modal.scss     # Modal/dialog component
│   ├── _navigation.scss# Navigation and sidebar
│   ├── _table.scss     # Table component
│   └── _index.scss     # Forward all components
│
├── pages/              # Page-specific styles
│   ├── _dashboard.scss # Dashboard page
│   ├── _auth.scss      # Login/signup pages
│   ├── _campaign.scss  # Campaign pages
│   └── _index.scss     # Forward all pages
│
├── themes/             # Theme and color scheme management
│   ├── _default.scss   # Default theme (CSS custom properties)
│   └── _index.scss     # Forward all themes
│
├── utils/              # Utility classes
│   ├── _utilities.scss # Helper classes (spacing, display, etc.)
│   └── _index.scss     # Forward all utils
│
└── main.scss           # Entry point (imports everything)
```

---

## 🎯 Responsive Strategy: Desktop & Tablet First

### Core Philosophy
- **Base styles are for desktop** (1200px+)
- **Adjust DOWN for tablet** (max-width: 992px)
- **Adjust DOWN for mobile** (max-width: 600px)
- **Client donation pages are MOBILE-FIRST** for donor experience

### Breakpoints
```scss
$breakpoint-desktop: 1200px;
$breakpoint-tablet: 992px;
$breakpoint-mobile: 600px;
$breakpoint-mobile-sm: 480px;
```

### Usage Example
```scss
.container {
  width: 1200px;  // Desktop first
  
  @include respond-below(tablet) {
    width: 90%;   // Adjust for tablet
  }
  
  @include respond-below(mobile) {
    width: 100%;  // Adjust for mobile
  }
}
```

---

## 🧩 How to Use

### 1. Import Main SCSS in Your App

In `src/main.tsx` or `src/App.tsx`:
```typescript
import './styles/main.scss';
```

### 2. Use in Component Files

For component-specific styles, create module files:
```
Button.tsx
Button.module.scss
```

In `Button.module.scss`:
```scss
@use '../styles/abstracts' as *;

.button {
  @include button-base;
  // Your custom styles
}
```

### 3. Use Utility Classes

```tsx
<div className="container mt-lg mb-xl">
  <h1 className="text-center text-primary">Welcome</h1>
  <div className="card p-lg">
    Content here
  </div>
</div>
```

---

## 📐 Design Tokens (Variables)

### Colors
```scss
$color-primary: #0066cc;
$color-success: #28a745;
$color-danger: #dc3545;
$color-text-primary: #212529;
$color-background: #ffffff;
```

### Spacing Scale
```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
$spacing-3xl: 64px;
$spacing-4xl: 96px;
```

### Typography
```scss
$font-size-base: 16px;
$font-size-h1: 48px;  // Desktop
$font-size-h2: 40px;
$font-size-h3: 32px;
```

---

## 🔧 Mixins Reference

### Media Queries
```scss
@include respond-below(tablet) {
  // Styles for tablet and smaller
}

@include respond-below(mobile) {
  // Styles for mobile
}
```

### Flexbox
```scss
@include flex-center;    // Center items
@include flex-between;   // Space between
@include flex-column;    // Vertical layout
```

### Button Variants
```scss
@include button-base;                          // Base button styles
@include button-variant($bg-color, $text-color); // Create variant
```

### Containers
```scss
@include container;  // Responsive container with max-width
@include card-base;  // Card styling
```

### Typography
```scss
@include heading-base;          // Heading defaults
@include text-truncate;         // Single line ellipsis
@include text-clamp(3);         // Multi-line clamp
```

### Visibility
```scss
@include hide-on-mobile;    // Hide below mobile breakpoint
@include hide-on-tablet;    // Hide below tablet breakpoint
@include show-only-mobile;  // Show only on mobile
```

---

## 🎨 Component Examples

### Button
```scss
@use '../styles/abstracts' as *;

.my-button {
  @include button-base;
  @include button-variant($color-primary);
  
  @include respond-below(mobile) {
    width: 100%;
  }
}
```

### Card
```scss
@use '../styles/abstracts' as *;

.my-card {
  @include card-base;
  @include hover-lift;
  
  @include respond-below(mobile) {
    padding: $spacing-md;
  }
}
```

### Grid Layout
```scss
@use '../styles/abstracts' as *;

.my-grid {
  @include grid-columns(4); // 4 columns on desktop
  // Automatically adjusts to 2 columns on tablet, 1 on mobile
}
```

---

## 📦 Utility Classes Quick Reference

### Display
```
.d-block, .d-flex, .d-grid, .d-none
.d-tablet-none, .d-mobile-none
```

### Spacing (Margin)
```
.m-0, .mt-lg, .mb-xl, .mx-auto, .my-lg
```

### Spacing (Padding)
```
.p-0, .pt-lg, .pb-xl, .px-lg, .py-lg
```

### Text
```
.text-center, .text-left, .text-right
.text-primary, .text-muted, .text-danger
.font-bold, .font-medium
```

### Layout
```
.flex, .flex-center, .flex-between, .flex-column
.grid, .grid-cols-3, .grid-cols-4
.container, .container-fluid
```

### Width/Height
```
.w-full, .w-50, .h-full, .h-screen
```

### Border & Shadows
```
.border, .rounded, .rounded-lg
.shadow-sm, .shadow-md, .shadow-lg
```

---

## 🌐 Responsive Design Rules

### Desktop-First Approach
1. Write base styles for desktop (largest screen)
2. Use `@include respond-below(tablet)` for tablet adjustments
3. Use `@include respond-below(mobile)` for mobile adjustments

### Example
```scss
.hero {
  padding: 100px 0;           // Desktop
  font-size: 48px;
  
  @include respond-below(tablet) {
    padding: 60px 0;          // Tablet
    font-size: 40px;
  }
  
  @include respond-below(mobile) {
    padding: 40px 0;          // Mobile
    font-size: 32px;
  }
}
```

### Mobile-First for Client Donation Pages
For pages where donors interact (donation forms, campaign pages):
```scss
.donate-button {
  // Mobile first for donor experience
  width: 100%;
  font-size: 18px;
  padding: 16px;
  
  @media (min-width: 601px) {
    width: auto;
    padding: 12px 24px;
  }
}
```

---

## 🎯 Naming Conventions

### Files
- Use lowercase with hyphens: `_button.scss`, `_card-header.scss`
- Prefix with underscore for partials: `_variables.scss`
- Match React component names: `Button.tsx` → `Button.module.scss`

### Classes
- Use kebab-case: `.btn-primary`, `.card-header`
- Use BEM for complex components:
  ```scss
  .card { }
  .card__header { }
  .card__body { }
  .card--highlighted { }
  ```

### Variables
- Descriptive names: `$color-primary`, `$spacing-lg`, `$font-size-h1`
- Group by category: `$color-*`, `$spacing-*`, `$font-*`

---

## 🚀 Best Practices

### 1. Always Import Abstracts
```scss
@use '../styles/abstracts' as *;
```

### 2. Use Mixins Over Repetition
❌ Bad:
```scss
.btn-1 {
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.2s;
}
.btn-2 {
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.2s;
}
```

✅ Good:
```scss
@mixin button-base { /* ... */ }

.btn-1 { @include button-base; }
.btn-2 { @include button-base; }
```

### 3. Keep Component Styles Scoped
Use CSS Modules or scoped classes to avoid global conflicts.

### 4. Use Variables for All Values
❌ Bad:
```scss
color: #0066cc;
margin: 24px;
```

✅ Good:
```scss
color: $color-primary;
margin: $spacing-lg;
```

### 5. Mobile Adjustments
Always test on mobile. Reduce padding, font sizes, and simplify layouts.

---

## 📝 Adding New Styles

### New Component
1. Create `_my-component.scss` in `components/`
2. Add `@forward 'my-component';` to `components/_index.scss`
3. Use in your React component

### New Page Styles
1. Create `_my-page.scss` in `pages/`
2. Add `@forward 'my-page';` to `pages/_index.scss`

### New Utility
Add to `utils/_utilities.scss`

### New Variable
Add to `abstracts/_variables.scss`

---

## 🔍 Troubleshooting

### Styles Not Applying?
1. Check import order in `main.scss`
2. Ensure `@use` instead of `@import`
3. Verify class names match (case-sensitive)

### Responsive Not Working?
1. Check browser width (use DevTools)
2. Verify `@include respond-below()` syntax
3. Ensure desktop styles are defined first

### Build Errors?
1. Check for missing semicolons
2. Verify `@use` paths are correct
3. Ensure no circular dependencies

---

## 📚 Resources

- **SCSS Documentation**: https://sass-lang.com/documentation
- **CSS Custom Properties**: For theme switching
- **BEM Methodology**: http://getbem.com/
- **Mobile-First vs Desktop-First**: Choose based on target audience

---

## 🎓 Quick Start Checklist

- [ ] Import `main.scss` in your app entry point
- [ ] Use utility classes for quick styling
- [ ] Create component modules for custom styles
- [ ] Always import abstracts in component files
- [ ] Test on mobile, tablet, and desktop
- [ ] Use variables instead of hard-coded values
- [ ] Keep styles scoped to components
- [ ] Document any custom mixins or patterns

---

**Last Updated**: 2026-02-11

For questions or improvements, update this README and commit changes.
