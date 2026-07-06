---
name: os-window-manager
description: Patterns et pièges pour le window manager macOS du portfolio (store Zustand, drag, resize, focus/z-index, minimize vers le dock). À utiliser dès qu'on touche aux fenêtres — ouverture, fermeture, déplacement, redimensionnement, superposition, animations de fenêtres.
---

# Window manager macOS

Le window manager est le cœur du portfolio. Une seule source de vérité : le store Zustand `useWindowStore`. Les composants ne stockent jamais la position/taille d'une fenêtre en state local persistant.

## Forme du store

```ts
type WindowState = {
  appId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  prevBounds?: { position: Position; size: Size }; // pour restore après maximize
};

type WindowStore = {
  windows: Record<string, WindowState>; // clé = appId (1 fenêtre par app en v1)
  nextZIndex: number;
  focusedAppId: string | null;
  openWindow: (appId: string) => void; // si déjà ouverte → focus ; si minimisée → restore
  closeWindow: (appId: string) => void;
  focusWindow: (appId: string) => void; // zIndex = nextZIndex++, focusedAppId = appId
  minimizeWindow: (appId: string) => void;
  toggleMaximize: (appId: string) => void;
  setBounds: (appId: string, bounds: Partial<Bounds>) => void; // appelé UNIQUEMENT en fin de drag/resize
};
```

- **Focus/z-index** : compteur incrémental simple (`nextZIndex++` à chaque focus). Pas de tri de tableau. Le focus se déclenche sur `onPointerDown` (capture) de toute la fenêtre, pas seulement la barre de titre.
- `focusedAppId` pilote aussi la menu bar (nom de l'app active) et l'apparence de la fenêtre (traffic lights colorés vs gris, ombre plus marquée).

## Drag et resize : performance d'abord

**Règle d'or : ne jamais écrire dans le store à chaque `pointermove`.** Sinon chaque pixel de drag re-rend toutes les fenêtres.

- Pendant le drag/resize : manipuler des **motion values Framer Motion** (`useMotionValue` pour x/y/width/height) ou du style direct via ref. Zéro re-render React.
- Au `pointerup` : commit unique dans le store via `setBounds`.
- Utiliser les **pointer events natifs** (`onPointerDown` + `setPointerCapture`) plutôt que le `drag` de Framer Motion : on garde le contrôle total (contraintes, resize 8 directions, sync store).
- Resize : 8 zones invisibles (4 bords ~6px, 4 coins ~12px) avec les bons `cursor` (`ew-resize`, `ns-resize`, `nwse-resize`, `nesw-resize`). Taille minimale par app (définie dans le registre d'apps).

## Contraintes de déplacement (comportement macOS réel)

- La barre de titre ne peut **jamais passer sous la menu bar** (y ≥ hauteur menu bar).
- La fenêtre PEUT dépasser des bords gauche/droite/bas — garder au minimum ~40px de barre de titre visibles pour pouvoir la rattraper.
- Maximize = remplir l'espace entre menu bar et bas de l'écran (pas le fullscreen navigateur). Sauvegarder `prevBounds` avant, restaurer au 2e clic sur le bouton vert ou double-clic barre de titre.

## Piège n°1 : les iframes mangent les événements souris

Dès que le curseur passe au-dessus d'une `<iframe>` pendant un drag/resize, les `pointermove` sont capturés par l'iframe et le drag se fige. **Solution** : un state global `isInteracting` (dans le store) qui, pendant tout drag/resize, pose `pointer-events: none` sur le contenu des fenêtres (ou un overlay transparent au-dessus de chaque iframe). Le retirer au `pointerup`.

## Animations (Framer Motion)

- **Ouverture** : `initial={{ scale: 0.9, opacity: 0 }}` → `animate={{ scale: 1, opacity: 1 }}`, ~200ms, ease-out. Bonus : partir de la position de l'icône cliquée.
- **Fermeture** : inverse rapide (~150ms) via `AnimatePresence`.
- **Minimize vers le dock** : mesurer la position de l'icône cible dans le dock (`ref` + `getBoundingClientRect`), animer `x/y` vers ce point + `scale: 0.05` + `opacity: 0`. Ne PAS tenter l'effet genie exact (déformation de mesh) : coûteux et fragile. Un scale+translate avec `transformOrigin` vers le dock est convaincant.
- **Restore** : animation inverse depuis le dock.
- Respecter `prefers-reduced-motion` : durées → 0 ou quasi.

## Rendu

- Une fenêtre minimisée reste **montée** (son état interne — note ouverte, page iframe — doit survivre), juste `visibility: hidden`/hors écran après l'animation. Ne pas démonter.
- Positionner avec `transform: translate(x, y)` (motion values), jamais `top/left` animés (layout thrash).
- Le contenu de l'app est chargé en `next/dynamic` à la première ouverture (voir skill os-apps).
