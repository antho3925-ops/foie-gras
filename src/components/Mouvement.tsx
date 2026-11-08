"use client";

import { MotionConfig } from "motion/react";

/** Respecte le réglage « réduire les animations » du téléphone */
export function Mouvement({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
