import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/store";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ location }) => {
    if (!useAuth.getState().user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AppLayout,
});
