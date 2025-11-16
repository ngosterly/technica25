export const NeutralFace = ({ size = 24, color = "#b8c8c5ff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill={color} stroke="#333" strokeWidth="1.5"/>
    <circle cx="8" cy="10" r="1.5" fill="#333"/>
    <circle cx="16" cy="10" r="1.5" fill="#333"/>
    <line x1="8" y1="15" x2="16" y2="15" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const MadFace = ({ size = 24, color = "#FF6B6B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill={color} stroke="#333" strokeWidth="1.5"/>
    <circle cx="8" cy="11" r="1.5" fill="#333"/>
    <circle cx="16" cy="11" r="1.5" fill="#333"/>
    <path d="M 8 17 Q 12 14 16 17" stroke="#333" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <line x1="6" y1="8" x2="9" y2="9.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="8" x2="15" y2="9.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const HappyFace = ({ size = 24, color = "#FFD93D" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill={color} stroke="#333" strokeWidth="1.5"/>
    <circle cx="8" cy="10" r="1.5" fill="#333"/>
    <circle cx="16" cy="10" r="1.5" fill="#333"/>
    <path d="M 7 14 Q 12 18 17 14" stroke="#333" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const SadFace = ({ size = 24, color = "#6086ceff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill={color} stroke="#333" strokeWidth="1.5"/>
    <circle cx="8" cy="10" r="1.5" fill="#333"/>
    <circle cx="16" cy="10" r="1.5" fill="#333"/>
    <path d="M 7 16 Q 12 13 17 16" stroke="#333" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const MehFace = ({ size = 24, color = "#8ed88cff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill={color} stroke="#333" strokeWidth="1.5"/>
    <circle cx="8" cy="10" r="1.5" fill="#333"/>
    <circle cx="16" cy="10" r="1.5" fill="#333"/>
    <path d="M 8 15 Q 10 14.5 12 15 Q 14 15.5 16 15" stroke="#333" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const NoFace = ({ size = 24, color = "#ffffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill={color} stroke="#333" strokeWidth="1.5"/>
    {/* <circle cx="8" cy="10" r="1.5" fill="#333"/>
    <circle cx="16" cy="10" r="1.5" fill="#333"/> */}
    {/* <path d="M 8 15 Q 10 14.5 12 15 Q 14 15.5 16 15" stroke="#333" strokeWidth="1.5" strokeLinecap="round" fill="none"/> */}
  </svg>
);