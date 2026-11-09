# Wanderer's Quest art licenses

The default look is one 3D scene: KayKit adventurers on continuous terrain, rendered in the browser with three.js. The ground is an original vertex-colored mesh (soft grass, sandy paths, earthen cliffs, water). Trees and grass tufts are from the KayKit Forest Nature Pack. Cottages, fences, rocks, barrels, crates, and the symptom cloud are from the KayKit Medieval Hexagon Pack. Bushes, flowers, pots, reeds, lily pads, and stairs are original meshes. If WebGL is unavailable, the page falls back to the original canvas diorama. Nothing is traced from a reference screenshot. No Nintendo characters, names, symbols, or assets are used. Quaternius models are not used.

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

## KayKit — Forest Nature Pack (1.0, free subset)

- Author: Kay Lousberg (KayKit)
- Source page: https://kaylousberg.itch.io/kaykit-forest
- Also: https://kaylousberg.com/game-assets/forest-nature-pack
- License: Creative Commons Zero (CC0 1.0). The itch.io page lists the asset license as "Creative Commons Zero v1.0 Universal". The author's page says the pack is "Free for personal and commercial use, no attribution required. (CC0 Licensed)".
- License file copied in: `models/kaykit/forest/LICENSE.txt` (the full CC0 1.0 legal text)
- Files were fetched from the public mirror `https://szofttech.inf.elte.hu/hall-of-fame/kishaverok/-/tree/master/Assets/Nature/KayKit_Forest_Nature_Pack_1.0_FREE` because the itch download is a checkout flow. That mirror only contains a subset of the free pack. The shipped files are exactly these:

| File | Used for |
| --- | --- |
| `models/kaykit/forest/gltf/Tree_2_C_Color1.gltf` + `.bin` | Rounded tree |
| `models/kaykit/forest/gltf/Tree_4_A_Color1.gltf` + `.bin` | Tree |
| `models/kaykit/forest/gltf/Tree_4_B_Color1.gltf` + `.bin` | Tree |
| `models/kaykit/forest/gltf/Tree_4_C_Color1.gltf` + `.bin` | Taller tree |
| `models/kaykit/forest/gltf/Grass_1_B_Color1.gltf` + `.bin` | Grass clump |
| `models/kaykit/forest/gltf/Grass_2_C_Color1.gltf` + `.bin` | Grass clump |
| `models/kaykit/forest/gltf/Grass_2_D_Color1.gltf` + `.bin` | Grass clump |
| `models/kaykit/forest/gltf/forest_texture.png` | Shared gradient atlas. Each glTF names this file as its texture. |

Bushes, rocks, and modular terrain from the full free zip are not in that mirror, so they are not shipped. Bushes and flowers are original meshes. Rocks come from the Medieval Hexagon pack below.

## KayKit — Medieval Hexagon Pack (1.0)

- Author: Kay Lousberg (KayKit)
- Source: https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0
- License: Creative Commons Zero (CC0 1.0), confirmed in the pack's `LICENSE.txt`.
- License file: `models/kaykit/medieval-LICENSE.txt`
- Texture: `models/kaykit/hexagons_medieval.png`, copied beside each glTF so the relative URI resolves.

Pieces the scene loads, each as a `.gltf` plus its `.bin` under `models/kaykit/med/`: `rock_single_A`, `rock_single_B`, `cloud_big`, `waterplant_A`, `fence_wood_straight`, `building_home_A_blue`, `building_home_B_yellow`, `barrel`, `crate_A_small`.

The hex ground tiles (`hex_grass`, `hex_water`, `hex_grass_sloped_high`, `hex_road_A`) and the older hex-pack trees are still in the folder from the previous scene. The default look does not load them. The ground is the original terrain mesh instead.

`cloud_big` is the symptom creature. Its color shifts from cool gray to warm gold as calm rises. Two eyes and a small mouth are added in code so it stays friendly.

## Original 3D pieces

The continuous ground (grass, sandy paths, pond basins, cliff colors), stone stairs, knoll steps, layered bushes, flowers, clay pots, reeds, lily pads, path pebbles, fen stepping stones, signs, lanterns, the cat, the dog, the halo, the warm support light, leaves, the breath ring, thought scribbles, footprint marks, the split shadow, and the backpack are simple meshes in `world3d.js`. The Forest Nature mirror did not include bush files, and the itch.io zip is not a direct download, so the bushes are original: overlapping icospheres with vertex-color shading, berries, and flowers. The cat and dog are original because these free KayKit packs do not include pets. License: CC0 1.0.

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
