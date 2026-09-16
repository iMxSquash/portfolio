-- Every project needs an icon to render in the OS (dock/desktop/springboard),
-- and the /admin form already requires one on creation — enforce the
-- invariant at the schema level too instead of a defensive fallback in
-- application code (see src/lib/projects.ts).
alter table public.projects
  alter column logo_url set not null;
