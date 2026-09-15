CREATE TYPE public.app_role AS ENUM ('user','editor','admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('editor','admin'))
$$;

CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_staff_write" ON public.categories FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  featured_image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_breaking BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX articles_category_idx ON public.articles(category_id);
CREATE INDEX articles_created_idx ON public.articles(created_at DESC);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_public_read" ON public.articles FOR SELECT USING (true);
CREATE POLICY "articles_staff_write" ON public.articles FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX comments_article_idx ON public.comments(article_id, created_at DESC);
GRANT SELECT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_public_read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own_or_staff" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT INSERT, SELECT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletter_anyone_subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "newsletter_admin_read" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.increment_article_views(_slug TEXT)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.articles SET views_count = views_count + 1 WHERE slug = _slug;
$$;
GRANT EXECUTE ON FUNCTION public.increment_article_views(TEXT) TO anon, authenticated;

CREATE POLICY "article_images_staff_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'article-images');
CREATE POLICY "article_images_staff_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-images' AND public.is_staff(auth.uid()));
CREATE POLICY "article_images_staff_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-images' AND public.is_staff(auth.uid()));

INSERT INTO public.categories (name, slug) VALUES
  ('Politique','politique'),
  ('Culture','culture'),
  ('Sport','sport'),
  ('Santé','sante'),
  ('Économie','economie'),
  ('Multimédia','multimedia');

INSERT INTO public.articles (title, slug, excerpt, content, category_id, author_name, is_featured, is_breaking, views_count, created_at)
SELECT v.title, v.slug, v.excerpt, v.content, c.id, v.author_name, v.is_featured, v.is_breaking, v.views, now() - (v.days || ' days')::interval
FROM (VALUES
 ('Kolda : le conseil départemental adopte un budget record pour les pistes rurales','conseil-departemental-budget-pistes-rurales','Les élus du département de Kolda ont validé une enveloppe historique consacrée au désenclavement des villages du Fouladou.', E'Les élus du département de Kolda ont adopté à l''unanimité un budget consacré en priorité au désenclavement des zones rurales du Fouladou.\n\nPrès de la moitié de l''enveloppe sera consacrée à la réhabilitation des pistes de production reliant les villages aux loumas hebdomadaires. Les transporteurs et les productrices de la région y voient un levier direct pour écouler leurs récoltes.\n\n« Sans piste, il n''y a pas de marché », résume un conseiller départemental à l''issue de la session.', 'politique','Mamadou Baldé', true, true, 1840, 0),
 ('Décentralisation : les communes du Fouladou réclament plus de moyens','decentralisation-communes-fouladou-moyens','Réunis à Kolda, les maires demandent un transfert effectif des ressources annoncées par l''État.', E'Réunis en atelier à Kolda, les maires des communes du Fouladou ont demandé un transfert effectif des ressources accompagnant les compétences déjà transférées.\n\nLes participants ont insisté sur la formation des agents municipaux et la modernisation de l''état civil, souvent citée comme premier point de contact des citoyens avec l''administration.', 'politique','Aïssatou Diallo', false, false, 620, 1),
 ('Citoyenneté : les jeunes de Sikilo s''organisent pour l''assainissement du quartier','citoyennete-jeunes-sikilo-assainissement','Journées de nettoyage, sensibilisation et dialogue avec la mairie.', E'Chaque samedi matin, des dizaines de jeunes du quartier de Sikilo se retrouvent pelles et brouettes à la main. Leur objectif : faire de l''assainissement une affaire collective.', 'politique','Mamadou Baldé', false, false, 305, 6),
 ('SALIKO : la nouvelle scène littéraire de Kolda se raconte','saliko-scene-litteraire-kolda','Poètes, conteurs et slameurs redonnent une voix aux traditions orales du Fouladou.', E'Le collectif SALIKO réunit une génération d''auteurs qui puise dans les récits peuls et mandingues pour écrire un présent résolument urbain.\n\nEntre ateliers d''écriture dans les lycées et scènes ouvertes le week-end, le collectif revendique une mission simple : garder vivante la parole du Fouladou.', 'culture','Fatou Cissé', true, false, 980, 2),
 ('Le Fouladou en fête : les tambours résonnent à nouveau','fouladou-en-fete-tambours','Retour en images et en sons sur une célébration qui rassemble toutes les générations.', E'Pendant trois jours, quartiers et villages ont vibré au rythme des tambours. Les gardiens de la tradition rappellent l''importance de la transmission aux plus jeunes.', 'culture','Ousmane Sow', false, false, 445, 3),
 ('Navétanes : l''ASC Sinthiang crée la sensation en quart de finale','navetanes-asc-sinthiang-quart-finale','Un but à la dernière minute envoie l''équipe de quartier dans le dernier carré régional.', E'Le stade municipal était comble. À la 89e minute, une frappe lointaine a suffi pour faire basculer la rencontre et enflammer les tribunes.\n\nL''ASC Sinthiang affrontera en demi-finale le vainqueur du derby de Sikilo.', 'sport','Ibrahima Ndiaye', true, true, 2310, 0),
 ('Lutte traditionnelle : la relève du Fouladou monte sur l''arène','lutte-traditionnelle-releve-fouladou','Les jeunes lutteurs de Kolda visent les grands tournois nationaux.', E'Entraînements à l''aube, régime strict et soutien des écuries locales : la nouvelle génération de lutteurs du Fouladou se prépare pour la saison.', 'sport','Ibrahima Ndiaye', false, false, 700, 4),
 ('Santé communautaire : campagne de vaccination élargie dans le district de Kolda','sante-campagne-vaccination-district-kolda','Les équipes mobiles sillonnent les villages pendant deux semaines.', E'Le district sanitaire de Kolda déploie des équipes mobiles pour atteindre les zones les plus éloignées. Les relais communautaires jouent un rôle central dans la sensibilisation des familles.', 'sante','Dr Aminata Ba', false, false, 512, 2),
 ('Paludisme : la saison des pluies impose une vigilance renforcée','paludisme-vigilance-saison-pluies','Moustiquaires, assainissement et dépistage précoce au cœur du dispositif.', E'Avec les premières pluies, les cas de paludisme augmentent dans la région. Les autorités sanitaires rappellent les gestes de prévention et l''importance du dépistage précoce.', 'sante','Dr Aminata Ba', false, false, 388, 5),
 ('Louma de Dabo : les productrices de riz imposent leurs prix','louma-dabo-productrices-riz','Organisées en groupement, elles négocient désormais directement avec les commerçants.', E'En se regroupant, les productrices de riz de Dabo ont gagné en pouvoir de négociation. Le stockage collectif leur permet d''attendre le meilleur moment pour vendre.', 'economie','Mariama Sadio', true, false, 1120, 1),
 ('Entrepreneuriat des jeunes : l''élevage attire une nouvelle génération à Kolda','entrepreneuriat-jeunes-elevage-kolda','Financements, formation et coopératives : ce qui change pour les éleveurs du Fouladou.', E'De jeunes diplômés reviennent au village pour monter des unités d''embouche bovine. Le crédit reste le principal obstacle, mais les coopératives ouvrent des portes.', 'economie','Mariama Sadio', false, false, 640, 3),
 ('En images : une journée au marché central de Kolda','en-images-marche-central-kolda','Reportage photo au cœur du poumon commercial de la région.', E'Dès l''aube, les allées du marché central s''animent. Reportage photo au cœur du poumon commercial du Fouladou.', 'multimedia','Rédaction', false, false, 290, 1)
) AS v(title, slug, excerpt, content, cat_slug, author_name, is_featured, is_breaking, views, days)
JOIN public.categories c ON c.slug = v.cat_slug;