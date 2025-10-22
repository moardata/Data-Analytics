/**
 * Brain in Microchip Icon Component
 * Custom SVG icon with transparent background
 * Designed to be completely distinct from crown
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
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      {/* Microchip outline */}
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Microchip pins - top */}
      <circle cx="4" cy="0" r="1.5" fill="currentColor" />
      <circle cx="8" cy="0" r="1.5" fill="currentColor" />
      <circle cx="12" cy="0" r="1.5" fill="currentColor" />
      <circle cx="16" cy="0" r="1.5" fill="currentColor" />
      <circle cx="20" cy="0" r="1.5" fill="currentColor" />
      
      {/* Microchip pins - bottom */}
      <circle cx="4" cy="24" r="1.5" fill="currentColor" />
      <circle cx="8" cy="24" r="1.5" fill="currentColor" />
      <circle cx="12" cy="24" r="1.5" fill="currentColor" />
      <circle cx="16" cy="24" r="1.5" fill="currentColor" />
      <circle cx="20" cy="24" r="1.5" fill="currentColor" />
      
      {/* Microchip pins - left */}
      <circle cx="0" cy="4" r="1.5" fill="currentColor" />
      <circle cx="0" cy="8" r="1.5" fill="currentColor" />
      <circle cx="0" cy="12" r="1.5" fill="currentColor" />
      <circle cx="0" cy="16" r="1.5" fill="currentColor" />
      <circle cx="0" cy="20" r="1.5" fill="currentColor" />
      
      {/* Microchip pins - right */}
      <circle cx="24" cy="4" r="1.5" fill="currentColor" />
      <circle cx="24" cy="8" r="1.5" fill="currentColor" />
      <circle cx="24" cy="12" r="1.5" fill="currentColor" />
      <circle cx="24" cy="16" r="1.5" fill="currentColor" />
      <circle cx="24" cy="20" r="1.5" fill="currentColor" />
      
      {/* Brain outline - very distinctive wavy shape */}
      <path
        d="M6 4C6 3 7 2 12 2C17 2 18 3 18 4C18 4.5 17.8 5 17.5 5.5C18 6 18.5 6.5 18.5 7.5C18.5 8.5 18 9 17.5 9.5C18 10 18.5 10.5 18.5 11.5C18.5 12.5 18 13 17.5 13.5C18 14 18.5 14.5 18.5 15.5C18.5 16.5 18 17 17.5 17.5C18 18 18.5 18.5 18.5 19.5C18.5 20.5 18 21 17.5 21.5C17 22 16.5 22.5 15.5 22.5C14.5 22.5 14 22 13.5 21.5C13 21 12.5 20.5 12.5 19.5C12.5 18.5 13 18 13.5 17.5C13 17 12.5 16.5 12.5 15.5C12.5 14.5 13 14 13.5 13.5C13 13 12.5 12.5 12.5 11.5C12.5 10.5 13 10 13.5 9.5C13 9 12.5 8.5 12.5 7.5C12.5 6.5 13 6 13.5 5.5C13 5 12.5 4.5 12.5 4C12.5 3 11.5 2 12 2C17 2 18 3 18 4Z"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      
      {/* Brain details - very visible */}
      <path
        d="M8 5.5C8.5 5 9 4.5 12 4.5C15 4.5 15.5 5 16 5.5"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M8 9.5C8.5 9 9 8.5 12 8.5C15 8.5 15.5 9 16 9.5"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M8 13.5C8.5 13 9 12.5 12 12.5C15 12.5 15.5 13 16 13.5"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M8 17.5C8.5 17 9 16.5 12 16.5C15 16.5 15.5 17 16 17.5"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  );
}