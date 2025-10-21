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
      <circle cx="6" cy="2" r="1" fill="currentColor" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
      <circle cx="18" cy="2" r="1" fill="currentColor" />
      
      {/* Microchip pins - bottom */}
      <circle cx="6" cy="22" r="1" fill="currentColor" />
      <circle cx="12" cy="22" r="1" fill="currentColor" />
      <circle cx="18" cy="22" r="1" fill="currentColor" />
      
      {/* Microchip pins - left */}
      <circle cx="2" cy="6" r="1" fill="currentColor" />
      <circle cx="2" cy="12" r="1" fill="currentColor" />
      <circle cx="2" cy="18" r="1" fill="currentColor" />
      
      {/* Microchip pins - right */}
      <circle cx="22" cy="6" r="1" fill="currentColor" />
      <circle cx="22" cy="12" r="1" fill="currentColor" />
      <circle cx="22" cy="18" r="1" fill="currentColor" />
      
      {/* Brain outline */}
      <path
        d="M8 8C8 6.5 9.5 5 12 5C14.5 5 16 6.5 16 8C16 8.5 15.8 9 15.5 9.5C16 10 16.5 10.5 16.5 11.5C16.5 12.5 16 13 15.5 13.5C16 14 16.5 14.5 16.5 15.5C16.5 16.5 16 17 15.5 17.5C16 18 16.5 18.5 16.5 19.5C16.5 20.5 16 21 15.5 21.5C15 22 14.5 22.5 13.5 22.5C12.5 22.5 12 22 11.5 21.5C11 21 10.5 20.5 10.5 19.5C10.5 18.5 11 18 11.5 17.5C11 17 10.5 16.5 10.5 15.5C10.5 14.5 11 14 11.5 13.5C11 13 10.5 12.5 10.5 11.5C10.5 10.5 11 10 11.5 9.5C11 9 10.5 8.5 10.5 8C10.5 6.5 9 5 12 5C14.5 5 16 6.5 16 8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      
      {/* Brain details */}
      <path
        d="M10 8.5C10.5 8 11 7.5 12 7.5C13 7.5 13.5 8 14 8.5"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M10 12.5C10.5 12 11 11.5 12 11.5C13 11.5 13.5 12 14 12.5"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M10 16.5C10.5 16 11 15.5 12 15.5C13 15.5 13.5 16 14 16.5"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
      />
    </svg>
  );
}
