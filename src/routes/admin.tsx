import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import brandLogo from "@/assets/sare-soukabe-logo.png";
import { useAuth, useRoles } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace rédaction — Saré Soukabé Info" },
      {
        name: "description",
        content:
          "Espace réservé à la rédaction de Saré Soukabé Info : préparation et gestion des articles de Kolda et du Fouladou.",
      },
      { property: "og:title", content: "Espace rédaction — Saré Soukabé Info" },
      {
        property: "og:description",
        content: "Accès réservé aux journalistes et administrateurs du journal.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const { isStaff, loading: rolesLoading } = useRoles();

  if (loading || rolesLoading) return <AdminSkeleton />;
  if (!user)
    return (
      <AdminNotice
        icon={<Lock className="size-7 text-logo-red" />}
        title="Connexion requise"
        text="L’espace rédaction est réservé à l’équipe du journal. Connectez-vous avec votre compte Saré Soukabé Info pour y accéder."
        action={{ to: "/auth", label: "Se connecter" }}
      />
    );
  if (!isStaff)
    return (
      <AdminNotice
        icon={<Lock className="size-7 text-logo-red" />}
        title="Accès réservé à la rédaction"
        text="Votre compte est actif, mais il ne dispose pas encore des droits de rédaction. Un administrateur peut vous donner le rôle éditeur ou administrateur."
        action={{ to: "/", label: "Retour à l’accueil" }}
      />
    );

  return (
    <AdminNotice
      icon={<PenLine className="size-7 text-logo-red" />}
      title="Espace rédaction en préparation"
      text={`Bonjour${user.email ? ` ${user.email}` : ""}, votre accès administrateur est bien actif. L’interface de publication des articles est en cours de construction : elle arrivera très prochainement.`}
      action={{ to: "/", label: "Retour à l’accueil" }}
    />
  );
}

function AdminNotice({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action: { to: "/auth" | "/"; label: string };
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Retour à l’accueil" className="shrink-0">
            <img
              src={brandLogo}
              alt="Saré Soukabé Infos"
              className="h-auto w-[150px] object-contain sm:w-[190px]"
            />
          </Link>
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-input px-4 text-xs font-bold uppercase text-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-4" /> Retour à l’accueil
          </Link>
        </div>
      </header>
      <main className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 py-12">
        <div className="w-full border-t-4 border-gold bg-secondary p-7 text-secondary-foreground">
          {icon}
          <h1 className="mt-4 text-2xl sm:text-3xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
          <Button asChild className="mt-6">
            <Link to={action.to}>{action.label}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-20">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
