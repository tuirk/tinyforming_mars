import type { SVGProps } from 'react';

export const NatureResource = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 11.5l-4.5 2.5" />
    <path d="M12 11.5l4.5 2.5" />
    <path d="M12 11.5V18" />
    <path d="M7.5 14l-2-1" />
    <path d="M16.5 14l2-1" />
  </svg>
);

export const ProductionResource = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 13a4 4 0 108 0 4 4 0 10-8 0" />
    <path d="M14 13a4 4 0 108 0 4 4 0 10-8 0" />
    <path d="M6 13V2h8v11" />
    <path d="M10 2v4" />
    <path d="M10 6h12v11" />
    <path d="M14 17a4 4 0 108 0 4 4 0 10-8 0" />
  </svg>
);

export const ScienceResource = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2L8 22l8-6-8-6 8 22" />
  </svg>
);

export const WaterCube = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="hsl(210, 60%, 50%)" {...props}>
        <rect x="10" y="10" width="80" height="80" rx="15" ry="15" stroke="hsl(210, 60%, 70%)" strokeWidth="5" />
    </svg>
);

export const GreeneryCube = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="hsl(120, 50%, 50%)" {...props}>
        <rect x="10" y="10" width="80" height="80" rx="15" ry="15" stroke="hsl(120, 50%, 70%)" strokeWidth="5"/>
    </svg>
);

export const HeatCube = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="hsl(0, 70%, 50%)" {...props}>
        <rect x="10" y="10" width="80" height="80" rx="15" ry="15" stroke="hsl(0, 70%, 70%)" strokeWidth="5"/>
    </svg>
);
