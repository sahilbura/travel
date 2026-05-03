"use client";

import React, { useRef } from "react";
import Image from "next/image";
import bgImages from "@/constants";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import RevealedContent from "./RevealSection"; // Adjust if needed
import CustomCursor from "./ui/CustomCursor";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const DURATION = 1.5;
const INTERVAL = 4;

const Hero = () => {
  const router = useRouter();
  const { data: session } = useSession(); // ✅ Replaces useAuth
  const user = session?.user;

  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const revealedContentRef = useRef<HTMLDivElement | null>(null);

  // Background slideshow
  useGSAP(() => {
    gsap.set(imageRefs.current, { opacity: 0, scale: 1.1, zIndex: 0 });
    gsap.set(imageRefs.current[0], { opacity: 1, scale: 1, zIndex: 1 });

    const timeline = gsap.timeline({ repeat: -1, defaults: { ease: "power1.Out" } });

    for (let i = 0; i < bgImages.length; i++) {
      const next = (i + 1) % bgImages.length;
      timeline.addLabel(`show${next}`);
      timeline.to(imageRefs.current[next], { opacity: 1, scale: 1, zIndex: 2, duration: DURATION }, `show${next}`);
      timeline.to(imageRefs.current[i], { opacity: 0, scale: 1.1, zIndex: 1, duration: DURATION }, `show${next}`);
      timeline.set(imageRefs.current[i], { zIndex: 0 }, `show${next}+=${DURATION}`);
    }
    timeline.timeScale(1 / INTERVAL);

    return () => timeline.kill();
  }, []);

  // Scroll-triggered animations
  useGSAP(() => {
    if (!mainRef.current || !revealedContentRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: mainRef.current,
        start: "top top",
        end: "+=150%",
        scrub: true,
        pin: true,
      },
    });

    tl.fromTo(
      revealedContentRef.current,
      { clipPath: "circle(0% at 50% 50%)" },
      { clipPath: "circle(100% at 50% 50%)", ease: "power2.inOut" }
    );

    tl.fromTo(
      ".revealed-fade",
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out" },
      "-=0.5"
    );

    tl.from(".revealed-text", {
      y: 50,
      opacity: 0,
      stagger: 0.2,
      duration: 1,
      ease: "power4.out",
    }, "-=0.2");

    tl.fromTo(
      ".revealed-img",
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.2, ease: "expo.out" },
      "-=0.2"
    );
  }, { scope: mainRef });

  // Initial hero animation
  useGSAP(() => {
    const tl2 = gsap.timeline();
    tl2.from(".hero-heading", {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    })
    .from(".hero-subtext", {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    })
    .fromTo(".hero-btn", {
      scale: 0.8,
      opacity: 0,
    }, {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.7)",
    }, "-=0.1");
  }, { scope: mainRef });

  return (
    <div ref={mainRef} className="relative w-full min-h-screen custom-cursor">
      <CustomCursor />
      <section
        ref={heroSectionRef}
        className="absolute inset-0 w-full h-full z-[1] overflow-hidden"
      >
        {bgImages.map((image, index) => (
          <div
            key={index}
            ref={el => { imageRefs.current[index] = el; }}
            className="absolute inset-0 w-full h-full opacity-0 z-0 will-change-transform will-change-opacity"
          >
            <Image
              className="object-cover"
              src={image}
              alt={`Background ${index + 1}`}
              fill
              priority={index === 0}
              draggable={false}
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-black opacity-45 z-10"></div>

        <div className="relative h-full flex items-center z-20 px-6 text-white">
          <div className="max-w-3xl text-left">
            <h1 className="text-3xl sm:text-5xl md:text-5xl font-bold leading-tight drop-shadow-xl hero-heading">
              Effortless Journeys, <br /> Incredible Discoveries.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-zinc-100 font-light drop-shadow hero-subtext">
              We meticulously craft elegant, culture-rich itineraries, so you can simply explore and discover.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  if (user?.id) router.push("/dashboard");
                  else router.push("/auth/signup");
                }}
                className="bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-black font-semibold px-8 py-3 rounded-full transition duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform hero-btn inline-flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => router.push("/contact")}
                className="px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition duration-300 transform hover:scale-105 hero-btn"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white text-center flex flex-col items-center animate-bounce-y">
          <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="text-sm tracking-wide uppercase font-medium">Scroll Down</span>
        </div>
      </section>

      <RevealedContent ref={revealedContentRef} />
    </div>
  );
};

export default Hero;
