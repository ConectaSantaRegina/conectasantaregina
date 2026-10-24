CREATE TABLE public.feed_metricas (
 publicacao_id uuid PRIMARY KEY REFERENCES public.novidades(id) ON DELETE CASCADE,
 curtidas bigint NOT NULL DEFAULT 0 CHECK (curtidas >= 0),
 compartilhamentos bigint NOT NULL DEFAULT 0 CHECK (compartilhamentos >= 0)
);
GRANT SELECT ON public.feed_metricas TO anon, authenticated;
GRANT ALL ON public.feed_metricas TO service_role;
ALTER TABLE public.feed_metricas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved feed or owner metrics" ON public.feed_metricas FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.novidades n WHERE n.id = publicacao_id AND n.canal = 'feed' AND n.aprovado = true));
CREATE POLICY "Owner and admin metrics" ON public.feed_metricas FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.novidades n WHERE n.id = publicacao_id AND (n.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE TABLE public.feed_curtidas (
 publicacao_id uuid NOT NULL REFERENCES public.novidades(id) ON DELETE CASCADE,
 user_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (publicacao_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.feed_curtidas TO authenticated;
GRANT ALL ON public.feed_curtidas TO service_role;
ALTER TABLE public.feed_curtidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own likes" ON public.feed_curtidas FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Like approved feed" ON public.feed_curtidas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.novidades n WHERE n.id = publicacao_id AND n.canal = 'feed' AND n.aprovado));
CREATE POLICY "Unlike own post" ON public.feed_curtidas FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.feed_compartilhamentos (
 publicacao_id uuid NOT NULL REFERENCES public.novidades(id) ON DELETE CASCADE,
 dispositivo_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (publicacao_id, dispositivo_id)
);
GRANT ALL ON public.feed_compartilhamentos TO service_role;
ALTER TABLE public.feed_compartilhamentos ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.contabilizar_feed_interacao() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
 v_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.publicacao_id ELSE NEW.publicacao_id END;
 IF TG_OP = 'INSERT' THEN
   INSERT INTO public.feed_metricas(publicacao_id) VALUES (v_id) ON CONFLICT DO NOTHING;
 END IF;
 IF TG_TABLE_NAME = 'feed_curtidas' THEN
   UPDATE public.feed_metricas SET curtidas = greatest(0, curtidas + CASE WHEN TG_OP = 'DELETE' THEN -1 ELSE 1 END) WHERE publicacao_id = v_id;
 ELSE
   UPDATE public.feed_metricas SET compartilhamentos = compartilhamentos + 1 WHERE publicacao_id = v_id;
 END IF;
 RETURN NULL;
END; $$;
REVOKE ALL ON FUNCTION public.contabilizar_feed_interacao() FROM PUBLIC;
CREATE TRIGGER contabilizar_curtidas AFTER INSERT OR DELETE ON public.feed_curtidas FOR EACH ROW EXECUTE FUNCTION public.contabilizar_feed_interacao();
CREATE TRIGGER contabilizar_compartilhamentos AFTER INSERT ON public.feed_compartilhamentos FOR EACH ROW EXECUTE FUNCTION public.contabilizar_feed_interacao();
CREATE FUNCTION public.registrar_compartilhamento_feed(p_publicacao uuid, p_dispositivo uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF p_dispositivo IS NULL OR NOT EXISTS (SELECT 1 FROM public.novidades n WHERE n.id = p_publicacao AND n.canal = 'feed' AND n.aprovado) THEN
   RAISE EXCEPTION 'Publicação indisponível';
 END IF;
 INSERT INTO public.feed_compartilhamentos(publicacao_id, dispositivo_id) VALUES (p_publicacao, p_dispositivo) ON CONFLICT DO NOTHING;
END; $$;
REVOKE ALL ON FUNCTION public.registrar_compartilhamento_feed(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_compartilhamento_feed(uuid,uuid) TO anon, authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_metricas;