import type { SVGProps } from 'react';
import { Tag } from '@/lib/game/types';

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

export const TagIcon = ({ tag, ...props }: {tag: Tag} & SVGProps<SVGSVGElement>) => {
    switch (tag) {
      case 'Energy':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M12 2l-2 9h4l-2 9" />
          </svg>
        );
      case 'Nature':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 11.5l-4.5 2.5" />
          </svg>
        );
      case 'Production':
         return <ProductionResource {...props} />;
      case 'Science':
        return <ScienceResource {...props} />;
      case 'Building':
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M12 2l-8 4 8 4 8-4-8-4z" />
                <path d="M4 10v8l8 4 8-4v-8" />
                <path d="M4 10l8 4 8-4" />
            </svg>
        )
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
    <svg viewBox="0 0 100 100" {...props}>
        <rect x="25" y="40" width="50" height="40" stroke="currentColor" strokeWidth="8" fill="none"/>
        <path d="M35 40 V 20 H 65 V 40" stroke="currentColor" strokeWidth="8" fill="none" />
        <circle cx="50" cy="60" r="10" stroke="currentColor" strokeWidth="6" fill="none" />
    </svg>
);

export const NatureTagIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}>
        <path d="M50 90 C 70 70, 70 40, 50 20 C 30 40, 30 70, 50 90 Z" stroke="currentColor" strokeWidth="8" fill="none" />
        <path d="M50 55 V 20" stroke="currentColor" strokeWidth="6" fill="none" />
    </svg>
);