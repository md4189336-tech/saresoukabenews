import { Link } from "@tanstack/react-router";
import { ArrowRight, Facebook, Youtube } from "lucide-react";

import { SOCIAL_LINKS } from "@/lib/social";
import { cn } from "@/lib/utils";

const ICONS = {
  facebook: Facebook,
  youtube: Youtube,
} as const;

const BADGE = {
  facebook: "bg-social-facebook text-social-facebook-foreground",
  youtube: "bg-social-youtube text-social-youtube-foreground",
} as const;


/** Rangée de boutons icônes (sidebar, page dédiée). */
export function SocialIconLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {SOCIAL_LINKS.map((network) => {
        const Icon = ICONS[network.key];
        return (
          <a
            key={network.key}
            href={network.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${network.name} — s’ouvre dans un nouvel onglet`}
            title={network.name}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              BADGE[network.key],
            )}
          >
            <Icon className="size-5" />
          </a>
        );
      })}
    </div>
  );
}

/** Boutons libellés (bandeau « Suivez-nous »). */
export function SocialButtonLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {SOCIAL_LINKS.map((network) => {
        const Icon = ICONS[network.key];
        return (
          <a
            key={network.key}
            href={network.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${network.name} — s’ouvre dans un nouvel onglet`}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wide transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              BADGE[network.key],
            )}
          >
            <Icon className="size-4" />
            {network.name}
          </a>
        );
      })}
    </div>
  );
}

/** Liste compacte pensée pour le pied de page (fond vert profond). */
export function SocialFooterLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {SOCIAL_LINKS.map((network) => {
        const Icon = ICONS[network.key];
        return (
          <li key={network.key}>
            <a
              href={network.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${network.name} — s’ouvre dans un nouvel onglet`}
              className="group inline-flex items-center gap-3 text-sm font-semibold text-primary-foreground/85 transition-colors hover:text-gold"
            >
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                  BADGE[network.key],
                )}
              >
                <Icon className="size-4" />
              </span>
              {network.name}
              <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Cartes détaillées (page « Nos réseaux sociaux »). */
export function SocialCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2", className)}>
      {SOCIAL_LINKS.map((network) => {
        const Icon = ICONS[network.key];
        return (
          <a
            key={network.key}
            href={network.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${network.name} — s’ouvre dans un nouvel onglet`}
            className="group flex items-start gap-4 border border-border bg-card p-6 text-card-foreground transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <span
              className={cn(
                "inline-flex size-12 shrink-0 items-center justify-center rounded-full",
                BADGE[network.key],
              )}
            >
              <Icon className="size-6" />
            </span>
            <span className="min-w-0">
              <span className="kicker block text-terracotta">{network.name}</span>
              <span className="mt-1 block font-display text-xl font-bold">{network.handle}</span>
              <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                {network.description}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase text-primary">
                Ouvrir la page
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

/** Bandeau « Suivez-nous » placé avant le pied de page de l’accueil. */
export function SocialSection({ className }: { className?: string }) {
  return (
    <section className={cn("border-t border-border bg-secondary", className)}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
        <div>
          <p className="kicker text-terracotta">Saré Soukabé TV</p>
          <h2 className="mt-2 text-2xl sm:text-3xl">Suivez-nous sur nos réseaux sociaux</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Chaque jour, l’actualité de Kolda et du Fouladou en photos sur Facebook et en vidéos
            sur YouTube. Rejoignez la communauté pour ne rien manquer.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <SocialButtonLinks />
          <Link
            to="/reseaux-sociaux"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase text-primary hover:underline"
          >
            Voir toutes nos pages <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
