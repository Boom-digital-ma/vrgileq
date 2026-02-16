-- Seed Data for Auction Platform

-- 1. Insert Categories
INSERT INTO categories (name, slug) VALUES 
('Industrial Machinery', 'industrial-machinery'),
('Restaurant Equipment', 'restaurant-equipment'),
('Office Assets', 'office-assets'),
('Vehicles & Logistics', 'vehicles-logistics')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Auctions (using temporary IDs for mapping)
-- Note: In a real scenario, you'd get the category_id dynamically.
-- Here we use a subquery to find the IDs based on slugs.

INSERT INTO auctions (id, title, description, category_id, start_price, current_price, min_increment, status, ends_at)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '2024 Industrial CNC Machine - Haas VF-2',
    '2024 Industrial CNC Machine - Haas VF-2 Vertical Machining Center. Includes 12,000-rpm spindle, side-mount tool changer, and Haas Next Generation Control. Pristine condition, original owner.',
    (SELECT id FROM categories WHERE slug = 'industrial-machinery'),
    40000.00,
    42500.00,
    500.00,
    'live',
    now() + interval '4 hours'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Commercial Grade Convection Oven - Vulcan VC4',
    'Vulcan VC4 Series Single Deck Natural Gas Convection Oven. Stainless steel front, sides, and top. Electronic spark ignition system.',
    (SELECT id FROM categories WHERE slug = 'restaurant-equipment'),
    2500.00,
    3200.00,
    100.00,
    'live',
    now() + interval '1 day 6 hours'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Herman Miller Aeron Chair Set (6 Units)',
    'Set of 6 Herman Miller Aeron chairs. Graphite frame, tuxedo pellicle. Fully adjustable arms, posturefit SL hardware. Minimal wear.',
    (SELECT id FROM categories WHERE slug = 'office-assets'),
    1200.00,
    1800.00,
    50.00,
    'live',
    now() + interval '2 days 4 hours'
),
(
    '00000000-0000-0000-0000-000000000004',
    'Heavy Duty Forklift - CAT 2023 Model',
    '2023 CAT GP25N Pneumatic Tire Forklift. 5,000 lb capacity. Solid pneumatic tires. Side shifter. Full maintenance records included.',
    (SELECT id FROM categories WHERE slug = 'vehicles-logistics'),
    12000.00,
    15500.00,
    250.00,
    'live',
    now() + interval '6 hours 45 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Auction Images
INSERT INTO auction_images (auction_id, url, is_main) VALUES 
('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=800', true),
('00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&q=80&w=800', true),
('00000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800', true),
('00000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=800', true);
