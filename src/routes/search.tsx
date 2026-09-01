import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: String(search["q"] ?? "") }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/shop",
      search: { q: search.q, category: "", department: "", view: "", store: "" },
    });
  },
});
