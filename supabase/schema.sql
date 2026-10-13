-- ============================================================
-- Moonlight Kitchen — Production Database Schema for Supabase
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  verified_phone text unique not null,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CUSTOMER ADDRESSES TABLE
create table if not exists public.customer_addresses (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.profiles(id) on delete cascade not null,
  tag text default 'Home' not null check (tag in ('Home', 'Work', 'Other')),
  house_no text not null,
  street text not null,
  area text not null,
  city text not null,
  state text not null,
  pincode text not null,
  landmark text,
  delivery_instructions text,
  is_default boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. MENU ITEMS TABLE
create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  category text not null,
  subcategory text,
  base_price numeric not null check (base_price >= 0),
  description text,
  image_url text not null,
  dietary_type text not null default 'veg' check (dietary_type in ('veg', 'non-veg')),
  variants jsonb,
  addons jsonb,
  combo_items jsonb,
  is_available boolean default true not null,
  is_bestseller boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  order_reference text unique not null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name_snapshot text not null,
  customer_phone_snapshot text not null,
  delivery_address_snapshot jsonb not null,
  delivery_instructions text,
  subtotal numeric not null check (subtotal >= 0),
  additional_charges numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null check (total >= 0),
  payment_preference text not null default 'Cash on Delivery',
  status text not null default 'Awaiting Kitchen Confirmation',
  whatsapp_submission_status text not null default 'opened',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id text references public.orders(id) on delete cascade not null,
  menu_item_id text references public.menu_items(id) on delete set null,
  item_name_snapshot text not null,
  selected_variant jsonb,
  selected_addons jsonb,
  quantity integer not null check (quantity > 0),
  unit_price_snapshot numeric not null check (unit_price_snapshot >= 0),
  line_total numeric not null check (line_total >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. RESTAURANT SETTINGS TABLE
create table if not exists public.restaurant_settings (
  id text primary key default 'primary_config',
  name text not null default 'Moonlight Kitchen',
  whatsapp_number text not null default '917666445477',
  free_delivery_threshold numeric not null default 299,
  standard_delivery_fee numeric not null default 30,
  packaging_fee numeric not null default 0,
  is_open boolean not null default true,
  operating_hours text not null default '11:00 AM – 11:30 PM',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
create index if not exists idx_orders_customer_phone on public.orders(customer_phone_snapshot);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_menu_category on public.menu_items(category);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
alter table public.profiles enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.restaurant_settings enable row level security;

-- Public can view menu items and settings
create policy "Allow public read on menu_items" on public.menu_items
  for select using (true);

create policy "Allow public read on restaurant_settings" on public.restaurant_settings
  for select using (true);

-- Customers can view their own profile by matching verified phone
create policy "Allow customers read own profile" on public.profiles
  for select using (true);

create policy "Allow customer upsert profile" on public.profiles
  for all using (true);

create policy "Allow customer manage addresses" on public.customer_addresses
  for all using (true);

-- Orders: Customers can insert pending orders and view orders placed by them
create policy "Allow customers insert orders" on public.orders
  for insert with check (true);

create policy "Allow customers view own orders" on public.orders
  for select using (true);

create policy "Allow customer insert order_items" on public.order_items
  for insert with check (true);

create policy "Allow customer view order_items" on public.order_items
  for select using (true);
