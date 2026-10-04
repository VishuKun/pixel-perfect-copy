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

- Every sidebar slug has a dedicated route file; `$role.$page` is only a not-found fallback. Why: no menu link should open a placeholder.
- Shared employee/department page bodies live in src/components/pages/RolePages.tsx. Why: reuse across roles.
