/**
 * Flat SVG illustrations for the dashboard, drawn in the ScriptX palette.
 * All are decorative (aria-hidden); the text next to them carries the meaning.
 */

const BRAND_500 = '#6236b8';
const BRAND_300 = '#b79be6';
const GOLD = '#f5c400';
const GOLD_DARK = '#dbae00';
const HAIR = '#2a1a3f';
const NAVY = '#1f2547';
const SHIRT = '#3b6fe0';
const SKIN = '#f4c3a1';
const SKIN_SHADE = '#e6aa85';

function Sparkle({ x, y, size = 6, fill = GOLD }) {
  const s = size;
  return <path d={`M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s} Z`} fill={fill} />;
}

/** A pointed leaf from `base` to `tip`, bulging `width` each side, with a light midrib. */
function PointLeaf({ base, tip, width, fill }) {
  const [bx, by] = base;
  const [tx, ty] = tip;
  const length = Math.hypot(tx - bx, ty - by) || 1;
  const nx = (-(ty - by) / length) * width;
  const ny = ((tx - bx) / length) * width;
  const mx = (bx + tx) / 2;
  const my = (by + ty) / 2;
  return (
    <g>
      <path d={`M${bx} ${by} Q${mx + nx} ${my + ny} ${tx} ${ty} Q${mx - nx} ${my - ny} ${bx} ${by} Z`} fill={fill} />
      <path d={`M${bx} ${by} Q${mx + nx * 0.15} ${my + ny * 0.15} ${tx} ${ty}`} stroke="#d1fae5" strokeWidth="1.4" fill="none" opacity="0.6" />
    </g>
  );
}

/**
 * Someone at a laptop with a plant, a wall calendar and a clock. The bottom edge is meant to sit
 * on the bottom of the banner, so the desk is cropped like a photo.
 */
