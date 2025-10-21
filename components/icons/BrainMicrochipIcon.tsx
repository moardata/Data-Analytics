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
        x="4"
        y="4"
        width="16"
        height="16"
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
      
      {/* Brain outline - simplified and more visible */}
      <path
        d="M7 7C7 6 8 5 12 5C16 5 17 6 17 7C17 7.5 16.8 8 16.5 8.5C17 9 17.5 9.5 17.5 10.5C17.5 11.5 17 12 16.5 12.5C17 13 17.5 13.5 17.5 14.5C17.5 15.5 17 16 16.5 16.5C17 17 17.5 17.5 17.5 18.5C17.5 19.5 17 20 16.5 20.5C16 21 15.5 21.5 14.5 21.5C13.5 21.5 13 21 12.5 20.5C12 20 11.5 19.5 11.5 18.5C11.5 17.5 12 17 12.5 16.5C12 16 11.5 15.5 11.5 14.5C11.5 13.5 12 13 12.5 12.5C12 12 11.5 11.5 11.5 10.5C11.5 9.5 12 9 12.5 8.5C12 8 11.5 7.5 11.5 7C11.5 6 10.5 5 12 5C16 5 17 6 17 7Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Brain details - more visible */}
      <path
        d="M9 8.5C9.5 8 10 7.5 12 7.5C14 7.5 14.5 8 15 8.5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M9 12.5C9.5 12 10 11.5 12 11.5C14 11.5 14.5 12 15 12.5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M9 16.5C9.5 16 10 15.5 12 15.5C14 15.5 14.5 16 15 16.5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
