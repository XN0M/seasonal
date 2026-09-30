# Original editorial imagery

Mode: built-in image generation, not API/CLI fallback. Skill: `imagegen`.

The four assets were generated earlier in this implementation. The recorded creative briefs below describe the selected outputs; they are not a byte-for-byte export of the earlier tool requests.

| Original saved asset | Creative brief |
|---|---|
| `assets/originals/holiday-hero.png` | Wide premium European holiday still life with an unlabeled amber perfume bottle, silk accessory, wooden building toy and gift box; warm ivory, forest green, oxblood and restrained champagne. Natural light and tactile materials. No text, logos or branded packaging. |
| `assets/originals/gifts-for-her.png` | Premium women’s self-care flatlay with unlabeled fragrance, mirror, pouch, ribbon and jewellery; warm paper and soft daylight. No text, logos or branded packaging. |
| `assets/originals/family-gifts.png` | Natural editorial family gift scene: exactly one parent and one child arranging wooden blocks and wrapping a gift. Plausible body positions, hands, limbs and everyday action. No branding or text. |
| `assets/originals/black-friday.png` | Premium unbranded gifts in a charcoal and champagne studio, clear product silhouettes and refined light. No sale text, logos, stickers or urgency graphics. |

Optimised delivery assets live in `public/images/`: responsive AVIF/WebP at 320, 640, 960 and 1400px, with a WebP fallback. Duplicate original PNGs were removed from `public/` after their hashes matched the retained originals. `scripts/optimise-images.mjs` reproduces the format conversions.

These images communicate editorial mood only. They are not photos of a purchasable SKU or evidence of hands-on testing. Merchant product photos and permission records must replace generic imagery on active product listings. The original package text, logos and identity of real products must never be AI-invented.
