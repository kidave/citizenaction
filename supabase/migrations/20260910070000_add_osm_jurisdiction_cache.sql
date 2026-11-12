create table if not exists public.osm_jurisdiction_cache (
  osm_type text not null,
  osm_id bigint not null,
  name text not null,
  official_name text,
  admin_level smallint not null,
  boundary text,
  local_authority text,
  ward text,
  ref text,
  center jsonb,
  geojson jsonb,
  parent_osm_type text,
  parent_osm_id bigint,
  state_osm_id bigint,
  source text not null default 'openstreetmap',
  source_url text,
  fetched_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (osm_type, osm_id)
);

create index if not exists osm_jurisdiction_cache_level_idx
  on public.osm_jurisdiction_cache (admin_level);

create index if not exists osm_jurisdiction_cache_parent_idx
  on public.osm_jurisdiction_cache (parent_osm_type, parent_osm_id, admin_level);

create index if not exists osm_jurisdiction_cache_state_idx
  on public.osm_jurisdiction_cache (state_osm_id, admin_level);

alter table public.osm_jurisdiction_cache enable row level security;

drop policy if exists "Public can read OSM jurisdiction cache" on public.osm_jurisdiction_cache;
create policy "Public can read OSM jurisdiction cache"
  on public.osm_jurisdiction_cache
  for select
  to anon, authenticated
  using (true);

insert into public.osm_jurisdiction_cache
  (osm_type, osm_id, name, official_name, admin_level, boundary, ref, center, source_url)
