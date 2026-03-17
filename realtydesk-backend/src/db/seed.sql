-- RealtyDesk Canada — Development Seed Data
-- Run AFTER schema.sql: psql $DATABASE_URL -f src/db/seed.sql
-- Creates one demo agent account: demo@realtydesk.ca / Demo1234!

-- Demo user (password: Demo1234!)
INSERT INTO users (id, email, password_hash, full_name) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'demo@realtydesk.ca',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS2nBEu', -- Demo1234!
   'Alex Realty')
ON CONFLICT DO NOTHING;

INSERT INTO user_settings (user_id, province) VALUES
  ('00000000-0000-0000-0000-000000000001', 'AB')
ON CONFLICT DO NOTHING;

-- Sample clients
INSERT INTO clients (id, user_id, name, email, phone, type, stage, budget, address) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001',
   'Sarah Chen', 'sarah@email.com', '403-555-0142', 'buyer', 'active', 650000, ''),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001',
   'Mark Thompson', 'mark.t@email.com', '403-555-0198', 'seller', 'offer', 780000, '123 Maple Dr NW, Calgary'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001',
   'Priya Patel', 'priya@email.com', '403-555-0267', 'buyer', 'lead', 450000, ''),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001',
   'David Okafor', 'david.o@email.com', '403-555-0333', 'buyer', 'closed', 520000, '45 River Run Blvd SE')
ON CONFLICT DO NOTHING;

INSERT INTO client_notes (client_id, user_id, body) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Looking for detached home in SW Calgary'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Pre-approved with TD'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Listed at $780k — 2 offers received'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Referred by James K. First-time buyer'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Closed March 1 at $515k')
ON CONFLICT DO NOTHING;

-- Sample transactions
INSERT INTO transactions (user_id, client_id, address, sale_price, commission_rate, brokerage_split, gst_collected, closing_date, status) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004',
   '45 River Run Blvd SE', 515000, 2.5, 20, 515.00, '2026-03-01', 'closed'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002',
   '123 Maple Dr NW', 780000, 3.0, 25, 0, '2026-04-15', 'pending');

-- Sample expenses
INSERT INTO expenses (user_id, date, category, description, amount, gst_paid) VALUES
  ('00000000-0000-0000-0000-000000000001', '2026-01-15', 'Marketing & advertising', 'Facebook ads - January', 450.00, 22.50),
  ('00000000-0000-0000-0000-000000000001', '2026-02-01', 'MLS & board fees', 'CREB quarterly fees', 685.00, 34.25),
  ('00000000-0000-0000-0000-000000000001', '2026-02-20', 'Vehicle / mileage', 'Feb mileage - 1,200 km', 840.00, 0),
  ('00000000-0000-0000-0000-000000000001', '2026-03-05', 'Technology & software', 'CRM subscription', 79.00, 3.95);
