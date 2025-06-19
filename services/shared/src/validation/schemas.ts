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
  image: z.string().url().optional(),
  secret: z.string().min(1, "Secret is required"),
});

export const chefUpdateSchema = chefProfileSchema.partial();

// Chef secret verification schema
export const chefSecretSchema = z.object({
  secret: z.string().min(1, "Secret is required"),
});

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  chefId: z.string().cuid("Invalid chef ID"),
});

export const categoryUpdateSchema = categorySchema.partial();

// Menu item schemas
export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  preparationTime: z
    .number()
    .int()
    .positive("Preparation time must be positive"),
  chefId: z.string().cuid("Invalid chef ID"),
  categoryId: z.string().cuid("Invalid category ID"),
  images: z.array(z.string().url()).optional().default([]),
});

export const menuItemUpdateSchema = menuItemSchema.partial();

// Customization option schemas
export const customizationOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const customizationOptionCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  menuItemId: z.string().cuid("Invalid menu item ID"),
});

export const customizationOptionUpdateSchema =
  customizationOptionSchema.partial();

// Order schemas
export const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  items: z.array(
    z.object({
      menuItemId: z.string().cuid("Invalid menu item ID"),
      quantity: z.number().int().positive("Quantity must be positive"),
      customizationOptions: z.array(z.string().cuid()).optional(),
    })
  ),
  specialInstructions: z.string().optional(),
});

export const orderUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

// Event schemas
export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  eventDate: z.string().refine((date) => {
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate > now;
  }, "Event date must be in the future"),
  maxOrders: z.number().int().positive().optional(),
});

export const eventUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  eventDate: z
    .string()
    .refine((date) => {
      const eventDate = new Date(date);
      const now = new Date();
      return eventDate > now;
    }, "Event date must be in the future")
    .optional(),
  maxOrders: z.number().int().positive().optional(),
  status: z.enum(["OPEN", "CLOSED", "CANCELLED"]).optional(),
});

export const eventOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  specialRequests: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().cuid("Invalid menu item ID"),
        quantity: z.number().int().positive("Quantity must be positive"),
        specialNotes: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),
});

export const eventOrderUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  category: z.string().optional(),
  chef: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPreparationTime: z.coerce.number().positive().optional(),
});
