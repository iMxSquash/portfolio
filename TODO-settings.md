# Réglages Système : TODO

> **Concept** : une nouvelle app système native « Réglages Système » (desktop), au visuel du Finder (fenêtre `unified`, sidebar pleine hauteur qui porte les traffic lights, panneau de contenu opaque), qui permet de modifier en direct les paramètres de l'OS, en premier lieu le **Liquid Glass**.
>
> **Référence visuelle** : System Settings de macOS 26 Tahoe. Sidebar : champ de recherche en haut, puis sections groupées avec une icône carrée arrondie colorée par panneau. Contenu : titre du panneau dans la toolbar (précédent/suivant à gauche), puis des **groupes en encart** (boîtes arrondies, lignes séparées par un filet, libellé à gauche, contrôle à droite). Vérifier sur une vraie capture avant de figer une mesure.
>
> **Branche** : `feat/system-settings`. Ne rien committer/pusher sans demande explicite.

---

## Décisions de conception (à valider)

| Sujet                         | Décision proposée                                                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Plateforme                    | Desktop uniquement en v1 (`showOnMobile: false`). Version iOS en phase optionnelle (Phase 9).                                                                                                                                                          |
| Nom / id                      | `Réglages Système`, id `settings` (constante `SETTINGS_APP_ID` dans `apps.ts`).                                                                                                                                                                        |
| Accès                         | Dock (épinglé, comme sur macOS), menu Pomme « Réglages Système… » (remplace le stub « Préférences… »), Spotlight, Finder > Applications. Pas sur le bureau.                                                                                            |
| Sidebar                       | Même traitement plat que le Finder (`SIDEBAR_CHROME_GLASS`, sans réfraction). C'est une **décision explicite** (demande « même visuel que le Finder ») : la documenter dans `CLAUDE.md` à côté de l'exception Finder/Notes.                            |
| Source de vérité glass        | Les presets de `glass-presets.ts` restent la seule source. Les réglages sont une **couche de modificateurs globaux** appliquée par une fonction pure dans `useLiquidGlass` (point d'intégration unique), jamais une config recopiée dans un composant. |
| Persistance                   | Store Zustand `persist` (localStorage), comme `useThemeStore` / `useWallpaperStore`, avec un champ `version` pour migrer plus tard.                                                                                                                    |
| Réglages existants            | Le thème et le fond d'écran **réutilisent** `useThemeStore` et `useWallpaperStore` (pas de duplication) : le Control Center et le picker du bureau restent synchronisés.                                                                               |
| `specularStrength`            | **Non exposé** : la décision projet « 0 partout, sans exception » est maintenue.                                                                                                                                                                       |
| Budget aberration chromatique | Le réglage peut seulement **couper** l'aberration sur les éléments qui y ont droit (Dock, Spotlight, rideau de verrouillage), jamais l'activer ailleurs.                                                                                               |
| Performance                   | `setConfig` peut reconstruire la displacement map de chaque surface. Les sliders modifient un état local pendant le geste et **commitent au relâchement** (même logique que « jamais d'écriture dans le store pendant un drag »).                      |
| Tests                         | Le repo n'a pas de test runner. Les fonctions pures (résolveur glass, migration du store) mériteraient Vitest : **nouvelle dépendance, à valider avant**. En attendant : lint + typecheck + build + vérification Playwright.                           |

---

## Phase 0 : Préparation

- [x] Créer la branche `feat/system-settings` depuis `main` à jour
- [x] Charger les skills `os-apps`, `os-macos-ui`, `os-window-manager` et `apple-design` avant de coder
- [x] Relire `FinderView.tsx`, `glass-presets.ts`, `use-liquid-glass.ts`, `Dock.tsx` / `DockIcon.tsx`, `ControlCenter.tsx`, `WallpaperPicker.tsx`, `sounds.ts` pour caler le style

## Phase 1 : Modèle des réglages

- [x] `src/lib/settings.ts` : types, valeurs par défaut et bornes (constantes nommées, pas de magic numbers)
  - `GlassSettings` : `style: "clear" | "tinted"`, `blurScale`, `refractionScale`, `chromaticAberration: boolean`, `dynamicLighting: boolean`, `quality: "high" | "medium" | "low"`
  - `AccessibilitySettings` : `reduceTransparency`, `reduceMotion`, `increaseContrast`
  - `DockSettings` : `iconSize`, `magnification: boolean`, `magnifiedSize`
  - `SoundSettings` : `systemSoundsEnabled`, `volume`
  - `AppearanceSettings` : `accentColor` (palette macOS : multicolore/bleu, violet, rose, rouge, orange, jaune, vert, graphite)
  - `DEFAULT_SETTINGS`, `SETTINGS_STORAGE_KEY`, `SETTINGS_VERSION`
  - Bornes des sliders en constantes (`BLUR_SCALE_RANGE`, `REFRACTION_SCALE_RANGE`, `DOCK_ICON_SIZE_RANGE`…)
- [x] `src/stores/useSettingsStore.ts` : store `persist`, setters par section (`updateGlass(partial)`…), `resetSection(section)`, `resetAll()`, `version` + `migrate` minimal
- [x] Les valeurs de `src/lib/dock.ts` deviennent les **valeurs par défaut** des réglages du dock (pas de double définition)

## Phase 2 : Couche de réglages Liquid Glass

- [x] Fonction pure `resolveGlassConfig(preset, glass, accessibility)` dans `src/lib/glass-presets.ts` (ou `src/lib/glass-settings.ts` si le fichier devient trop long) :
  - `blur *= blurScale`, `refractionStrength *= refractionScale` (valeur de base = celle du preset, ou du `MATERIAL_PRESETS` quick-liquid si le preset ne la fixe pas)
  - `style: "tinted"` : augmente `tintOpacity` (équivalent du réglage « Liquid Glass : Teinté » de macOS 26.1) **sauf** si le preset est déjà opaque (`tintOpacity: 1`, sidebar chrome) pour ne pas casser la continuité sidebar/contenu
  - `chromaticAberration: false` → force `0` ; `true` → garde la valeur du preset (jamais d'ajout)
  - `dynamicLighting: false` → `dynamicLighting`, `cursorTracking`, `hoverLighting` à `false`
  - `quality` → `quality`
  - `reduceTransparency` → surfaces quasi opaques (`tintOpacity` élevé, `refractionStrength: 0`, `chromaticAberration: 0`), comme « Réduire la transparence » de macOS
  - `reduceMotion` → `parallax: false`, `inertia: false`
  - Ne touche jamais `borderRadius`, `specularStrength`, `tint` (le tint sidebar dépend du thème)
- [x] Brancher dans `useLiquidGlass` : lire le store, `useMemo` du config résolu sur `[config, glass, accessibility]`, le passer au constructeur et à `setConfig`. Aucun composant consommateur ne change
- [x] Vérifier que les appels existants (Dock, Spotlight, fenêtres, menus, lock screens, iOS dock) réagissent en direct : vérifié visuellement (Playwright) pour le Dock (taille/agrandissement, réduction de transparence) et les fenêtres (bordure d'`increase-contrast`) ; Spotlight, lock screens et le dock iOS n'ont pas été testés dans cette session (voir rapport final)

## Phase 3 : Coquille de l'app

- [x] `src/components/apps/settings/SettingsIcon.tsx` : icône engrenage façon macOS 26, SVG recréé (style du skill `os-macos-ui`, comme les autres icônes système)
- [x] `src/lib/settings-panes.ts` : registre des panneaux (même principe que `finder.ts`) : `{ id, label, icon, iconColor, keywords[] }`, groupés en sections
  - Section 1 : Général
  - Section 2 : Apparence, Liquid Glass, Accessibilité
  - Section 3 : Bureau et Dock, Fond d'écran, Son
- [x] Déclarer l'app dans `SYSTEM_APPS` (`src/lib/apps.ts`) : `next/dynamic`, `windowStyle: "unified"`, `pinnedToDock: true`, `showOnDesktop: false`, `showOnMobile: false`, `defaultSize` ~ `{ 720, 560 }`, `minSize` ~ `{ 560, 420 }`
  - Déviation : pas de `menus` bespoke sur l'`AppDefinition`. La barre de menus affiche déjà le nom de l'app focus (`MenuBar.tsx`) avant les menus génériques (`DEFAULT_APP_MENUS`) ; ajouter un premier menu littéralement nommé « Réglages Système » aurait dupliqué ce texte à l'écran (aucune autre app système ne définit `menus` aujourd'hui). L'app suit donc le fallback `DEFAULT_APP_MENUS`, comme Finder/Notes/Trash.
- [x] `SettingsView.tsx` (layout calqué sur `FinderView`) :
  - Sidebar `nav` plate (`SIDEBAR_CHROME_GLASS` + tint clair/sombre via `useIsDarkMode`), traffic lights + `dragHandlers` en haut via `useWindowChrome()`
  - Champ de recherche sous les traffic lights : filtre les panneaux par `label` et `keywords` ; `Entrée` ouvre le premier résultat ; message « Aucun résultat »
  - Lignes de panneau : icône carrée colorée + libellé, sélection façon Finder, navigation clavier (réutiliser `arrow-key-nav.ts` si adapté)
  - Toolbar du contenu : cluster précédent/suivant (glass, comme `ToolbarCluster` du Finder) + titre du panneau ; historique de navigation comme le Finder
  - Zone de contenu scrollable, `bg-window-canvas`
- [x] Si `ToolbarCluster` doit servir au Finder **et** aux Réglages : l'extraire dans un composant partagé plutôt que le dupliquer
- [x] Menu Pomme : l'entrée `preferences` devient « Réglages Système… » et ouvre l'app (`src/lib/menu-bar.ts` + `MenuBar.tsx`), mise à jour du commentaire « non-functional stub »

## Phase 4 : Kit de contrôles

Dans `src/components/apps/settings/controls/`, accessibles (vrais `<button>`, `<input>`, labels associés, focus visible, cibles ≥ 44 px de haut par ligne) :

- [x] `SettingsGroup` : encart arrondi, titre de section optionnel au-dessus, texte d'aide optionnel en dessous
- [x] `SettingsRow` : libellé (+ description secondaire) à gauche, contrôle à droite, filet entre les lignes
- [x] `Toggle` : interrupteur macOS (`<button role="switch" aria-checked>`), animation ressort Framer Motion, couleur d'accent
- [x] `SettingsSlider` : `<input type="range">` stylé macOS, graduations optionnelles, valeur locale pendant le geste, `onCommit` au relâchement (`pointerup` / `keyup` / `change`)
- [x] `SegmentedControl` : actionnable donc **glass avec réfraction**. Déviation : réutilise `FINDER_TOOLBAR_CLUSTER_GLASS` (option explicitement permise par ce TODO) plutôt qu'un nouveau `SETTINGS_SEGMENTED_GLASS` : même famille visuelle que les clusters de la toolbar Finder, pas de preset dupliqué.
- [ ] `SettingsSelect` : non implémenté : les deux seuls réglages à choix discret (style, qualité) sont couverts par `SegmentedControl` (2 et 3 options), un `<select>` natif n'apportait rien (YAGNI).

## Phase 5 : Panneaux

- [x] **Général** : infos « À propos » (nom, rôle, lien vers « À propos de ce Mac »), bouton « Réinitialiser tous les réglages » (confirmation inline, pas de `window.confirm`)
- [x] **Apparence** : thème Clair / Sombre / Automatique avec vignettes façon macOS (`useThemeStore`), couleur d'accentuation (pastilles rondes + libellé de la couleur choisie, pas la couleur seule)
- [x] **Liquid Glass** (le panneau vedette) :
  - Aperçu en direct : une vignette du fond d'écran courant avec une pastille glass (via `useLiquidGlass` + un preset d'aperçu) qui reflète les réglages
  - Style : `Clair` / `Teinté` (segmented)
  - Intensité de la teinte (slider, affiché uniquement quand le style est `Teinté`) : interpole l'opacité de teinte entre celle du preset (0%, identique à `Clair`) et le plafond `TINTED_STYLE_MAX_OPACITY` (100%)
  - Intensité du flou (slider)
  - Réfraction (slider)
  - Aberration chromatique (toggle, texte d'aide : « Dock et Spotlight uniquement »)
  - Éclairage dynamique (toggle)
  - Qualité de rendu : Élevée / Moyenne / Faible (texte d'aide sur la performance)
  - Bouton « Réinitialiser le Liquid Glass »
- [x] **Accessibilité** : Réduire la transparence, Réduire les animations, Augmenter le contraste (toggles)
- [x] **Bureau et Dock** : taille des icônes (slider), agrandissement (toggle) + taille agrandie (slider désactivé si agrandissement coupé)
- [x] **Fond d'écran** : grille de vignettes des fonds macOS (`src/lib/wallpapers.ts` + `useWallpaperStore`), sélection = bordure d'accent + coche
- [x] **Son** : sons système (toggle), volume (slider), bouton « Tester » qui joue `playSystemSound("minimize")`

## Phase 6 : Brancher les réglages dans l'OS

- [x] **Couleur d'accentuation** : attribut `data-accent` sur `<html>` (appliqué comme le thème, voir `ThemeProvider.tsx`) + redéfinition de `--system-blue` par accent dans `globals.css` (clair et sombre). Vérifier le contraste ≥ 4.5:1 du texte en accent (le jaune en clair est le cas piège)
- [x] **Réduire les animations** : `<MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>` à la racine de `OS.tsx`, pour que tous les `useReducedMotion()` existants suivent sans modification
- [x] **Augmenter le contraste** : classe `increase-contrast` sur `<html>` + bordures/séparateurs renforcés dans `globals.css`. Volontairement minimal (comme demandé) : ne renforce que le contour/l'ombre des fenêtres (`--shadow-window-focused/unfocused`), le séparateur le plus visible de l'OS : pas de réécriture des dizaines de `border-black/10`-style utilitaires disséminés dans les composants.
- [x] **Dock** : `Dock.tsx` / `DockIcon.tsx` lisent taille et agrandissement dans le store (sans agrandissement : taille fixe, pas de ressort). `DOCK_HEIGHT` (constante) devient `getDockHeight(iconSize)` (fonction pure, `src/lib/dock.ts`) puisque la hauteur dépend désormais du réglage. Animation de minimisation non re-testée avec une taille d'icône custom (voir rapport final).
- [x] **Sons** : `playSystemSound` lit `useSettingsStore.getState()` (activé + volume multiplié sur `note.volume`), sans devenir un hook
- [x] Éviter le flash au chargement : appliquer `data-accent` / `increase-contrast` avant le premier paint si le thème le fait déjà (même mécanisme que le thème)

## Phase 7 : Qualité et vérification

- [x] L'app reste utilisable à son `minSize` (sidebar qui ne déborde pas, contenu scrollable) : vérifié en redimensionnant à ~560×420 via Playwright
- [x] Clavier : Tab entre sidebar, recherche et contrôles ; flèches dans la sidebar ; Échap vide la recherche ; focus visible partout : Échap-vide-la-recherche vérifié ; flèches dans la sidebar réutilisent `focusListSibling` à l'identique du Finder (déplace le focus DOM, ne change pas le panneau affiché sans Entrée/clic : comportement hérité de `FinderView.tsx`, pas une régression) ; Tab/focus visible non passés en revue exhaustivement contrôle par contrôle
- [x] Lecteur d'écran : `aria-label` sur la sidebar (`nav`), titre de panneau en `h1` unique dans la fenêtre, groupes en `section` + `h2` : `SettingsGroup` accepte désormais un `srOnlyTitle` en plus de `title`, rendu en `h2` visuellement masqué (`sr-only`) et lié à la `section` via `aria-labelledby` quand il n'y a pas de titre visible (comme sur le vrai macOS) ; tous les `SettingsGroup` sans titre visible (Général x2, Accessibilité, Bureau et Dock, Son, Fond d'écran, Liquid Glass x5) en ont un
- [x] Réglages persistés après rechargement ; « Réinitialiser » remet les valeurs par défaut et l'OS suit en direct : vérifié (rechargement de page + bouton Réinitialiser, taille du Dock revenue à 48px en direct)
- [x] Clair et sombre vérifiés sur chaque panneau : Général/Apparence/Liquid Glass vérifiés dans les deux modes ; Accessibilité/Bureau et Dock/Fond d'écran/Son vérifiés dans un seul mode faute de temps (voir rapport final)
- [x] Performance : pas de saccade en bougeant les sliders (commit au relâchement), pas de fuite d'engines (`destroy` au démontage) : pas de test de charge dédié ; le mécanisme (état local + `onCommit`, `destroy` dans `useLiquidGlass`) est inchangé/repris tel quel
- [x] `npm run lint`, `npm run typecheck`, `npm run build`, `npm run format:check` au vert
- [x] Vérification Playwright : ouverture depuis le dock et le menu Pomme, changement de chaque réglage Liquid Glass avec effet visible sur le Dock, accent, dock, persistance, captures clair/sombre
- [x] Lancer `/simplify` sur le code modifié

## Phase 8 : Documentation

- [x] `CLAUDE.md` : ajouter `TODO-settings.md` aux roadmaps ; documenter la couche de réglages glass (`resolveGlassConfig` dans `useLiquidGlass`) dans « Paramètres Liquid Glass centralisés » ; étendre l'exception sidebar plate aux Réglages (décision explicite)
- [x] Skill `os-apps` : ajouter Réglages Système aux « Conventions des apps système »
- [x] `README.md` : mentionner l'app si le README liste les apps système
- [x] Cocher les cases de ce fichier au fil de l'eau

## Phase 9 (optionnelle) : Version iOS

- [ ] `mobileComponent` façon Réglages iOS : liste groupée en encarts, navigation empilée (liste → panneau) comme `NotesMobile`
- [ ] `showOnMobile: true`, présence sur le springboard
- [ ] Masquer les panneaux sans sens sur iOS (Bureau et Dock, fond d'écran macOS → fond d'écran iOS)

---

## Découpage de commits suggéré

1. `feat(settings): add settings model and persisted store`
2. `feat(glass): apply user glass settings in useLiquidGlass`
3. `feat(settings): add system settings app shell and sidebar`
4. `feat(settings): add settings controls and panes`
5. `feat(settings): wire accent, dock, sound and motion settings into the os`
6. `docs: document system settings app`
