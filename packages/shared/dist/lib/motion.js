import { spring } from "motion/react";
export const buttonTapScale = 0.97;
export const springPresets = {
    snappy: {
        stiffness: 500,
        damping: 30,
        mass: 1,
    },
    smooth: {
        stiffness: 300,
        damping: 30,
        mass: 1,
    },
    gentle: {
        stiffness: 200,
        damping: 25,
        mass: 1,
    },
    bouncy: {
        stiffness: 400,
        damping: 30,
        mass: 1,
    },
};
export const animateEnter = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};
export const animateSlideIn = {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 8 },
};
export const fadeInOut = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};
export const defaultTransition = spring({ stiffness: 300, damping: 30 });
