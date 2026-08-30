"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./HomeExperience.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ArrowUpRight = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const ForkMark = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path d="M9 3v8M5 3v6c0 3 2 5 4 5s4-2 4-5V3M9 14v15M23 3v26M18 10c0-4 2-7 5-7v12h-5Z" />
  </svg>
);

const menuItems = [
  { name: "Miso eggplant", votes: 8, width: "88%", tone: "lime" },
  { name: "Chilli noodles", votes: 6, width: "68%", tone: "coral" },
  { name: "Sesame greens", votes: 4, width: "46%", tone: "cream" },
];

const steps = [
  {
    number: "01",
    eyebrow: "Set the table",
    title: "Build the menu you’d love to cook.",
    copy: "Add the dishes, details and event deadline. ForkCast turns it into one beautiful link for your guests.",
    accent: "coral",
  },
  {
    number: "02",
    eyebrow: "Pass it around",
    title: "Guests choose. No account, no group-chat chaos.",
    copy: "Friends open the link, pick their favourites and leave dietary notes. Their choices arrive in one place.",
    accent: "lime",
  },
  {
    number: "03",
    eyebrow: "Cook the signal",
    title: "See real demand before the first chop.",
    copy: "Know what people want and how much to prepare. Less guessing, less waste, more of the good stuff.",
    accent: "blue",
  },
];

