"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary that lazy-loads the WebGL hero (three.js chunk stays out
 * of the initial route JS; App Router requires ssr:false inside 'use client').
 */
const HeroSpace = dynamic(() => import("./HeroSpace"), { ssr: false });

export function HeroSpaceClient() {
  return <HeroSpace />;
}
