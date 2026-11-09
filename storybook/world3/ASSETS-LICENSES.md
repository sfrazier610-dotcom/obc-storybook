# Wanderer's Quest art licenses

The default Vista look keeps an original shaded diorama for the land (grass, cliffs, paths, cottages, shrubs). The people, pets, and symptom creatures are 3D models rendered in the browser with three.js, then drawn into that world and upscaled with nearest-neighbor. If WebGL is unavailable, the page falls back to the original canvas figures. Nothing is traced from a reference screenshot. No Nintendo characters, names, symbols, or assets are used.

## 3D cast (default look)

Quaternius models, converted from the CC0 FBX packs to glTF binary. Animations stay on the hero file and are retargeted by bone name. Other character files keep the mesh and the skeleton only.

- Author: Quaternius
- License: Creative Commons Zero (CC0 1.0). Commercial use is allowed. Credit is not required.
- License file: `models/licenses/cc0.txt`
- License text: https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt

### Ultimate Animated Character Pack (November 2019)

- Source page: https://quaternius.com/packs/ultimatedanimatedcharacter.html
- Mirror used: https://opengameart.org/content/animated-characters-pack
- What we ship, and the original FBX name:

| File | Original model | Used for |
| --- | --- | --- |
| `models/hero.glb` | Casual_Male.fbx (mesh and all clips) | The hero, with an original book satchel mesh |
| `models/amber.glb` | Casual_Female.fbx | Amber |
| `models/scott.glb` | Suit_Male.fbx | Scott |
| `models/shanna.glb` | Doctor_Female_Young.fbx | Shanna |
| `models/abby.glb` | Worker_Female.fbx | Abby |
| `models/aspen.glb` | Casual3_Female.fbx | Aspen |
| `models/amanda.glb` | Casual2_Female.fbx | Amanda |
| `models/makayla.glb` | Cowboy_Female.fbx | Makayla |
| `models/villager_a.glb` | Casual_Bald.fbx | Villagers |
| `models/villager_b.glb` | Worker_Male.fbx | Villagers |
| `models/villager_c.glb` | Casual3_Male.fbx | Villagers |
| `models/pug.glb` | Pug.fbx | Pets (Ragnar, Orion, and Kenneth) |

Clips in the hero file: Idle, Walk, Walk_Carry, SitDown, Defeat, RecieveHit, Victory, Punch, PickUp, Shoot_OneHanded, StandUp. There is no separate run clip and no wave clip. Run plays Walk faster. Asking for help plays Idle with the right arm raised.

### Cute Animated Monsters (August 2020)

- Source page: https://quaternius.com/packs/cutemonsters.html
- Mirror used: https://opengameart.org/content/textured-cute-monster-pack
- `models/alien.glb` and `models/alien.png` from Alien.fbx. Boss symptoms, including the Heavy Cloud. The texture is tinted from storm gray to warm as calm rises. Clips include Idle, HitRecieve, and Yes.
- `models/mushroom.glb` and `models/mushroom.png` from Mushroom.fbx. Smaller symptoms. This file's only clip is Idle.

Skull, Demon, Cthulhu, and Dragon from that pack are not used.

### Original 3D pieces

The hero's book, the pet tint, the halo ring, leaves, breath ring, thought scribbles, footprint marks, split shadow, and the backpack sack are meshes made for this game in `chars3d.js`. License: CC0 1.0, same as the other original game art.

## three.js

- What: `vendor/three/three.module.js` and the GLTFLoader addon, version 0.170.0.
- Author: three.js authors
- Source: https://github.com/mrdoob/three.js and https://unpkg.com/three@0.170.0/
- License: MIT. License file: `vendor/three/LICENSE`


## Original diorama art (the land, and the WebGL fallback)

- What: grass fields, earthen cliff bands, sandy paths, ponds, shrubs, rocks, pottery, fences, cottages, signs, lanterns, chests, the hero (book satchel), counselors, villagers, pets, and symptom clouds.
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
