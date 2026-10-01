// Hero background: an abstract top-down view of Cerdà's Eixample, with members
// (points) helping each other (saffron lines). Pure SVG + CSS animation, no JavaScript.
// Base styles are the settled end state, so reduced-motion and no-JS users get a calm static picture.

const PITCH = 100; // one block plus its street, in SVG units
const COLS = 16;
const ROWS = 9;

// Block position as [column, row]. Hand-placed, weighted to the right so the headline stays clear.
const NODES: Array<[number, number]> = [
  [1, 7], [3, 5], [4, 8], [6, 6], [7, 2], [9, 4], [9, 7], [9, 1], [10, 5],
  [11, 3], [12, 7], [12, 1], [13, 5], [14, 3], [14, 8], [15, 6], [15, 1], [11, 8],
];

// Pairs of node indexes, in the order they draw.
const EDGES: Array<[number, number]> = [
  [8, 9], [5, 8], [9, 13], [8, 12], [12, 13], [3, 5], [9, 7], [5, 4],
  [12, 15], [13, 16], [9, 11], [8, 6], [12, 10], [6, 17], [10, 14], [4, 7],
  [1, 3], [0, 1], [2, 3], [10, 17], [3, 6],
];

const centre = ([c, r]: [number, number]) => ({ x: c * PITCH + PITCH / 2, y: r * PITCH + PITCH / 2 });

const START = 0.45; // seconds after load; the headline has painted by then
const STEP = 0.17;

export default function HeroNetwork() {
  const firstTouch = new Map<number, number>();
  EDGES.forEach(([a, b], k) => {
    for (const n of [a, b]) if (!firstTouch.has(n)) firstTouch.set(n, k);
  });

  return (
    <svg
      className="net"
      viewBox={`0 0 ${COLS * PITCH} ${ROWS * PITCH}`}
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* One Cerdà block: a square with chamfered corners, so every crossing opens into an octagon. */}
        <pattern id="eixample" width={PITCH} height={PITCH} patternUnits="userSpaceOnUse">
          <path d="M22 10H78L90 22V78L78 90H22L10 78V22Z" className="net__block" />
        </pattern>
      </defs>
      <rect width={COLS * PITCH} height={ROWS * PITCH} fill="url(#eixample)" />

      {/* The Diagonal */}
      <line className="net__diagonal" x1="250" y1="900" x2="1150" y2="0" pathLength={1} />

      {EDGES.map(([a, b], k) => {
        const p = centre(NODES[a]);
        const q = centre(NODES[b]);
        return (
          <line
            key={`e${k}`}
            className="net__edge"
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            pathLength={1}
            style={{ '--d': `${(START + 0.25 + k * STEP).toFixed(2)}s` } as React.CSSProperties}
          />
        );
      })}

      {NODES.map((n, i) => {
        const { x, y } = centre(n);
        const k = firstTouch.get(i) ?? 0;
        return (
          <g
            key={`n${i}`}
            className="net__node"
            style={{ '--d': `${(START + k * STEP).toFixed(2)}s` } as React.CSSProperties}
          >
            <circle className="net__halo" cx={x} cy={y} r="11" />
            <circle className="net__dot" cx={x} cy={y} r="3.4" />
          </g>
        );
      })}
    </svg>
  );
}
