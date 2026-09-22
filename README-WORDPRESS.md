# Fathom WordPress Theme JSON Template

This package adds a Fathom-aligned block theme configuration for WordPress (theme.json v3) and reusable editorial block patterns.

## Files

- `/home/runner/work/fathom-brand/fathom-brand/theme.json` — main theme configuration (palette, typography, spacing, templates, style variations)
- `/home/runner/work/fathom-brand/fathom-brand/block-patterns.json` — reusable patterns for research posts, explainers, curation, and pillar layouts

## Brand alignment included

- **Color palette:** Deep Navy `#1a2940`, Active Blue `#0066cc`, Off-White `#f8f9fa`, Accent Teal `#00a8a8`, Neutral Gray `#6b7280`, Alert Red `#dc2626`
- **Typography:** Inter/Relative sans-serif for headings + body, monospace for code/data
- **Content pillars:** AI & Technology, Marketing & Growth, Research & Analysis, Business & Strategy
- **Style variations:** Research Post, Explainer, Curation

## How to use in WordPress

### 1) Add `theme.json` to your block theme

1. In your WordPress install, open your active block theme folder:
   - `wp-content/themes/<your-theme>/`
2. Copy `theme.json` into that folder.
3. In WordPress Admin, go to **Appearance → Editor** and refresh.

WordPress will apply the palette, typography, spacing presets, templates, and style variations.

### 2) Register the block patterns

`block-patterns.json` is a transport file for this repository. WordPress pattern registration still happens in PHP.

In your theme’s `functions.php`, load and register the patterns from this JSON file:

```php
add_action('init', function () {
    $path = get_theme_file_path('block-patterns.json');
    if (!file_exists($path)) {
        return;
    }

    $json = json_decode(file_get_contents($path), true);
    if (!is_array($json) || empty($json['patterns'])) {
        return;
    }

    if (!empty($json['categories'])) {
        foreach ($json['categories'] as $category) {
            register_block_pattern_category(
                $category['slug'],
                array('label' => $category['label'])
            );
        }
    }

    foreach ($json['patterns'] as $pattern) {
        register_block_pattern($pattern['name'], array(
            'title'       => $pattern['title'],
            'description' => $pattern['description'],
            'categories'  => $pattern['categories'],
            'keywords'    => $pattern['keywords'],
            'content'     => $pattern['content'],
            'blockTypes'  => $pattern['blockTypes'],
        ));
    }
});
```

After registration, patterns appear in the Editor inserter.

### 3) Map templates and taxonomies (recommended)

- Use the included custom templates (`research-post`, `explainer`, `curation-digest`) for post-level presentation.
- Create a taxonomy (for example `pillar`) and add terms matching these slugs:
  - `ai-technology`
  - `marketing-growth`
  - `research-analysis`
  - `business-strategy`

This aligns editorial workflow to the brand’s documented content pillars.

## Customization notes

- Keep `version: 3` and schema URL for compatibility with current WordPress block theme tooling.
- If you change brand tokens, update both `theme.json` and `block-patterns.json` to keep design/editor parity.
- Prefer extending `settings.custom.fathom` for project-specific metadata instead of editing WordPress core keys.

## Validation

Before deployment:

1. Validate both JSON files with a JSON linter.
2. Open **Appearance → Editor** and confirm:
   - Global styles load correctly
   - Templates are visible
   - Pattern category `Fathom` appears in Inserter

