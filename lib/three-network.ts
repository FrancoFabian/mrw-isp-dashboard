// lib/three-network.ts
import type * as THREE from "three";

export async function mountThreeNetwork(host: HTMLElement) {
    type Vec2 = [number, number];

    interface Config {
        BASE_POINTS: number;
        MIN_POINTS: number;
        MAX_POINTS: number;
        LINK_DIST: number;
        MAX_NEIGHBORS: number;
        DOT_SIZE: number;
        DOT_ALPHA: number;
        LINE_WIDTH_PX: number;
        LINE_GLOW_WIDTH_PX: number;
        LINE_ALPHA: number;
        LINE_GLOW_ALPHA: number;
        SPEED_DESKTOP: number;
        SPEED_MOBILE: number;
        DPR_DESKTOP_MAX: number;
        DPR_MOBILE_MAX: number;
        BREATH_SCALE: number;
        BREATH_DUR: number;
    }

    interface State {
        w: number;
        h: number;
        dpr: number;
        isMobile: boolean;
        reduce: boolean;
        color: THREE.Color;
    }

    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        tx: number;
        ty: number;
        change: number;
    }

    const CFG: Config = {
        BASE_POINTS: 130,
        MIN_POINTS: 60,
        MAX_POINTS: 220,
        LINK_DIST: 140,
        MAX_NEIGHBORS: 5,
        DOT_SIZE: 3.0,
        DOT_ALPHA: 0.95,
        LINE_WIDTH_PX: 1.2,
        LINE_GLOW_WIDTH_PX: 2.6,
        LINE_ALPHA: 0.55,
        LINE_GLOW_ALPHA: 0.12,
        SPEED_DESKTOP: 12,
        SPEED_MOBILE: 9,
        DPR_DESKTOP_MAX: 2.0,
        DPR_MOBILE_MAX: 1.5,
        BREATH_SCALE: 2.03,
        BREATH_DUR: 10,
    };

    const S: State = {
        w: 0,
        h: 0,
        dpr: 1,
        isMobile: typeof window !== "undefined" ? window.matchMedia("(pointer: coarse)").matches : false,
        reduce:
            typeof window !== "undefined"
                ? window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                !!((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
                : false,
        color: { r: 0, g: 0.65, b: 0.84 } as unknown as THREE.Color,
    };

    const rand = (a: number, b: number) => Math.random() * (b - a) + a;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function resolveThemeColor(ColorCtor: typeof import("three").Color): THREE.Color {
        try {
            if (typeof document === "undefined" || !document.body) {
                const c = new ColorCtor();
                c.setStyle("#0aa5d6");
                return c;
            }

            const probe = document.createElement("span");
            probe.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
            probe.style.color = "var(--color-primary, var(--network-blue-dark, #0aa5d6))";
            document.body.appendChild(probe);

            let css = "";
            try {
                css = getComputedStyle(probe).color || "";
            } catch (e) {
                console.warn("Failed to get computed style for theme color", e);
            }

            if (probe.parentNode) document.body.removeChild(probe);

            if (/oklch|color\(/i.test(css)) {
                const p2 = document.createElement("span");
                p2.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
                p2.style.color = "var(--network-blue-dark, #0aa5d6)";
                document.body.appendChild(p2);
                try {
                    css = getComputedStyle(p2).color || "#0aa5d6";
                } catch {
                    css = "#0aa5d6";
                }
                if (p2.parentNode) document.body.removeChild(p2);
            }

            const c = new ColorCtor();
            c.setStyle(css || "#0aa5d6");
            return c;
        } catch (e) {
            console.error("Error resolving theme color:", e);
            const c = new ColorCtor();
            c.setStyle("#0aa5d6");
            return c;
        }
    }

    // Lazy load when container is visible
    const visible = await new Promise<boolean>((resolve) => {
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    io.disconnect();
                    resolve(true);
                }
            },
            { rootMargin: "150px" }
        );
        io.observe(host);
    });
    if (!visible) return;

    // Dynamic import for code splitting
    const [THREE, LineSegments2Mod, LineSegmentsGeometryMod, LineMaterialMod] = await Promise.all([
        import("three"),
        import("three/addons/lines/LineSegments2.js"),
        import("three/addons/lines/LineSegmentsGeometry.js"),
        import("three/addons/lines/LineMaterial.js"),
    ]);

    const {
        WebGLRenderer,
        OrthographicCamera,
        Scene,
        Points,
        BufferGeometry,
        PointsMaterial,
        BufferAttribute,
        CanvasTexture,
        AdditiveBlending,
        Color,
        SRGBColorSpace,
    } = THREE;

    const { LineSegments2 } = LineSegments2Mod;
    const { LineSegmentsGeometry } = LineSegmentsGeometryMod;
    const { LineMaterial } = LineMaterialMod;

    // Override config via data attributes
    const ds = host.dataset;
    if (ds.points) CFG.BASE_POINTS = parseFloat(ds.points);
    if (ds.dotSize) CFG.DOT_SIZE = parseFloat(ds.dotSize);
    if (ds.lineWidth) CFG.LINE_WIDTH_PX = parseFloat(ds.lineWidth);
    if (ds.lineGlow) CFG.LINE_GLOW_WIDTH_PX = parseFloat(ds.lineGlow);
    if (ds.linkDist) CFG.LINK_DIST = parseFloat(ds.linkDist);

    S.color = resolveThemeColor(Color);

    const renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
    });
    (renderer as unknown as { outputColorSpace: typeof SRGBColorSpace }).outputColorSpace = SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const camera = new OrthographicCamera(0, 1, 1, 0, -1000, 1000);
    const scene = new Scene();

    const pointsGroup = new Points<THREE.BufferGeometry, THREE.PointsMaterial>();
    scene.add(pointsGroup);

    let linesMain: InstanceType<typeof LineSegments2> | undefined;
    let linesGlow: InstanceType<typeof LineSegments2> | undefined;
    let matMain: InstanceType<typeof LineMaterial> | undefined;
    let matGlow: InstanceType<typeof LineMaterial> | undefined;
    let geoSeg: InstanceType<typeof LineSegmentsGeometry> | undefined;

    let P: Particle[] = [];
    let baseSpeed = S.isMobile ? CFG.SPEED_MOBILE : CFG.SPEED_DESKTOP;

    const neighbors: Vec2[] = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [0, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
    ];
    const grid = new Map<string, number[]>();
    let cellSize = CFG.LINK_DIST;

    let segPos!: Float32Array;
    let segGlowPos!: Float32Array;
    let segCol!: Float32Array;
    let maxPairsCap = 0;

    function makeDot(): THREE.CanvasTexture {
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const g = c.getContext("2d")!;
        const r = 32;
        const rgb = `rgba(${Math.round((S.color as unknown as { r: number }).r * 255)}, ${Math.round((S.color as unknown as { g: number }).g * 255)}, ${Math.round((S.color as unknown as { b: number }).b * 255)},`;
        const grd = g.createRadialGradient(r, r, 0, r, r, r);
        grd.addColorStop(0.0, `${rgb} 1)`);
        grd.addColorStop(0.5, `${rgb} 0.25)`);
        grd.addColorStop(1.0, `${rgb} 0)`);
        g.fillStyle = grd;
        g.beginPath();
        g.arc(r, r, r, 0, Math.PI * 2);
        g.fill();
        const tex = new CanvasTexture(c);
        (tex as unknown as { colorSpace: typeof SRGBColorSpace }).colorSpace = SRGBColorSpace;
        return tex;
    }

    function ensureSegBuffers(count: number) {
        const nextMaxPairs = count * Math.min(CFG.MAX_NEIGHBORS, Math.max(0, count - 1));
        if (nextMaxPairs <= maxPairsCap) return;
        maxPairsCap = nextMaxPairs;
        segPos = new Float32Array(maxPairsCap * 2 * 3);
        segGlowPos = new Float32Array(maxPairsCap * 2 * 3);
        segCol = new Float32Array(maxPairsCap * 2 * 3);
    }

    function rebuild(count: number): void {
        P.length = 0;
        baseSpeed = S.isMobile ? CFG.SPEED_MOBILE : CFG.SPEED_DESKTOP;

        for (let i = 0; i < count; i++) {
            const ang = rand(0, Math.PI * 2);
            const spd = rand(baseSpeed * 0.85, baseSpeed * 1.1);
            const tx = Math.cos(ang) * spd,
                ty = Math.sin(ang) * spd;
            P.push({ x: rand(0, S.w), y: rand(0, S.h), vx: tx, vy: ty, tx, ty, change: rand(1.6, 3.6) });
        }

        ensureSegBuffers(count);

        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = P[i].x;
            pos[i * 3 + 1] = P[i].y;
        }
        const geo = new BufferGeometry();
        geo.setAttribute("position", new BufferAttribute(pos, 3));

        if (pointsGroup.geometry) pointsGroup.geometry.dispose();
        pointsGroup.geometry = geo;

        const ptsMat = new PointsMaterial({
            size: CFG.DOT_SIZE * S.dpr,
            sizeAttenuation: false,
            transparent: true,
            opacity: CFG.DOT_ALPHA,
            blending: AdditiveBlending,
            depthWrite: false,
            map: makeDot(),
            color: S.color,
        });
        pointsGroup.material = ptsMat;

        if (!geoSeg) {
            geoSeg = new LineSegmentsGeometry();
            matMain = new LineMaterial({
                color: S.color,
                linewidth: CFG.LINE_WIDTH_PX,
                transparent: true,
                opacity: CFG.LINE_ALPHA,
                vertexColors: true,
                blending: AdditiveBlending,
                depthWrite: false,
            });
            matGlow = new LineMaterial({
                color: S.color,
                linewidth: CFG.LINE_GLOW_WIDTH_PX,
                transparent: true,
                opacity: CFG.LINE_GLOW_ALPHA,
                vertexColors: false,
                blending: AdditiveBlending,
                depthWrite: false,
            });

            (matMain as unknown as { resolution: { set: (w: number, h: number) => void } }).resolution.set(S.w * S.dpr, S.h * S.dpr);
            (matGlow as unknown as { resolution: { set: (w: number, h: number) => void } }).resolution.set(S.w * S.dpr, S.h * S.dpr);

            linesMain = new LineSegments2(geoSeg, matMain);
            linesGlow = new LineSegments2(new LineSegmentsGeometry(), matGlow);
            scene.add(linesGlow, linesMain);
        } else {
            (matMain as unknown as { color: { copy: (c: THREE.Color) => void } }).color.copy(S.color);
            (matGlow as unknown as { color: { copy: (c: THREE.Color) => void } }).color.copy(S.color);
            (matMain as unknown as { linewidth: number }).linewidth = CFG.LINE_WIDTH_PX;
            (matGlow as unknown as { linewidth: number }).linewidth = CFG.LINE_GLOW_WIDTH_PX;
            (matMain as unknown as { resolution: { set: (w: number, h: number) => void } }).resolution.set(S.w * S.dpr, S.h * S.dpr);
            (matGlow as unknown as { resolution: { set: (w: number, h: number) => void } }).resolution.set(S.w * S.dpr, S.h * S.dpr);
            (matMain as unknown as { needsUpdate: boolean }).needsUpdate = true;
            (matGlow as unknown as { needsUpdate: boolean }).needsUpdate = true;

            (pointsGroup.material as THREE.PointsMaterial).size = CFG.DOT_SIZE * S.dpr;
            (pointsGroup.material as THREE.PointsMaterial).needsUpdate = true;
        }
    }

    function buildGrid(): void {
        grid.clear();
        for (let i = 0; i < P.length; i++) {
            const p = P[i],
                cx = (p.x / cellSize) | 0,
                cy = (p.y / cellSize) | 0;
            const k = `${cx}|${cy}`;
            const arr = grid.get(k);
            if (arr) arr.push(i);
            else grid.set(k, [i]);
        }
    }

    function fit(): void {
        const r = host.getBoundingClientRect();
        S.w = Math.max(1, Math.round(r.width));
        S.h = Math.max(1, Math.round(r.height));
        S.dpr = Math.min(window.devicePixelRatio || 1, S.isMobile ? CFG.DPR_MOBILE_MAX : CFG.DPR_DESKTOP_MAX);

        renderer.setSize(S.w, S.h, false);
        renderer.setPixelRatio(S.dpr);

        camera.left = 0;
        camera.right = S.w;
        camera.top = S.h;
        camera.bottom = 0;
        camera.updateProjectionMatrix();

        if (matMain) {
            (matMain as unknown as { resolution: { set: (w: number, h: number) => void } }).resolution.set(S.w * S.dpr, S.h * S.dpr);
            (matMain as unknown as { needsUpdate: boolean }).needsUpdate = true;
        }
        if (matGlow) {
            (matGlow as unknown as { resolution: { set: (w: number, h: number) => void } }).resolution.set(S.w * S.dpr, S.h * S.dpr);
            (matGlow as unknown as { needsUpdate: boolean }).needsUpdate = true;
        }
        if (pointsGroup.material) {
            (pointsGroup.material as THREE.PointsMaterial).size = CFG.DOT_SIZE * S.dpr;
            (pointsGroup.material as THREE.PointsMaterial).needsUpdate = true;
        }

        const ref = 1280 * 720;
        let count = Math.round(CFG.BASE_POINTS * ((S.w * S.h) / ref));
        if (S.isMobile) count = Math.floor(count * 0.75);
        if (S.reduce) count = Math.floor(count * 0.6);
        count = clamp(count, CFG.MIN_POINTS, CFG.MAX_POINTS);

        rebuild(count);
    }

    const parallax = { targetX: 0, targetY: 0, x: 0, y: 0 };
    if (!S.reduce) {
        window.addEventListener(
            "mousemove",
            (e: MouseEvent) => {
                const r = host.getBoundingClientRect();
                const mx = (e.clientX - r.left) / r.width - 0.5;
                const my = (e.clientY - r.top) / r.height - 0.5;
                parallax.targetX = 16 * mx;
                parallax.targetY = -16 * my;
            },
            { passive: true }
        );
        window.addEventListener(
            "touchmove",
            (e: TouchEvent) => {
                const t = e.touches?.[0];
                if (!t) return;
                const r = host.getBoundingClientRect();
                const mx = (t.clientX - r.left) / r.width - 0.5;
                const my = (t.clientY - r.top) / r.height - 0.5;
                parallax.targetX = 16 * mx;
                parallax.targetY = -16 * my;
            },
            { passive: true }
        );
    }

    let last = performance.now();
    const t0 = last;

    function tick(now: number): void {
        if (document.hidden) {
            last = now;
            requestAnimationFrame(tick);
            return;
        }
        const dt = (now - last) / 1000;
        last = now;

        if (!S.reduce) {
            const phase = (((now - t0) / 1000) / CFG.BREATH_DUR) * Math.PI * 2;
            const s = 1 + (CFG.BREATH_SCALE - 1) * (0.5 * (1 + Math.sin(phase)));
            scene.scale.setScalar(s);
        }

        const posAttr = pointsGroup.geometry.getAttribute("position") as THREE.BufferAttribute;
        const pos = posAttr.array as Float32Array;
        const smooth = 1 - Math.exp(-dt * 1.6);

        for (let i = 0; i < P.length; i++) {
            const p = P[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            const pad = 24;
            if (p.x < -pad) p.x = S.w + pad;
            if (p.x > S.w + pad) p.x = -pad;
            if (p.y < -pad) p.y = S.h + pad;
            if (p.y > S.h + pad) p.y = -pad;

            p.change -= dt;
            if (p.change <= 0) {
                const ang = Math.random() * Math.PI * 2;
                const spd = rand(baseSpeed * 0.85, baseSpeed * 1.15);
                p.tx = Math.cos(ang) * spd;
                p.ty = Math.sin(ang) * spd;
                p.change = rand(1.6, 3.6);
            }
            p.vx += (p.tx - p.vx) * smooth;
            p.vy += (p.ty - p.vy) * smooth;

            const k = i * 3;
            pos[k] = p.x;
            pos[k + 1] = p.y;
        }
        posAttr.needsUpdate = true;

        cellSize = CFG.LINK_DIST;
        buildGrid();

        const maxD2 = CFG.LINK_DIST * CFG.LINK_DIST;
        let segs = 0;

        for (let i = 0; i < P.length; i++) {
            const a = P[i],
                cx = (a.x / cellSize) | 0,
                cy = (a.y / cellSize) | 0;
            let added = 0;
            for (let n = 0; n < neighbors.length; n++) {
                const nx = cx + neighbors[n][0],
                    ny = cy + neighbors[n][1];
                const arr = grid.get(nx + "|" + ny);
                if (!arr) continue;
                for (let t = 0; t < arr.length; t++) {
                    const j = arr[t];
                    if (j <= i) continue;
                    const b = P[j];
                    const dx = a.x - b.x,
                        dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 >= maxD2) continue;

                    const tclose = 1 - d2 / maxD2;
                    const base = segs * 2 * 3;

                    segPos[base] = a.x;
                    segPos[base + 1] = a.y;
                    segPos[base + 3] = b.x;
                    segPos[base + 4] = b.y;

                    segGlowPos[base] = segPos[base];
                    segGlowPos[base + 1] = segPos[base + 1];
                    segGlowPos[base + 3] = segPos[base + 3];
                    segGlowPos[base + 4] = segPos[base + 4];

                    segCol[base] = (S.color as unknown as { r: number }).r * tclose;
                    segCol[base + 1] = (S.color as unknown as { g: number }).g * tclose;
                    segCol[base + 2] = (S.color as unknown as { b: number }).b * tclose;
                    segCol[base + 3] = segCol[base];
                    segCol[base + 4] = segCol[base + 1];
                    segCol[base + 5] = segCol[base + 2];

                    segs++;
                    added++;
                    if (added >= CFG.MAX_NEIGHBORS) break;
                }
                if (added >= CFG.MAX_NEIGHBORS) break;
            }
        }

        if (!geoSeg) geoSeg = new LineSegmentsGeometry();
        geoSeg.setPositions(segPos.subarray(0, segs * 6));
        geoSeg.setColors(segCol.subarray(0, segs * 6));

        if (!linesMain) linesMain = new LineSegments2(geoSeg, matMain);
        else (linesMain as unknown as { geometry: typeof geoSeg }).geometry = geoSeg;

        if (linesGlow) {
            const lg = ((linesGlow as unknown as { geometry: InstanceType<typeof LineSegmentsGeometry> | undefined }).geometry ?? new LineSegmentsGeometry()) as InstanceType<typeof LineSegmentsGeometry>;
            (linesGlow as unknown as { geometry: typeof lg }).geometry = lg;
            lg.setPositions(segGlowPos.subarray(0, segs * 6));
        }

        const follow = 1 - Math.exp(-dt * 3);
        parallax.x = lerp(parallax.x, parallax.targetX, follow);
        parallax.y = lerp(parallax.y, parallax.targetY, follow);

        pointsGroup.position.set(parallax.x, parallax.y, 0);
        (linesMain as unknown as { position: { set: (x: number, y: number, z: number) => void } }).position.set(parallax.x, parallax.y, 0);
        if (linesGlow) (linesGlow as unknown as { position: { set: (x: number, y: number, z: number) => void } }).position.set(parallax.x, parallax.y, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }

    function onResize(): void {
        fit();
    }

    fit();
    window.addEventListener("resize", onResize, { passive: true });
    new ResizeObserver(() => fit()).observe(host);

    requestAnimationFrame(tick);
}
