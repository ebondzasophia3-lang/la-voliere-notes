import { createFileRoute } from "@tanstack/react-router";
import { Voliere } from "@/components/voliere/Voliere";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Volière — Registre des Attentions du Royaume" },
      {
        name: "description",
        content:
          "La Volière, un registre vivant pixel art fantasy cosy pour conserver idées cadeaux, attentions, anniversaires et grandes joies du royaume.",
      },
      { property: "og:title", content: "La Volière — Registre des Attentions du Royaume" },
      {
        property: "og:description",
        content: "Un lieu chaleureux pour préparer avec patience les joies à venir.",
      },
    ],
  }),
  component: Voliere,
});
