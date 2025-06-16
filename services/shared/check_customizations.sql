SELECT 
  co.id,
  co.name,
  co."menuItemId",
  co."createdAt",
  mi.name as menu_item_name,
  c.name as chef_name
FROM customization_options co
JOIN menu_items mi ON co."menuItemId" = mi.id
JOIN chefs c ON mi."chefId" = c.id
ORDER BY co."createdAt" DESC
LIMIT 20; 