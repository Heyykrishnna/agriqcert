-- Create user role enum
create type public.app_role as enum ('exporter', 'qa_agency', 'importer', 'admin');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  organization_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create user_roles table (separate from profiles for security)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role),
  created_at timestamptz not null default now()
);

-- Create batches table
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  exporter_id uuid references public.profiles(id) not null,
  product_type text not null,
  variety text,
  quantity numeric not null,
  weight_unit text not null,
  origin_country text not null,
  origin_state text,
  origin_lat numeric,
  origin_lon numeric,
  origin_address text,
  harvest_date date not null,
  destination_country text not null,
  expected_ship_date date,
  packaging_type text,
  status text not null default 'Submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create batch_attachments table
create table public.batch_attachments (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade not null,
  type text not null,
  url text not null,
  filename text not null,
  file_hash text,
  created_at timestamptz not null default now()
);

-- Create inspections table
create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade not null,
  qa_agency_id uuid references public.profiles(id) not null,
  inspector_id uuid references public.profiles(id),
  moisture_percent numeric,
  organic_status text,
  iso_codes text[],
  conclusion text,
  comments text,
  scheduled_date timestamptz,
  completed_date timestamptz,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create pesticide_results table
create table public.pesticide_results (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references public.inspections(id) on delete cascade not null,
  name text not null,
  ppm numeric not null,
  created_at timestamptz not null default now()
);

-- Create inspection_attachments table
create table public.inspection_attachments (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references public.inspections(id) on delete cascade not null,
  type text not null,
  url text not null,
  filename text not null,
  created_at timestamptz not null default now()
);

-- Create verifiable_credentials table
create table public.verifiable_credentials (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade not null,
  inspection_id uuid references public.inspections(id) on delete cascade not null,
  issuer_did text not null,
  holder_id uuid references public.profiles(id) not null,
  credential_json jsonb not null,
  qr_token text unique not null,
  revocation_status text not null default 'active',
  revoked_at timestamptz,
  revocation_reason text,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Create audit_logs table
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.batches enable row level security;
alter table public.batch_attachments enable row level security;
alter table public.inspections enable row level security;
alter table public.pesticide_results enable row level security;
alter table public.inspection_attachments enable row level security;
alter table public.verifiable_credentials enable row level security;
alter table public.audit_logs enable row level security;

-- Create security definer function for role checking
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create security definer function for getting user roles
create or replace function public.get_user_roles(_user_id uuid)
returns setof app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = _user_id
$$;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can manage all roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for batches
create policy "Exporters can view their own batches"
  on public.batches for select
  using (auth.uid() = exporter_id);

create policy "Exporters can create batches"
  on public.batches for insert
  with check (auth.uid() = exporter_id and public.has_role(auth.uid(), 'exporter'));

create policy "QA agencies can view assigned batches"
  on public.batches for select
  using (
    exists (
      select 1 from public.inspections
      where inspections.batch_id = batches.id
        and inspections.qa_agency_id = auth.uid()
    )
  );

create policy "Admins can view all batches"
  on public.batches for all
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for batch_attachments
create policy "Users can view attachments for batches they can access"
  on public.batch_attachments for select
  using (
    exists (
      select 1 from public.batches
      where batches.id = batch_attachments.batch_id
    )
  );

create policy "Exporters can manage attachments for their batches"
  on public.batch_attachments for all
  using (
    exists (
      select 1 from public.batches
      where batches.id = batch_attachments.batch_id
        and batches.exporter_id = auth.uid()
    )
  );

-- RLS Policies for inspections
create policy "QA agencies can view their inspections"
  on public.inspections for select
  using (auth.uid() = qa_agency_id);

create policy "QA agencies can manage their inspections"
  on public.inspections for all
  using (auth.uid() = qa_agency_id and public.has_role(auth.uid(), 'qa_agency'));

create policy "Exporters can view inspections for their batches"
  on public.inspections for select
  using (
    exists (
      select 1 from public.batches
      where batches.id = inspections.batch_id
        and batches.exporter_id = auth.uid()
    )
  );

create policy "Admins can view all inspections"
  on public.inspections for all
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for pesticide_results
create policy "Users can view pesticide results for accessible inspections"
  on public.pesticide_results for select
  using (
    exists (
      select 1 from public.inspections
      where inspections.id = pesticide_results.inspection_id
    )
  );

create policy "QA agencies can manage pesticide results for their inspections"
  on public.pesticide_results for all
  using (
    exists (
      select 1 from public.inspections
      where inspections.id = pesticide_results.inspection_id
        and inspections.qa_agency_id = auth.uid()
    )
  );

-- RLS Policies for inspection_attachments
create policy "Users can view inspection attachments for accessible inspections"
  on public.inspection_attachments for select
  using (
    exists (
      select 1 from public.inspections
      where inspections.id = inspection_attachments.inspection_id
    )
  );

create policy "QA agencies can manage attachments for their inspections"
  on public.inspection_attachments for all
  using (
    exists (
      select 1 from public.inspections
      where inspections.id = inspection_attachments.inspection_id
        and inspections.qa_agency_id = auth.uid()
    )
  );

-- RLS Policies for verifiable_credentials
create policy "Anyone can view active VCs (public verification)"
  on public.verifiable_credentials for select
  using (revocation_status = 'active');

create policy "Holders can view their VCs"
  on public.verifiable_credentials for select
  using (auth.uid() = holder_id);

create policy "QA agencies can issue VCs"
  on public.verifiable_credentials for insert
  with check (
    public.has_role(auth.uid(), 'qa_agency') and
    exists (
      select 1 from public.inspections
      where inspections.id = inspection_id
        and inspections.qa_agency_id = auth.uid()
    )
  );

create policy "QA agencies and admins can revoke VCs"
  on public.verifiable_credentials for update
  using (
    public.has_role(auth.uid(), 'qa_agency') or
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for audit_logs
create policy "Admins can view all audit logs"
  on public.audit_logs for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "All authenticated users can create audit logs"
  on public.audit_logs for insert
  with check (auth.uid() = user_id);

-- Create trigger function for updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers for updated_at columns
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_batches_updated_at
  before update on public.batches
  for each row execute function public.update_updated_at_column();

create trigger update_inspections_updated_at
  before update on public.inspections
  for each row execute function public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();