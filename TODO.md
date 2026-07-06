# Portfolio v2 — TODO

> **Concept** : reproduire macOS (desktop) et iOS (mobile/tablette). Les projets tournent dans des fenêtres via des sous-domaines (`photoshop.elwen.dev`), gérés depuis un backoffice.
>
> **Stack** : Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion (animations) · Zustand (window manager) · Supabase (Postgres + Auth + Storage) · Vercel
>
> **Mode d'ouverture des projets (hybride)** : mes propres projets en iframe via sous-domaines ; pour les projets tiers, choix `iframe` ou `lien externe` dans le backoffice (les sites tiers bloquent souvent l'iframe via `X-Frame-Options`).

---

## Phase 0 — Setup

- [x] Initialiser le repo Git (`portfolio`) + repo GitHub
- [x] Créer le projet : `npx create-next-app@latest` (App Router, TypeScript, Tailwind, ESLint)
- [x] Configurer Prettier + règles ESLint
- [x] Mettre en place la structure de dossiers :
  - `src/components/os/` — fenêtres, dock, menu bar, bureau, springboard iOS
  - `src/components/apps/` — Notes, Finder, Corbeille, apps projets
  - `src/stores/` — stores Zustand
  - `src/lib/` — clients Supabase, helpers, registre des apps
  - `src/app/admin/` — backoffice
- [x] Installer les dépendances : `zustand`, `framer-motion`, `@supabase/supabase-js`, `@supabase/ssr`
- [x] Créer le projet Supabase + récupérer les clés → `.env.local` (et `.env.example` committé) — projet `portfolio` (`pxfauyqwldigcxjfynzz`, eu-west-3, org AlemAgency)
- [ ] Créer le projet Vercel, lier le repo, ajouter les variables d'env
- [ ] Configurer le domaine `elwen.dev` sur Vercel + DNS wildcard `*.elwen.dev`

## Phase 1 — Fondations OS