export function WorkspaceIllustration({ className }) {
  return (
    <svg viewBox="0 0 430 180" className={className} aria-hidden="true">
      {/* soft shapes behind */}
      <path d="M118 180 C104 118 150 58 222 52 C296 46 338 96 346 142 C349 160 345 172 340 180 Z" fill="#dbe6ff" opacity="0.75" />
      <ellipse cx="352" cy="58" rx="74" ry="48" fill="#e3ebff" opacity="0.8" />
      <ellipse cx="66" cy="150" rx="58" ry="40" fill="#e0ecff" opacity="0.7" />
      <Sparkle x={146} y={30} size={6} />
      <Sparkle x={282} y={16} size={4.5} fill={BRAND_300} />

      {/* plant, left */}
      <PointLeaf base={[70, 148]} tip={[20, 84]} width={26} fill="#22a06b" />
      <PointLeaf base={[70, 148]} tip={[44, 50]} width={28} fill="#16a34a" />
      <PointLeaf base={[70, 148]} tip={[96, 48]} width={28} fill="#34c38f" />
      <PointLeaf base={[70, 148]} tip={[120, 88]} width={24} fill="#22a06b" />
      <PointLeaf base={[70, 150]} tip={[14, 128]} width={16} fill="#34c38f" />
      <PointLeaf base={[70, 150]} tip={[126, 126]} width={16} fill="#16a34a" />
      <rect x="38" y="143" width="64" height="11" rx="4" fill="#b8c7e0" />
      <path d="M41 152 H99 L94 180 H46 Z" fill="#cdd9ee" />

      {/* chair */}
      <rect x="266" y="108" width="46" height="80" rx="15" fill="#1e3a8a" opacity="0.85" />

      {/* person */}
      <path d="M148 180 C148 132 174 112 215 112 C256 112 282 132 282 180 Z" fill={SHIRT} />
      <path d="M200 112 L215 130 L230 112 Z" fill="#2f5bc4" />
      <rect x="207" y="94" width="16" height="22" rx="7" fill={SKIN_SHADE} />
      <ellipse cx="215" cy="74" rx="25" ry="27" fill={SKIN} />
      <circle cx="190" cy="79" r="5" fill={SKIN_SHADE} />
      <circle cx="240" cy="79" r="5" fill={SKIN_SHADE} />
      <path d="M188 72 C184 48 198 34 216 33 C236 32 248 46 244 68 C238 56 228 52 216 54 C204 55 194 61 188 72 Z" fill={NAVY} />
      {[
        [193, 52, 10],
        [205, 41, 11],
        [221, 38, 11],
        [235, 46, 10],
        [243, 58, 7],
        [188, 63, 7],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={NAVY} />
      ))}
      <path d="M201 71 Q206 68 211 71" stroke={NAVY} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M219 71 Q224 68 229 71" stroke={NAVY} strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="206" cy="78" rx="2.2" ry="2.8" fill={NAVY} />
      <ellipse cx="224" cy="78" rx="2.2" ry="2.8" fill={NAVY} />
      <path d="M215 81 Q218.5 87 214 88" stroke={SKIN_SHADE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M206 93 Q215 100 224 93" stroke="#b5654a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M262 150 C254 140 244 140 236 148" stroke={SHIRT} strokeWidth="16" strokeLinecap="round" fill="none" />
      <circle cx="234" cy="151" r="7" fill={SKIN} />

      {/* laptop, back towards us */}
      <rect x="146" y="126" width="98" height="62" rx="7" fill={NAVY} />
      <rect x="146" y="126" width="98" height="5" rx="2.5" fill="#2f3a75" />
      <circle cx="195" cy="156" r="5.5" fill="#3b4a8a" />

      {/* calendar */}
      <rect x="300" y="16" width="100" height="84" rx="11" fill="#fff" stroke="#c7d6f5" strokeWidth="2" />
      <path d="M300 27 A11 11 0 0 1 311 16 H389 A11 11 0 0 1 400 27 V39 H300 Z" fill="#4f7ce8" />
      <rect x="321" y="8" width="7" height="17" rx="3.5" fill="#2b4fb8" />
      <rect x="372" y="8" width="7" height="17" rx="3.5" fill="#2b4fb8" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={311 + col * 21}
            y={48 + row * 15}
            width="14"
            height="10"
            rx="3"
            fill={(row === 0 && col === 3) || (row === 1 && col === 1) ? '#f4a3a3' : '#c7d8fb'}
          />
        )),
      )}

      {/* clock */}
      <circle cx="384" cy="110" r="25" fill="#fff" stroke="#1f2a6b" strokeWidth="6" />
      {[0, 90, 180, 270].map((angle) => (
        <line key={angle} x1="384" y1="91" x2="384" y2="94.5" stroke="#1f2a6b" strokeWidth="2" strokeLinecap="round" transform={`rotate(${angle} 384 110)`} />
      ))}
      <line x1="384" y1="110" x2="384" y2="96" stroke="#1f2a6b" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="384" y1="110" x2="395" y2="115" stroke="#1f2a6b" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="384" cy="110" r="3" fill="#1f2a6b" />

      {/* small plant, right */}
      <PointLeaf base={[412, 164]} tip={[400, 138]} width={6} fill="#22a06b" />
      <PointLeaf base={[412, 164]} tip={[412, 130]} width={6} fill="#16a34a" />
      <PointLeaf base={[412, 164]} tip={[424, 140]} width={6} fill="#34c38f" />
      <path d="M401 162 H423 L420 180 H404 Z" fill="#cdd9ee" />
    </svg>
  );
}

const CHAIR = '#2a0b63';
const CHAIR_DARK = '#1b0646';
const DESK = '#ece4fa';
const MUTED_TEXT = '#6b6490';

/** A white card floating over the purple login panel. */
function FloatCard({ x, y, width, height, children, late }) {
  return (
    <g className={late ? 'drift-late' : 'drift'}>
      <rect x={x} y={y + 4} width={width} height={height} rx="14" fill="#14043a" opacity="0.25" />
      <rect x={x} y={y} width={width} height={height} rx="14" fill="#fff" />
      {children}
    </g>
  );
}

/**
 * Login panel scene: an employee on a headset at their laptop, with the workday floating around them:
 * check-in, today's tasks, hours this week and a team chat. Drawn for the purple brand panel.
 */
