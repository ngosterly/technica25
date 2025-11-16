const HappyGhost = ({ className }) => {
  return (
    <svg
      className={className}
      width="300"
      height="300"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 40C70 40 50 60 50 90V150C50 150 55 145 65 145C75 145 80 150 90 150C100 150 105 145 110 145C120 145 125 150 135 150C145 150 150 145 150 150V90C150 60 130 40 100 40Z"
        fill="white"
        stroke="#e0e0e0"
        strokeWidth="2"
      />
      
      <circle cx="80" cy="85" r="8" fill="#333" />
      
      <circle cx="120" cy="85" r="8" fill="#333" />
      
      <path
        d="M75 105 Q100 120 125 105"
        stroke="#333"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Rosy cheeks */}
      <circle cx="65" cy="100" r="6" fill="#FFB6C1" opacity="0.6" />
      <circle cx="135" cy="100" r="6" fill="#FFB6C1" opacity="0.6" />
    </svg>
  );
};

export default HappyGhost;
