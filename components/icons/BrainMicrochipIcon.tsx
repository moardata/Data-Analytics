/**
 * Brain in Microchip Icon Component
 * Custom SVG icon with transparent background
 */

interface BrainMicrochipIconProps {
  className?: string;
}

export function BrainMicrochipIcon({ className = "h-5 w-5" }: BrainMicrochipIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      {/* Microchip outline */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Microchip pins - top */}
      <circle cx="6" cy="1" r="1" fill="currentColor" />
      <circle cx="12" cy="1" r="1" fill="currentColor" />
      <circle cx="18" cy="1" r="1" fill="currentColor" />
      
      {/* Microchip pins - bottom */}
      <circle cx="6" cy="23" r="1" fill="currentColor" />
      <circle cx="12" cy="23" r="1" fill="currentColor" />
      <circle cx="18" cy="23" r="1" fill="currentColor" />
      
      {/* Microchip pins - left */}
      <circle cx="1" cy="6" r="1" fill="currentColor" />
      <circle cx="1" cy="12" r="1" fill="currentColor" />
      <circle cx="1" cy="18" r="1" fill="currentColor" />
      
      {/* Microchip pins - right */}
      <circle cx="23" cy="6" r="1" fill="currentColor" />
      <circle cx="23" cy="12" r="1" fill="currentColor" />
      <circle cx="23" cy="18" r="1" fill="currentColor" />
      
      {/* Brain outline - more distinctive shape */}
      <path
        d="M8 6C8 5 9 4 12 4C15 4 16 5 16 6C16 6.5 15.8 7 15.5 7.5C16 8 16.5 8.5 16.5 9.5C16.5 10.5 16 11 15.5 11.5C16 12 16.5 12.5 16.5 13.5C16.5 14.5 16 15 15.5 15.5C16 16 16.5 16.5 16.5 17.5C16.5 18.5 16 19 15.5 19.5C15 20 14.5 20.5 13.5 20.5C12.5 20.5 12 20 11.5 19.5C11 19 10.5 18.5 10.5 17.5C10.5 16.5 11 16 11.5 15.5C11 15 10.5 14.5 10.5 13.5C10.5 12.5 11 12 11.5 11.5C11 11 10.5 10.5 10.5 9.5C10.5 8.5 11 8 11.5 7.5C11 7 10.5 6.5 10.5 6C10.5 5 9.5 4 12 4C15 4 16 5 16 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      
      {/* Brain details - more visible */}
      <path
        d="M10 7.5C10.5 7 11 6.5 12 6.5C13 6.5 13.5 7 14 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M10 11.5C10.5 11 11 10.5 12 10.5C13 10.5 13.5 11 14 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M10 15.5C10.5 15 11 14.5 12 14.5C13 14.5 13.5 15 14 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
