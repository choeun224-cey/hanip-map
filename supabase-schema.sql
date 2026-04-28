-- 한입지도 Supabase 테이블 생성 SQL
-- Supabase 대시보드 > SQL Editor에서 실행하세요

create table restaurants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null default '',
  region text not null default '',
  area text not null default '서울' check (area in ('서울', '경기', '지방')),
  category text not null default '기타',
  memo text default '',
  visited boolean default false,
  rating smallint check (rating >= 1 and rating <= 5),
  lat double precision not null,
  lng double precision not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- 누구나 읽기/쓰기 가능하게 (커플 전용이니까 간단하게)
alter table restaurants enable row level security;

create policy "Anyone can read" on restaurants
  for select using (true);

create policy "Anyone can insert" on restaurants
  for insert with check (true);

create policy "Anyone can update" on restaurants
  for update using (true);

create policy "Anyone can delete" on restaurants
  for delete using (true);
