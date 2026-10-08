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

## Project rules

- External links (social networks and any other outbound URL) are declared once in `src/lib/social.ts` and rendered only through `src/components/social-links.tsx`, so a URL is never retyped and never silently changed. Add a network by adding one entry to `SOCIAL_LINKS`; never hardcode a URL inside a page or component.
- Only publish a social entry once its real URL exists. Never create an placeholder or guessed profile link.

