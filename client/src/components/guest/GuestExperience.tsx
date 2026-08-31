"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GuestFAQ from "./GuestFAQ";
import styles from "./GuestExperience.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ArrowUpRight = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const ArrowDown = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.14-1.14" />
  </svg>
);

const KeyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 8-8M15 8l3 3M17 6l3 3" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    <path d="M8 9h8M8 13h5" />
  </svg>
);

const guestSteps = [
  {
    number: "01",
    title: "Open your invitation",
    description:
      "Use the menu link your host sent by text, email, or group chat.",
    icon: <LinkIcon />,
  },
  {
    number: "02",
    title: "Enter the shared secret",
    description:
      "The host’s secret keeps their gathering private and opens the right menu.",
    icon: <KeyIcon />,
  },
  {
    number: "03",
    title: "Choose what sounds good",
    description:
      "Pick dishes and leave dietary notes so your host can plan with confidence.",
    icon: <MenuIcon />,
  },
  {
    number: "04",
    title: "Come back if plans change",
    description:
      "Use the same invitation to update your choices before the host’s deadline.",
    icon: <MessageIcon />,
  },
];

const guestBenefits = [
  {
    number: "01",
    title: "No account to manage",
    copy: "Your host’s invitation is your access. There is no guest sign-up or app download between you and the menu.",
  },
  {
    number: "02",
    title: "No dinner guesswork",
    copy: "See the choices before the gathering and tell your host what you would genuinely enjoy eating.",
  },
  {
    number: "03",
    title: "Your needs travel with the choice",
    copy: "Add dietary requirements or requests while you select, where the host can see them during planning.",
  },
];

