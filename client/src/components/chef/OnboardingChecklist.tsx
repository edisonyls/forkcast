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
          title: "Create your first menu item",
          description: "Add a dish so guests have something to order",
          completed: hasMenuItems,
          actionButton: {
            text: "Add menu item",
            href: "/chef/menu",
          },
        },
        {
          id: "event",
          title: "Open an event",
          description: "Guests can only order while an event is open",
          completed: hasEvents,
          actionButton: {
            text: "Create event",
            href: "/chef/events",
          },
        },
        {
          id: "orders",
          title: "Process your first order",
          description: "Confirm or reject at least one guest order",
          completed: hasProcessedOrders,
          actionButton: hasProcessedOrders
            ? undefined
            : {
                text: "View orders",
                href: "/chef/events",
              },
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
    <section className="fc-panel mt-6 sm:mt-8">
      <div className="fc-panel-header">
        <div>
          <p className="fc-eyebrow">Getting started</p>
          <h2 className="fc-panel-title">Three steps to your first order</h2>
        </div>
        <p className="fc-mono m-0 text-sm text-text-subtle">
          {completedTasks}/{totalTasks} done
        </p>
      </div>

      <ol className="fc-list m-0 list-none p-0">
        {tasks.map((task, index) => (
          <li key={task.id} className="fc-row items-center">
            <div className="flex min-w-0 items-center gap-4">
              <span
                className={`fc-index ${
                  task.completed ? "fc-index-done" : "fc-index-active"
                }`}
                aria-hidden="true"
              >
                {task.completed ? "✓" : index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="m-0 text-sm font-semibold text-ink">
                  {task.title}
                </h3>
                <p className="mt-1 mb-0 text-xs text-text-muted">
                  {task.description}
                </p>
              </div>
            </div>

            {task.completed ? (
              <span className="fc-badge fc-badge-success">Complete</span>
            ) : (
              task.actionButton && (
                <Link
                  href={task.actionButton.href}
                  className="fc-button fc-button-secondary text-sm"
                >
                  {task.actionButton.text}
                </Link>
              )
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
