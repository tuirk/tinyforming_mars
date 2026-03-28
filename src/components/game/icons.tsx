import type { SVGProps } from 'react';
import type { TagType } from '@/engine/types';
import { Zap, Orbit, Beaker, Factory } from 'lucide-react';

export const NatureResource = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="hsl(120, 50%, 50%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 11.5l-4.5 2.5" />
    <path d="M12 11.5l4.5 2.5" />
    <path d="M12 11.5V18" />
    <path d="M7.5 14l-2-1" />
    <path d="M16.5 14l2-1" />
  </svg>
);

export const ProductionResource = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="hsl(30, 70%, 50%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 13a4 4 0 108 0 4 4 0 10-8 0" />
    <path d="M14 13a4 4 0 108 0 4 4 0 10-8 0" />
    <path d="M6 13V2h8v11" />
    <path d="M10 2v4" />
    <path d="M10 6h12v11" />
    <path d="M14 17a4 4 0 108 0 4 4 0 10-8 0" />
  </svg>
);

export const ScienceResource = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="hsl(200, 60%, 50%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
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

export const SpecialProjectToken = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/>
        <path d="m14 7 3 3"/>
        <path d="M5 15.5 10 13l2 2-7 4.5"/>
    </svg>
);

export const BuildingTagIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M3 9h18"></path>
    <path d="M9 21V9"></path>
  </svg>
);

export const TagIcon = ({ tag, ...props }: {tag: TagType} & SVGProps<SVGSVGElement>) => {
    switch (tag) {
      case 'energy':
        return <Zap {...props} />;
      case 'production':
        return <Factory {...props} />;
      case 'nature':
        return <NatureResource {...props} />;
      case 'science':
        return <Beaker {...props} />;
      case 'space':
        return <Orbit {...props} />;
      default:
        return null;
    }
  };
  
  
export const ScienceTagIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"/>
        <path d="M30,50 A20,20 0 1,1 70,50" fill="none" stroke="currentColor" strokeWidth="6"/>
        <path d="M50,30 A20,20 0 1,1 50,70" fill="none" stroke="currentColor" strokeWidth="6"/>
    </svg>
);

export const EnergyTagIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}>
        <path d="M50 10 L 40 50 L 60 50 L 50 90" stroke="currentColor" strokeWidth="8" fill="none" />
    </svg>
);

export const ProductionTagIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 13a4 4 0 108 0 4 4 0 10-8 0" />
        <path d="M14 13a4 4 0 108 0 4 4 0 10-8 0" />
        <path d="M6 13V2h8v11" />
        <path d="M10 2v4" />
        <path d="M10 6h12v11" />
        <path d="M14 17a4 4 0 108 0 4 4 0 10-8 0" />
    </svg>
);

export const NatureTagIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}>
        <path d="M50 90 C 70 70, 70 40, 50 20 C 30 40, 30 70, 50 90 Z" stroke="currentColor" strokeWidth="8" fill="none" />
        <path d="M50 55 V 20" stroke="currentColor" strokeWidth="6" fill="none" />
    </svg>
);

export const SpaceTagIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <path d="M5 22h14"/>
        <path d="M4 17a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4v-3z"/>
    </svg>
);
