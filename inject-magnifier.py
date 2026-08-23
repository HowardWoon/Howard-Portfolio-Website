import os

file_path = 'components/bikebear-hero.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

magnified_component = """
function MagnifiedHeadline() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative space-y-2 cursor-none"
    >
      {/* Base Normal Text */}
      <h2 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tight leading-[0.92] text-white transition-opacity duration-300" style={{ opacity: isHovered ? 0.2 : 1 }}>
        ENGINEERING <br />
        <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
          SYSTEMS TO
        </span> <br />
        STAND OUT IN <br />
        A NOISY WORLD.
      </h2>

      {/* Scaled X-Ray Magnification Text */}
      <h2 
        className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tight leading-[0.92] text-amber-400 absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{
          transform: 'scale(1.15)',
          transformOrigin: `${position.x}px ${position.y}px`,
          WebkitMaskImage: `radial-gradient(circle 140px at ${position.x}px ${position.y}px, black 60%, transparent 100%)`,
          maskImage: `radial-gradient(circle 140px at ${position.x}px ${position.y}px, black 60%, transparent 100%)`,
          opacity: isHovered ? 1 : 0
        }}
      >
        ENGINEERING <br />
        <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          SYSTEMS TO
        </span> <br />
        STAND OUT IN <br />
        A NOISY WORLD.
      </h2>

      {/* Decorative Accent Glow Wave */}
      <div className="w-48 sm:w-64 pt-2 relative z-10">
        <svg
          viewBox="0 0 200 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full stroke-amber-400"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          <path d="M2 8 Q 12 0, 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 122 8 T 142 8 T 162 8 T 182 8 T 198 8" />
        </svg>
      </div>
    </div>
  );
}
"""

# Insert the component definition before the default export
content = content.replace("export default function BikebearHero() {", magnified_component + "\nexport default function BikebearHero() {")

# Replace the original headline HTML block with the new component
original_headline = """<h2 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tight leading-[0.92] text-white">
                ENGINEERING <br />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  SYSTEMS TO
                </span> <br />
                STAND OUT IN <br />
                A NOISY WORLD.
              </h2>

              {/* Decorative Accent Glow Wave */}
              <div className="w-48 sm:w-64 pt-2">
                <svg
                  viewBox="0 0 200 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full stroke-amber-400"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                >
                  <path d="M2 8 Q 12 0, 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 122 8 T 142 8 T 162 8 T 182 8 T 198 8" />
                </svg>
              </div>"""

content = content.replace(original_headline, "<MagnifiedHeadline />")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)