export function DeskWorkIllustration({ className }) {
  const text = { fontFamily: 'inherit' };
  return (
    <svg viewBox="0 0 480 440" className={className} role="img" aria-label="An employee working at their desk">
      {/* glow and orbit */}
      <circle cx="250" cy="236" r="176" fill="#fff" opacity="0.06" />
      <circle cx="250" cy="236" r="132" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.5" strokeDasharray="4 8" />
      <ellipse cx="250" cy="404" rx="205" ry="11" fill="#0d0230" opacity="0.28" />
      <Sparkle x={188} y={30} size={7} />
      <Sparkle x={462} y={176} size={5} fill={BRAND_300} />
      <Sparkle x={26} y={250} size={4.5} fill="#fff" />

      {/* plant */}
      <PointLeaf base={[70, 346]} tip={[30, 280]} width={18} fill="#22a06b" />
      <PointLeaf base={[70, 346]} tip={[56, 250]} width={20} fill="#16a34a" />
      <PointLeaf base={[70, 346]} tip={[90, 256]} width={20} fill="#34c38f" />
      <PointLeaf base={[70, 346]} tip={[112, 292]} width={17} fill="#22a06b" />
      <PointLeaf base={[70, 348]} tip={[24, 320]} width={12} fill="#34c38f" />
      <rect x="40" y="342" width="60" height="11" rx="4" fill="#d9c9f4" />
      <path d="M44 351 H96 L90 402 H50 Z" fill={DESK} />

      {/* chair */}
      <rect x="124" y="196" width="24" height="118" rx="12" fill={CHAIR} transform="rotate(-10 136 312)" />
      <rect x="140" y="300" width="110" height="16" rx="8" fill={CHAIR} />
      <rect x="190" y="314" width="12" height="52" fill={CHAIR_DARK} />
      <path d="M150 372 H244" stroke={CHAIR_DARK} strokeWidth="8" strokeLinecap="round" />
      {[150, 197, 244].map((cx) => (
        <circle key={cx} cx={cx} cy={cx === 197 ? 386 : 384} r="7" fill={CHAIR_DARK} />
      ))}

      {/* desk legs sit behind the person */}
      <rect x="246" y="274" width="10" height="128" rx="3" fill="#cbb8f0" />
      <rect x="436" y="274" width="10" height="128" rx="3" fill="#cbb8f0" />

      {/* legs */}
      <path d="M186 290 H268" stroke={NAVY} strokeWidth="30" strokeLinecap="round" />
      <path d="M268 292 L278 374" stroke={NAVY} strokeWidth="24" strokeLinecap="round" />
      <rect x="262" y="372" width="44" height="15" rx="7.5" fill="#fff" />
      <rect x="262" y="382" width="44" height="5" rx="2.5" fill="#d9c9f4" />

      {/* desk, laptop, mug */}
      <rect x="236" y="262" width="222" height="12" rx="5" fill={DESK} />
      <rect x="286" y="254" width="92" height="8" rx="3" fill="#d9c9f4" />
      <path d="M367 258 L383 186 L392 188 L377 260 Z" fill={BRAND_300} />
      <circle cx="381" cy="222" r="2.5" fill="#fff" opacity="0.8" />
      <rect x="410" y="236" width="22" height="26" rx="4" fill="#fff" />
      <path d="M432 242 a6 6 0 0 1 0 12" stroke="#fff" strokeWidth="3" fill="none" />
      <path d="M417 230 q-4 -6 0 -12 q4 -6 0 -12 M425 230 q-4 -6 0 -12 q4 -6 0 -12" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* far arm, behind the body */}
      <path d="M222 214 Q238 240 250 252" stroke={GOLD_DARK} strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M250 252 L296 256" stroke={SKIN_SHADE} strokeWidth="11" strokeLinecap="round" />
      <circle cx="300" cy="255" r="6" fill={SKIN_SHADE} />

      {/* body and head */}
      <rect x="210" y="178" width="16" height="30" rx="7" fill={SKIN_SHADE} />
      <path d="M172 296 C166 258 172 222 192 206 C210 192 238 196 246 214 C254 232 248 266 242 296 Z" fill={GOLD} />
      <path d="M212 202 L222 218 L232 202" stroke={GOLD_DARK} strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <circle cx="222" cy="158" r="27" fill={SKIN} />
      <path d="M247 154 q8 5 0 10" fill={SKIN} />
      <path d="M196 162 C192 130 214 118 236 124 C252 128 258 140 253 148 C242 141 230 141 222 147 C216 152 214 166 208 178 C200 176 197 170 196 162 Z" fill={HAIR} />
      <path d="M233 146 q5 -3 10 0" stroke={HAIR} strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="238" cy="155" rx="2.4" ry="3" fill={NAVY} />
      <path d="M236 170 q5 4 10 0" stroke="#b5654a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* headset */}
      <path d="M213 151 C210 128 224 118 240 126" stroke={CHAIR} strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="206" y="150" width="14" height="22" rx="6" fill={CHAIR} />
      <path d="M214 170 Q222 183 237 177" stroke={CHAIR} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="239" cy="176" r="3" fill={GOLD} />

      {/* near arm, typing */}
      <path d="M230 214 Q244 238 256 250" stroke={GOLD} strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d="M256 250 L304 252" stroke={SKIN} strokeWidth="12" strokeLinecap="round" />
      <circle cx="308" cy="251" r="7" fill={SKIN} />

      {/* checked in */}
      <FloatCard x={36} y={56} width={156} height={58}>
        <circle cx="64" cy="85" r="15" fill="#dcfce7" />
        <path d="M57 85 l5 5 l9 -10" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="88" y="81" fontSize="12.5" fontWeight="700" fill={NAVY} style={text}>
          Checked in
        </text>
        <text x="88" y="99" fontSize="10.5" fill={MUTED_TEXT} style={text}>
          09:28 · On time
        </text>
      </FloatCard>

      {/* hours this week */}
      <FloatCard x={20} y={130} width={92} height={62} late>
        <text x="32" y="148" fontSize="9.5" fontWeight="600" fill={MUTED_TEXT} style={text}>
          This week
        </text>
        {[18, 26, 14, 30, 22].map((h, i) => (
          <rect key={i} x={32 + i * 14} y={182 - h} width="8" height={h} rx="3" fill={i === 3 ? GOLD : '#d9c9f4'} />
        ))}
      </FloatCard>

      {/* team chat */}
      <g className="drift-late">
        <path d="M206 70 H270 a12 12 0 0 1 12 12 V94 a12 12 0 0 1 -12 12 H246 L236 116 L234 106 H206 a12 12 0 0 1 -12 -12 V82 a12 12 0 0 1 12 -12 Z" fill="#fff" />
        {[220, 238, 256].map((cx, i) => (
          <circle key={cx} cx={cx} cy="88" r="4" fill={i === 1 ? BRAND_500 : BRAND_300} />
        ))}
      </g>

      {/* today's tasks */}
      <FloatCard x={292} y={36} width={160} height={106}>
        <text x="308" y="60" fontSize="12.5" fontWeight="700" fill={NAVY} style={text}>
          Today’s tasks
        </text>
        {[
          [78, 72, true],
          [96, 58, true],
          [114, 84, false],
        ].map(([y, width, done]) => (
          <g key={y}>
            {done ? (
              <>
                <rect x="308" y={y - 8} width="12" height="12" rx="3.5" fill="#22c55e" />
                <path d={`M310.5 ${y - 2} l2.5 2.5 l4.5 -5`} stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </>
            ) : (
              <rect x="309" y={y - 7} width="10" height="10" rx="3" fill="none" stroke="#cbb8f0" strokeWidth="1.6" />
            )}
            <rect x="328" y={y - 5} width={width} height="7" rx="3.5" fill={done ? '#ece4fa' : '#d9c9f4'} />
          </g>
        ))}
        <rect x="308" y="128" width="128" height="5" rx="2.5" fill="#ece4fa" />
        <rect x="308" y="128" width="86" height="5" rx="2.5" fill={GOLD} />
      </FloatCard>
    </svg>
  );
}

