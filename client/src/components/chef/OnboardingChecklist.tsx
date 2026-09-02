"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Chef {
  id: string;
  secret: string;
}

interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionButton?: {
    text: string;
    href: string;
  };
  icon: string;
}

interface OnboardingChecklistProps {
  chef: Chef;
}

export default function OnboardingChecklist({
  chef,
}: OnboardingChecklistProps) {
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProgress();
  }, [chef]);

  const checkProgress = async () => {
    try {
      // Check for menu items
      const menuResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu/items?chefId=${chef.id}&secret=${chef.secret}`,
        { credentials: "include" },
      );
      const menuData = menuResponse.ok ? await menuResponse.json() : null;
      const hasMenuItems = menuData?.data?.menuItems?.length > 0;

      // Check for events
      const eventsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events?chefId=${chef.id}&secret=${chef.secret}`,
        { credentials: "include" },
      );
      const eventsData = eventsResponse.ok ? await eventsResponse.json() : null;
      const hasEvents = eventsData?.data?.events?.length > 0;

      // Check if user has confirmed or rejected any orders
      const hasProcessedOrders =
        eventsData?.data?.events?.some((event: any) =>
          event.eventOrders?.some(
            (order: any) =>
              order.status === "CONFIRMED" || order.status === "CANCELLED",
          ),
        ) || false;

      const checklistTasks: ChecklistTask[] = [
        {
          id: "menu",
          title: "Create Your First Menu Item",
          description:
            "Add at least one dish so guests have something to order",
          completed: hasMenuItems,
          actionButton: {
            text: "Add Menu Item",
            href: "/chef/menu",
          },
          icon: "🍽️",
        },
        {
          id: "event",
          title: "Create a New Event",
          description:
            "Guests can only place orders when there is an active event",
          completed: hasEvents,
          actionButton: {
            text: "Create Event",
            href: "/chef/events",
          },
          icon: "📅",
        },
        {
          id: "orders",
          title: "Process Your First Order",
          description: "Confirm or reject at least one guest order",
          completed: hasProcessedOrders,
          actionButton: hasProcessedOrders
            ? undefined
            : {
                text: "View Orders",
                href: "/chef/events",
              },
          icon: "📋",
        },
      ];

      setTasks(checklistTasks);
    } catch (error) {
      console.error("Error checking onboarding progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length; // All tasks are now trackable

  if (loading) {
    return null; // Don't show loading state for this compact component
  }

  // Don't show checklist if all trackable tasks are completed
  if (completedTasks >= totalTasks) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Getting Started
      </h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`fc-feedback flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between ${
              task.completed
                ? "fc-feedback-success"
                : "fc-feedback-warning"
            }`}
          >
            <div className="flex min-w-0 items-center space-x-3">
              <span className="text-lg">
                {task.completed ? "✅" : task.icon}
              </span>
              <div className="min-w-0">
                <h4
                  className={`text-sm font-medium ${
                    task.completed ? "text-success" : "text-gray-900"
                  }`}
                >
                  {task.title}
                </h4>
                <p
                  className={`text-xs ${
                    task.completed ? "text-success" : "text-gray-600"
                  }`}
                >
                  {task.description}
                </p>
              </div>
            </div>

            {task.actionButton && !task.completed && (
              <Link
                href={task.actionButton.href}
                className="fc-button fc-button-primary text-xs"
              >
                {task.actionButton.text}
              </Link>
            )}

            {task.completed && (
              <span className="self-start text-success text-xs font-medium sm:self-auto">
                Complete
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
