-- Table `projects`: project apps managed from the /admin backoffice
-- (see TODO.md Phase 7). Merged server-side with the static system apps
-- from src/lib/apps.ts to build the app registry the OS renders.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  url text not null,
  logo_url text,
  display_mode text not null check (display_mode in ('iframe', 'external')),
  description text,
  tech text[] not null default '{}',
  sort_order int not null default 0,
  visible boolean not null default true,
  show_on_desktop boolean not null default true,
  show_on_mobile boolean not null default true,
  default_width int,
  default_height int,
  created_at timestamptz not null default now()
);

comment on table public.projects is 'Project apps managed from the /admin backoffice (portfolio TODO.md Phase 7).';

create index projects_sort_order_idx on public.projects (sort_order);

alter table public.projects enable row level security;

-- Public read: only visible projects (the portfolio itself, anonymous visitors).
create policy "Public can read visible projects"
  on public.projects for select
  to anon, authenticated
  using (visible = true);

-- Backoffice: the authenticated admin can also read hidden projects.
create policy "Authenticated users can read all projects"
  on public.projects for select
  to authenticated
  using (true);

-- Backoffice writes: reserved to authenticated users (single admin account,
-- signup disabled in Supabase Auth — see TODO.md Phase 7).
create policy "Authenticated users can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update projects"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete projects"
  on public.projects for delete
  to authenticated
  using (true);
