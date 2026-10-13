ALTER TABLE public.comercios ADD COLUMN subcategorias_personalizadas text[] NOT NULL DEFAULT ARRAY[]::text[];
GRANT SELECT, INSERT, UPDATE (subcategorias_personalizadas) ON public.comercios TO authenticated;

CREATE OR REPLACE FUNCTION public.salvar_comercio_classificado(p_dados jsonb, p_categoria uuid, p_subcategorias uuid[], p_id uuid DEFAULT NULL::uuid)
RETURNS uuid LANGUAGE plpgsql SET search_path TO 'public' AS $function$
DECLARE v_id uuid; v_nome text; v_sub text; v_row public.comercios;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre na sua conta para publicar.'; END IF;
 SELECT nome INTO v_nome FROM public.comercio_categorias WHERE id=p_categoria AND categoria_pai_id IS NULL AND status='aprovado';
 IF v_nome IS NULL THEN RAISE EXCEPTION 'Selecione uma categoria principal válida.'; END IF;
 v_row := jsonb_populate_record(NULL::public.comercios, p_dados);
 v_row.subcategorias_personalizadas := COALESCE(v_row.subcategorias_personalizadas, ARRAY[]::text[]);
 IF COALESCE(cardinality(p_subcategorias),0) + cardinality(v_row.subcategorias_personalizadas) < 1 OR COALESCE(cardinality(p_subcategorias),0) + cardinality(v_row.subcategorias_personalizadas)>20 THEN RAISE EXCEPTION 'Selecione entre uma e vinte subcategorias.'; END IF;
 IF EXISTS (SELECT 1 FROM unnest(v_row.subcategorias_personalizadas) n WHERE n IS NULL OR length(btrim(n))<2 OR length(n)>100) THEN RAISE EXCEPTION 'Cada subcategoria deve ter entre 2 e 100 caracteres.'; END IF;
 SELECT COALESCE(array_agg(nome ORDER BY nome),ARRAY[]::text[]) INTO v_row.subcategorias_personalizadas FROM (SELECT DISTINCT btrim(n) AS nome FROM unnest(v_row.subcategorias_personalizadas) n) nomes;
 IF EXISTS (SELECT 1 FROM unnest(p_subcategorias) s(id) WHERE s.id IS NULL OR NOT EXISTS (SELECT 1 FROM public.comercio_categorias t WHERE t.id=s.id AND t.categoria_pai_id=p_categoria AND t.status='aprovado')) THEN RAISE EXCEPTION 'Selecione subcategorias da categoria principal.'; END IF;
 SELECT nome INTO v_sub FROM public.comercio_categorias WHERE id=p_subcategorias[1];
 v_sub := COALESCE(v_sub,v_row.subcategorias_personalizadas[1]);
 IF length(btrim(COALESCE(v_row.nome,'')))<2 OR length(v_row.nome)>200 OR length(COALESCE(v_row.descricao,''))>4000 OR length(COALESCE(v_row.endereco,''))>4000 OR length(COALESCE(v_row.horario,''))>400 THEN RAISE EXCEPTION 'Verifique os dados do comércio.'; END IF;
 IF p_id IS NULL THEN
 INSERT INTO public.comercios(user_id,nome,categoria,categoria_principal_id,secao,descricao,endereco,telefone,whatsapp,instagram,horario,delivery,imagem_url,fotos_extras,subcategorias_personalizadas)
 VALUES(auth.uid(),btrim(v_row.nome),v_sub,p_categoria,'comercio',v_row.descricao,v_row.endereco,v_row.telefone,v_row.whatsapp,v_row.instagram,v_row.horario,COALESCE(v_row.delivery,false),v_row.imagem_url,COALESCE(v_row.fotos_extras,ARRAY[]::text[]),v_row.subcategorias_personalizadas) RETURNING id INTO v_id;
 ELSE
 UPDATE public.comercios SET nome=btrim(v_row.nome),categoria=v_sub,categoria_principal_id=p_categoria,secao='comercio',descricao=v_row.descricao,endereco=v_row.endereco,telefone=v_row.telefone,whatsapp=v_row.whatsapp,instagram=v_row.instagram,horario=v_row.horario,delivery=COALESCE(v_row.delivery,false),imagem_url=CASE WHEN p_dados ? 'imagem_url' THEN v_row.imagem_url ELSE imagem_url END,fotos_extras=CASE WHEN p_dados ? 'fotos_extras' THEN v_row.fotos_extras ELSE fotos_extras END,subcategorias_personalizadas=v_row.subcategorias_personalizadas,aprovado=false WHERE id=p_id RETURNING id INTO v_id;
 IF v_id IS NULL THEN RAISE EXCEPTION 'Cadastro não encontrado ou sem permissão.'; END IF;
 DELETE FROM public.comercio_subcategorias WHERE comercio_id=v_id;
 END IF;
 INSERT INTO public.comercio_subcategorias(comercio_id,subcategoria_id) SELECT v_id,id FROM (SELECT DISTINCT unnest(p_subcategorias) AS id) s;
 RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.aprovar_subcategorias_personalizadas() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE nome_manual text; sub_id uuid;
BEGIN
 IF NEW.aprovado AND NOT OLD.aprovado AND cardinality(NEW.subcategorias_personalizadas)>0 THEN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Apenas administradores podem aprovar.'; END IF;
 FOR nome_manual IN SELECT unnest(NEW.subcategorias_personalizadas) LOOP
 IF nome_manual IS NULL OR length(btrim(nome_manual))<2 OR length(nome_manual)>100 OR NEW.categoria_principal_id IS NULL THEN RAISE EXCEPTION 'Verifique as subcategorias personalizadas.'; END IF;
 SELECT id INTO sub_id FROM public.comercio_categorias WHERE categoria_pai_id=NEW.categoria_principal_id AND chave=public.normalizar_categoria_comercio(nome_manual);
 IF sub_id IS NULL THEN
 INSERT INTO public.comercio_categorias(nome,chave,categoria_pai_id,status) VALUES(btrim(nome_manual),public.normalizar_categoria_comercio(nome_manual),NEW.categoria_principal_id,'aprovado') RETURNING id INTO sub_id;
 ELSE UPDATE public.comercio_categorias SET status='aprovado' WHERE id=sub_id;
 END IF;
 INSERT INTO public.comercio_subcategorias(comercio_id,subcategoria_id) VALUES(NEW.id,sub_id) ON CONFLICT DO NOTHING;
 END LOOP;
 END IF;
 RETURN NEW;
END;
$function$;
CREATE TRIGGER aprovar_subcategorias_personalizadas AFTER UPDATE OF aprovado ON public.comercios FOR EACH ROW EXECUTE FUNCTION public.aprovar_subcategorias_personalizadas();