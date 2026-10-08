import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CloudSun,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Moon,
  Phone,
  Search,
  Sun,
  X,
  Youtube,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import brandLogo from "@/assets/sare-soukabe-logo.png";
import { supabase } from "@/integrations/supabase/client";
import {
  type Article,
  coverImage,
  fetchBreaking,
  fetchFeatured,
  fetchLatest,
  fetchMostRead,
  formatDate,
  readTime,
  sectionName,
  SECTIONS,
} from "@/lib/news";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saré Soukabé Info — Actualités de Kolda" },
      {
        name: "description",
        content: "Toute l’actualité de Kolda et du Fouladou : politique, culture, sport, santé et économie.",
      },
      { property: "og:title", content: "Saré Soukabé Info — La voix du Fouladou" },
      {
        property: "og:description",
        content: "L’information locale de Kolda, vérifiée et racontée au plus près du terrain.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const homeQuery = {
  queryKey: ["home-news"],
  queryFn: async () => {
    const [latest, featured, breaking, mostRead] = await Promise.all([
      fetchLatest(24),
      fetchFeatured(),
      fetchBreaking(),
      fetchMostRead(),
    ]);
    return { latest, featured, breaking, mostRead };
  },
  staleTime: 60_000,
};

function HomePage() {
  const news = useQuery(homeQuery);
  const [activeSection, setActiveSection] = useState("accueil");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const visibleArticles = useMemo(() => {
    const articles = news.data?.latest ?? [];
    const bySection =
      activeSection === "accueil"
        ? articles
        : articles.filter((article) => article.categories?.slug === activeSection);
    const term = searchTerm.trim().toLocaleLowerCase("fr");
    if (!term) return bySection;
    return bySection.filter((article) =>
      `${article.title} ${article.excerpt ?? ""}`.toLocaleLowerCase("fr").includes(term),
    );
  }, [activeSection, news.data?.latest, searchTerm]);

  const featured = news.data?.featured.length ? news.data.featured : news.data?.latest.slice(0, 5);
  const lead = featured?.[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        breaking={news.data?.breaking ?? []}
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setMenuOpen(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <main>
        {news.isLoading ? (
          <HomeSkeleton />
        ) : news.isError ? (
          <ErrorState retry={() => news.refetch()} />
        ) : activeSection !== "accueil" || searchTerm.trim() ? (
          <FilteredNews
            articles={visibleArticles}
            title={searchTerm.trim() ? `Résultats pour « ${searchTerm.trim()} »` : sectionName(activeSection)}
            clear={() => {
              setSearchTerm("");
              setActiveSection("accueil");
            }}
          />
        ) : lead ? (
          <>
            <LeadSection lead={lead} secondary={featured?.slice(1, 5) ?? []} />
            <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-16">
              <div className="space-y-16">
                {SECTIONS.map((section) => {
                  const articles = (news.data?.latest ?? []).filter(
                    (article) => article.categories?.slug === section.slug,
                  );
                  return articles.length ? (
                    <CategoryBlock
                      key={section.slug}
                      name={section.name}
                      articles={articles.slice(0, 4)}
                      onMore={() => setActiveSection(section.slug)}
                    />
                  ) : null;
                })}
              </div>
              <Sidebar articles={news.data?.mostRead ?? []} />
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>
      <Footer onSectionChange={setActiveSection} />
    </div>
  );
}

type HeaderProps = {
  breaking: Array<{ title: string; slug: string; is_breaking: boolean; created_at: string }>;
  activeSection: string;
  onSectionChange: (slug: string) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

function SiteHeader(props: HeaderProps) {
  const { theme, toggle } = useTheme();
  const date = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const headlines = props.breaking.length
    ? props.breaking
    : [{ title: "Bienvenue sur Saré Soukabé Info", slug: "bienvenue", is_breaking: false, created_at: "" }];

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="hidden text-xs text-muted-foreground lg:block">
          <p className="capitalize">{date}</p>
          <p className="mt-1 font-semibold text-primary">Kolda · Sénégal</p>
        </div>
        <Button
          variant="ghost"
          type="button"
          onClick={() => props.onSectionChange("accueil")}
          className="col-start-2 h-auto min-w-0 rounded-none p-0 hover:bg-transparent"
          aria-label="Retour à l’accueil"
        >
          <img
            src={brandLogo}
            alt="Saré Soukabé Infos"
            className="h-auto w-[190px] object-contain sm:w-[240px] lg:w-[275px]"
          />
        </Button>
        <div className="col-start-3 flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => props.setSearchOpen(!props.searchOpen)}
            aria-label="Rechercher"
          >
            {props.searchOpen ? <X /> : <Search />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Changer de thème">
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => props.setMenuOpen(!props.menuOpen)}
            aria-label="Ouvrir le menu"
          >
            {props.menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <nav className={cn("bg-primary-deep text-primary-foreground", props.menuOpen ? "block" : "hidden lg:block")}>
        <div className="mx-auto flex max-w-7xl flex-col px-4 lg:flex-row lg:items-center lg:justify-center lg:px-8">
          <NavButton
            active={props.activeSection === "accueil"}
            label="Accueil"
            onClick={() => props.onSectionChange("accueil")}
          />
          {SECTIONS.map((section) => (
            <NavButton
              key={section.slug}
              active={props.activeSection === section.slug}
              label={section.name}
              onClick={() => props.onSectionChange(section.slug)}
            />
          ))}
        </div>
      </nav>

      <div className="bg-secondary text-secondary-foreground">
        <div className="mx-auto flex h-10 max-w-7xl items-stretch overflow-hidden px-4 sm:px-6 lg:px-8">
          <span className="relative z-10 -ml-4 flex shrink-0 items-center bg-logo-red px-4 text-[11px] font-bold uppercase text-logo-red-foreground">
            Flash info
          </span>
          <div className="min-w-0 flex-1 overflow-hidden pl-4">
            <div className="animate-news-reel">
              {[...headlines, ...headlines].map((item, index) => (
                <span key={`${item.slug}-${index}`} className="flex h-10 items-center gap-3 truncate text-xs font-semibold">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> {item.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {props.searchOpen && (
        <div className="border-t border-border bg-muted/45 px-4 py-3">
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={props.searchTerm}
              onChange={(event) => props.setSearchTerm(event.target.value)}
              placeholder="Rechercher un sujet, un lieu, une actualité…"
              className="h-11 bg-background pl-10"
            />
          </div>
        </div>
      )}
    </header>
  );
}

function NavButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-11 justify-start rounded-none border-b-2 border-transparent px-5 text-xs font-bold uppercase text-primary-foreground hover:bg-primary hover:text-primary-foreground lg:justify-center",
        active && "border-gold bg-primary text-gold",
      )}
    >
      {label}
    </Button>
  );
}

function LeadSection({ lead, secondary }: { lead: Article; secondary: Article[] }) {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <SectionHeading eyebrow="L’essentiel" title="À la une" />
        <div className="mt-7 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <article className="group relative min-h-[430px] overflow-hidden bg-primary-deep sm:min-h-[520px]">
            <img
              src={coverImage(lead)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground sm:p-9">
              <ArticleMeta article={lead} inverse />
              <h1 className="mt-3 max-w-3xl text-3xl leading-[1.08] sm:text-5xl">{lead.title}</h1>
              {lead.excerpt && <p className="mt-4 max-w-2xl text-sm leading-6 opacity-85 sm:text-base">{lead.excerpt}</p>}
            </div>
          </article>
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-1">
            {secondary.slice(0, 3).map((article, index) => (
              <article key={article.id} className="group grid grid-cols-[116px_1fr] gap-4 bg-background py-4 sm:grid-cols-1 lg:grid-cols-[135px_1fr] lg:px-4">
                <img
                  src={coverImage(article)}
                  alt=""
                  loading="lazy"
                  className="h-24 w-full object-cover sm:h-36 lg:h-28"
                />
                <div>
                  <span className="kicker text-terracotta">{sectionName(article.categories?.slug)}</span>
                  <h2 className="mt-2 text-lg leading-snug transition-colors group-hover:text-primary lg:text-xl">{article.title}</h2>
                  <p className="mt-2 hidden text-xs text-muted-foreground lg:block">{readTime(article.content)} min de lecture</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryBlock({ name, articles, onMore }: { name: string; articles: Article[]; onMore: () => void }) {
  const [first, ...rest] = articles;
  if (!first) return null;
  return (
    <section>
      <div className="flex items-end justify-between border-b-2 border-foreground pb-3">
        <h2 className="text-2xl sm:text-3xl">{name}</h2>
        <Button variant="ghost" size="sm" onClick={onMore} className="text-xs font-bold uppercase text-primary">
          Tout voir <ArrowRight />
        </Button>
      </div>
      <div className="mt-6 grid gap-7 md:grid-cols-2">
        <article className="group">
          <img src={coverImage(first)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
          <ArticleMeta article={first} className="mt-4" />
          <h3 className="mt-2 text-2xl leading-tight transition-colors group-hover:text-primary">{first.title}</h3>
          {first.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{first.excerpt}</p>}
        </article>
        <div className="divide-y divide-border border-y border-border">
          {rest.map((article) => (
            <article key={article.id} className="group grid grid-cols-[1fr_110px] gap-4 py-4">
              <div>
                <ArticleMeta article={article} />
                <h3 className="mt-2 text-lg leading-snug transition-colors group-hover:text-primary">{article.title}</h3>
              </div>
              <img src={coverImage(article)} alt="" loading="lazy" className="h-24 w-full object-cover" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sidebar({ articles }: { articles: Article[] }) {
  const weather = useQuery({
    queryKey: ["kolda-weather"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=12.8939&longitude=-14.9413&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Africa%2FDakar",
      );
      if (!response.ok) throw new Error("Météo indisponible");
      return response.json() as Promise<{
        current: { temperature_2m: number; relative_humidity_2m: number; wind_speed_10m: number };
      }>;
    },
    staleTime: 600_000,
  });

  return (
    <aside className="space-y-10 lg:border-l lg:border-border lg:pl-8">
      <section>
        <SectionHeading eyebrow="La sélection" title="Les plus lus" compact />
        <ol className="mt-5 divide-y divide-border border-y border-border">
          {articles.map((article, index) => (
            <li key={article.id} className="grid grid-cols-[38px_1fr] gap-3 py-5">
              <span className="font-display text-3xl font-bold text-gold">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="kicker text-primary">{sectionName(article.categories?.slug)}</p>
                <h3 className="mt-1 text-base leading-snug">{article.title}</h3>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-primary-deep p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="kicker text-gold">Aujourd’hui</p>
            <h2 className="mt-1 text-2xl">Météo à Kolda</h2>
          </div>
          <CloudSun className="size-9 text-gold" />
        </div>
        {weather.data ? (
          <>
            <p className="mt-7 font-display text-5xl font-bold">{Math.round(weather.data.current.temperature_2m)}°</p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-primary-foreground/20 pt-4 text-xs">
              <span>Humidité<br /><strong className="text-sm">{weather.data.current.relative_humidity_2m}%</strong></span>
              <span>Vent<br /><strong className="text-sm">{Math.round(weather.data.current.wind_speed_10m)} km/h</strong></span>
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm opacity-75">Conditions météo momentanément indisponibles.</p>
        )}
      </section>

      <Newsletter compact />

      <section>
        <p className="kicker text-terracotta">Restez connectés</p>
        <h2 className="mt-2 text-2xl">Suivez l’actualité</h2>
        <div className="mt-5 flex gap-2">
          {[Facebook, Instagram, Youtube].map((Icon, index) => (
            <Button key={index} variant="outline" size="icon" aria-label={["Facebook", "Instagram", "YouTube"][index]}>
              <Icon />
            </Button>
          ))}
        </div>
      </section>
    </aside>
  );
}

function FilteredNews({ articles, title, clear }: { articles: Article[]; title: string; clear: () => void }) {
  return (
    <section className="mx-auto min-h-[55vh] max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div><p className="kicker text-terracotta">Toute l’actualité</p><h1 className="mt-1 text-4xl">{title}</h1></div>
        <Button variant="outline" onClick={clear}><X /> Effacer le filtre</Button>
      </div>
      {articles.length ? (
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => <NewsCard key={article.id} article={article} />)}
        </div>
      ) : (
        <div className="py-20 text-center"><Search className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-4 text-2xl">Aucun article trouvé</h2><p className="mt-2 text-sm text-muted-foreground">Essayez un autre mot ou une autre rubrique.</p></div>
      )}
    </section>
  );
}

function NewsCard({ article }: { article: Article }) {
  return (
    <article className="group">
      <img src={coverImage(article)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
      <ArticleMeta article={article} className="mt-4" />
      <h2 className="mt-2 text-xl leading-snug transition-colors group-hover:text-primary">{article.title}</h2>
      {article.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>}
    </article>
  );
}

function ArticleMeta({ article, inverse = false, className }: { article: Article; inverse?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase", inverse ? "text-gold" : "text-terracotta", className)}>
      <span>{sectionName(article.categories?.slug)}</span><span className="opacity-50">•</span><span className={inverse ? "text-primary-foreground/70" : "text-muted-foreground"}>{formatDate(article.created_at)}</span>
    </div>
  );
}

function SectionHeading({ eyebrow, title, compact = false }: { eyebrow: string; title: string; compact?: boolean }) {
  return <div><p className="kicker text-terracotta">{eyebrow}</p><h2 className={cn("mt-1", compact ? "text-2xl" : "text-3xl sm:text-4xl")}>{title}</h2></div>;
}

function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  async function subscribe(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
    setSending(false);
    if (error) {
      if (error.code === "23505") toast.info("Vous êtes déjà inscrit à notre lettre d’information.");
      else toast.error("L’inscription n’a pas abouti. Réessayez dans un instant.");
      return;
    }
    setEmail("");
    toast.success("Bienvenue ! Vous recevrez désormais l’essentiel du Fouladou.");
  }
  if (compact) {
    return (
      <section className="border-t-4 border-gold bg-secondary p-6 text-secondary-foreground">
        <Mail className="size-7 text-primary" />
        <p className="kicker mt-4 text-logo-red">La lettre du Fouladou</p>
        <h2 className="mt-2 text-2xl">L’essentiel de Kolda par e-mail</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Un condensé fiable et local, sans bruit inutile.</p>
        <form onSubmit={subscribe} className="mt-5 space-y-2">
          <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre adresse e-mail" className="h-11 bg-background" />
          <Button type="submit" disabled={sending} className="h-11 w-full bg-logo-red text-logo-red-foreground hover:bg-logo-red/90">{sending ? "…" : "S’inscrire"}</Button>
        </form>
      </section>
    );
  }
  return (
    <section className="bg-gold text-gold-foreground">
      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
        <div className="flex gap-4"><Mail className="mt-1 hidden size-8 sm:block" /><div><p className="kicker">La lettre du Fouladou</p><h2 className="mt-1 text-2xl sm:text-3xl">L’essentiel de Kolda dans votre boîte mail</h2><p className="mt-2 text-sm opacity-80">Un condensé fiable et local, sans bruit inutile.</p></div></div>
        <form onSubmit={subscribe} className="flex w-full max-w-md gap-2 md:w-[390px]">
          <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre adresse e-mail" className="h-11 border-gold-foreground/25 bg-background text-foreground" />
          <Button type="submit" disabled={sending} className="h-11 bg-primary-deep px-5 text-primary-foreground hover:bg-primary">{sending ? "…" : "S’inscrire"}</Button>
        </form>
      </div>
    </section>
  );
}

function Footer({ onSectionChange }: { onSectionChange: (slug: string) => void }) {
  return (
    <footer className="bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-9 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div><img src={brandLogo} alt="Saré Soukabé Infos" className="w-48 rounded-sm bg-background p-2" /><p className="mt-4 max-w-sm text-sm leading-6 opacity-75">L’actualité de Kolda et du Fouladou, racontée avec proximité, exigence et indépendance.</p></div>
        <div><p className="kicker text-gold">Rubriques</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{SECTIONS.map((section) => <Button key={section.slug} variant="link" onClick={() => onSectionChange(section.slug)} className="h-auto p-0 text-xs text-primary-foreground/75">{section.name}</Button>)}</div></div>
        <div><p className="kicker text-gold">Nous contacter</p><div className="mt-4 space-y-4 text-sm"><a href="tel:+221770106859" className="flex items-start gap-3 font-semibold"><Phone className="mt-0.5 size-5 shrink-0 text-logo-red" /><span>{"77 010 68 59 \n\n"}</span></a><p className="flex items-start gap-3 font-semibold"><MapPin className="mt-0.5 size-5 shrink-0 text-logo-red" /><span>KOLDA SIKILO ZONE LYCÉE</span></p></div></div>
      </div>
      <div className="border-t border-primary-foreground/15 px-4 py-4 text-center text-[11px] opacity-60">© {new Date().getFullYear()} Saré Soukabé Info · Tous droits réservés</div>
    </footer>
  );
}

function HomeSkeleton() {
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-10"><Skeleton className="h-8 w-48" /><div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]"><Skeleton className="h-[480px]" /><div className="space-y-4"><Skeleton className="h-36" /><Skeleton className="h-36" /><Skeleton className="h-36" /></div></div></div>;
}

function ErrorState({ retry }: { retry: () => void }) {
  return <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center"><div><h1 className="text-3xl">L’actualité n’a pas pu charger</h1><p className="mt-3 text-sm text-muted-foreground">La connexion semble momentanément interrompue.</p><Button onClick={retry} className="mt-6">Réessayer</Button></div></div>;
}

function EmptyState() {
  return <div className="mx-auto grid min-h-[55vh] max-w-md place-items-center px-4 text-center"><div><CalendarDays className="mx-auto size-9 text-primary" /><h1 className="mt-4 text-3xl">Les nouvelles arrivent</h1><p className="mt-3 text-muted-foreground">La rédaction prépare les prochains articles du Fouladou.</p></div></div>;
}