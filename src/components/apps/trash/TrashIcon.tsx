"use client";

import Image from "next/image";
import { useTrashStore } from "@/stores/useTrashStore";

/**
 * Reflects `useTrashStore` live: the empty wastebasket render, swapped for
 * the crumpled-paper render as soon as the trash actually has content.
 */
export function TrashIcon() {
  const isEmpty = useTrashStore((state) => state.items.length === 0);

  return (
    <Image
      src={isEmpty ? "/img/icons/trash-empty.png" : "/img/icons/trash-full.png"}
      alt=""
      fill
      sizes="80px"
      className="object-contain"
      draggable={false}
    />
  );
}
