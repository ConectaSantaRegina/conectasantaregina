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
- Keep Feed video display centralized in `SiteVideo`, with signed storage URLs and native controls, so public, owner, and moderation previews behave consistently.
- Keep expandable feed text in `TextoFeed` and content rules shared between Feed and Novidades to ensure consistent publication behavior.
- Manage Premium only through the person-based admin control; new Premium rows use `user_id` with `comercio_id` null so publication privileges belong to the account.
- Keep visitor SELECT grants aligned with safe publication columns (including `canal`) and approved-row RLS; never expose author or approver IDs to enable public feeds.

- Keep sign-in in the public `/entrar` route using the managed OAuth helper with a public same-origin callback; verify the returned user before navigation so account access does not race session hydration.
- Collect post-session profile completion in a shared root dialog backed by the private profiles table and database validation; require its completion for new publication inserts so bypassing the dialog cannot skip required contact data.
- Reuse the admin-only profile query and author-contact presentation for people search and moderation so private contact fields never enter public publication queries.
- Keep people and moderation in separate admin tabs; reuse the person-based Premium editor in a profile-triggered dialog and share its query with profile badges so management stays consistent without page scrolling.
- Force all new moderated listings and publications to pending in database INSERT triggers, even for administrators; only authenticated administrator UPDATE approval makes them public, while owner queries retain pending visibility.
