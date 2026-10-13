ALTER TABLE public.novidades
ADD COLUMN video_url text;

GRANT SELECT (video_url) ON public.novidades TO anon;
GRANT SELECT (video_url) ON public.novidades TO authenticated;
GRANT UPDATE (video_url), INSERT (video_url) ON public.novidades TO authenticated;

COMMENT ON COLUMN public.novidades.video_url IS 'Private storage path for an optional video attachment; used by canal=feed posts.';