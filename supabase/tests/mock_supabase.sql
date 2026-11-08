drop database if exists td; create database td;
\c td
create role anon nologin; create role authenticated nologin;
create schema auth; create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
create schema storage; create table storage.buckets(id text primary key, name text, public boolean);
create table storage.objects(id serial, bucket_id text); alter table storage.objects enable row level security;
grant usage on schema public, auth, storage to anon, authenticated;
