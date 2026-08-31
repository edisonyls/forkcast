import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomeExperience from "./HomeExperience";

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn(),
}));

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

describe("HomeExperience", () => {
  it("renders the primary value proposition and example menu", () => {
    const { container } = render(<HomeExperience />);
    const menuCard = container.querySelector("[data-menu-card]");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Know what they want before you cook",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Example ForkCast menu results"),
    ).toHaveTextContent("Laneway dinner");
    expect(menuCard).not.toBeNull();
    expect(
      within(menuCard as HTMLElement).getByText("Miso eggplant"),
    ).toBeInTheDocument();
    expect(within(menuCard as HTMLElement).getByText("12 replied")).toBeInTheDocument();
  });

  it("keeps the host, guest, and returning-host entry points intact", () => {
    render(<HomeExperience />);

    expect(
      screen.getByRole("link", { name: /Host a meal/i }),
    ).toHaveAttribute("href", "/chef/signup");
    expect(
      screen.getByRole("link", { name: /Join as a guest/i }),
    ).toHaveAttribute("href", "/guest");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/chef/signin",
    );
  });

  it("renders the complete How it works flow in order", () => {
    const { container } = render(<HomeExperience />);
    const howItWorks = container.querySelector("#how-it-works");

    expect(howItWorks).not.toBeNull();
    const cards = within(howItWorks as HTMLElement).getAllByRole("article");

    expect(cards).toHaveLength(3);
    expect(cards.map((card) => card.textContent)).toEqual([
      expect.stringContaining("Build the menu you’d love to cook."),
      expect.stringContaining("Guests choose. No account, no group-chat chaos."),
      expect.stringContaining("See real demand before the first chop."),
    ]);
  });

  it("keeps the final call to action linked to host signup", () => {
    const { container } = render(<HomeExperience />);
    const finalCta = container.querySelector("[data-final-cta]");

    expect(finalCta).not.toBeNull();
    expect(
      within(finalCta as HTMLElement).getByRole("link", {
        name: /Create\s*a menu/i,
      }),
    ).toHaveAttribute("href", "/chef/signup");
  });
});

describe("HomeExperience responsive CSS contracts", () => {
  const css = readFileSync(
    join(process.cwd(), "src/components/home/HomeExperience.module.css"),
    "utf8",
  );

  const ruleBodies = (selector: string) => {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [
      ...css.matchAll(
        new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "g"),
      ),
    ].map((match) => match[1].replace(/\s+/g, " "));
  };

  it("constrains the story stage so its cards scroll inside the viewport", () => {
    expect(
      ruleBodies(".storyStage").some((body) => /min-width:\s*0;/.test(body)),
    ).toBe(true);

    expect(
      ruleBodies(".storyGrid").some(
        (body) =>
          /grid-auto-flow:\s*column;/.test(body) &&
          /overflow-x:\s*auto;/.test(body) &&
          /scroll-snap-type:\s*inline mandatory;/.test(body),
      ),
    ).toBe(true);
  });

  it("limits mandatory vertical snapping to short desktop windows", () => {
    expect(css).toMatch(
      /@media\s*\(min-width:\s*821px\)\s*and\s*\(max-height:\s*699px\)\s*\{[\s\S]*?:global\(html\):has\(\.page\)\s*\{[\s\S]*?scroll-snap-type:\s*y mandatory;/,
    );
    expect(css).not.toMatch(
      /@media\s*\(max-height:\s*699px\)\s*\{\s*:global\(html\):has\(\.page\)/,
    );
  });
});
