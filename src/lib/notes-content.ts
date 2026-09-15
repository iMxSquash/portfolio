export type NoteFolder = {
  id: string;
  name: string;
};

export type Note = {
  id: string;
  folderId: string;
  title: string;
  date: string;
  preview: string;
  body: string[];
};

/**
 * CV content disguised as Notes.app data — read-only, edited here in the
 * repo (not Supabase-managed, see os-apps skill). Folders mirror a real
 * Notes sidebar; each note's first paragraph doubles as its list preview.
 */
export const NOTE_FOLDERS: NoteFolder[] = [
  { id: "about", name: "À propos" },
  { id: "background", name: "Parcours" },
  { id: "skills", name: "Compétences" },
  { id: "contact", name: "Contact" },
];

export const NOTES: Note[] = [
  {
    id: "about-me",
    folderId: "about",
    title: "À propos de moi",
    date: "10 sept. 2026",
    preview: "Développeur front-end passionné par les interfaces soignées et les détails qui...",
    body: [
      "Développeur front-end passionné par les interfaces soignées et les détails qui font qu'un produit semble vivant plutôt que fonctionnel.",
      "Ce portfolio reproduit macOS et iOS jusque dans leurs petits détails : vibrancy, magnification du dock, traffic lights, springboard. C'est autant une vitrine de mes projets qu'un terrain de jeu technique.",
      "J'aime les stacks modernes (Next.js, TypeScript, Tailwind) et le travail bien fini, du store Zustand jusqu'au dernier pixel d'une ombre de fenêtre.",
    ],
  },
  {
    id: "background-timeline",
    folderId: "background",
    title: "Parcours",
    date: "10 sept. 2026",
    preview: "Quelques étapes clés de mon parcours de développeur...",
    body: [
      "Quelques étapes clés de mon parcours de développeur.",
      "Formation en développement web, avec un intérêt croissant pour le front-end et les interfaces à fort niveau de détail.",
      "Expériences en développement d'applications web modernes, du prototypage à la mise en production.",
      "Une constante : l'envie de comprendre comment les choses sont faites avant de les refaire mieux.",
    ],
  },
  {
    id: "skills-list",
    folderId: "skills",
    title: "Compétences",
    date: "10 sept. 2026",
    preview: "Front-end : React, Next.js (App Router), TypeScript, Tailwind CSS...",
    body: [
      "Front-end : React, Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand.",
      "Back-end / data : Node.js, Supabase (Postgres, Auth, Storage), API REST.",
      "Outils : Git/GitHub, Vercel, Figma.",
      "Sensibilités : accessibilité (WCAG), performance (Core Web Vitals), sécurité applicative (OWASP).",
    ],
  },
  {
    id: "contact-info",
    folderId: "contact",
    title: "Contact",
    date: "10 sept. 2026",
    preview: "Le moyen le plus simple de me joindre reste l'e-mail...",
    body: [
      "Le moyen le plus simple de me joindre reste l'e-mail : coussotelwen@gmail.com",
      "Toujours partant pour discuter d'un projet, d'une opportunité, ou simplement échanger sur du développement front-end.",
    ],
  },
];
