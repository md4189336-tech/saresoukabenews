CREATE OR REPLACE FUNCTION private.grant_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) IN ('elhadjihamadysow@yahoo.fr','md4189336@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT NEW.id, 'admin'::public.app_role
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_owner_admin ON auth.users;
CREATE TRIGGER on_auth_user_owner_admin
AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION private.grant_owner_admin();