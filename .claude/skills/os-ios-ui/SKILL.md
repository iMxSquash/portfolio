---
name: os-ios-ui
description: Spécifications du mode iOS du portfolio (mobile/tablette) — détection du device, springboard, status bar, icônes squircle, ouverture d'apps plein écran, gestes, safe areas. À utiliser dès qu'on travaille sur la version mobile/tablette du portfolio.
---

# UI iOS — mode mobile/tablette

Sur mobile et tablette, le portfolio devient iOS : pas de fenêtres flottantes, les apps s'ouvrent en plein écran depuis un springboard. Finder et Corbeille n'existent pas dans ce mode.

## Détection du device

Ne pas se fier qu'à la largeur d'écran (un desktop redimensionné n'est pas un iPhone) :

```ts
const isTouchDevice = matchMedia("(pointer: coarse)").matches;
const isMobileWidth = matchMedia("(max-width: 1024px)").matches;
// Mode iOS si pointer coarse OU largeur mobile ; sinon macOS.
```

- Décision rendue dans un composant racine `<OS>` : `<MacOS>` ou `<IOS>`. Un seul mode monté à la fois.
- ⚠️ SSR : le serveur ne connaît pas le device → soit lire le `User-Agent` dans un Server Component pour un premier rendu correct, soit accepter un flash et rendre après hydratation. Préférer le User-Agent (via `userAgent` de `next/server`) + correction client au resize.
- Tablette = même mode iOS avec grille plus large (façon iPadOS), breakpoint interne ~768px.

## Status bar

- Hauteur ~54px avec notch/Dynamic Island, contenu : **heure à gauche** (format `9:41`), **réseau + wifi + batterie à droite**.
- Respecter les **safe areas** : `padding-top: env(safe-area-inset-top)` et `padding-bottom: env(safe-area-inset-bottom)` + `viewport-fit=cover` dans le meta viewport, sinon le notch recouvre l'UI sur un vrai iPhone.

## Springboard

- Grille d'icônes : 4 colonnes (6 en tablette), gap régulier, icônes 60px + label 11px blanc avec ombre.
- **Pagination horizontale par swipe** si plus d'une page : scroll-snap CSS (`scroll-snap-type: x mandatory`) est plus fiable que du drag JS. Points de pagination en bas.
- **Dock iOS** : 4 icônes max, fond vibrancy arrondi, fixé au-dessus de la barre home, pas de labels.
- Icônes **squircle** (superellipse) : un `border-radius: 22.5%` est une approximation acceptable ; pour la vraie forme, `clip-path` avec le path SVG de superellipse partagé par le composant `AppIcon`.
- Cibles tactiles ≥ 44×44px partout (règle Apple).

## Ouverture / fermeture d'app

- **Ouverture** : zoom depuis l'icône vers le plein écran. Framer Motion `layoutId` partagé entre l'icône et le conteneur d'app donne l'effet iOS quasi gratuitement.
- L'app ouverte occupe tout l'écran sous la status bar (la status bar reste visible, passe en couleur adaptée à l'app).
- **Fermeture** : barre home (trait horizontal en bas, ~134×5px, arrondi) + swipe up depuis le bas → retour springboard avec l'animation inverse. Prévoir aussi un bouton retour discret pour les navigateurs où le swipe entre en conflit avec les gestes système.
- ⚠️ Le swipe up depuis le bord bas déclenche le geste système du téléphone : déclencher notre geste sur la zone de la barre home elle-même plutôt que sur le bord de l'écran.
- Une seule app ouverte à la fois en v1 (pas d'app switcher — bonus possible plus tard).

## Adaptation des apps

- Chaque app du registre expose `showOnMobile` ; Finder et Corbeille sont à `false`.
- **Notes** : layout 1 colonne avec navigation empilée (liste → note, bouton retour « ‹ Notes » en haut à gauche), comme la vraie app iPhone.
- **Projets iframe** : iframe plein écran sous la status bar. Vérifier que les projets embarqués sont responsive — c'est leur vrai viewport mobile.
- **Projets `external`** : ouverture directe dans un nouvel onglet au tap.

## Pièges mobiles classiques

- `100vh` inclut la barre d'URL mobile → utiliser `100dvh` (et fallback `100vh`).
- Désactiver le scroll/bounce du body : `overscroll-behavior: none` + `touch-action: manipulation` sur le springboard (supprime aussi le délai de double-tap zoom).
- Empêcher la sélection de texte accidentelle sur les icônes : `user-select: none` + `-webkit-touch-callout: none`.
- Tester sur un vrai iPhone (Safari iOS a ses propres bugs de `backdrop-filter` et de `position: fixed`).
