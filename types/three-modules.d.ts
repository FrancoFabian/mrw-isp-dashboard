declare module 'three' {
    const three: any;
    export = three;
}

declare module 'three/addons/lines/LineSegments2.js' {
    export class LineSegments2 {
        constructor(geometry?: any, material?: any);
        geometry: any;
        material: any;
    }
}

declare module 'three/addons/lines/LineSegmentsGeometry.js' {
    export class LineSegmentsGeometry {
        constructor();
        setPositions(array: Float32Array): this;
        setColors(array: Float32Array): this;
        dispose(): void;
        getAttribute(name: string): any;
    }
}

declare module 'three/addons/lines/LineMaterial.js' {
    export class LineMaterial {
        constructor(parameters?: any);
        color: any;
        linewidth: number;
        resolution: any;
        needsUpdate: boolean;
        dispose(): void;
    }
}
