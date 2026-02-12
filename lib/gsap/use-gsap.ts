"use client";

import { useGSAP } from "@gsap/react";
import { registerGSAP } from "./register";
import { useLayoutEffect, useRef } from "react";

export const useGsap = (
    callback: gsap.ContextFunc,
    dependencies: React.DependencyList = []
) => {
    const scope = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        registerGSAP();
    }, []);

    useGSAP(callback, { scope, dependencies: Array.from(dependencies) });

    return scope;
};
