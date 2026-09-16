-- Seeds the 3 project apps that existed as static entries in src/lib/apps.ts
-- before Phase 7 (see TODO.md) moved them into the backoffice. Their
-- monogram icons are recreated as static SVGs in /public/img/logos/ rather
-- than re-uploaded to the `logos` Storage bucket, since they ship with the
-- codebase like the wallpapers do, not as backoffice-managed uploads.
insert into public.projects
  (name, slug, url, logo_url, display_mode, tech, sort_order, visible, show_on_desktop, show_on_mobile, default_width, default_height)
values
  ('Photoshop', 'photoshop', 'https://photoshop.elwen.dev', '/img/logos/photoshop.svg', 'iframe', '{}', 0, true, true, true, 960, 640),
  ('Illustrator', 'illustrator', 'https://illustrator.elwen.dev', '/img/logos/illustrator.svg', 'iframe', '{}', 1, true, true, true, 960, 640),
  ('Premiere Pro', 'premierepro', 'https://premierepro.elwen.dev', '/img/logos/premierepro.svg', 'iframe', '{}', 2, true, true, true, 960, 640)
on conflict (slug) do nothing;
