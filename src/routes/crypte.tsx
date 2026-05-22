import { createFileRoute } from "@tanstack/react-router";
import { Crypte } from "@/components/crypte/Crypte";

export const Route = createFileRoute("/crypte")({
  head: () => ({
    meta: [
      { title: "La Crypte — Sanctuaire d'épargne du Royaume" },
      {
        name: "description",
        content:
          "La Crypte, mini-app pixel art fantasy cosy pour protéger vos richesses jusqu'à l'Éveil du Dragon. Suivi d'épargne RPG rétro 16-bit.",
      },
      { property: "og:title", content: "La Crypte — Sanctuaire d'épargne du Royaume" },
      {
        property: "og:description",
        content: "Déposez vos pièces dans la Crypte ancienne. Pixel art fantasy cosy.",
      },
    ],
  }),
  component: Crypte,
});
