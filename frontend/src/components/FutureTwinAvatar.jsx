import React from 'react';
import { motion } from 'framer-motion';

/**
 * FutureTwinAvatar
 * Renders an expressive, animated SVG digital twin whose posture, mood,
 * lighting, surroundings, and accessories dynamically adapt to projected habits.
 * Zero external image dependencies.
 */
export default function FutureTwinAvatar({ avatar, avatarState, title, subtitle, compact = false }) {
  const effectiveAvatar = avatar || avatarState;
  if (!effectiveAvatar) return null;

  const {
    posture = 'neutral',
    expression = 'neutral',
    aura_color = '#3B82F6',
    aura_intensity = 0.6,
    energy_level = 65,
    accessories = [],
    environment_theme = 'balanced_workspace',
    badge_title = 'Steady Track',
  } = effectiveAvatar;

  const isSlouched = posture === 'slouched';
  const isConfident = posture === 'upright_confident';
  const hasDarkCircles = accessories.includes('dark_circles');
  const hasCoffee = accessories.includes('caffeine_mug');
  const hasPhoneGlow = accessories.includes('smartphone_glow');
  const hasSmartwatch = accessories.includes('smartwatch');
  const hasGradCap = accessories.includes('graduation_cap');
  const hasSavingsBadge = accessories.includes('investment_badge');
  const hasSparkles = accessories.includes('golden_sparkles');

  // Friendly human mood description instead of clinical labels
  const moodLabel =
    expression === 'radiant'
      ? 'Thriving & Clear-Headed'
      : expression === 'smiling'
      ? 'Balanced & Energized'
      : expression === 'exhausted'
      ? 'Running on Empty'
      : expression === 'stressed'
      ? 'Stretched Thin'
      : 'Coasting Along';

  // Background palette by environment
  const envColors =
    environment_theme === 'sunlit_loft'
      ? { bg1: '#ecfdf5', bg2: '#d1fae5', darkBg1: '#064e3b', darkBg2: '#022c22', hill: '#a7f3d0' }
      : environment_theme === 'cluttered_dark_room'
      ? { bg1: '#f1f5f9', bg2: '#e2e8f0', darkBg1: '#1e1b4b', darkBg2: '#0f172a', hill: '#cbd5e1' }
      : { bg1: '#eff6ff', bg2: '#dbeafe', darkBg1: '#172554', darkBg2: '#0f172a', hill: '#bfdbfe' };

  // Dynamic head & torso offsets for posture
  const headTransform = isSlouched
    ? { y: 12, rotate: -6 }
    : isConfident
    ? { y: -4, rotate: 0 }
    : { y: 2, rotate: 0 };

  const shirtColor =
    environment_theme === 'sunlit_loft'
      ? '#059669'
      : environment_theme === 'cluttered_dark_room'
      ? '#64748b'
      : '#4f46e5';

  return (
    <div className="flex flex-col items-center">
      {title && (
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      )}

      {/* Animated Scene Container */}
      <div
        className={`relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/70 shadow-inner ${
          compact ? 'w-52 h-52' : 'w-64 h-64 sm:w-72 sm:h-72'
        }`}
        style={{
          background: `linear-gradient(160deg, ${envColors.bg1}, ${envColors.bg2})`,
        }}
      >
        {/* Subtle dark mode backdrop overlay */}
        <div
          className="absolute inset-0 hidden dark:block opacity-90"
          style={{
            background: `linear-gradient(160deg, ${envColors.darkBg1}, ${envColors.darkBg2})`,
          }}
        />

        {/* Pulsing Energy Aura */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [aura_intensity * 0.45, aura_intensity * 0.75, aura_intensity * 0.45],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-6 rounded-full blur-2xl pointer-events-none"
          style={{ backgroundColor: aura_color }}
        />

        {/* SVG Scene & Digital Twin */}
        <svg viewBox="0 0 240 240" className="relative z-10 w-full h-full">
          {/* Sunlit window rays vs dim lamp */}
          {environment_theme === 'sunlit_loft' && (
            <g opacity="0.7">
              <circle cx="195" cy="45" r="22" fill="#FDE047" />
              <path d="M160 0 L240 0 L240 130 L130 130 Z" fill="#FEF08A" opacity="0.2" />
            </g>
          )}
          {environment_theme === 'cluttered_dark_room' && (
            <g opacity="0.55">
              {/* Late night crescent moon / dim glow */}
              <circle cx="42" cy="42" r="14" fill="#94A3B8" opacity="0.4" />
              <circle cx="48" cy="38" r="12" fill="#1E293B" opacity="0.35" />
            </g>
          )}

          {/* Background Indoor Plant (Thriving vs Drooping) */}
          <g transform="translate(26, 175)">
            <rect x="0" y="20" width="22" height="22" rx="4" fill="#D97706" opacity="0.85" />
            {environment_theme === 'cluttered_dark_room' ? (
              <path d="M11 20 Q4 10 0 18 M11 20 Q18 12 22 20" stroke="#65A30D" strokeWidth="3" fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <path d="M11 20 Q2 2 6 -4 Q12 6 11 20" fill="#10B981" />
                <path d="M11 20 Q22 2 18 -6 Q12 6 11 20" fill="#059669" />
                <path d="M11 20 Q11 -4 11 -12" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
          </g>

          {/* Desk / Ground Surface */}
          <rect x="0" y="210" width="240" height="30" fill="#334155" opacity="0.18" />

          {/* Character Group with gentle breathing animation */}
          <motion.g
            animate={{
              y: isSlouched ? [0, 1.5, 0] : [0, -3, 0],
            }}
            transition={{
              duration: isSlouched ? 4.2 : 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Torso & Shoulders */}
            <path
              d={
                isSlouched
                  ? 'M68 214 C68 164 85 152 120 156 C155 160 172 168 172 214 Z'
                  : isConfident
                  ? 'M64 214 C66 156 88 144 120 144 C152 144 174 156 176 214 Z'
                  : 'M68 214 C70 160 90 148 120 148 C150 148 170 160 172 214 Z'
              }
              fill={shirtColor}
            />
            {/* Shirt collar detail */}
            <path
              d={
                isSlouched
                  ? 'M105 156 Q120 168 135 156'
                  : 'M104 146 Q120 158 136 146'
              }
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Neck */}
            <rect
              x="110"
              y={isSlouched ? '134' : '126'}
              width="20"
              height="24"
              rx="8"
              fill="#FDBA74"
            />

            {/* Head Group (tilts slightly forward when slouched) */}
            <motion.g
              animate={headTransform}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              style={{ originX: '120px', originY: '120px' }}
            >
              {/* Hair back */}
              <circle cx="120" cy="86" r="40" fill="#1E293B" />

              {/* Face */}
              <rect x="85" y="58" width="70" height="74" rx="34" fill="#FED7AA" />

              {/* Hair front bangs */}
              <path
                d="M84 82 C86 52 154 52 156 82 C142 68 130 74 120 68 C108 75 94 70 84 82 Z"
                fill="#1E293B"
              />

              {/* Graduation Cap accessory (High CGPA >= 8.8) */}
              {hasGradCap && (
                <g transform="translate(0, -14)">
                  <polygon points="120,38 166,54 120,70 74,54" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                  <rect x="102" y="60" width="36" height="10" rx="2" fill="#0F172A" />
                  <path d="M158 56 L162 76" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="162" cy="78" r="3" fill="#FBBF24" />
                </g>
              )}

              {/* Cheeks / Blush when thriving */}
              {(expression === 'smiling' || expression === 'radiant') && (
                <g opacity="0.45">
                  <ellipse cx="98" cy="104" rx="6" ry="3.5" fill="#FB7185" />
                  <ellipse cx="142" cy="104" rx="6" ry="3.5" fill="#FB7185" />
                </g>
              )}

              {/* Dark Circles under eyes (Low sleep) */}
              {hasDarkCircles && (
                <g opacity="0.55">
                  <path d="M97 98 Q105 103 113 98" stroke="#64748B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M127 98 Q135 103 143 98" stroke="#64748B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </g>
              )}

              {/* Eyes */}
              {expression === 'exhausted' ? (
                <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M98 92 Q105 95 112 92" fill="none" />
                  <path d="M128 92 Q135 95 142 92" fill="none" />
                </g>
              ) : expression === 'radiant' ? (
                <g>
                  <circle cx="105" cy="91" r="4.5" fill="#1E293B" />
                  <circle cx="135" cy="91" r="4.5" fill="#1E293B" />
                  <circle cx="106.5" cy="89.5" r="1.6" fill="#FFFFFF" />
                  <circle cx="136.5" cy="89.5" r="1.6" fill="#FFFFFF" />
                </g>
              ) : (
                <g>
                  <circle cx="105" cy="92" r="4" fill="#1E293B" />
                  <circle cx="135" cy="92" r="4" fill="#1E293B" />
                  <circle cx="106" cy="90.5" r="1.2" fill="#FFFFFF" />
                  <circle cx="136" cy="90.5" r="1.2" fill="#FFFFFF" />
                </g>
              )}

              {/* Eyebrows */}
              {expression === 'stressed' || expression === 'exhausted' ? (
                <g stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="97" y1="84" x2="112" y2="81" />
                  <line x1="128" y1="81" x2="143" y2="84" />
                </g>
              ) : (
                <g stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M97 82 Q105 79 112 82" fill="none" />
                  <path d="M128 82 Q135 79 143 82" fill="none" />
                </g>
              )}

              {/* Mouth Expression */}
              {expression === 'radiant' || expression === 'smiling' ? (
                <path
                  d={expression === 'radiant' ? 'M107 109 Q120 123 133 109 Z' : 'M109 111 Q120 120 131 111'}
                  fill={expression === 'radiant' ? '#FFFFFF' : 'none'}
                  stroke="#9A3412"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ) : expression === 'exhausted' || expression === 'stressed' ? (
                <path
                  d="M111 116 Q120 110 129 116"
                  fill="none"
                  stroke="#9A3412"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ) : (
                <line x1="112" y1="113" x2="128" y2="113" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
              )}
            </motion.g>

            {/* Smartwatch on left wrist */}
            {hasSmartwatch && (
              <g transform="translate(68, 192)">
                <rect x="0" y="0" width="12" height="15" rx="3" fill="#0F172A" />
                <rect x="2" y="3" width="8" height="9" rx="1.5" fill="#10B981" />
              </g>
            )}
          </motion.g>

          {/* Desk Props: Coffee Cup (low sleep) & Smartphone Glow (high screen time) */}
          {hasCoffee && (
            <g transform="translate(178, 186)">
              <rect x="0" y="6" width="18" height="20" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
              <path d="M18 10 Q25 10 25 16 Q25 22 18 22" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
              <motion.path
                animate={{ y: [-1, -5, -1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                d="M5 2 Q7 -4 5 -8 M12 2 Q14 -4 12 -8"
                stroke="#94A3B8"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          )}

          {hasPhoneGlow && (
            <g transform="translate(194, 152)">
              <rect x="0" y="0" width="18" height="30" rx="3" fill="#1E293B" />
              <rect x="2" y="3" width="14" height="22" rx="1.5" fill="#60A5FA" opacity="0.9" />
            </g>
          )}

          {/* Investment Savings Badge */}
          {hasSavingsBadge && (
            <motion.g
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              transform="translate(185, 92)"
            >
              <circle cx="16" cy="16" r="15" fill="#10B981" opacity="0.95" />
              <text x="16" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">₹</text>
            </motion.g>
          )}

          {/* Golden Sparkles when thriving */}
          {hasSparkles && (
            <g fill="#FBBF24">
              <motion.circle
                animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                cx="48"
                cy="74"
                r="3.5"
              />
              <motion.circle
                animate={{ scale: [1.2, 0.7, 1.2], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                cx="192"
                cy="128"
                r="3"
              />
              <motion.circle
                animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                cx="166"
                cy="48"
                r="2.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Friendly Status & Energy Pill */}
      <div className="mt-3 flex flex-col items-center gap-1.5 w-full max-w-[240px]">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
          style={{ backgroundColor: aura_color }}
        >
          {badge_title}
        </span>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Mood: {moodLabel}
        </span>

        {/* Simple Energy Meter */}
        <div className="w-full mt-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Daily Energy</span>
            <span>{energy_level}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${energy_level}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: aura_color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
