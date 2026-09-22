import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/seo";

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
];

export const NOTES: Note[] = [
  {
    id: "about-me",
    folderId: "about",
    title: "À propos de moi",
    date: "22 sept. 2026",
    preview:
      "Elwen Coussot, développeur full-stack basé à Herblay, en Île-de-France. Actuellement en...",
    body: [
      "Elwen Coussot, développeur full-stack basé à Herblay, en Île-de-France. Actuellement en alternance chez SP Formation, en Mastère « Tech Lead, IA & Cybersécurité » à Digital Campus Paris.",
      "Sur GitHub depuis fin 2023, avec une vingtaine de projets, du fact-checking à la mobilité urbaine. Auteur de Liquid Glass Tailwind, un utilitaire open source qui reproduit l'effet Liquid Glass d'iOS 26 en Tailwind CSS.",
      "Curieux par nature : j'aime comprendre comment les choses fonctionnent, une interface comme une API ou l'architecture d'une base de données, avant de les refaire mieux.",
      "Ce portfolio reproduit macOS et iOS jusque dans leurs petits détails : vibrancy, magnification du dock, traffic lights, springboard. C'est autant une vitrine de mes projets qu'un terrain de jeu technique.",
    ],
  },
  {
    id: "contact-info",
    folderId: "about",
    title: "Contact",
    date: "10 sept. 2026",
    preview: "Le moyen le plus simple de me joindre reste l'e-mail...",
    body: [
      `Le moyen le plus simple de me joindre reste l'e-mail : ${CONTACT_EMAIL}`,
      `On peut aussi me retrouver sur ${SOCIAL_LINKS.map((link) => `${link.label} (${link.href})`).join(" et ")}.`,
      "Toujours partant pour discuter d'un projet ou d'une opportunité.",
    ],
  },
  {
    id: "background-timeline",
    folderId: "background",
    title: "Parcours",
    date: "22 sept. 2026",
    preview:
      "Spécialité NSI (Numérique et Sciences Informatique) au lycée, avant de rejoindre Digital...",
    body: [
      "Spécialité NSI (Numérique et Sciences Informatique) au lycée, avant de rejoindre Digital Campus Paris pour un Bachelor Développement Web axé full-stack : data, API et architecture, autant que l'interface.",
      "En alternance chez SP Formation depuis le Bachelor, dans le cadre du titre RNCP « Concepteur Développeur de Solutions Digitales » (niveau 6) : la pratique en entreprise en parallèle des cours.",
      "Conception et développement de detailing.fr (https://detailing.fr) de A à Z depuis le début de l'alternance : un CMS qui génère les sites des professionnels certifiés du detailing automobile (polissage, protection céramique, PPF), tous réunis dans un annuaire.",
      "Autre mission : la base technique d'un connecteur entre ActiveCampaign (CRM) et Digiforma (gestion d'organisme de formation), avec clients HTTP, retry/throttle, logs, et une première synchronisation bidirectionnelle des contacts.",
      "Poursuite en Mastère « Tech Lead, IA & Cybersécurité » à Digital Campus Paris (M1), toujours en alternance chez SP Formation.",
      "Actif sur GitHub depuis fin 2024, avec une bonne vingtaine de dépôts entre projets d'école, side-projects et code open source.",
      "Une constante : l'envie de comprendre comment les choses sont faites avant de les refaire mieux.",
    ],
  },
  {
    id: "projects-showcase",
    folderId: "background",
    title: "Projets",
    date: "22 sept. 2026",
    preview: "Au-delà de ce portfolio et des apps Adobe (Photoshop, Illustrator, Premiere Pro),...",
    body: [
      "Au-delà de ce portfolio et des apps Adobe (Photoshop, Illustrator, Premiere Pro), quelques projets menés à Digital Campus Paris et à côté.",
      "UrbanFlow (https://urbanflow.elwen.dev) : PWA de mobilité urbaine multimodale pour Nantes Métropole, avec itinéraires éco-responsables, scoring multicritères et gamification.",
      "Glide (https://glide.elwen.dev) : contrôle du PC (Windows/macOS) depuis son téléphone comme trackpad, en WebRTC peer-to-peer sur le réseau local, sans serveur intermédiaire.",
      "Zenko (https://zenkoo.vercel.app) : PWA qui réunit parents, éducateurs et spécialistes autour du soutien aux enfants neuroatypiques, avec bibliothèque de guides, forum en temps réel et assistant vocal IA basé sur la base de connaissances de la plateforme.",
      "Vera (https://vera-g6.vercel.app) : application de vérification des faits (fact-checking), développée en monorepo Nx avec plusieurs projets front-end et back-end.",
    ],
  },
  {
    id: "skills-list",
    folderId: "skills",
    title: "Compétences",
    date: "22 sept. 2026",
    preview: "Front-end : React, Next.js (App Router), TypeScript, Tailwind CSS...",
    body: [
      "Front-end : React, Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand, Vite.",
      "Back-end / data : Node.js, Python (Django), PHP (Symfony, WordPress), Supabase (Postgres, Auth, Storage, Edge Functions), API REST, WebRTC.",
      "Mobile & PWA : React Native, Flutter, Progressive Web Apps installables et offline-first.",
      "IA : LangChain, modélisation et stratégie IA (au cœur de mon Mastère « Tech Lead, IA & Cybersécurité »).",
      "Développement assisté par IA : Claude Code au quotidien, avec skills et hooks personnalisés, sub-agents et automatisations sur-mesure.",
      "DevOps / cloud : Docker, sensibilisation multi-cloud (AWS, Azure, GCP).",
      "Domotique (passion) : un NAS en mini-serveur, avec Home Assistant et Zigbee2MQTT en Docker, pour automatiser la maison.",
      "Outils & qualité : Git/GitHub, ESLint, Vercel, Figma, tests et qualité logicielle.",
      "Sensibilités : accessibilité (WCAG), performance (Core Web Vitals), sécurité applicative (OWASP), en lien direct avec le volet cybersécurité de mon Mastère.",
    ],
  },
];
