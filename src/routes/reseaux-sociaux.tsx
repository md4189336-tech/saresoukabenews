import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone } from "lucide-react";

import brandLogo from "@/assets/sare-soukabe-logo.png";
import { SocialCards, SocialIconLinks } from "@/components/social-links";

export const Route = createFileRoute("/reseaux-sociaux")({
  head: () => ({
    meta: [
      { title: "Nos réseaux sociaux — Saré Soukabé Info" },
      {
        name: "description",
        content:
          "Suivez Saré Soukabé Info sur Facebook et Saré Soukabé TV sur YouTube : l’actualité de Kolda et du Fouladou en photos et en vidéos.",
      },
      { property: "og:title", content: "Nos réseaux sociaux — Saré Soukabé Info" },
      {
        property: "og:description",
        content:
          "Facebook et YouTube officiels de Saré Soukabé Info : reportages, interviews et actualités de Kolda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SocialNetworksPage,
});

function SocialNetworksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
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

      <main>
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <p className="kicker text-terracotta">Communauté</p>
            <h1 className="mt-2 text-4xl sm:text-5xl">Nos réseaux sociaux</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Saré Soukabé Info publie chaque jour l’actualité de Kolda et du Fouladou. Les photos
              et les annonces se partagent sur Facebook, les reportages et les interviews se
              regardent sur la chaîne YouTube de Saré Soukabé TV.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h2 className="text-2xl sm:text-3xl">Suivez-nous</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Les liens s’ouvrent dans un nouvel onglet.
          </p>
          <SocialCards className="mt-7" />
        </section>

        <section className="border-t border-border bg-primary-deep text-primary-foreground">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
            <div>
              <p className="kicker text-gold">Restez connectés</p>
              <h2 className="mt-2 text-2xl">Abonnez-vous à nos pages</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 opacity-80">
                Une question, une information à transmettre à la rédaction ? Écrivez-nous ou
                passez nous voir à Kolda.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold">
                <a
                  href="tel:+221770106859"
                  className="inline-flex items-center gap-2 transition-colors hover:text-gold"
                >
                  <Phone className="size-4 text-logo-red" /> 77 010 68 59
                </a>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-logo-red" /> KOLDA SIKILO ZONE LYCÉE
                </span>
              </div>
            </div>
            <SocialIconLinks />
          </div>
        </section>
      </main>

      <footer className="border-t border-primary-foreground/15 bg-primary-deep px-4 py-4 text-center text-[11px] text-primary-foreground/60">
        © {new Date().getFullYear()} Saré Soukabé Info · Tous droits réservés
      </footer>
    </div>
  );
}
