"use client";

/**
 * Single GSAP registration point — deep imports only (never "gsap/all").
 * Everything animation-related imports from here so plugins register once.
 */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

export { gsap, useGSAP, ScrollTrigger, DrawSVGPlugin };
