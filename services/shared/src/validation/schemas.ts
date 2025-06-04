import { z } from "zod";
import { OrderStatus } from "../types/common";

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Chef schemas
export const chefProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  cuisine: z.string().min(1, "Cuisine is required"),
  image: z.string().url().optional(),
});

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

// Menu item schemas
export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  preparationTime: z
    .number()
    .int()
    .positive("Preparation time must be positive"),
  chefId: z.string().cuid("Invalid chef ID"),
  categoryId: z.string().cuid("Invalid category ID"),
  image: z.string().url().optional(),
});

export const customizationOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price cannot be negative"),
});

// Order schemas
export const orderItemSchema = z.object({
  menuItemId: z.string().cuid("Invalid menu item ID"),
  quantity: z.number().int().positive("Quantity must be positive"),
  customizationOptions: z.array(z.string().cuid()).optional(),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
  specialInstructions: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  estimatedDelivery: z.string().datetime().optional(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  cuisine: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().positive().optional(),
  ...paginationSchema.shape,
});