function Diya() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <path d="M24 6 C29 13 30 18 24 23 C18 18 19 13 24 6 Z" fill="#f59e0b" />
      <path d="M24 12 C26.5 15.5 26.5 18 24 20.5 C21.5 18 21.5 15.5 24 12 Z" fill="#fde68a" />
      <path d="M7 26 H41 C39 36 32.5 41 24 41 C15.5 41 9 36 7 26 Z" fill="#ea580c" />
      <path d="M7 26 H41" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="17" cy="32" r="1.8" fill="#fde68a" />
      <circle cx="24" cy="34" r="1.8" fill="#fde68a" />
      <circle cx="31" cy="32" r="1.8" fill="#fde68a" />
    </svg>
  );
}

function Tree() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <path d="M24 7 L35 21 H29 L38 33 H10 L19 21 H13 Z" fill="#16a34a" />
      <rect x="21" y="33" width="6" height="8" rx="1" fill="#92400e" />
      <path d="M24 2.5 L25.6 6 L29.3 6.3 L26.5 8.7 L27.4 12.3 L24 10.4 L20.6 12.3 L21.5 8.7 L18.7 6.3 L22.4 6 Z" fill={GOLD} />
      <circle cx="20" cy="18" r="1.8" fill="#ef4444" />
      <circle cx="28" cy="24" r="1.8" fill={GOLD} />
      <circle cx="17" cy="29" r="1.8" fill="#3b82f6" />
      <circle cx="31" cy="30" r="1.8" fill="#ef4444" />
    </svg>
  );
}

