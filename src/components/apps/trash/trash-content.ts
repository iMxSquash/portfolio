export type TrashItem = {
  id: string;
  name: string;
  kind: string;
};

/** Static fun content — a fake pile of "past attempts", per os-apps skill. */
export const INITIAL_TRASH_ITEMS: TrashItem[] = [
  { id: "v1-zip", name: "portfolio-v1-final-FINAL.zip", kind: "Archive ZIP" },
  { id: "old-cv", name: "cv-elwen-2019-a-ne-plus-jamais-ouvrir.docx", kind: "Document Word" },
  { id: "logo-attempt", name: "logo-essai-3-vraiment-le-bon-cette-fois.png", kind: "Image PNG" },
  { id: "todo-never", name: "todo-a-faire-un-jour-peut-etre.txt", kind: "Document texte" },
  { id: "weird-bug", name: "capture-bug-inexplicable-3h-du-matin.png", kind: "Image PNG" },
  { id: "css-hell", name: "flexbox-ca-marche-plus-pourquoi.css", kind: "Feuille de style" },
];
