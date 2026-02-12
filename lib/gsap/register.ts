"use client";

import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
let scrollBehaviorInitialized = false;
let resizeTimeout: number | undefined;
let orientationTimeout: number | undefined;

const initScrollBehavior = () => {
    if (scrollBehaviorInitialized || typeof window === "undefined") return;
    scrollBehaviorInitialized = true;

    document.documentElement.classList.add("gsap-nosmooth");

    ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    });

    if (typeof ScrollTrigger.normalizeScroll === "function") {
        ScrollTrigger.normalizeScroll({
            allowNestedScroll: true,
            lockAxis: true,
            type: "pointer,touch,wheel",
        });
    }

    window.addEventListener(
        "resize",
        () => {
            window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(() => {
                ScrollTrigger.refresh();
            }, 120);
        },
        { passive: true }
    );

    window.addEventListener(
        "orientationchange",
        () => {
            window.clearTimeout(orientationTimeout);
            orientationTimeout = window.setTimeout(() => {
                ScrollTrigger.refresh();
            }, 280);
        },
        { passive: true }
    );

    if (document.readyState === "complete") {
        requestAnimationFrame(() => ScrollTrigger.refresh());
    } else {
        window.addEventListener(
            "load",
            () => requestAnimationFrame(() => ScrollTrigger.refresh()),
            { once: true, passive: true }
        );
    }
};

export const registerGSAP = () => {
    if (typeof window === "undefined") return;

    if (!registered) {
        gsap.registerPlugin(ScrollTrigger, Observer);
        registered = true;
    }

    initScrollBehavior();
};