function Flag() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <rect x="8" y="5" width="3" height="38" rx="1.5" fill="#94a3b8" />
      <rect x="11" y="8" width="29" height="7.5" fill="#ff9933" />
      <rect x="11" y="15.5" width="29" height="7.5" fill="#fff" />
      <rect x="11" y="23" width="29" height="7.5" fill="#138808" />
      <rect x="11" y="8" width="29" height="22.5" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
      <circle cx="25.5" cy="19.25" r="2.8" fill="none" stroke="#000080" strokeWidth="1" />
      <circle cx="25.5" cy="19.25" r="0.7" fill="#000080" />
    </svg>
  );
}

function CalendarArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <rect x="8" y="10" width="32" height="30" rx="6" fill="#fff" stroke={BRAND_300} strokeWidth="2" />
      <path d="M8 16 A6 6 0 0 1 14 10 H34 A6 6 0 0 1 40 16 V20 H8 Z" fill={BRAND_500} />
      <path d="M24 35 C24 35 16 30 16 25.5 C16 23 18 21.5 20 21.5 C21.7 21.5 23 22.5 24 24 C25 22.5 26.3 21.5 28 21.5 C30 21.5 32 23 32 25.5 C32 30 24 35 24 35 Z" fill="#ec4899" />
    </svg>
  );
}

const HOLIDAY_ART = [
  [/diwali|deepavali|karthigai/i, Diya, 'bg-orange-50'],
  [/christmas/i, Tree, 'bg-green-50'],
  [/republic|independence|gandhi/i, Flag, 'bg-sky-50'],
];

/** A small picture for a holiday, picked from its name, on a soft tile. */
export function HolidayArt({ name }) {
  const [, Art, tone] = HOLIDAY_ART.find(([pattern]) => pattern.test(name ?? '')) ?? [null, CalendarArt, 'bg-brand-50'];
  return (
    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
      <Art />
    </span>
  );
}

/** Leaf with a light midrib, drawn upright and then turned. */
function VeinedLeaf({ cx, cy, rx, ry, rotate, fill }) {
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} />
      <line x1={cx} y1={cy + ry - 3} x2={cx} y2={cy - ry + 6} stroke="#dcfce7" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

