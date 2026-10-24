ALTER TABLE public.profiles ADD COLUMN onboarding_concluido boolean NOT NULL DEFAULT false;
UPDATE public.profiles SET onboarding_concluido = true;
COMMENT ON COLUMN public.profiles.onboarding_concluido IS 'Optional first-registration prompt has been presented or dismissed; existing accounts are excluded from automatic presentation.';
GRANT SELECT, UPDATE (onboarding_concluido) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;