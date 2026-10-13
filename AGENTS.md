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
- Keep publication-image fitting centralized in `SiteImage` so cards, galleries, feed, and review previews use consistent image presentation.
- Keep expandable feed text in `TextoFeed` and content rules shared between Feed and Novidades to ensure consistent publication behavior.
- Manage Premium only through the person-based admin control; new Premium rows use `user_id` with `comercio_id` null so publication privileges belong to the account.
- Keep visitor SELECT grants aligned with safe publication columns (including `canal`) and approved-row RLS; never expose author or approver IDs to enable public feeds.

- Keep sign-in in the public `/entrar` route using the managed OAuth helper with a public same-origin callback; verify the returned user before navigation so account access does not race session hydration.
