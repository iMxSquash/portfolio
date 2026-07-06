# Portfolio v2 — elwen.dev

Portfolio d'Elwen qui reproduit **macOS sur desktop** et **iOS sur mobile/tablette**. Les apps système (Notes, Finder, Corbeille) sont des composants ; les projets (Photoshop, Illustrator, Premiere Pro, etc.) tournent en **iframe via des sous-domaines** (`photoshop.elwen.dev`) ou en lien externe, gérés depuis un backoffice.

## Roadmaps

- `TODO.md` — l'OS (portfolio lui-même), en phases avec cases à cocher. **Cocher les cases au fur et à mesure.**
- `TODO-adobe-apps.md` — les apps Photoshop/Illustrator/Premiere Pro (repo séparé `adobe-apps`, 1 app Next.js multi-sous-domaines)

## Stack (décisions actées — ne pas rediscuter)

- **Next.js (App Router) + TypeScript + Tailwind** — portfolio, backoffice `/admin` et API dans un seul projet
- **Zustand** — window manager ; **Framer Motion** — animations
- **Supabase** — Postgres (table `projects`), Auth (protection admin, un seul compte), Storage (logos)
- **Vercel** — domaine `elwen.dev` + wildcard `*.elwen.dev`
- Projets dans les fenêtres : mode **hybride** — `iframe` (sous-domaines maîtrisés) ou `external` (nouvel onglet), choisi par projet dans le backoffice (`display_mode`)

## Architecture — points non négociables

- **Registre central des apps** (`src/lib/apps.ts`) : tout ce qui s'ouvre (app système, projet iframe, lien externe) y est déclaré. Bureau, dock, Finder et springboard iOS ne font que le lire — aucune liste d'apps dupliquée.
- **Une seule source de vérité pour les fenêtres** : le store Zustand `useWindowStore`. Jamais de position/taille de fenêtre en state local.
- **Jamais d'écriture dans le store pendant un drag/resize** (motion values pendant le geste, commit au `pointerup`).
- Desktop → mode macOS fenêtré ; mobile/tablette → mode iOS plein écran (détection `pointer: coarse` + largeur, pas la largeur seule). Finder et Corbeille : desktop uniquement.
- Apps chargées en `next/dynamic` à la première ouverture ; fenêtres minimisées restent montées.

## Skills — à utiliser systématiquement

**Skills projet** (`.claude/skills/`) — les charger AVANT de coder la partie concernée :

| Skill               | Quand                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `os-window-manager` | Tout travail sur les fenêtres : store, drag, resize, focus/z-index, minimize, animations                         |
| `os-macos-ui`       | Menu bar, dock, bureau, traffic lights, vibrancy — mesures et couleurs exactes                                   |
| `os-ios-ui`         | Mode mobile/tablette : springboard, status bar, gestes, safe areas                                               |
| `os-apps`           | Créer/modifier une app, brancher les projets Supabase, fenêtres iframe                                           |
| `check-security`    | Audit sécurité : avant un merge, après tout travail sur l'admin/auth/Supabase/uploads, avant chaque mise en prod |

**Skills utilisateur** (`~/.claude/skills/`, valables sur tous les repos) :

| Skill                   | Quand                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `portfolio-embed-check` | Dans le repo d'un projet à embarquer (photoshop.elwen.dev…) : valider headers, responsive fenêtre, cookies, avant de l'ajouter au backoffice |
| `seo-geo-boost`         | Avant toute mise en prod, et pour tout travail SEO/metadata/JSON-LD/llms.txt — sur le portfolio ET sur chaque sous-domaine                   |

## Rappels pièges (détails dans les skills)

- Les iframes capturent la souris pendant un drag → `pointer-events: none` sur le contenu des fenêtres pendant l'interaction
- SF Pro non redistribuable → `-apple-system, BlinkMacSystemFont, 'Inter'`
- Safari : `backdrop-filter` préfixé, pas de vibrancy imbriquée ; mobile : `100dvh`, safe areas
- Le contenu en iframe est crédité au sous-domaine, pas au portfolio → SEO complet sur chaque sous-domaine + vrais liens `<a href>` crawlables côté portfolio

## Conventions

- Code et commits en français côté contenu, nommage code en anglais
- Fidélité macOS/iOS avant tout : en cas de doute sur un détail d'UI, vérifier sur une capture du vrai macOS plutôt qu'inventer
- Contenu éditorial (notes du CV, contenu corbeille) : dans le repo (TS/MDX) ; contenu géré (projets) : Supabase uniquement

## Git

- Branche principale : `main`
- Feature branches : `feat/nom-feature`
- Fix branches : `fix/nom-bug`
- Commits conventionnels : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- PR obligatoire vers main (même en solo, pour l'historique)
- **Pas de `Co-Authored-By` dans les messages de commit** — ne jamais ajouter de trailer Claude/AI
- Un commit = un changement logique cohérent (pas de "fix stuff" fourre-tout)
- Description en anglais, impératif, < 72 caractères
