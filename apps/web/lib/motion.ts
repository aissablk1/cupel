import type { Transition, Variants } from 'motion/react';

export const ease = {
  out: [0.32, 0.72, 0, 1] as [number, number, number, number],
  in: [0.85, 0, 0.15, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

export const spring: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.out } },
};

export const fadeUpStagger: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: ease.out },
  }),
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: ease.out } },
};