/** A big gold trophy on a navy base, with a soft glow, leaves either side and confetti. */
export function TrophyIllustration({ className }) {
  return (
    <svg viewBox="0 0 360 220" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="trophy-cup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id="trophy-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.65" stopColor="#fefce8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fefce8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="190" cy="104" r="100" fill="url(#trophy-glow)" />
      <circle cx="338" cy="214" r="70" fill="#dcfce7" opacity="0.8" />

      {/* confetti */}
      <circle cx="108" cy="38" r="5" fill="none" stroke="#22c55e" strokeWidth="3" />
      <rect x="118" y="74" width="9" height="5" rx="2" transform="rotate(32 122 76)" fill="#22c55e" />
      <rect x="96" y="102" width="10" height="10" rx="2.5" transform="rotate(18 101 107)" fill="none" stroke="#ef4444" strokeWidth="2.6" />
      <rect x="126" y="134" width="6" height="6" rx="1" transform="rotate(45 129 137)" fill="#facc15" />
      <rect x="262" y="24" width="11" height="5" rx="2" transform="rotate(-32 267 26)" fill="#22c55e" />
      <path d="M300 54 a7 7 0 0 1 9 9" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      <rect x="262" y="92" width="7" height="4" rx="1.5" transform="rotate(22 265 94)" fill="#facc15" />
      <rect x="276" y="132" width="10" height="10" rx="2.5" transform="rotate(16 281 137)" fill="#3b82f6" />
      <circle cx="248" cy="14" r="3" fill="#facc15" />
      <circle cx="146" cy="16" r="2.5" fill="#22c55e" />
      <Sparkle x={160} y={22} size={5} fill="#facc15" />

      {/* handles, cup, star */}
      <path d="M140 50 H118 C106 50 101 62 103 75 C106 93 121 103 142 105" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" />
      <path d="M240 50 H262 C274 50 279 62 277 75 C274 93 259 103 238 105" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" />
      <rect x="132" y="28" width="116" height="13" rx="6.5" fill="#f59e0b" />
      <path d="M138 36 H242 V72 C242 108 220 128 190 128 C160 128 138 108 138 72 Z" fill="url(#trophy-cup)" />
      <path d="M190 36 H242 V72 C242 108 220 128 190 128 Z" fill="#d97706" opacity="0.22" />
      <path d="M150 42 H164 V80 C164 97 170 109 178 117 C159 111 150 96 150 77 Z" fill="#fef3c7" opacity="0.55" />
      <path d="M190 54 L195 67.1 L209 67.8 L198.1 76.6 L201.8 90.2 L190 82.5 L178.2 90.2 L181.9 76.6 L171 67.8 L185 67.1 Z" fill="#fff7d6" />

      {/* stem and base */}
      <path d="M178 127 H202 L198 150 H182 Z" fill="#f59e0b" />
      <rect x="168" y="148" width="44" height="11" rx="3.5" fill="#fbbf24" />
      <ellipse cx="190" cy="209" rx="62" ry="5" fill="#0f172a" opacity="0.08" />
      <rect x="148" y="158" width="84" height="48" rx="7" fill="#1e293b" />
      <rect x="148" y="158" width="84" height="8" rx="4" fill="#334155" />
      <rect x="171" y="174" width="38" height="15" rx="3" fill="#fbbf24" />

      {/* leaves */}
      <VeinedLeaf cx={74} cy={176} rx={13} ry={34} rotate={-42} fill="#22c55e" />
      <VeinedLeaf cx={92} cy={164} rx={14} ry={42} rotate={-14} fill="#16a34a" />
      <VeinedLeaf cx={111} cy={170} rx={12} ry={36} rotate={16} fill="#4ade80" />
      <VeinedLeaf cx={127} cy={186} rx={10} ry={26} rotate={44} fill="#22c55e" />
      <VeinedLeaf cx={290} cy={186} rx={10} ry={28} rotate={-26} fill="#22c55e" />
      <VeinedLeaf cx={305} cy={178} rx={11} ry={35} rotate={4} fill="#16a34a" />
      <VeinedLeaf cx={320} cy={188} rx={10} ry={28} rotate={32} fill="#4ade80" />
    </svg>
  );
}
