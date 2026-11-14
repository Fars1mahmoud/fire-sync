import React from 'react';
import { LayerId } from './infrastructureTypes';

interface LayerGlyphProps {
  layerId: LayerId;
  colorOverride?: string;
  size?: number;
}

export const LayerGlyph: React.FC<LayerGlyphProps> = ({
  layerId,
  colorOverride,
  size = 18,
}) => {
  switch (layerId) {
    case 'cities':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="2.5" y="6" width="6.5" height="11.5" rx="0.8" fill={colorOverride || '#22C55E'} />
          <rect x="10.5" y="3" width="7" height="14.5" rx="0.8" fill={colorOverride || '#16A34A'} />
          <rect x="4.2" y="8.2" width="1.3" height="1.5" fill="#0D1A2D" />
          <rect x="6.2" y="8.2" width="1.3" height="1.5" fill="#0D1A2D" />
          <rect x="4.2" y="11.2" width="1.3" height="1.5" fill="#0D1A2D" />
          <rect x="6.2" y="11.2" width="1.3" height="1.5" fill="#0D1A2D" />
          <rect x="12.2" y="5.5" width="1.4" height="1.5" fill="#0D1A2D" />
          <rect x="14.5" y="5.5" width="1.4" height="1.5" fill="#0D1A2D" />
          <rect x="12.2" y="8.5" width="1.4" height="1.5" fill="#0D1A2D" />
          <rect x="14.5" y="8.5" width="1.4" height="1.5" fill="#0D1A2D" />
          <rect x="12.2" y="11.5" width="1.4" height="1.5" fill="#0D1A2D" />
          <rect x="14.5" y="11.5" width="1.4" height="1.5" fill="#0D1A2D" />
        </svg>
      );

    case 'hospitals':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="2.5" y="4.5" width="15" height="12.5" rx="2" fill={colorOverride || '#DC2626'} />
          <path d="M7.5 4.5V3.3C7.5 2.75 7.95 2.3 8.5 2.3H11.5C12.05 2.3 12.5 2.75 12.5 3.3V4.5" stroke={colorOverride || '#EF4444'} strokeWidth="1.5" />
          <rect x="9" y="7.2" width="2" height="7" rx="0.4" fill="#FFFFFF" />
          <rect x="6.5" y="9.7" width="7" height="2" rx="0.4" fill="#FFFFFF" />
        </svg>
      );

    case 'airports':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M17.5 11.2L11.5 8.4V4.1C11.5 3.1 10.8 2.2 10 2.2C9.2 2.2 8.5 3.1 8.5 4.1V8.4L2.5 11.2V12.9L8.5 11.1V15.1L6.6 16.5V17.8L10 16.9L13.4 17.8V16.5L11.5 15.1V11.1L17.5 12.9V11.2Z"
            fill={colorOverride || '#60A5FA'}
          />
        </svg>
      );

    case 'power':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M3 17V9.5L7.5 11.8V9.5L12 11.8V6.2H14.6L15.4 17H3Z"
            fill={colorOverride || '#F59E0B'}
          />
          <rect x="15.8" y="8" width="2.2" height="9" rx="0.4" fill={colorOverride || '#D97706'} />
          <circle cx="14.2" cy="4.2" r="1.1" fill="#FCD34D" opacity="0.8" />
          <circle cx="16.4" cy="5.6" r="0.9" fill="#FCD34D" opacity="0.65" />
        </svg>
      );

    case 'roads':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M5.5 3.5H14.5L17.5 17H2.5L5.5 3.5Z" fill={colorOverride || '#F59E0B'} />
          <rect x="9.3" y="4.8" width="1.4" height="2.4" rx="0.3" fill="#0D1A2D" />
          <rect x="9.3" y="8.8" width="1.4" height="2.6" rx="0.3" fill="#0D1A2D" />
          <rect x="9.3" y="13.2" width="1.4" height="2.6" rx="0.3" fill="#0D1A2D" />
        </svg>
      );

    case 'industrial':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M2.5 17V8.5L7 10.8V8.5L11.5 10.8V8.5L16 10.8V5.5H18V17H2.5Z"
            fill={colorOverride || '#60A5FA'}
          />
          <rect x="4.5" y="13" width="2" height="2" fill="#0D1A2D" />
          <rect x="8.5" y="13" width="2" height="2" fill="#0D1A2D" />
          <rect x="12.5" y="13" width="2" height="2" fill="#0D1A2D" />
        </svg>
      );

    case 'other':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="3" y="3" width="14" height="14" rx="3.2" fill={colorOverride || '#475569'} />
        </svg>
      );
  }
};
