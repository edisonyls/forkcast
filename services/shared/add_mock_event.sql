-- Insert a past event for the chef
INSERT INTO events (id, title, description, "eventDate", status, "chefId", "createdAt", "updatedAt")
VALUES (
  'evt_mock_past_001',
  'Weekend Dinner Party',
  'A cozy dinner party from last weekend',
  '2024-01-15 18:00:00',
  'CLOSED',
  'cmbylcd7g000011jelutzr4ip',
  '2024-01-10 10:00:00',
  '2024-01-15 20:00:00'
);

-- Insert an event order for this past event
INSERT INTO event_orders (id, "customerName", "customerEmail", "customerPhone", "specialRequests", status, "eventId", "createdAt", "updatedAt")
VALUES (
  'order_mock_001',
  'Sarah Johnson',
  'sarah.johnson@email.com',
  '+1-555-0123',
  'Please make it spicy!',
  'CONFIRMED',
  'evt_mock_past_001',
  '2024-01-12 14:30:00',
  '2024-01-15 15:00:00'
);

-- Get the first menu item from this chef to add to the order
-- We'll insert the event order item with a hardcoded menu item ID
-- You may need to adjust this based on actual menu items in your database

-- Insert event order items (using a placeholder menu item ID)
-- First, let's check what menu items exist for this chef
-- SELECT id, name FROM menu_items WHERE "chefId" = 'cmbylcd7g000011jelutzr4ip' LIMIT 1;

-- For now, I'll use a placeholder - you should replace this with an actual menu item ID
INSERT INTO event_order_items (id, quantity, "specialNotes", "menuItemId", "eventOrderId", "createdAt", "updatedAt")
VALUES (
  'order_item_mock_001',
  2,
  'Customizations: extra spicy, no onions',
  (SELECT id FROM menu_items WHERE "chefId" = 'cmbylcd7g000011jelutzr4ip' LIMIT 1),
  'order_mock_001',
  '2024-01-12 14:30:00',
  '2024-01-12 14:30:00'
); 