<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep premium gallery paths in `comercios.fotos_extras`; validate uploads against active premium in the database and render extras only while premium is valid, so expired accounts retain cover-only cards.
- Keep both content types in `novidades` with the existing approval gate; `canal='novidades'` feeds the Premium carousel/page and `canal='feed'` feeds only the community feed.
