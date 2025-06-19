import express from "express";
import {
  prisma,
  sendSuccessResponse,
  sendErrorResponse,
  validateRequest,
  authenticateChef,
  eventSchema,
  eventUpdateSchema,
  eventOrderSchema,
  eventOrderUpdateSchema,
} from "@forkcast/shared";

const router = express.Router();

// Get all events for a chef (public endpoint with secret verification)
router.get("/", async (req, res) => {
  try {
    const { chefId, secret } = req.query;

    if (!chefId) {
      return sendErrorResponse(res, "Chef ID is required", 400);
    }

    // Verify chef exists and secret is correct if provided
    if (secret) {
      const chef = await prisma.chef.findUnique({
        where: { id: chefId as string },
        select: { secret: true },
      });

      if (!chef) {
        return sendErrorResponse(res, "Chef not found", 404);
      }

      if (chef.secret !== secret) {
        return sendErrorResponse(res, "Invalid secret", 403);
      }
    }

    const events = await prisma.event.findMany({
      where: {
        chefId: chefId as string,
        status: { not: "CANCELLED" },
      },
      include: {
        chef: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        // Include event orders if secret is provided (for users to see what's already ordered)
        ...(secret && {
          eventOrders: {
            include: {
              eventOrderItems: {
                include: {
                  menuItem: {
                    select: {
                      id: true,
                      name: true,
                      customizationOptions: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        }),
        _count: {
          select: {
            eventOrders: true,
          },
        },
      },
      orderBy: { eventDate: "asc" },
    });

    return sendSuccessResponse(
      res,
      { events },
      "Events retrieved successfully"
    );
  } catch (error) {
    console.error("Get events error:", error);
    return sendErrorResponse(res, "Failed to retrieve events", 500);
  }
});

// Get events for authenticated chef (protected endpoint)
router.get("/me", authenticateChef, async (req, res) => {
  try {
    const chefId = req.chef!.chefId;

    const events = await prisma.event.findMany({
      where: {
        chefId,
      },
      include: {
        chef: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        eventOrders: {
          include: {
            eventOrderItems: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            eventOrders: true,
          },
        },
      },
      orderBy: { eventDate: "desc" },
    });

    return sendSuccessResponse(
      res,
      { events },
      "Chef events retrieved successfully"
    );
  } catch (error) {
    console.error("Get chef events error:", error);
    return sendErrorResponse(res, "Failed to retrieve chef events", 500);
  }
});

// Get event by ID (public endpoint with secret verification)
router.get("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { secret } = req.query;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        chef: {
          select: {
            id: true,
            name: true,
            username: true,
            secret: true,
          },
        },
        eventOrders: {
          include: {
            eventOrderItems: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    customizationOptions: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            eventOrders: true,
          },
        },
      },
    });

    if (!event) {
      return sendErrorResponse(res, "Event not found", 404);
    }

    // Verify secret if provided (for viewing orders)
    if (secret && event.chef.secret !== secret) {
      return sendErrorResponse(res, "Invalid secret", 403);
    }

    // Remove secret from response
    const { chef, ...eventData } = event;
    const { secret: _, ...chefData } = chef;

    return sendSuccessResponse(
      res,
      { event: { ...eventData, chef: chefData } },
      "Event retrieved successfully"
    );
  } catch (error) {
    console.error("Get event error:", error);
    return sendErrorResponse(res, "Failed to retrieve event", 500);
  }
});

// Create event (protected endpoint)
router.post(
  "/",
  authenticateChef,
  validateRequest(eventSchema),
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { title, description, eventDate, maxOrders } = req.body;

      // Auto-generate title if not provided
      const eventDateTime = new Date(eventDate);
      const finalTitle =
        title ||
        eventDateTime.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

      const event = await prisma.event.create({
        data: {
          title: finalTitle,
          description,
          eventDate: eventDateTime,
          maxOrders,
          chefId,
        },
        include: {
          chef: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          _count: {
            select: {
              eventOrders: true,
            },
          },
        },
      });

      return sendSuccessResponse(
        res,
        { event },
        "Event created successfully",
        201
      );
    } catch (error) {
      console.error("Create event error:", error);
      return sendErrorResponse(res, "Failed to create event", 500);
    }
  }
);

