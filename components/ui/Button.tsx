// Define a mapping of color names to their corresponding Tailwind CSS border styles
const colorMap: Record<string, string> = {
  neutralWhite: "border-neutral-400 dark:border-white",
  whiteBlack: "border-black dark:border-white",
};

// Define the reusable Button component
export default function Button({
  // Parameters
  className, // Additional classNames to style the Button
  color = "neutralWhite",
  children, // Button Content
  type,
  disabled,
  onClick,
}: {
  // TypeScript Parameter Types
  className?: string;
  color?: keyof typeof colorMap;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      className={`group/btn relative transition duration-200 ${className}`}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {/* Container for the hover effect on button borders */}
      <div
        className="absolute inset-0 h-full w-full transform opacity-0 transition 
      duration-200 group-hover/btn:opacity-100"
      >
        {/* Top-left corner border effect */}
        <div
          className={`absolute -left-px -top-px h-4 w-4 rounded-tl-lg border-l-2 
            border-t-2 bg-transparent transition-all duration-200 
            group-hover/btn:-left-4 group-hover/btn:-top-4 ${colorMap[color]}`}
        />
        {/* Top-right corner border effect */}
        <div
          className={`absolute -right-px -top-px h-4 w-4 rounded-tr-lg border-r-2 
            border-t-2 bg-transparent transition-all duration-200
             group-hover/btn:-right-4 group-hover/btn:-top-4 ${colorMap[color]}`}
        />
        {/* Bottom-left corner border effect */}
        <div
          className={`absolute -bottom-px -left-px h-4 w-4 rounded-bl-lg border-b-2 
            border-l-2 bg-transparent transition-all duration-200
             group-hover/btn:-bottom-4 group-hover/btn:-left-4 ${colorMap[color]}`}
        />
        {/* Bottom-right corner border effect */}
        <div
          className={`absolute -bottom-px -right-px h-4 w-4 rounded-br-lg border-b-2
             border-r-2 bg-transparent transition-all duration-200 
             group-hover/btn:-bottom-4 group-hover/btn:-right-4 ${colorMap[color]}`}
        />
      </div>
      {children} {/* Render the button's content */}
    </button>
  );
}
