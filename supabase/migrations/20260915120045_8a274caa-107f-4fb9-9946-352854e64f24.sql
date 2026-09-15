CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('editor','admin'))
$$;

REVOKE ALL ON FUNCTION private.has_role(UUID, public.app_role) FROM public;
REVOKE ALL ON FUNCTION private.is_staff(UUID) FROM public;
GRANT EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(UUID) TO authenticated, service_role;

DROP POLICY "user_roles_read_own" ON public.user_roles;
DROP POLICY "user_roles_admin_write" ON public.user_roles;
CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY "categories_staff_write" ON public.categories;
CREATE POLICY "categories_staff_write" ON public.categories FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "articles_staff_write" ON public.articles;
CREATE POLICY "articles_staff_write" ON public.articles FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "comments_delete_own_or_staff" ON public.comments;
CREATE POLICY "comments_delete_own_or_staff" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR private.is_staff(auth.uid()));

DROP POLICY "newsletter_admin_read" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_read" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'));

DROP POLICY "article_images_staff_insert" ON storage.objects;
DROP POLICY "article_images_staff_delete" ON storage.objects;
CREATE POLICY "article_images_staff_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-images' AND private.is_staff(auth.uid()));
CREATE POLICY "article_images_staff_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-images' AND private.is_staff(auth.uid()));

DROP FUNCTION public.has_role(UUID, public.app_role);
DROP FUNCTION public.is_staff(UUID);

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM public;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION private.increment_article_views(_slug TEXT)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.articles SET views_count = views_count + 1 WHERE slug = _slug;
$$;
REVOKE ALL ON FUNCTION private.increment_article_views(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION private.increment_article_views(TEXT) TO service_role;
DROP FUNCTION IF EXISTS public.increment_article_views(TEXT);