-- Mull Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Sessions table (one per article/reading session)
create table if not exists sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  source_url text,
  source_type text check (source_type in ('url', 'paste', 'pdf', 'file')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table (branching conversation tree)
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  parent_id uuid references messages(id) on delete set null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  -- Context for the message
  paragraph_index integer,
  paragraph_text text,
  selected_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Highlights table
create table if not exists highlights (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  paragraph_index integer not null,
  text text not null,
  start_offset integer not null,
  end_offset integer not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notes/exports table
create table if not exists notes (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  paragraph_index integer not null,
  paragraph_text text,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table sessions enable row level security;
alter table messages enable row level security;
alter table highlights enable row level security;
alter table notes enable row level security;

-- Policies: Users can only access their own data
create policy "Users can view own sessions" on sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own sessions" on sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions" on sessions
  for update using (auth.uid() = user_id);

create policy "Users can delete own sessions" on sessions
  for delete using (auth.uid() = user_id);

-- Messages policies (via session ownership)
create policy "Users can view messages in own sessions" on messages
  for select using (
    exists (
      select 1 from sessions where sessions.id = messages.session_id and sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own sessions" on messages
  for insert with check (
    exists (
      select 1 from sessions where sessions.id = messages.session_id and sessions.user_id = auth.uid()
    )
  );

-- Highlights policies
create policy "Users can manage highlights in own sessions" on highlights
  for all using (
    exists (
      select 1 from sessions where sessions.id = highlights.session_id and sessions.user_id = auth.uid()
    )
  );

-- Notes policies
create policy "Users can manage notes in own sessions" on notes
  for all using (
    exists (
      select 1 from sessions where sessions.id = notes.session_id and sessions.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_messages_session_id on messages(session_id);
create index if not exists idx_messages_parent_id on messages(parent_id);
create index if not exists idx_highlights_session_id on highlights(session_id);
create index if not exists idx_notes_session_id on notes(session_id);

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_sessions_updated_at
  before update on sessions
  for each row execute function update_updated_at_column();
