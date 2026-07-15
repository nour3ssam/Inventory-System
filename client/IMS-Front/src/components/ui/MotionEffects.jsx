/**
 * MotionEffects.jsx
 * Shared premium motion primitives used across Profile and Settings pages.
 * All components are purely client-side React — no network calls, no Redux.
 */
import { useRef, useCallback, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

/* ─────────────────────────────────────────────────────────────────────────── *
 * 1. MagneticButton
 *    Wraps any <button> with a spring-physics "magnetic pull" that nudges the
 *    element toward the cursor while it hovers nearby.
 *
 *    Props
 *    ─────
 *    strength  number  (0–1)  how far the button moves toward cursor. Default 0.32
 *    type      string         forwarded to <button>
 *    All other props are spread onto the motion.button element.
 * ─────────────────────────────────────────────────────────────────────────── */
export function MagneticButton({
  children,
  className,
  style,
  strength = 0.32,
  type = 'button',
  onClick,
  disabled,
  id,
  title,
  onMouseDown,
  onMouseUp,
  onMouseLeave: externalLeave,
  onTouchStart,
  onTouchEnd,
  ...rest
}) {
  const ref    = useRef(null);
  const rawX   = useMotionValue(0);
  const rawY   = useMotionValue(0);
  const springX = useSpring(rawX, { damping: 18, stiffness: 260, mass: 0.45 });
  const springY = useSpring(rawY, { damping: 18, stiffness: 260, mass: 0.45 });

  const handleMove = useCallback((e) => {
    if (!ref.current || disabled) return;
    const r = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - (r.left + r.width  / 2)) * strength);
    rawY.set((e.clientY - (r.top  + r.height / 2)) * strength);
  }, [rawX, rawY, strength, disabled]);

  const handleLeave = useCallback((e) => {
    rawX.set(0);
    rawY.set(0);
    externalLeave?.(e);
  }, [rawX, rawY, externalLeave]);

  return (
    <motion.button
      ref={ref}
      id={id}
      type={type}
      className={className}
      style={{ x: springX, y: springY, ...style }}
      disabled={disabled}
      title={title}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 * 2. EnergyScanFrame
 *    Wraps a card/panel in a rotating conic-gradient border powered by the
 *    CSS Houdini @property trick (defined in each page's CSS file).
 *
 *    The wrapper renders ONE extra <div class="ec-frame__ring"> sibling that
 *    sits behind the content via z-index inside an isolation context.
 *
 *    Props
 *    ─────
 *    variant  'card' | 'panel'   sets border-radius to match glass-card / glass-panel
 *    className string            appended to the ec-frame root
 * ─────────────────────────────────────────────────────────────────────────── */
export function EnergyScanFrame({ children, className = '', variant = 'panel', style }) {
  return (
    <div
      className={`ec-frame ec-frame--${variant}${className ? ` ${className}` : ''}`}
      style={style}
    >
      <div className="ec-frame__ring" aria-hidden="true" />
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 * 3. GlitchText
 *    On mount, rapidly scrambles characters in `text` before resolving to the
 *    real string — a classic "data-decoding" entrance animation.
 *
 *    Props
 *    ─────
 *    text      string   the final text to display
 *    className string   applied to the wrapping <span>
 *    delay     number   ms to wait before starting (default 400)
 *    speed     number   ms per iteration frame (default 38)
 * ─────────────────────────────────────────────────────────────────────────── */
const GLITCH_POOL = '!<>-_\\/[]{}—=+*^?#@$%&ABCDEFabcdef01234!><_[]{}';

export function GlitchText({ text, className, delay = 400, speed = 38 }) {
  const [output, setOutput] = useState(
    // Start with randomised characters so first paint is already glitched
    text.split('').map(ch => ch === ' ' ? ' ' : GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)]).join('')
  );
  const timerRef = useRef(null);

  useEffect(() => {
    let iteration = 0;
    const maxIter = text.length * 3;

    const tick = () => {
      setOutput(
        text.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < Math.floor(iteration / 3)) return ch;        // already resolved
          return GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)];
        }).join('')
      );
      iteration++;
      if (iteration <= maxIter) {
        timerRef.current = setTimeout(tick, speed);
      } else {
        setOutput(text); // guarantee clean final state
      }
    };

    timerRef.current = setTimeout(tick, delay);
    return () => clearTimeout(timerRef.current);
  }, [text, delay, speed]);

  return <span className={className} data-text={text}>{output}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────── *
 * 4. HoldToConfirm
 *    A button that requires a sustained press (default 2 s) before firing
 *    `onConfirm`. Progress is visualised by an SVG ring that fills in red.
 *    While the user holds, `onHoldStart` is called so the parent can trigger
 *    ambient crimson mode.
 *
 *    Props
 *    ─────
 *    label       string     button text
 *    icon        ReactNode  lucide icon placed inside the ring area
 *    duration    number     ms required to hold (default 2000)
 *    className   string     applied to root <button>
 *    onConfirm   () => void called once at 100 % progress
 *    onHoldStart () => void called when the press begins
 *    onHoldEnd   () => void called when the press is released before confirm
 * ─────────────────────────────────────────────────────────────────────────── */
export function HoldToConfirm({
  label,
  icon,
  duration = 2000,
  className = 'btn-danger',
  onConfirm,
  onHoldStart,
  onHoldEnd,
}) {
  const [progress,   setProgress]   = useState(0);
  const [isHolding,  setIsHolding]  = useState(false);
  const [completed,  setCompleted]  = useState(false);
  const rafRef   = useRef(null);
  const startRef = useRef(null);

  // cleanup on unmount
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const startHold = (e) => {
    e.preventDefault();
    if (completed) return;
    setIsHolding(true);
    onHoldStart?.();
    startRef.current = performance.now();

    const tick = (now) => {
      const prog = Math.min((now - startRef.current) / duration, 1);
      setProgress(prog);
      if (prog < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIsHolding(false);
        setCompleted(true);
        onConfirm?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopHold = () => {
    if (completed) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsHolding(false);
    setProgress(0);
    onHoldEnd?.();
  };

  // SVG ring geometry
  const R    = 10;
  const CIRC = 2 * Math.PI * R;
  const dash = CIRC * (1 - progress);

  return (
    <button
      type="button"
      className={`${className} hold-btn${isHolding ? ' holding' : ''}${completed ? ' completed' : ''}`}
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      disabled={completed}
      title={completed ? 'Action confirmed' : 'Hold 2 s to confirm'}
      aria-label={label}
    >
      {/* SVG progress ring + icon */}
      <span className="hold-btn__ring-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="hold-ring">
          {/* Track */}
          <circle cx="12" cy="12" r={R} fill="none" stroke="rgba(220,20,60,0.2)" strokeWidth="2.5" />
          {/* Fill */}
          {progress > 0 && (
            <circle
              cx="12" cy="12" r={R}
              fill="none"
              stroke="#DC143C"
              strokeWidth="2.5"
              strokeDasharray={CIRC}
              strokeDashoffset={dash}
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
            />
          )}
        </svg>
        <span className="hold-btn__icon">{icon}</span>
      </span>
      <span className="hold-btn__label">
        {completed ? '✓ Confirmed' : label}
      </span>
    </button>
  );
}
