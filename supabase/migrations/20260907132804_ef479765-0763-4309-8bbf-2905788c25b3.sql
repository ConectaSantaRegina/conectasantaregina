DROP FUNCTION IF EXISTS public.meu_premium_ativo();
REVOKE EXECUTE ON FUNCTION public.novidades_controla_aprovacao() FROM PUBLIC, anon, authenticated;