export default function GuestExperience() {
  const pageRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 900px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) return;

          const intro = gsap.timeline({
            defaults: { duration: 0.72, ease: "power3.out" },
          });

          intro
            .from("[data-guest-line]", {
              yPercent: 110,
              stagger: 0.08,
              duration: 0.95,
            })
            .from(
              "[data-guest-intro]",
              { y: 24, autoAlpha: 0, stagger: 0.08 },
              "-=0.52",
            )
            .from(
              "[data-invite-card]",
              {
                x: desktop ? 68 : 0,
                y: desktop ? 0 : 32,
                rotation: 3,
                autoAlpha: 0,
                duration: 0.9,
              },
              "-=0.72",
            )
            .from(
              "[data-invite-status]",
              { scale: 0.78, autoAlpha: 0, ease: "back.out(1.5)" },
              "-=0.3",
            );

          gsap.fromTo(
            "[data-scroll-progress]",
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: pageRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.2,
              },
            },
          );

          gsap.to("[data-invite-card]", {
            yPercent: desktop ? 12 : 5,
            rotation: desktop ? -1.5 : 0,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-guest-hero]",
              start: "top top",
              end: "bottom top",
              scrub: 0.7,
            },
          });

          gsap.from("[data-step-card]", {
            y: 52,
            autoAlpha: 0,
            stagger: 0.12,
            duration: 0.82,
            ease: "power3.out",
            scrollTrigger: {
              trigger: "[data-step-grid]",
              start: "clamp(top 82%)",
              once: true,
            },
          });

          gsap.utils
            .toArray<HTMLElement>("[data-reveal]")
            .forEach((element) => {
              gsap.from(element, {
                y: 44,
                autoAlpha: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: element,
                  start: "clamp(top 86%)",
                  once: true,
                },
              });
            });
        },
      );

      return () => mm.revert();
    },
    { scope: pageRef },
  );

  return (
    <main ref={pageRef} className={styles.page}>
      <div className={styles.scrollProgress} data-scroll-progress />

      <section className={styles.hero} data-guest-hero>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker} data-guest-intro>
              <span className={styles.liveDot} /> Guest access, explained
            </p>
            <h1 className={styles.heroTitle}>
              <span className={styles.lineMask}>
                <span data-guest-line>Your invite</span>
              </span>
              <span className={styles.lineMask}>
                <span data-guest-line>is all you</span>
              </span>
              <span className={styles.lineMask}>
                <span data-guest-line><em>need.</em></span>
              </span>
            </h1>
            <p className={styles.heroLead} data-guest-intro>
              Open the menu link from your host, enter their shared secret,
              and choose before they cook. No guest account required.
            </p>
            <div className={styles.heroActions} data-guest-intro>
              <Link href="/chefs" className={styles.primaryAction}>
                Browse host menus <ArrowUpRight />
              </Link>
              <a href="#how-it-works" className={styles.secondaryAction}>
                See how it works <ArrowDown />
              </a>
            </div>
            <ul className={styles.heroProof} data-guest-intro>
              <li><Check /> No sign-up</li>
              <li><Check /> Private access</li>
              <li><Check /> Clear choices</li>
            </ul>
          </div>

          <div className={styles.inviteStage} aria-hidden="true">
            <div className={styles.inviteHalo} />
            <div className={styles.inviteCard} data-invite-card>
              <div className={styles.inviteTopline}>
                <span>Saturday · 7:00 pm</span>
                <span className={styles.privatePill}>Private invite</span>
              </div>
              <p className={styles.invitedBy}>Mia invited you to</p>
              <h2>Laneway dinner</h2>
              <div className={styles.inviteRule} />
              <div className={styles.inviteStep}>
                <span className={styles.inviteStepNumber}>1</span>
                <div>
                  <strong>Open this menu</strong>
                  <p>forkcast.app/mia/laneway</p>
                </div>
                <span className={styles.doneMark}><Check /></span>
              </div>
              <div className={styles.inviteStep}>
                <span className={styles.inviteStepNumber}>2</span>
                <div>
                  <strong>Use the shared secret</strong>
                  <p className={styles.secretDots}>••••••••</p>
                </div>
                <span className={styles.openMark}><KeyIcon /></span>
              </div>
              <div className={styles.inviteFooter}>
                <span>No account needed</span>
                <span>Choices close Fri 5:00 pm</span>
              </div>
            </div>
            <div className={styles.inviteStatus} data-invite-status>
              <span className={styles.statusIcon}><Check /></span>
              <div><strong>You’re in</strong><span>Menu unlocked</span></div>
            </div>
          </div>
        </div>
        <a href="#how-it-works" className={styles.scrollCue} data-guest-intro>
          <span>Follow the invitation</span><ArrowDown />
        </a>
      </section>

      <aside className={styles.signalStrip} aria-label="Guest access summary">
        <div>Host sends the link</div><span aria-hidden="true" />
        <div>Guest makes the choices</div><span aria-hidden="true" />
        <div>Everyone arrives informed</div>
      </aside>

      <section id="how-it-works" className={styles.stepsSection}>
        <div className={styles.sectionIntro} data-reveal>
          <p className={styles.sectionIndex}>01 · The guest flow</p>
          <h2>From message to menu in <em>four small steps.</em></h2>
          <p>
            ForkCast keeps guest access lightweight while the host stays in
            control of who can respond.
          </p>
        </div>
        <div className={styles.stepGrid} data-step-grid>
          {guestSteps.map((step) => (
            <article className={styles.stepCard} data-step-card key={step.number}>
              <div className={styles.stepMeta}>
                <span>{step.number}</span>
                <div className={styles.stepIcon}>{step.icon}</div>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.benefitsSection}>
        <div className={styles.benefitsHeading} data-reveal>
          <p className={styles.sectionIndex}>02 · Why it feels easier</p>
          <h2>Less admin. More anticipation.</h2>
        </div>
        <div className={styles.benefitList}>
          {guestBenefits.map((benefit) => (
            <article className={styles.benefitRow} data-reveal key={benefit.number}>
              <span className={styles.benefitNumber}>{benefit.number}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <GuestFAQ />

      <section className={styles.finalCta}>
        <div className={styles.finalCtaCopy} data-reveal>
          <p className={styles.sectionIndex}>Ready when you are</p>
          <h2>Find the menu that starts your <em>next good dinner.</em></h2>
        </div>
        <Link href="/chefs" className={styles.finalAction} data-reveal>
          Browse host menus <ArrowUpRight />
        </Link>
      </section>
    </main>
  );
}
