import { z } from "zod";
import { UserRole, OrderStatus } from "../types/common";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    ),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Chef schemas
export const chefProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  cuisine: z.string().min(2, "Cuisine must be specified"),
  image: z.string().url("Invalid image URL").optional(),
});

// Menu item schemas
export const menuItemSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  preparationTime: z
    .number()
    .int()
    .positive("Preparation time must be positive"),
  categoryId: z.string().cuid("Invalid category ID"),
  image: z.string().url("Invalid image URL").optional(),
});

export const customizationOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  price: z.number().min(0, "Price cannot be negative"),
});

// Order schemas
export const orderItemSchema = z.object({
  menuItemId: z.string().cuid("Invalid menu item ID"),
  quantity: z.number().int().positive("Quantity must be positive"),
  customizationOptions: z.array(z.string().cuid()).optional(),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
  deliveryAddress: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  cuisine: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().positive().optional(),
  ...paginationSchema.shape,
});
