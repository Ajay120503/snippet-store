const Logo = ({ className = "", size = 160 }) => {
  return (
    <svg
      width={size}
      height={size / 4}
      viewBox="0 0 400 100"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-colors duration-300 ease-in-out ${className}`}
      role="img"
      aria-label="SnippetStore Logo"
      preserveAspectRatio="xMinYMid meet"
    >
      <text
        x="0"
        y="70"
        fontFamily="'Fira Code', 'Courier New', monospace"
        fontSize="65"
        fill="currentColor"
        fontWeight="900"
        letterSpacing="-7"
      >
        SnippetStore
      </text>
    </svg>
  );
};

export default Logo;