// Update event (protected endpoint)
router.put(
  "/:eventId",
  authenticateChef,
  validateRequest(eventUpdateSchema),
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { eventId } = req.params;
      const updateData = req.body;

      // Check if event exists and belongs to the chef
      const existingEvent = await prisma.event.findFirst({
        where: {
          id: eventId,
          chefId,
        },
      });

      if (!existingEvent) {
        return sendErrorResponse(res, "Event not found", 404);
      }

      // Validate event date if provided
      if (updateData.eventDate) {
        updateData.eventDate = new Date(updateData.eventDate);
      }

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: updateData,
        include: {
          chef: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          _count: {
            select: {
              eventOrders: true,
            },
          },
        },
      });

      return sendSuccessResponse(
        res,
        { event: updatedEvent },
        "Event updated successfully"
      );
    } catch (error) {
      console.error("Update event error:", error);
      return sendErrorResponse(res, "Failed to update event", 500);
    }
  }
);

// Delete event (protected endpoint)
router.delete("/:eventId", authenticateChef, async (req, res) => {
  try {
    const chefId = req.chef!.chefId;
    const { eventId } = req.params;

    // Check if event exists and belongs to the chef
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        chefId,
      },
      include: {
        _count: {
          select: {
            eventOrders: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return sendErrorResponse(res, "Event not found", 404);
    }

    // Don't allow deletion if there are orders
    if (existingEvent._count.eventOrders > 0) {
      return sendErrorResponse(
        res,
        "Cannot delete event with existing orders. Consider cancelling the event instead.",
        400
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return sendSuccessResponse(res, {}, "Event deleted successfully");
  } catch (error) {
    console.error("Delete event error:", error);
    return sendErrorResponse(res, "Failed to delete event", 500);
  }
});

// Create event order (public endpoint)
router.post(
  "/:eventId/orders",
  validateRequest(eventOrderSchema),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const {
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
        items,
      } = req.body;

      // Check if event exists and is open for orders
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          chef: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              eventOrders: true,
            },
          },
        },
      });

      if (!event) {
        return sendErrorResponse(res, "Event not found", 404);
      }

      if (event.status !== "OPEN") {
        return sendErrorResponse(res, "Event is not open for orders", 400);
      }

      // Check if max orders limit is reached
      if (event.maxOrders && event._count.eventOrders >= event.maxOrders) {
        return sendErrorResponse(
          res,
          "Event has reached maximum order limit",
          400
        );
      }

      // Verify all menu items belong to the chef
      const menuItemIds = items.map((item: any) => item.menuItemId);
      const menuItems = await prisma.menuItem.findMany({
        where: {
          id: { in: menuItemIds },
          chefId: event.chef.id,
        },
      });

      if (menuItems.length !== menuItemIds.length) {
        return sendErrorResponse(
          res,
          "One or more menu items are invalid",
          400
        );
      }

      // Create the event order
      const eventOrder = await prisma.eventOrder.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          specialRequests,
          eventId,
          eventOrderItems: {
            create: items.map((item: any) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              specialNotes: item.specialNotes,
            })),
          },
        },
        include: {
          eventOrderItems: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  images: true,
                },
              },
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              eventDate: true,
            },
          },
        },
      });

      return sendSuccessResponse(
        res,
        { eventOrder },
        "Order placed successfully",
        201
      );
    } catch (error) {
      console.error("Create event order error:", error);
      return sendErrorResponse(res, "Failed to place order", 500);
    }
  }
);

// Update event order status (protected endpoint)
router.patch(
  "/:eventId/orders/:orderId",
  authenticateChef,
  validateRequest(eventOrderUpdateSchema),
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { eventId, orderId } = req.params;
      const { status } = req.body;

      // Verify event belongs to chef and order belongs to event
      const eventOrder = await prisma.eventOrder.findFirst({
        where: {
          id: orderId,
          eventId,
          event: {
            chefId,
          },
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!eventOrder) {
        return sendErrorResponse(res, "Order not found", 404);
      }

      const updatedOrder = await prisma.eventOrder.update({
        where: { id: orderId },
        data: { status },
        include: {
          eventOrderItems: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return sendSuccessResponse(
        res,
        { eventOrder: updatedOrder },
        "Order status updated successfully"
      );
    } catch (error) {
      console.error("Update event order error:", error);
      return sendErrorResponse(res, "Failed to update order status", 500);
    }
  }
);

export default router;
