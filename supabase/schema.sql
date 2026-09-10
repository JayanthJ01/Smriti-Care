-- ============================================================================
-- Smriti Care — Phase 5B Supabase schema (part 1: tables)
-- Run part 1 then part 2 in the Supabase SQL editor. Idempotent re-runs.
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.caregiver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists caregiver_profiles_user_id_idx on public.caregiver_profiles (user_id);

create table if not exists public.patient_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  date_of_birth date,
  photo_url text,
  caregiver_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.caregiver_patient (
  id uuid primary key default gen_random_uuid(),
  caregiver_id uuid not null references auth.users (id) on delete cascade,
  patient_id uuid not null references public.patient_profiles (id) on delete cascade,
  role text,
  created_at timestamptz not null default now(),
  unique (caregiver_id, patient_id)
);
create index if not exists caregiver_patient_caregiver_idx on public.caregiver_patient (caregiver_id);
create index if not exists caregiver_patient_patient_idx on public.caregiver_patient (patient_id);

create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles (id) on delete cascade,
  name text not null,
  dosage text,
  scheduled_time text,
  frequency text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists medicines_patient_idx on public.medicines (patient_id);

create table if not exists public.hydrations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles (id) on delete cascade,
  date_key date not null,
  current_glasses integer not null default 0,
  target_glasses integer not null default 8,
  last_updated timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, date_key)
);
create index if not exists hydrations_patient_date_idx on public.hydrations (patient_id, date_key);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles (id) on delete cascade,
  doctor_name text not null,
  specialty text,
  date text not null,
  time text not null,
  location text,
  note text,
  status text not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists appointments_patient_idx on public.appointments (patient_id);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles (id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  category text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists activities_patient_time_idx on public.activities (patient_id, occurred_at desc);

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles (id) on delete cascade,
  game_id text not null,
  game_category text not null,
  difficulty_level integer not null default 1,
  score integer not null default 0,
  accuracy numeric not null default 0,
  rounds_completed integer not null default 0,
  total_rounds integer not null default 0,
  response_time_average_ms integer,
  mistakes integer not null default 0,

-- ============================================================================
-- Part 2: updated_at trigger + Row Level Security. Run after part 1.
-- ============================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists trg_caregiver_profiles_touch on public.caregiver_profiles;
create trigger trg_caregiver_profiles_touch before update on public.caregiver_profiles
for each row execute function public.touch_updated_at();

drop trigger if exists trg_patient_profiles_touch on public.patient_profiles;
create trigger trg_patient_profiles_touch before update on public.patient_profiles
for each row execute function public.touch_updated_at();

drop trigger if exists trg_medicines_touch on public.medicines;
create trigger trg_medicines_touch before update on public.medicines
for each row execute function public.touch_updated_at();

drop trigger if exists trg_hydrations_touch on public.hydrations;
create trigger trg_hydrations_touch before update on public.hydrations
for each row execute function public.touch_updated_at();

drop trigger if exists trg_appointments_touch on public.appointments;
create trigger trg_appointments_touch before update on public.appointments
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.caregiver_profiles enable row level security;
alter table public.patient_profiles enable row level security;
alter table public.caregiver_patient enable row level security;
alter table public.medicines enable row level security;
alter table public.hydrations enable row level security;
alter table public.appointments enable row level security;
alter table public.activities enable row level security;
alter table public.game_results enable row level security;

create or replace function public.is_linked_caregiver(p_patient_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.caregiver_patient
    where caregiver_id = auth.uid() and patient_id = p_patient_id
  );
$$;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists caregiver_profiles_owner on public.caregiver_profiles;
create policy caregiver_profiles_owner on public.caregiver_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists patient_profiles_read on public.patient_profiles;
create policy patient_profiles_read on public.patient_profiles
  for select using (auth.uid() = user_id or public.is_linked_caregiver(id));

drop policy if exists caregiver_patient_read on public.caregiver_patient;
create policy caregiver_patient_read on public.caregiver_patient
  for select using (auth.uid() = caregiver_id);

drop policy if exists medicines_access on public.medicines;
create policy medicines_access on public.medicines
  for all using (public.is_linked_caregiver(patient_id))
  with check (public.is_linked_caregiver(patient_id));

drop policy if exists hydrations_access on public.hydrations;
create policy hydrations_access on public.hydrations
  for all using (public.is_linked_caregiver(patient_id))
  with check (public.is_linked_caregiver(patient_id));

drop policy if exists appointments_access on public.appointments;
create policy appointments_access on public.appointments
  for all using (public.is_linked_caregiver(patient_id))
  with check (public.is_linked_caregiver(patient_id));

drop policy if exists activities_access on public.activities;
create policy activities_access on public.activities
  for all using (public.is_linked_caregiver(patient_id))
  with check (public.is_linked_caregiver(patient_id));

drop policy if exists game_results_access on public.game_results;
create policy game_results_access on public.game_results
  for all using (public.is_linked_caregiver(patient_id))
  with check (public.is_linked_caregiver(patient_id));

  completion_status text not null default 'completed',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists game_results_patient_time_idx on public.game_results (patient_id, started_at desc);