values
  ('relation', 2025855, 'Andaman and Nicobar Islands', 'Union Territory of Andaman and Nicobar Islands', 4, 'administrative', 'AN', '{"lat":10.2157903,"lng":93.2407643}', 'https://www.openstreetmap.org/relation/2025855'),
  ('relation', 2022095, 'Andhra Pradesh', null, 4, 'administrative', 'AP', '{"lat":15.8953329,"lng":80.7629435}', 'https://www.openstreetmap.org/relation/2022095'),
  ('relation', 2027346, 'Arunachal Pradesh', null, 4, 'administrative', 'AR', '{"lat":28.0127098,"lng":94.4786993}', 'https://www.openstreetmap.org/relation/2027346'),
  ('relation', 2025886, 'Assam', null, 4, 'administrative', 'AS', '{"lat":26.0536379,"lng":92.8555201}', 'https://www.openstreetmap.org/relation/2025886'),
  ('relation', 1958982, 'Bihar', null, 4, 'administrative', 'BR', '{"lat":25.9036757,"lng":85.8075262}', 'https://www.openstreetmap.org/relation/1958982'),
  ('relation', 1942809, 'Chandigarh', null, 4, 'administrative', 'CH', '{"lat":30.7299626,"lng":76.7770068}', 'https://www.openstreetmap.org/relation/1942809'),
  ('relation', 1972004, 'Chhattisgarh', null, 4, 'administrative', 'CT', '{"lat":20.944451,"lng":82.3200722}', 'https://www.openstreetmap.org/relation/1972004'),
  ('relation', 1952530, 'Dadra and Nagar Haveli and Daman and Diu', null, 4, 'administrative', null, '{"lat":20.4075921,"lng":72.0456423}', 'https://www.openstreetmap.org/relation/1952530'),
  ('relation', 1942586, 'Delhi', null, 4, 'administrative', 'DL', '{"lat":28.6440374,"lng":77.0920865}', 'https://www.openstreetmap.org/relation/1942586'),
  ('relation', 11251493, 'Goa', null, 4, 'administrative', null, '{"lat":15.2768473,"lng":74.0058576}', 'https://www.openstreetmap.org/relation/11251493'),
  ('relation', 1949080, 'Gujarat', null, 4, 'administrative', 'GJ', '{"lat":22.4157127,"lng":71.3260455}', 'https://www.openstreetmap.org/relation/1949080'),
  ('relation', 1942601, 'Haryana', null, 4, 'administrative', 'HR', '{"lat":29.2906989,"lng":76.0378253}', 'https://www.openstreetmap.org/relation/1942601'),
  ('relation', 364186, 'Himachal Pradesh', null, 4, 'administrative', 'HP', '{"lat":31.8164194,"lng":77.3031949}', 'https://www.openstreetmap.org/relation/364186'),
  ('relation', 1943188, 'Jammu and Kashmir', null, 4, 'administrative', 'JK', '{"lat":33.5317491,"lng":75.2651752}', 'https://www.openstreetmap.org/relation/1943188'),
  ('relation', 1960191, 'Jharkhand', null, 4, 'administrative', 'JH', '{"lat":23.6594771,"lng":85.6454695}', 'https://www.openstreetmap.org/relation/1960191'),
  ('relation', 2019939, 'Karnataka', null, 4, 'administrative', 'KA', '{"lat":15.035604,"lng":76.3209834}', 'https://www.openstreetmap.org/relation/2019939'),
  ('relation', 2018151, 'Kerala', null, 4, 'administrative', 'KL', '{"lat":10.5447938,"lng":76.1382147}', 'https://www.openstreetmap.org/relation/2018151'),
  ('relation', 5515045, 'Ladakh', null, 4, 'administrative', null, '{"lat":34.0043353,"lng":77.3938503}', 'https://www.openstreetmap.org/relation/5515045'),
  ('relation', 2027460, 'Lakshadweep', null, 4, 'administrative', 'LD', '{"lat":10.3329131,"lng":72.7120906}', 'https://www.openstreetmap.org/relation/2027460'),
  ('relation', 1950071, 'Madhya Pradesh', null, 4, 'administrative', 'MP', '{"lat":23.9701251,"lng":78.4209968}', 'https://www.openstreetmap.org/relation/1950071'),
  ('relation', 1950884, 'Maharashtra', null, 4, 'administrative', 'MH', '{"lat":18.8183145,"lng":76.7751977}', 'https://www.openstreetmap.org/relation/1950884'),
  ('relation', 2027869, 'Manipur', null, 4, 'administrative', 'MN', '{"lat":24.762861,"lng":93.8579757}', 'https://www.openstreetmap.org/relation/2027869'),
  ('relation', 2027521, 'Meghalaya', null, 4, 'administrative', 'ML', '{"lat":25.5744063,"lng":91.3085904}', 'https://www.openstreetmap.org/relation/2027521'),
  ('relation', 2029046, 'Mizoram', null, 4, 'administrative', 'MZ', '{"lat":23.2315916,"lng":92.848796}', 'https://www.openstreetmap.org/relation/2029046'),
  ('relation', 2027973, 'Nagaland', null, 4, 'administrative', 'NL', '{"lat":26.1171142,"lng":94.284539}', 'https://www.openstreetmap.org/relation/2027973'),
  ('relation', 1984022, 'Odisha', null, 4, 'administrative', 'OR', '{"lat":20.1899333,"lng":84.4373603}', 'https://www.openstreetmap.org/relation/1984022'),
  ('relation', 107001, 'Puducherry', null, 4, 'administrative', 'PY', '{"lat":13.7947161,"lng":78.9201499}', 'https://www.openstreetmap.org/relation/107001'),
  ('relation', 1942686, 'Punjab', null, 4, 'administrative', 'PB', '{"lat":31.0270585,"lng":75.4094459}', 'https://www.openstreetmap.org/relation/1942686'),
  ('relation', 1942920, 'Rajasthan', null, 4, 'administrative', 'RJ', '{"lat":26.6284571,"lng":73.8782229}', 'https://www.openstreetmap.org/relation/1942920'),
  ('relation', 1791324, 'Sikkim', 'State of Sikkim', 4, 'administrative', 'SK', '{"lat":27.6016531,"lng":88.4666008}', 'https://www.openstreetmap.org/relation/1791324'),
  ('relation', 96905, 'Tamil Nadu', null, 4, 'administrative', 'TN', '{"lat":10.8204024,"lng":78.2961229}', 'https://www.openstreetmap.org/relation/96905'),
  ('relation', 3250963, 'Telangana', null, 4, 'administrative', 'TG', '{"lat":17.8768604,"lng":79.2796048}', 'https://www.openstreetmap.org/relation/3250963'),
  ('relation', 2026458, 'Tripura', null, 4, 'administrative', 'TR', '{"lat":23.7342443,"lng":91.7433299}', 'https://www.openstreetmap.org/relation/2026458'),
  ('relation', 1942587, 'Uttar Pradesh', null, 4, 'administrative', 'UP', '{"lat":27.138505,"lng":80.8591926}', 'https://www.openstreetmap.org/relation/1942587'),
  ('relation', 9987086, 'Uttarakhand', null, 4, 'administrative', null, '{"lat":30.0916702,"lng":79.3080592}', 'https://www.openstreetmap.org/relation/9987086'),
  ('relation', 1960177, 'West Bengal', null, 4, 'administrative', 'WB', '{"lat":24.3841844,"lng":87.8511378}', 'https://www.openstreetmap.org/relation/1960177')
on conflict (osm_type, osm_id) do update set
  name = excluded.name,
  official_name = excluded.official_name,
  admin_level = excluded.admin_level,
  boundary = excluded.boundary,
  ref = excluded.ref,
  center = excluded.center,
  source_url = excluded.source_url,
  updated_at = now();
