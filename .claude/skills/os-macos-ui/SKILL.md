---
name: os-macos-ui
description: Spécifications visuelles macOS pour le portfolio — menu bar, dock (magnification), traffic lights, vibrancy, ombres, mesures exactes et couleurs système. À utiliser dès qu'on construit ou retouche l'UI macOS (barre de menu, dock, bureau, chrome de fenêtre) pour rester fidèle au vrai macOS.
---

# UI macOS — fidélité visuelle

L'effet du portfolio repose sur la fidélité : quelqu'un qui connaît macOS doit s'y croire. En cas de doute sur un détail, regarder une capture d'écran de macOS (Sonoma/Sequoia) plutôt qu'inventer.

## Mesures et tokens de référence

| Élément                | Valeur                                                                            |
| ---------------------- | --------------------------------------------------------------------------------- |
| Menu bar               | hauteur 28px, texte 13px, fond vibrancy                                           |
| Traffic lights         | Ø 12px, gap 8px, à 8px du bord gauche, en haut de la barre de titre               |
| Rouge / Jaune / Vert   | `#FF5F57` / `#FEBC2E` / `#28C840` (gris `#DDD` quand la fenêtre n'a pas le focus) |
| Barre de titre         | hauteur 28–38px selon l'app, titre 13px semi-bold centré                          |
| Coins de fenêtre       | radius 10px                                                                       |
| Dock                   | icônes 48–56px au repos, radius du conteneur ~20px, marge bas 4–8px               |
| Ombre fenêtre focus    | `0 20px 60px rgba(0,0,0,0.35)` + bordure 1px `rgba(0,0,0,0.15)`                   |
| Ombre fenêtre inactive | `0 8px 24px rgba(0,0,0,0.2)`                                                      |

- **Police** : SF Pro n'est pas redistribuable. Font stack : `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` (sur Mac les visiteurs auront le vrai SF).
- **Vibrancy** : `backdrop-blur-2xl` + fond `rgba(255,255,255,0.65)` (clair) / `rgba(30,30,30,0.65)` (sombre) + `saturate(180%)`. Définir une classe utilitaire `vibrancy` réutilisée partout (menu bar, dock, sidebars).
- ⚠️ Safari : `backdrop-filter` a besoin du préfixe `-webkit-` et se dégrade mal quand il est imbriqué (pas de vibrancy dans vibrancy). Tester tôt.

## Traffic lights — comportement exact

- Au repos : trois disques colorés **sans glyphe**.
- Au hover **du groupe** (pas d'un seul bouton) : les glyphes ×, −, ⤢ apparaissent sur les trois à la fois.
- Fenêtre sans focus : les trois deviennent gris uniformes.
- Le vert = maximize dans notre version (pas le vrai fullscreen). Alt+vert non géré en v1.

## Dock — magnification

Interpolation continue selon la distance du curseur, pas un simple scale au hover :

```tsx
const mouseX = useMotionValue(Infinity); // mis à jour sur onMouseMove du dock, Infinity sur leave

// Dans chaque icône :
const distance = useTransform(mouseX, (x) => x - iconCenterX); // via ref + getBoundingClientRect
const size = useTransform(distance, [-150, 0, 150], [48, 80, 48]);
const spring = useSpring(size, { mass: 0.1, stiffness: 170, damping: 12 });
```

- Les icônes voisines grossissent aussi (c'est l'interpolation sur la distance qui le fait naturellement).
- Le dock s'élargit quand les icônes grossissent : laisser le layout flex faire, ne pas figer la largeur.
- Indicateur app ouverte : point noir/blanc Ø 4px sous l'icône.
- Tooltip nom de l'app : au-dessus de l'icône, fond vibrancy, apparition ~300ms après hover.
- Séparateur vertical avant la zone de droite : fenêtres minimisées + Corbeille.
- Désactiver la magnification si `prefers-reduced-motion`.

## Menu bar

- Gauche : logo Apple (SVG, pas l'emoji ), puis nom de l'app **focusée** en semi-bold, puis menus (Fichier, Édition, Fenêtre, Aide) — contenu défini par app dans le registre.
- Menus déroulants : ouverts au clic, naviguer au survol une fois un menu ouvert (comportement macOS), fermeture au clic extérieur/Échap. Items avec raccourcis factices alignés à droite (`⌘N`).
- Droite : icônes wifi/batterie/Control Center + **horloge live** au format français macOS : `lun. 6 juil. 09:41` → `date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })` + heure `HH:mm`. Mise à jour via `setInterval` 1s dans un composant isolé (éviter de re-rendre la barre entière).

## Bureau

- Icônes alignées en colonne **depuis la droite** (convention macOS), grille ~80×90px.
- Simple clic = sélection (fond bleu translucide arrondi sur le label), double-clic = ouverture. Sur le bureau uniquement — le dock, lui, ouvre au simple clic.
- Label : 12px, blanc avec ombre portée légère pour rester lisible sur tout fond d'écran.
- Clic sur le fond du bureau : désélectionne tout et défocus la fenêtre active côté menu bar (l'app affichée redevient « Finder »).

## Icônes d'apps

- Recréer les icônes Adobe en SVG (carré arrondi + « Ps »/« Ai »/« Pr » avec leurs couleurs : Ps `#31A8FF` sur `#001E36`, Ai `#FF9A00` sur `#330000`, Pr `#9999FF` sur `#00005B`) — ne pas embarquer les assets officiels.
- Toutes les icônes au même format : composant `AppIcon` (SVG, radius proportionnel ~22.5%), réutilisé dock/bureau/springboard.