- [ ] Détection du device : desktop → mode **macOS**, mobile/tablette → mode **iOS**
  - Breakpoints + `pointer: coarse` / `hover: none` (pas seulement la largeur d'écran)
  - Composant racine `<OS>` qui rend `<MacOS>` ou `<IOS>`
- [ ] Design tokens dans Tailwind : couleurs système macOS, radius, ombres de fenêtres, effet vibrancy (`backdrop-blur` + transparence)
- [ ] Police : SF Pro n'est pas librement redistribuable → utiliser **Inter** ou `-apple-system` en font stack
- [ ] Fonds d'écran macOS/iOS (plusieurs, changeables plus tard)
- [ ] Thème clair/sombre (suivre `prefers-color-scheme` + toggle manuel façon Control Center)
- [ ] **Registre central des apps** (`src/lib/apps.ts`) : `{ id, name, icon, type: 'component' | 'iframe' | 'external', component?, url?, showOnDesktop, showOnMobile, defaultSize, defaultPosition }`
  - Les apps système (Notes, Finder, Corbeille) sont déclarées en dur ; les apps projets seront injectées depuis Supabase (Phase 7)
- [ ] Écran de boot / login Apple au premier chargement (bonus, mais gros effet waouh)

## Phase 2 — Window manager (cœur du projet, desktop)

- [ ] Store Zustand `useWindowStore` :
  - [ ] `openWindow(appId)` / `closeWindow(id)` — une app peut-elle avoir plusieurs fenêtres ? (décision : non pour la v1, 1 fenêtre par app)
  - [ ] Focus : clic n'importe où sur une fenêtre → elle passe au premier plan (gestion `zIndex` incrémental)
  - [ ] État par fenêtre : `{ appId, position, size, isMinimized, isMaximized, zIndex, prevBounds }`
  - [ ] Mémoriser position/taille quand on ferme puis rouvre (localStorage en bonus)
- [ ] Composant `<Window>` :
  - [ ] Barre de titre avec **traffic lights** (rouge = fermer, jaune = réduire, vert = plein écran) + icônes au hover du groupe, comme sur macOS
  - [ ] **Drag** via la barre de titre (Framer Motion `drag` ou pointer events maison — pointer events recommandé pour garder le contrôle du store)
  - [ ] **Resize** : 4 bords + 4 coins, taille minimale par app
  - [ ] Contrainte : la fenêtre ne peut pas passer sous la menu bar ; peut dépasser des bords gauche/droite/bas comme sur macOS
  - [ ] Les fenêtres se superposent librement (zIndex piloté par le focus)
- [ ] Animations Framer Motion :
  - [ ] Ouverture : scale + fade depuis l'icône cliquée
  - [ ] **Minimize vers le dock** : la fenêtre s'anime vers la position de l'icône dans le dock (mesurer la position de l'icône avec un `ref`). L'effet genie exact est très coûteux — un scale + translate vers le dock suffit largement
  - [ ] Restore depuis le dock (animation inverse)
  - [ ] Plein écran : la fenêtre remplit l'espace sous la menu bar (pas le vrai fullscreen navigateur)
- [ ] Double-clic sur la barre de titre → maximise (comportement macOS)

## Phase 3 — UI macOS

### Menu bar

- [ ] Barre fixe en haut : fond vibrancy, hauteur ~28px
- [ ] Logo à gauche → menu déroulant (« À propos de ce portfolio », « Préférences… », « Verrouiller l'écran »…)
- [ ] Nom de l'app active en gras + menus contextuels (Fichier, Édition…) — contenu par app, même factice
- [ ] À droite : wifi, batterie, **horloge live** (format macOS : « lun. 6 juil. 09:41 »)
- [ ] Bonus : Spotlight (Cmd+Espace, recherche parmi les apps/projets), Control Center (toggle thème, luminosité factice)

### Dock

- [ ] Dock centré en bas : fond vibrancy, coins arrondis
- [ ] Icônes des apps (depuis le registre) + **effet magnification au survol** (interpolation de la taille selon la distance du curseur — Framer Motion `useMotionValue` + `useTransform`)
- [ ] Point/indicateur sous les apps ouvertes
- [ ] Tooltip avec le nom de l'app au survol
- [ ] Section droite après un séparateur : fenêtres réduites (miniature ou icône) + Corbeille
- [ ] Clic sur une app fermée → ouvre ; ouverte → focus ; réduite → restore

### Bureau

- [ ] Fond d'écran plein écran
- [ ] Icônes sur le bureau (alignées à droite, façon macOS) : projets, raccourcis
- [ ] Simple clic → sélection (surbrillance), **double-clic → ouverture**
- [ ] Bonus : rectangle de sélection au drag, menu contextuel clic droit (« Changer le fond d'écran… », « Nouvelle note »)

## Phase 4 — Apps système

### Notes

- [ ] Layout 3 colonnes : sidebar (dossiers) + liste des notes + éditeur
- [ ] Contenu : « À propos de moi », parcours, compétences, contact — le CV déguisé en notes
- [ ] Notes en lecture seule, mais rendu fidèle (fond jaune du titre, typographie Notes)

### Finder — desktop uniquement

- [ ] Fenêtre Finder : toolbar (précédent/suivant, vue icônes/liste), sidebar (Favoris : Projets, Applications, Bureau…)
- [ ] Arborescence virtuelle : les projets (depuis Supabase) apparaissent comme des fichiers/dossiers
- [ ] Double-clic sur un projet dans le Finder → ouvre sa fenêtre
- [ ] Ne pas l'enregistrer dans les apps mobiles (flag `showOnMobile: false`)

### Corbeille

- [ ] Icône dans le dock (pleine/vide selon le contenu)
- [ ] Fenêtre (réutilise le layout Finder) avec du contenu fun : « portfolio-v1-final-FINAL.zip », vieux brouillons…
- [ ] Bonus : glisser une icône du bureau vers la corbeille + « Vider la corbeille » avec son macOS

## Phase 5 — Apps projets (fenêtres iframe)

- [ ] Composant `<IframeWindow>` :
  - [ ] `<iframe>` avec `sandbox` approprié + `loading="lazy"`
  - [ ] Skeleton/spinner pendant le chargement (événement `onLoad`)
  - [ ] Gestion d'erreur : si le site refuse l'iframe ou timeout → message + bouton « Ouvrir dans un nouvel onglet »
  - [ ] ⚠️ Piège : pendant le drag/resize, l'iframe capture les événements souris → poser un overlay transparent sur l'iframe tant que le drag est actif
- [ ] Fenêtres **Photoshop**, **Illustrator**, **Premiere Pro** → `photoshop.elwen.dev`, `illustrator.elwen.dev`, `premierepro.elwen.dev`
- [ ] Icônes fidèles aux apps Adobe (recréées en SVG pour éviter les soucis de droits sur les assets officiels)
- [ ] Mode `external` : clic sur l'icône → `window.open(url)` directement (pas de fenêtre)
- [ ] Bouton dans la barre de titre des fenêtres iframe : « Ouvrir en plein écran » (vers le sous-domaine direct)

## Phase 6 — Mode iOS (mobile/tablette)

- [ ] **Status bar** : heure à gauche, réseau/wifi/batterie à droite
- [ ] **Springboard** : grille d'icônes (apps système + projets), pagination horizontale par swipe, points de page
- [ ] **Dock iOS** : 4 icônes fixes en bas, fond vibrancy
- [ ] Icônes au format iOS (superellipse/squircle, taille tap-friendly ≥ 44px)
- [ ] Ouverture d'app : animation zoom depuis l'icône → **plein écran** (pas de fenêtres flottantes en mobile)
- [ ] Fermeture : barre home en bas + swipe up (ou bouton retour) → retour springboard
- [ ] Adapter les apps : Notes en layout 1 colonne avec navigation, projets iframe en plein écran
- [ ] Pas de Finder ni de Corbeille en mode iOS
- [ ] Tablette : springboard iOS avec grille plus large (iPadOS)
- [ ] Bonus : écran de verrouillage au chargement (swipe up pour déverrouiller), app switcher

## Phase 7 — Backoffice + Supabase

### Base de données

- [ ] Table `projects` :
  ```sql
  id uuid pk, name text, slug text unique, url text,
  logo_url text, display_mode text check (display_mode in ('iframe','external')),
  description text, tech text[], sort_order int,
  visible boolean default true,
  show_on_desktop boolean default true, show_on_mobile boolean default true,
  default_width int, default_height int,
  created_at timestamptz default now()
  ```
- [ ] RLS : lecture publique (`visible = true`), écriture réservée aux utilisateurs authentifiés
- [ ] Bucket Storage `logos` (public en lecture, upload authentifié)
- [ ] Supabase Auth : email/password, **inscription désactivée** (un seul compte, créé à la main dans le dashboard)

### Backoffice `/admin`

- [ ] Page de login (Supabase Auth) + middleware Next.js qui protège tout `/admin/*`
- [ ] Liste des projets : nom, logo, URL, mode, visibilité, réordonnancement (drag ou flèches ↑↓)
- [ ] Formulaire création/édition : nom, slug, URL, description, technos, **upload du logo** (→ Storage), mode `iframe`/`external`, visibilité desktop/mobile, taille de fenêtre par défaut
- [ ] Suppression avec confirmation (+ suppression du logo dans le Storage)
- [ ] Prévisualisation : vérifier que l'URL accepte l'iframe (test de chargement) → suggérer le mode

### Intégration portfolio

- [ ] Le registre d'apps fusionne apps système (statiques) + projets (Supabase)
- [ ] Fetch côté serveur (Server Component) + revalidation (`revalidatePath` après modif admin, ou ISR)
- [ ] Les projets apparaissent automatiquement : bureau + Finder (desktop), springboard (mobile), dock si épinglé

## Phase 8 — Sous-domaines

- [ ] Vérifier le DNS wildcard `*.elwen.dev` → Vercel
- [ ] Déployer chaque projet (Photoshop, Illustrator, Premiere Pro…) comme projet Vercel séparé, assigner son sous-domaine
- [ ] Sur **chaque projet embarqué**, autoriser l'iframe : header `Content-Security-Policy: frame-ancestors 'self' https://elwen.dev` (et ne PAS envoyer `X-Frame-Options: DENY`)
- [ ] Tester chaque sous-domaine dans une fenêtre du portfolio (desktop + mobile)
- [ ] Documenter la procédure « ajouter un nouveau projet » dans le README (déploiement + entrée backoffice)

## Phase 9 — Polish & mise en ligne

- [ ] SEO : metadata, title/description, image Open Graph (screenshot du bureau), sitemap, favicon
- [ ] ⚠️ Le contenu étant très interactif, prévoir un fallback SEO : contenu textuel des projets rendu côté serveur (visible pour les crawlers, par ex. dans le HTML des fenêtres)
- [ ] Performance : `next/dynamic` pour chaque app (chargée à l'ouverture de la fenêtre), images optimisées (`next/image`), lazy iframes
- [ ] Accessibilité : navigation clavier (Tab entre fenêtres, Échap pour fermer), `prefers-reduced-motion` → désactiver les grosses animations, contrastes
- [ ] Easter eggs : « À propos de ce Mac » avec mes specs perso, sons système, Terminal factice avec commandes (`whoami`, `ls projects`)…
- [ ] Tests cross-browser (Safari est le plus piégeux sur `backdrop-filter` et les iframes) + vrais devices iOS/Android
- [ ] Lighthouse ≥ 90 sur les métriques principales
- [ ] Mise en prod sur `elwen.dev` 🚀

---

## Décisions actées (référence)

| Sujet                     | Décision                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Projets dans le portfolio | Hybride : iframe (sous-domaines maîtrisés) ou lien externe, choisi par projet dans le backoffice |
| Stack                     | Next.js + TypeScript + Tailwind, Framer Motion, Zustand                                          |
| Données / auth / logos    | Supabase (Postgres + Auth + Storage)                                                             |
| Hébergement               | Vercel, domaine `elwen.dev` + wildcard                                                           |
| Desktop vs mobile         | macOS fenêtré sur desktop, iOS plein écran sur mobile/tablette                                   |
| Finder / Corbeille        | Desktop uniquement                                                                               |