export default function HomeExperience() {
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 900px) and (min-height: 700px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) {
            return;
          }

          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .from("[data-hero-line]", {
              yPercent: 115,
              stagger: 0.08,
              duration: 1.05,
            })
            .from(
              "[data-hero-copy]",
              { y: 24, autoAlpha: 0, duration: 0.65 },
              "-=0.55",
            )
            .from(
              "[data-hero-action]",
              { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.55 },
              "-=0.4",
            )
            .from(
              "[data-menu-card]",
              {
                x: desktop ? 70 : 0,
                y: desktop ? 0 : 32,
                rotation: 3,
                autoAlpha: 0,
                duration: 0.9,
              },
              "-=0.8",
            )
            .from(
              "[data-float-card]",
              { scale: 0.82, autoAlpha: 0, stagger: 0.12, duration: 0.55 },
              "-=0.45",
            );

          gsap.to("[data-float='one']", {
            y: -10,
            rotation: -2,
            duration: 2.6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
          gsap.to("[data-float='two']", {
            y: 9,
            rotation: 2,
            duration: 3.1,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });

          gsap.fromTo(
            "[data-scroll-progress]",
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: pageRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.2,
              },
            },
          );

          gsap
            .timeline({
              scrollTrigger: {
                trigger: "[data-hero]",
                start: "top top",
                end: "bottom top",
                scrub: 0.8,
              },
            })
            .to(
              "[data-hero-copy-wrap]",
              { yPercent: -18, autoAlpha: 0, ease: "none" },
              0,
            )
            .to(
              "[data-menu-stage]",
              {
                yPercent: desktop ? 22 : 10,
                rotation: desktop ? -3 : 0,
                scale: desktop ? 0.88 : 0.95,
                autoAlpha: 0.16,
                ease: "none",
              },
              0,
            )
            .to(
              "[data-hero-glow]",
              { yPercent: 28, scale: 1.3, ease: "none" },
              0,
            )
            .to("[data-scroll-cue]", { x: 90, autoAlpha: 0, ease: "none" }, 0);

          gsap.fromTo(
            "[data-manifesto-word]",
            { y: 30, autoAlpha: 0.14 },
            {
              y: 0,
              autoAlpha: 1,
              stagger: 0.08,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-manifesto]",
                start: "top 72%",
                end: "bottom 42%",
                scrub: 0.7,
              },
            },
          );

          gsap.utils
            .toArray<HTMLElement>("[data-reveal]")
            .forEach((element) => {
              gsap.from(element, {
                y: 54,
                autoAlpha: 0,
                duration: 0.85,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: element,
                  start: "clamp(top 86%)",
                  once: true,
                },
              });
            });

          const storyCards =
            gsap.utils.toArray<HTMLElement>("[data-story-card]");

          if (desktop) {
            gsap.set(storyCards, {
              y: 24,
              scale: 0.93,
              rotation: (index) => (index - 1) * 2.5,
              autoAlpha: 0.24,
            });

            const storyTimeline = gsap.timeline({
              defaults: { ease: "power2.out" },
              scrollTrigger: {
                trigger: "[data-story-section]",
                start: "top top",
                end: () => `+=${window.innerHeight * 1.8}`,
                pin: true,
                scrub: 0.75,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });

            storyCards.forEach((card, index) => {
              const visual = card.querySelector("[data-story-visual]");
              const content = card.querySelectorAll("[data-story-content] > *");

              storyTimeline
                .to(
                  card,
                  {
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    autoAlpha: 1,
                    duration: 0.8,
                  },
                  index,
                )
                .from(
                  visual,
                  {
                    scale: 0.65,
                    rotation: -8,
                    duration: 0.65,
                    ease: "back.out(1.4)",
                    immediateRender: false,
                  },
                  index + 0.08,
                )
                .from(
                  content,
                  {
                    y: 18,
                    autoAlpha: 0,
                    stagger: 0.08,
                    duration: 0.45,
                    immediateRender: false,
                  },
                  index + 0.14,
                )
                .to(
                  `[data-story-progress='${index}']`,
                  { scaleX: 1, duration: 0.72, ease: "none" },
                  index,
                );

              if (index < storyCards.length - 1) {
                storyTimeline.to(
                  card,
                  { y: -16, scale: 0.96, autoAlpha: 0.5, duration: 0.45 },
                  index + 0.72,
                );
              }
            });

            gsap
              .timeline({
                scrollTrigger: {
                  trigger: "[data-proof]",
                  start: "top 78%",
                  end: "bottom 26%",
                  scrub: 0.9,
                },
              })
              .from("[data-proof-copy]", { x: 90, autoAlpha: 0 }, 0)
              .from(
                "[data-proof-note]",
                { x: 80, autoAlpha: 0, stagger: 0.18 },
                0.12,
              )
              .to("[data-orbit]", { rotation: 155, ease: "none" }, 0)
              .to("[data-orbit-label]", { rotation: -155, ease: "none" }, 0);

            gsap.from("[data-role-intro]", {
              y: 54,
              autoAlpha: 0,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: "[data-role-intro]",
                start: "clamp(top 86%)",
                once: true,
              },
            });

            gsap.fromTo(
              "[data-role-card]",
              {
                xPercent: (index) => (index === 0 ? -12 : 12),
                rotation: (index) => (index === 0 ? -3 : 3),
              },
              {
                xPercent: 0,
                rotation: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: "[data-role-grid]",
                  start: "top bottom",
                  end: "center 55%",
                  scrub: 0.8,
                },
              },
            );
          } else {
            storyCards.forEach((card) => {
              gsap.from(card, {
                y: 54,
                autoAlpha: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "clamp(top 86%)",
                  once: true,
                },
              });
            });

            gsap.utils
              .toArray<HTMLElement>(
                "[data-proof-copy], [data-proof-note], [data-role-intro], [data-role-card]",
              )
              .forEach((element) => {
                gsap.from(element, {
                  y: 44,
                  autoAlpha: 0,
                  duration: 0.75,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: element,
                    start: "clamp(top 88%)",
                    once: true,
                  },
                });
              });
          }

          gsap
            .timeline({
              scrollTrigger: {
                trigger: "[data-final-cta]",
                start: "top bottom",
                end: "center center",
                scrub: 0.8,
              },
            })
            .from("[data-final-copy]", { y: 90, autoAlpha: 0 }, 0)
            .from(
              "[data-final-mark]",
              { rotation: -140, scale: 0.45, autoAlpha: 0 },
              0,
            )
            .from(
              "[data-final-action]",
              { rotation: -18, scale: 0.55, autoAlpha: 0 },
              0.12,
            );
        },
      );

      return () => mm.revert();
    },
    { scope: pageRef },
  );

  return (
    <div ref={pageRef} className={styles.page}>
      <div
        className={styles.scrollProgress}
        data-scroll-progress
        aria-hidden="true"
      />
      <section className={styles.hero} data-hero>
        <div className={styles.heroGlow} data-hero-glow aria-hidden="true" />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-hero-copy-wrap>
            <div className={styles.kicker} data-hero-copy>
              <span className={styles.liveDot} />A better forecast for dinner
            </div>
            <h1
              className={styles.heroTitle}
              aria-label="Know what they want before you cook"
            >
              <span className={styles.lineMask}>
                <span data-hero-line>Know what</span>
              </span>
              <span className={styles.lineMask}>
                <span data-hero-line>
                  <em>they want</em>
                </span>
              </span>
              <span className={styles.lineMask}>
                <span data-hero-line>before you cook.</span>
              </span>
            </h1>
            <p className={styles.heroLead} data-hero-copy>
              Share your menu. Let every guest choose. Cook with a clear count,
              not a hunch.
            </p>
            <div className={styles.heroActions}>
              <Link
                href="/chef/signup"
                className={styles.primaryButton}
                data-hero-action
              >
                Create your menu <ArrowUpRight />
              </Link>
              <Link
                href="/guest"
                className={styles.textButton}
                data-hero-action
              >
                I’m joining a table <span>→</span>
              </Link>
            </div>
            <div className={styles.microProof} data-hero-copy>
              <span>
                <Check /> Free for hosts
              </span>
              <span>
                <Check /> No guest sign-up
              </span>
              <span>
                <Check /> Ready in minutes
              </span>
            </div>
          </div>

          <div
            className={styles.menuStage}
            data-menu-stage
            aria-label="Example ForkCast menu results"
          >
            <div className={styles.menuCard} data-menu-card>
              <div className={styles.menuTopline}>
                <div>
                  <span className={styles.menuLabel}>Saturday · 7:00 pm</span>
                  <h2>Laneway dinner</h2>
                </div>
                <span className={styles.responsePill}>12 replied</span>
              </div>
              <div className={styles.hostRow}>
                <div className={styles.avatarStack} aria-hidden="true">
                  <span>JM</span>
                  <span>SK</span>
                  <span>+8</span>
                </div>
                <p>Guest picks are rolling in</p>
              </div>
              <div className={styles.menuResults}>
                {menuItems.map((item) => (
                  <div className={styles.resultRow} key={item.name}>
                    <div className={styles.resultMeta}>
                      <span>{item.name}</span>
                      <strong>{item.votes} picks</strong>
                    </div>
                    <div className={styles.barTrack}>
                      <span
                        className={`${styles.barFill} ${styles[item.tone]}`}
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.menuFooter}>
                <span>3 dietary notes</span>
                <span>Closes Fri 5:00 pm</span>
              </div>
            </div>

            <div
              className={`${styles.floatingCard} ${styles.choiceCard}`}
              data-float-card
              data-float="one"
            >
              <span className={styles.choiceIcon}>
                <Check />
              </span>
              <p>
                <strong>Mia chose</strong>
                <br />
                Miso eggplant
              </p>
            </div>
            <div
              className={`${styles.floatingCard} ${styles.countCard}`}
              data-float-card
              data-float="two"
            >
              <span className={styles.countNumber}>12</span>
              <p>
                guests
                <br />
                <strong>counted</strong>
              </p>
            </div>
            <div className={styles.scribble} aria-hidden="true">
              <svg viewBox="0 0 190 110">
                <path d="M3 88c36-9 58-8 93-30 20-13 34-29 39-46m-14 8 15-10 2 18" />
              </svg>
              <span>less guesswork</span>
            </div>
          </div>
        </div>
        <div className={styles.scrollCue} data-scroll-cue aria-hidden="true">
          <span /> Scroll to see the handoff
        </div>
      </section>

      <section className={styles.manifesto} data-manifesto>
        <p className={styles.manifestoLabel} data-reveal>
          The dinner problem
        </p>
        <div
          className={styles.manifestoStatement}
          aria-label="What will everyone eat? Shouldn’t be the hardest part of bringing people together."
        >
          <span aria-hidden="true">
            {"“What will everyone eat?” shouldn’t be the hardest part of bringing people together."
              .split(" ")
              .map((word, index) => (
                <span
                  className={styles.manifestoWord}
                  data-manifesto-word
                  key={`${word}-${index}`}
                >
                  {word}
                </span>
              ))}
          </span>
        </div>
        <div className={styles.manifestoFooter} data-reveal>
          <p>
            ForkCast turns a scattered group chat into a useful cooking signal.
          </p>
          <span className={styles.forkBadge}>
            <ForkMark />
          </span>
        </div>
      </section>

      <section
        id="how-it-works"
        className={styles.storySection}
        data-story-section
      >
        <div className={styles.sectionHeading} data-reveal>
          <div>
            <span className={styles.sectionIndex}>01 / How it works</span>
            <h2>
              From menu idea
              <br />
              to <em>confident prep.</em>
            </h2>
          </div>
          <p>
            One simple handoff from host to guests, then straight back to the
            kitchen.
          </p>
        </div>

        <div className={styles.storyStage} data-story-stage>
          <div className={styles.storyProgress} aria-hidden="true">
            {steps.map((step, index) => (
              <span key={step.number}>
                <i data-story-progress={index} />
              </span>
            ))}
          </div>
          <div className={styles.storyGrid} data-story-grid>
            {steps.map((step) => (
              <article
                className={`${styles.storyCard} ${styles[step.accent]}`}
                key={step.number}
                data-story-card
              >
                <div className={styles.storyNumber}>{step.number}</div>
                <div
                  className={styles.storyVisual}
                  data-story-visual
                  aria-hidden="true"
                >
                  {step.number === "01" && (
                    <div className={styles.miniMenu}>
                      <span />
                      <span />
                      <span />
                      <b>+</b>
                    </div>
                  )}
                  {step.number === "02" && (
                    <div className={styles.shareVisual}>
                      <span>send</span>
                      <i>↗</i>
                      <b>3 new picks</b>
                    </div>
                  )}
                  {step.number === "03" && (
                    <div className={styles.signalVisual}>
                      <span style={{ height: "42%" }} />
                      <span style={{ height: "72%" }} />
                      <span style={{ height: "100%" }} />
                      <span style={{ height: "60%" }} />
                    </div>
                  )}
                </div>
                <div className={styles.storyContent} data-story-content>
                  <span>{step.eyebrow}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.proofSection} data-proof>
        <div className={styles.proofOrb} data-orbit aria-hidden="true">
          <span data-orbit-label>plan</span>
          <span data-orbit-label>pick</span>
          <span data-orbit-label>prep</span>
          <span data-orbit-label>plate</span>
          <div>
            <ForkMark />
          </div>
        </div>
        <div className={styles.proofCopy} data-proof-copy>
          <span className={styles.sectionIndex}>02 / Why it feels better</span>
          <h2>
            More yes.
            <br />
            <em>Less maybe.</em>
          </h2>
          <p>
            ForkCast gives everyone a tiny bit of certainty. Guests get food
            they’re excited about. Hosts get quantities they can trust.
          </p>
          <Link href="/host" className={styles.underlinedLink}>
            See the host experience <ArrowUpRight />
          </Link>
        </div>
        <div className={styles.proofNotes}>
          <article data-proof-note>
            <span>For the host</span>
            <h3>One dashboard, every choice.</h3>
            <p>
              Live totals and dietary notes make shopping and prep feel calm.
            </p>
          </article>
          <article data-proof-note>
            <span>For the guest</span>
            <h3>Tap in. Pick. Done.</h3>
            <p>
              No download or account. Just the menu your host meant you to see.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.roleSection}>
        <div className={styles.roleIntro} data-role-intro>
          <span className={styles.sectionIndex}>03 / Choose your seat</span>
          <h2>
            There’s room
            <br />
            at the table.
          </h2>
        </div>
        <div className={styles.roleGrid} data-role-grid>
          <div className={styles.roleMotion} data-role-card>
            <Link
              href="/chef/signup"
              className={`${styles.roleCard} ${styles.hostRole}`}
            >
              <span className={styles.roleEyebrow}>I’m cooking</span>
              <h3>
                Create the menu.
                <br />
                Lose the guesswork.
              </h3>
              <p>
                Build an event, share the link and see what your table wants.
              </p>
              <span className={styles.roleAction}>
                Start hosting <ArrowUpRight />
              </span>
              <span className={styles.roleStamp}>HOST</span>
            </Link>
          </div>
          <div className={styles.roleMotion} data-role-card>
            <Link
              href="/guest"
              className={`${styles.roleCard} ${styles.guestRole}`}
            >
              <span className={styles.roleEyebrow}>I’m eating</span>
              <h3>
                See the menu.
                <br />
                Claim your favourites.
              </h3>
              <p>Explore how ForkCast makes choosing easy for every guest.</p>
              <span className={styles.roleAction}>
                Explore as a guest <ArrowUpRight />
              </span>
              <span className={styles.roleStamp}>GUEST</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.finalCta} data-final-cta>
        <div className={styles.finalMark} data-final-mark>
          <ForkMark />
        </div>
        <div data-final-copy>
          <p>Tonight’s forecast</p>
          <h2>
            Everyone gets
            <br />
            <em>what they want.</em>
          </h2>
        </div>
        <div className={styles.finalAction} data-final-action>
          <Link href="/chef/signup" className={styles.ctaCircle}>
            <span>
              Create
              <br />a menu
            </span>
            <ArrowUpRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
