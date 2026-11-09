# Wanderer's Quest art licenses

The default look is one 3D scene: KayKit land and KayKit adventurers, rendered in the browser with three.js. If WebGL is unavailable, the page falls back to the original canvas diorama. Nothing is traced from a reference screenshot. No Nintendo characters, names, symbols, or assets are used. Quaternius models are not used.

## KayKit — Adventurers (1.0)

- Author: Kay Lousberg (KayKit)
- Source page: https://kaylousberg.itch.io/kaykit-adventurers
- Also: https://kaylousberg.com/game-assets/characters-adventurers
- Files used: the GitHub mirror https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0
- License: Creative Commons Zero (CC0 1.0). The pack page says it is free for personal and commercial use, with no attribution required. The pack's own `LICENSE.txt` says "License: (Creative Commons Zero, CC0)".
- License file: `models/kaykit/adventurers-LICENSE.txt`
- Full CC0 legal text: `models/licenses/cc0.txt`

Shipped files are trimmed to the body mesh plus the clips the game plays. Weapons are hidden. The mage keeps the closed spellbook in hand.

| File | Original | Used for |
| --- | --- | --- |
| `models/kaykit/chars/mage.glb` | Mage.glb | Hero, and Amanda (warmer tint, hat hidden) |
| `models/kaykit/chars/rogue.glb` | Rogue.glb | Amber, and Aspen (cooler tint) |
| `models/kaykit/chars/knight.glb` | Knight.glb | Scott. Helmet hidden so the face stays visible |
| `models/kaykit/chars/rogue_hooded.glb` | Rogue_Hooded.glb | Shanna, and Makayla |
| `models/kaykit/chars/barbarian.glb` | Barbarian.glb | Abby, and some villagers |

Clips kept from the shared rig: Idle, Walking_A, Running_A, Interact, Cheer, Sit_Floor_Idle, Lie_Idle, Hit_A, Spellcast_Raise.

## KayKit — Medieval Hexagon Pack (1.0)

- Author: Kay Lousberg (KayKit)
- Source: https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0
- License: Creative Commons Zero (CC0 1.0), confirmed in the pack's `LICENSE.txt`.
- License file: `models/kaykit/medieval-LICENSE.txt`
- Texture: `models/kaykit/hexagons_medieval.png`, copied beside each glTF so the relative URI resolves.

Pieces used, each as a `.gltf` plus its `.bin` under `models/kaykit/med/`: `hex_grass`, `hex_water`, `hex_grass_sloped_high`, `hex_road_A`, `tree_single_A`, `tree_single_B`, `rock_single_A`, `rock_single_B`, `hill_single_A`, `cloud_small`, `cloud_big`, `waterplant_A`, `fence_wood_straight`, `building_home_A_blue`, `building_home_B_yellow`, `barrel`, `crate_A_small`.

`cloud_big` is the symptom creature. Its color shifts from cool gray to warm gold as calm rises. Two eyes and a small mouth are added in code so it stays friendly.

## Original 3D pieces

Signs, lanterns, the cat, the dog, the halo ring, leaves, the breath ring, thought scribbles, footprint marks, the split shadow, and the backpack are simple meshes in `world3d.js`, colored to sit in the same light as the KayKit models. The cat and dog are original because these free KayKit packs do not include pets. License: CC0 1.0.

## three.js

- What: `vendor/three/three.module.js`, GLTFLoader, and SkeletonUtils, version 0.170.0.
- Author: three.js authors
- Source: https://github.com/mrdoob/three.js and https://unpkg.com/three@0.170.0/
- License: MIT. License file: `vendor/three/LICENSE`

## Original diorama art (WebGL fallback only)

- What: grass fields, earthen cliff bands, sandy paths, ponds, shrubs, rocks, pottery, fences, cottages, signs, lanterns, chests, the hero, counselors, villagers, pets, and symptom clouds.
- Author: drawn for this game as original code in `vista.js`.
- License: CC0 1.0. The site authors waive copyright in these drawings to the extent allowed by law.

## Optional 16px tiles (`?art=tiles` only)

The older tile look is not the default. It still loads `img/atlas.png`.

### Kenney Roguelike/RPG pack (terrain tiles)

- What: 16×16 grass, dirt, water, stone, cliff, and tree tiles copied into the atlas.
- Author: Kenney Vleugels (Kenney), tile sheet converted to 16×16 by Lynn Evers.
- Source: https://opengameart.org/content/roguelikerpg-pack-1700-tiles
- Also published at: https://kenney.nl/assets/roguelike-rpg-pack
- License: Creative Commons Zero (CC0 1.0). Commercial use is allowed. Credit is not required.
- License file: `licenses/kenney-roguelike-cc0.txt`
- License text: http://creativecommons.org/publicdomain/zero/1.0/

### Original pixel sprites in the same atlas

Hero, counselors, villagers, pets, symptom clouds, cottage, sign, lantern, chest, and rock. These are not from the Kenney pack.

License: CC0 1.0. No Nintendo characters, names, or assets are used.
