# Snip Design System

Inspired by Lovable's design language: dark, minimal, with a warm accent gradient and generous spacing.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| **background** | `#0f0f0f` | Page background (near-black) |
| **surface** | `#1a1a1a` | Cards, containers |
| **surface-light** | `#242424` | Hover states, secondary surfaces |
| **text-primary** | `#ffffff` | Headings, primary text |
| **text-secondary** | `#b0b0b0` | Body text |
| **text-muted** | `#808080` | Secondary info, labels |
| **border** | `#333333` | Subtle borders |
| **accent-start** | `#ff6b35` | Coral (gradient start) |
| **accent-mid** | `#ff8c5a` | Warm orange (gradient middle) |
| **accent-end** | `#ffa66d` | Light coral (gradient end) |
| **success** | `#22c55e` | Success messages |
| **error** | `#ef4444` | Error messages |

## Gradients

- **Accent Glow**: `linear-gradient(90deg, #ff6b35 0%, #ff8c5a 50%, #ffa66d 100%)`
  - Used for: Background hero glow, button states, highlights

## Typography

| Token | Value |
|-------|-------|
| **Font Stack** | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` |
| **Headline** | 2.5rem / 700 weight / leading 1.2 |
| **Subheading** | 1.25rem / 600 weight |
| **Body** | 1rem / 400 weight / leading 1.6 |
| **Small** | 0.875rem / 400 weight |
| **Label** | 0.75rem / 600 weight / uppercase |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 0.25rem | Micro spacing |
| **sm** | 0.5rem | Small gaps |
| **md** | 1rem | Default spacing |
| **lg** | 1.5rem | Section spacing |
| **xl** | 2rem | Large sections |
| **2xl** | 3rem | Major section separation |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| **sm** | 4px | Subtle |
| **md** | 6px | Default (inputs, buttons) |
| **lg** | 12px | Cards |
| **full** | 9999px | Pill-shaped (input, buttons) |

## Shadows & Effects

- **none** `none` - Default
- **subtle** `0 1px 2px rgba(0, 0, 0, 0.3)` - Light shadow
- **medium** `0 4px 6px rgba(0, 0, 0, 0.4)` - Card shadow
- **glow** `0 0 20px rgba(255, 107, 53, 0.3)` - Accent glow

## Component Mapping

### Hero Section (Header)
- Background: page background
- Glow: Full-width fixed positioned gradient band (`position: fixed; left: 0; right: 0`)
- Headline: `text-primary`, 2.5rem
- Subline: `text-muted`, 1.1rem

### URL Input Form (Chat-style Centerpiece)
- Layout: Flex, gap 0.5rem
- Input: Pill-rounded (`border-radius: 9999px`), `surface` background, `text-primary` text
- Padding: 0.75rem 1rem
- Border: 1px `border` color
- Focus: Accent color border + subtle glow
- Button (Action): Pill-rounded, accent gradient background, white text, 0.75rem 1.5rem padding
- Hover: Darker accent shade

### Messages (Success/Error)
- Container: 1rem padding, rounded (6px), subtle borders, 0.95rem type
- **Success**: `#d4edda` bg, `#155724` text, `#c3e6cb` border
- **Error**: `#f8d7da` bg, `#721c24` text, `#f5c6cb` border

### Links Table (Card)
- Background: `surface`
- Border: 1px `border`
- Border Radius: 12px
- Padding: 1rem
- Header BG: `surface-light`
- Row Hover: Slight `surface-light` background
- Spacing: Generous padding (1rem)
- Links: Accent color, underline on hover

### Empty State
- Center-aligned text
- Padding: 2rem
- Background: `surface-light`
- Border Radius: 6px
- Text: `text-muted`

## Design Principles

1. **Dark Minimal**: Keep the page feeling open and spacious despite dark colors
2. **Warm Accent**: The coral-to-orange gradient is the only color pop — use it sparingly
3. **Generous Spacing**: Room to breathe between sections
4. **Rounded Everything**: Pills and smooth corners create friendliness
5. **Subtle Depth**: Cards and buttons feel elevated but not heavy
6. **Typography-First**: Clean sans-serif at various scales carries the hierarchy
7. **Fixed Glow**: The gradient glow is **always** full-width at the top, never constrained
