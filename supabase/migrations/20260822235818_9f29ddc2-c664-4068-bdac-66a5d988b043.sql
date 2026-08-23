CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  telefone text,
  whatsapp text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.comercios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  categoria text NOT NULL,
  descricao text,
  endereco text,
  telefone text,
  whatsapp text,
  instagram text,
  horario text,
  delivery boolean NOT NULL DEFAULT false,
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vagas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  empresa text,
  descricao text,
  tipo text NOT NULL DEFAULT 'CLT',
  salario text,
  contato text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.novidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  texto text,
  categoria text NOT NULL DEFAULT 'Aviso',
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.imoveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  finalidade text NOT NULL DEFAULT 'Aluguel',
  tipo text NOT NULL DEFAULT 'Casa',
  preco text,
  endereco text,
  descricao text,
  contato text,
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sugestoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  local text,
  status text NOT NULL DEFAULT 'Em análise',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sugestao_apoios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sugestao_id uuid NOT NULL REFERENCES public.sugestoes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sugestao_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.sugestao_apoios TO authenticated;
GRANT SELECT ON public.sugestao_apoios TO anon;
GRANT ALL ON public.sugestao_apoios TO service_role;
ALTER TABLE public.sugestao_apoios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apoios public read" ON public.sugestao_apoios FOR SELECT USING (true);
CREATE POLICY "apoios insert own" ON public.sugestao_apoios FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "apoios delete own" ON public.sugestao_apoios FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  tipo text NOT NULL DEFAULT 'Doação',
  descricao text,
  meta text,
  local text,
  contato text,
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['comercios','vagas','novidades','imoveis','sugestoes','acoes'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "%s public read" ON public.%I FOR SELECT USING (true)', t, t);
    EXECUTE format('CREATE POLICY "%s insert own" ON public.%I FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY "%s update own or admin" ON public.%I FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), ''admin'')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), ''admin''))', t, t);
    EXECUTE format('CREATE POLICY "%s delete own or admin" ON public.%I FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), ''admin''))', t, t);
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

CREATE TABLE public.mensagens_contato (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text,
  mensagem text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.mensagens_contato TO anon, authenticated;
GRANT SELECT, DELETE ON public.mensagens_contato TO authenticated;
GRANT ALL ON public.mensagens_contato TO service_role;
ALTER TABLE public.mensagens_contato ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contato insert any" ON public.mensagens_contato FOR INSERT WITH CHECK (true);
CREATE POLICY "contato admin read" ON public.mensagens_contato FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contato admin delete" ON public.mensagens_contato FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "imagens public read" ON storage.objects FOR SELECT USING (bucket_id = 'imagens');
CREATE POLICY "imagens auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'imagens' AND owner = auth.uid());
CREATE POLICY "imagens owner delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'imagens' AND owner = auth.uid());