---
name: os-apps
description: Registre des apps et conventions pour créer une app du portfolio (Notes, Finder, Corbeille, apps projets iframe/external). À utiliser pour ajouter ou modifier une app, brancher les projets Supabase dans l'OS, ou travailler sur les fenêtres iframe.
---

# Apps du portfolio — registre et conventions

Tout ce qui s'ouvre (app système, projet iframe, lien externe) passe par le **registre central** `src/lib/apps.ts`. Le bureau, le dock, le Finder et le springboard iOS ne font que lire ce registre — aucune liste d'apps dupliquée ailleurs.

## Le registre

```ts
type AppDefinition = {
  id: string; // slug unique, ex. 'notes', 'photoshop'
  name: string;
  icon: ComponentType | string; // composant SVG (apps système) ou logo_url (projets Supabase)
  type: "component" | "iframe" | "external";
  component?: ComponentType; // si type 'component' — TOUJOURS via next/dynamic
  url?: string; // si 'iframe' (sous-domaine) ou 'external'
  showOnDesktop: boolean;
  showOnMobile: boolean;
  pinnedToDock?: boolean;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  menus?: MenuDefinition[]; // menus affichés dans la menu bar quand l'app a le focus
};
```

- **Apps système** (Notes, Finder, Corbeille, réglages…) : déclarées en dur dans `apps.ts`.
- **Apps projets** : lignes de la table `projects` Supabase, mappées vers des `AppDefinition` (`display_mode` → `type`, `logo_url` → `icon`, `default_width/height` → `defaultSize`). La fusion statique + Supabase se fait côté serveur et descend en props — pas de fetch client au boot.
- Après modification dans le backoffice : `revalidatePath('/')` pour que l'OS reflète la base.

## Créer une nouvelle app système — checklist

1. Composant dans `src/components/apps/<nom>/` — il reçoit sa fenêtre comme conteneur, ne gère **ni** position **ni** taille (c'est le job du window manager).
2. Import via `next/dynamic` dans le registre (le code de l'app n'est chargé qu'à la première ouverture).
3. Renseigner `defaultSize`, `minSize`, `showOnDesktop/Mobile`, `menus`.
4. Icône : composant `AppIcon` SVG (voir skill os-macos-ui pour le style).
5. Vérifier le rendu dans les deux modes si `showOnMobile: true` (layout fenêtre ET plein écran).

## Apps `iframe` (projets sur sous-domaines)

Composant unique `<IframeWindow url>` pour tous les projets iframe :

- `<iframe loading="lazy">` + skeleton pendant le chargement (basculer sur `onLoad`).
- **Détection d'échec** : `onLoad` ne se déclenche pas toujours en cas de blocage `X-Frame-Options` (souvent l'iframe "charge" une page d'erreur). Poser un timeout (~8s) et surtout offrir en permanence le bouton « Ouvrir dans un nouvel onglet » dans la barre de titre.
- `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"` par défaut.
- ⚠️ Rappel window manager : pendant drag/resize, l'iframe doit passer en `pointer-events: none` (voir skill os-window-manager).
- Ne **pas** démonter l'iframe au minimize (l'état du projet embarqué serait perdu).
- Côté projet embarqué : header `Content-Security-Policy: frame-ancestors 'self' https://elwen.dev` requis, et ne pas envoyer `X-Frame-Options: DENY`.

## Apps `external`

- Pas de fenêtre : clic/tap sur l'icône → `window.open(url, '_blank', 'noopener')`.
- Feedback visuel quand même (bounce de l'icône dans le dock façon lancement macOS) pour ne pas donner l'impression d'un clic mort.

## Conventions des apps système

- **Notes** : 3 colonnes en desktop (dossiers / liste / éditeur), 1 colonne empilée en mobile. Contenu = CV/à-propos, stocké en constantes TS ou MDX dans le repo (pas en base — ce n'est pas du contenu géré par le backoffice).
- **Finder** : lit les projets du registre et les présente en arborescence virtuelle (`Projets/`, `Applications/`…). Double-clic sur un projet → `openWindow(projectId)`. Desktop uniquement.
- **Corbeille** : réutilise le layout Finder. Contenu fun statique. Icône dock pleine/vide selon l'état.
- Les apps sont **résilientes à la petite taille** : elles doivent rester utilisables à leur `minSize` (tester en resize).
