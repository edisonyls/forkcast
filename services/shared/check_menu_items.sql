SELECT 
  mi.id,
  mi.name,
  mi.description,
  mi."createdAt",
  c.name as chef_name,
  cat.name as category_name
FROM menu_items mi
JOIN chefs c ON mi."chefId" = c.id
JOIN categories cat ON mi."categoryId" = cat.id
ORDER BY mi."createdAt" DESC
LIMIT 10; 