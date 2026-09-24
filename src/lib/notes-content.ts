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
  { id: "legal", name: "Légal" },
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
  {
    id: "legal-notice",
    folderId: "legal",
    title: "Mentions légales",
    date: "24 sept. 2026",
    preview: "Ce site est un portfolio personnel, sans but commercial, édité par Elwen Coussot...",
    body: [
      "Ce site est un portfolio personnel, sans but commercial, édité par Elwen Coussot, personne physique, domicilié en France (Herblay, Île-de-France).",
      `Éditeur et directeur de la publication : Elwen Coussot. Contact : ${CONTACT_EMAIL}`,
      "Conformément à l'article 6, III, 2 de la loi n° 2004-575 du 21 juin 2004 (LCEN), l'éditeur étant un particulier, ses coordonnées personnelles sont communiquées à l'hébergeur, qui peut les transmettre sur réquisition de l'autorité judiciaire.",
      "Hébergeur du site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (https://vercel.com).",
      "Base de données et stockage des logos de projets : Supabase, région Europe (Paris). Aucune donnée de visiteur n'y est enregistrée.",
      "Les projets présentés dans les fenêtres ou via des liens sont hébergés sur leurs propres sous-domaines (elwen.dev) ou sur des sites tiers. Leur contenu relève de leurs éditeurs respectifs, l'éditeur de ce site n'en est pas responsable pour les sites tiers.",
      "Propriété intellectuelle, marques et crédits : voir la note « Propriété intellectuelle et crédits ». Le droit français est applicable au présent site.",
      "Dernière mise à jour : 24 septembre 2026.",
    ],
  },
  {
    id: "legal-privacy",
    folderId: "legal",
    title: "Politique de confidentialité",
    date: "24 sept. 2026",
    preview:
      "Ce site ne demande aucun compte, n'a aucun formulaire et n'affiche aucune publicité...",
    body: [
      "Ce site ne demande aucun compte, n'a aucun formulaire et n'affiche aucune publicité. Aucune donnée n'est vendue ni cédée à des tiers, et aucun cookie de suivi n'est déposé.",
      `Responsable du traitement : Elwen Coussot, ${CONTACT_EMAIL}`,
      "Mesure d'audience (Vercel Web Analytics) : pour connaître la fréquentation du site, sont enregistrés la page consultée, le site référent, le pays et la région, le système d'exploitation, le navigateur et le type d'appareil. Les visiteurs sont distingués par un identifiant calculé à partir de la requête, qui n'est pas conservé au-delà de 24 heures. Ni cookie, ni adresse IP associée aux statistiques, ni suivi entre sites. Base légale : intérêt légitime (article 6.1.f du RGPD) à mesurer l'audience de son portfolio.",
      "Mesure des performances (Vercel Speed Insights) : temps de chargement des pages (Core Web Vitals), avec la page, la vitesse de connexion, le navigateur, l'appareil, le système et le pays. Ces mesures sont anonymes et ne permettent ni de suivre une navigation ni d'identifier une personne. Base légale : intérêt légitime à maintenir un site rapide.",
      "Journaux techniques : l'hébergeur (Vercel) traite l'adresse IP des visiteurs dans les journaux de connexion nécessaires à la diffusion et à la sécurité du site. Ils ne sont pas exploités par l'éditeur.",
      `Courriels : si vous écrivez à ${CONTACT_EMAIL}, votre adresse et votre message ne servent qu'à vous répondre. Ils sont conservés le temps de l'échange, puis au plus 3 ans après le dernier message.`,
      "Espace d'administration : réservé à l'éditeur (un seul compte). Il utilise un cookie de session strictement nécessaire à la connexion. Aucun visiteur n'est concerné.",
      "Transferts hors Union européenne : Vercel Inc. est établie aux États-Unis. Ces transferts sont encadrés par les garanties prévues au chapitre V du RGPD (Data Privacy Framework ou clauses contractuelles types).",
      `Vos droits : accès, rectification, effacement, opposition, limitation et portabilité, en écrivant à ${CONTACT_EMAIL}. Vous pouvez aussi introduire une réclamation auprès de la CNIL (https://www.cnil.fr).`,
      "Les projets présentés sur d'autres sous-domaines ou sites tiers ont leur propre politique de confidentialité.",
      "Dernière mise à jour : 24 septembre 2026.",
    ],
  },
  {
    id: "legal-storage",
    folderId: "legal",
    title: "Cookies et stockage local",
    date: "24 sept. 2026",
    preview:
      "Ce site ne dépose aucun cookie sur les visiteurs et n'affiche donc pas de bannière...",
    body: [
      "Ce site ne dépose aucun cookie sur les visiteurs et n'affiche donc pas de bannière de consentement. Il utilise uniquement le stockage local de votre navigateur pour retenir vos réglages.",
      "Ce qui est mémorisé : le thème clair ou sombre, les réglages de « Réglages Système » (apparence, accessibilité, Dock, son), le fond d'écran choisi, la position et la taille des fenêtres, et le fait que l'écran de démarrage a déjà été joué pendant la session.",
      "Ces données restent dans votre navigateur (localStorage et sessionStorage), ne sont jamais envoyées à un serveur et ne servent pas au suivi. Elles sont strictement nécessaires au fonctionnement demandé par le visiteur, ce qui les exempte de consentement (article 82 de la loi Informatique et Libertés).",
      "Pour les supprimer : vider les données du site elwen.dev dans les réglages de votre navigateur.",
      "La mesure d'audience et de performance fonctionne sans cookie ni identifiant persistant (voir « Politique de confidentialité »).",
      "Seule exception, l'espace d'administration réservé à l'éditeur : un cookie de session de connexion, sans lien avec les visiteurs.",
    ],
  },
  {
    id: "legal-credits",
    folderId: "legal",
    title: "Propriété intellectuelle et crédits",
    date: "24 sept. 2026",
    preview: "Ce portfolio est une création indépendante, non affiliée à Apple ni à Adobe...",
    body: [
      "Ce portfolio est une création indépendante, non affiliée à Apple ni à Adobe, et non approuvée par ces sociétés. Il reproduit l'apparence de macOS et d'iOS comme démonstration technique.",
      "Apple, macOS, iOS, Finder et Notes sont des marques d'Apple Inc. Adobe, Photoshop, Illustrator et Premiere Pro sont des marques d'Adobe Inc. Les projets portant ces noms ici sont des réalisations personnelles sans lien avec ces sociétés.",
      "Les textes, la présentation et les réalisations de ce portfolio sont la propriété d'Elwen Coussot. Toute reproduction ou réutilisation sans autorisation écrite est interdite, hors citation courte avec mention de la source.",
      "Logos des projets tiers, captures et noms de marques cités : propriété de leurs détenteurs respectifs.",
      "Composants open source : Next.js et React (licence MIT), Tailwind CSS (MIT), Framer Motion (MIT), Zustand (MIT), Tabler Icons (MIT), React Icons (MIT, avec les licences propres à chaque jeu d'icônes) et quick-liquid (MIT). Police Inter, servie depuis ce site (SIL Open Font License 1.1).",
      `Une question sur un contenu, ou un contenu à retirer ? Écrivez à ${CONTACT_EMAIL}`,
    ],
  },
];
