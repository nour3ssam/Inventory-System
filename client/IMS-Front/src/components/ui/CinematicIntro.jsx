import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'motion/react';

/* ─── Config ──────────────────────────────────────────────────────── */
const TOTAL_CLICKS = 4;
const W = 190;     // face width/height in px
const HALF = 95;   // W / 2  →  translateZ distance
let _key = 0;

const rand  = (a, b) => Math.random() * (b - a) + a;
const sleep = ms    => new Promise(r => setTimeout(r, ms));

/* ─── Cardboard color palette ─────────────────────────────────────── */
const FACES = {
  front:  { bg: 'linear-gradient(150deg,#FCD34D 0%,#F59E0B 55%,#D97706 100%)', border: '3.5px solid #92400E' },
  back:   { bg: '#B45309',                                                       border: '3.5px solid #78350F' },
  left:   { bg: 'linear-gradient(90deg,#B45309 0%,#92400E 100%)',               border: '3.5px solid #78350F' },
  right:  { bg: 'linear-gradient(90deg,#D97706 0%,#B45309 100%)',               border: '3.5px solid #78350F' },
  bottom: { bg: '#78350F',                                                       border: '3.5px solid #451A03' },
  top:    { bg: 'linear-gradient(135deg,#FDE68A 0%,#FCD34D 55%,#FBBF24 100%)', border: '3.5px solid #92400E' },
};

/* Face 3D transforms for a W×W×W cube centred at origin */
const TRANSFORMS = {
  front:  `translateZ(${HALF}px)`,
  back:   `rotateY(180deg) translateZ(${HALF}px)`,
  left:   `rotateY(-90deg) translateZ(${HALF}px)`,
  right:  `rotateY(90deg)  translateZ(${HALF}px)`,
  bottom: `rotateX(-90deg) translateZ(${HALF}px)`,
  top:    `rotateX(90deg)  translateZ(${HALF}px)`,
};

/* ─── A single face panel ─────────────────────────────────────────── */
function Face({ id, children }) {
  const { bg, border } = FACES[id];
  return (
    <div style={{
      position: 'absolute', width: W, height: W, top: 0, left: 0,
      transform: TRANSFORMS[id],
      background: bg, border,
      backfaceVisibility: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

/* ─── Star / sparkle burst ────────────────────────────────────────── */
const EMOJIS = ['⭐','✨','💫','🌟','⚡','🔥'];

function StarBurst({ stars }) {
  return <>
    {stars.map(s => (
      <motion.span
        key={s.id}
        style={{ position:'absolute', top:'30%', left:'50%', fontSize:s.sz, pointerEvents:'none', zIndex:50 }}
        initial={{ x:0, y:0, opacity:1, scale:0.3, rotate:0 }}
        animate={{ x:s.dx, y:s.dy, opacity:0, scale:1.4, rotate:s.rot }}
        transition={{ duration:0.72, ease:'easeOut' }}
      >
        {EMOJIS[s.i % EMOJIS.length]}
      </motion.span>
    ))}
  </>;
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function CinematicIntro({ onComplete }) {
  const [clicks,     setClicks]     = useState(0);
  const [stars,      setStars]      = useState([]);
  const [bouncing,   setBouncing]   = useState(false);
  const [lidOpen,    setLidOpen]    = useState(false);
  const [innerGlow,  setInnerGlow]  = useState(false);
  // box rotation state – driven by Framer Motion animate
  const [boxRot,     setBoxRot]     = useState({ rotateX: -22, rotateY: -32 });
  // overlay flash
  const [flash,      setFlash]      = useState(false);

  const shakeCtrl = useAnimationControls();

  /* spawn stars on click */
  const spawnStars = useCallback(() => {
    const batch = Array.from({ length: 7 }, (_, i) => ({
      id: ++_key, i,
      dx: rand(-95, 95), dy: rand(-115, -25),
      sz: `${rand(13, 21)}px`, rot: rand(-130, 130),
    }));
    setStars(p => [...p, ...batch]);
    setTimeout(() => setStars(p => p.filter(s => !batch.find(b => b.id === s.id))), 900);
  }, []);

  /* full open sequence */
  const openSequence = useCallback(async () => {
    /* 1 – shake the box */
    await shakeCtrl.start({
      x: [-9,9,-9,8,-6,6,-3,3,0],
      transition: { duration:0.52, ease:'easeOut' },
    });
    await sleep(80);

    /* 2 – flip: rotate box so the TOP face faces the camera
           rotateX(-90) tips the box "backward" → we look straight down into the top */
    setBoxRot({ rotateX: -90, rotateY: 0 });
    await sleep(1050);

    /* 3 – lid springs open */
    setLidOpen(true);
    await sleep(350);

    /* 4 – inner glow blooms */
    setInnerGlow(true);
    await sleep(700);

    /* 5 – white flash then done */
    setFlash(true);
    await sleep(520);
    onComplete?.();
  }, [shakeCtrl, onComplete]);

  /* click handler */
  const handleClick = useCallback(() => {
    if (clicks >= TOTAL_CLICKS) return;
    spawnStars();

    /* bounce */
    setBouncing(true);
    setTimeout(() => setBouncing(false), 430);

    const next = clicks + 1;
    setClicks(next);
    if (next >= TOTAL_CLICKS) {
      setTimeout(() => openSequence(), 240);
    }
  }, [clicks, spawnStars, openSequence]);

  const isDone    = clicks >= TOTAL_CLICKS;
  const isFlipped = boxRot.rotateX === -90;
  const hints     = ['👆 Click the box!','Again!','Keep going…','One more!','🎉 Opening…'];

  return (
    <motion.div
      animate={{ background: flash ? '#ffffff' : 'radial-gradient(circle at 50% 45%, #0B1E3A 0%, #07152D 100%)' }}
      transition={{ duration: 0.45 }}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        overflow:'hidden', fontFamily:"'Inter',sans-serif",
      }}
    >
      {/* Dot-grid texture */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', opacity:0.04,
        backgroundImage:'radial-gradient(circle, rgba(255,107,0,0.9) 1px, transparent 1px)',
        backgroundSize:'30px 30px',
      }} />

      {/* Hint */}
      <AnimatePresence mode="wait">
        {!isDone && (
          <motion.p
            key={hints[clicks]}
            initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            style={{ color:'rgba(248,250,252,0.6)', fontSize:14, fontWeight:600, letterSpacing:'0.12em',
                     textTransform:'uppercase', marginBottom:88 }}
          >
            {hints[clicks]}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── 3D Stage ── */}
      <div style={{ perspective:960, perspectiveOrigin:'50% 40%' }}>
        <motion.div animate={shakeCtrl}>

          {/* Float wrapper */}
          <motion.div
            animate={!isDone ? { y:[0,-14,0] } : { y:0 }}
            transition={{ y:{ duration:3.2, repeat:Infinity, ease:'easeInOut' } }}
          >
            {/* Squash-stretch bounce */}
            <motion.div
              animate={bouncing ? {
                y:[0,-24,-8,-18,-4,-10,0],
                scaleX:[1,0.91,1.02,0.95,1],
                scaleY:[1,1.08,0.97,1.03,1],
              } : {}}
              transition={{ duration:0.43, ease:'easeOut' }}
              style={{ transformOrigin:'center bottom' }}
            >
              {/* Click target */}
              <div
                role="button" tabIndex={0}
                onClick={handleClick}
                onKeyDown={e => (e.key==='Enter'||e.key===' ') && handleClick()}
                style={{ cursor: isDone ? 'default' : 'pointer', position:'relative' }}
              >
                <StarBurst stars={stars} />

                {/* "Click me" badge */}
                <AnimatePresence>
                  {clicks === 0 && (
                    <motion.div
                      initial={{ opacity:0, y:-4, scale:0.8 }}
                      animate={{ opacity:1, y:0,  scale:1 }}
                      exit={{ opacity:0, scale:0.7 }}
                      transition={{ delay:0.7, type:'spring', stiffness:300 }}
                      style={{
                        position:'absolute', top:-48, left:'50%', transform:'translateX(-50%)',
                        background:'#1e293b', color:'#F8FAFC', padding:'5px 14px',
                        borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:'nowrap',
                        border:'1.5px solid rgba(255,107,0,0.45)',
                        boxShadow:'0 4px 16px rgba(0,0,0,0.5)', zIndex:10,
                      }}
                    >
                      👆 Click me!
                      <div style={{ position:'absolute', bottom:-6, left:'50%', transform:'translateX(-50%)',
                                    borderLeft:'6px solid transparent', borderRight:'6px solid transparent',
                                    borderTop:'6px solid #1e293b' }} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── THE 3D BOX ── */}
                <motion.div
                  animate={{ rotateX: boxRot.rotateX, rotateY: boxRot.rotateY, scale: 1 + clicks * 0.04 }}
                  transition={{ duration:1.0, ease:[0.4,0,0.2,1] }}
                  style={{ position:'relative', width:W, height:W, transformStyle:'preserve-3d' }}
                >
                  {/* ── FRONT ── */}
                  <Face id="front">
                    {/* Tape H */}
                    <div style={{ position:'absolute', left:0, right:0, top:'50%', height:13,
                                  background:'rgba(254,240,138,0.55)', transform:'translateY(-50%)',
                                  borderTop:'1.5px solid rgba(234,215,80,0.4)',
                                  borderBottom:'1.5px solid rgba(234,215,80,0.4)' }} />
                    {/* Tape V */}
                    <div style={{ position:'absolute', top:0, bottom:0, left:'50%', width:13,
                                  background:'rgba(254,240,138,0.55)', transform:'translateX(-50%)',
                                  borderLeft:'1.5px solid rgba(234,215,80,0.4)',
                                  borderRight:'1.5px solid rgba(234,215,80,0.4)' }} />
                    {/* Crease lines */}
                    <div style={{ position:'absolute', top:0, bottom:0, left:'28%', width:1, background:'rgba(0,0,0,0.08)' }} />
                    <div style={{ position:'absolute', top:0, bottom:0, right:'28%', width:1, background:'rgba(0,0,0,0.08)' }} />
                    <span style={{ fontSize:10, fontWeight:900, color:'rgba(120,53,15,0.5)', letterSpacing:'0.3em', zIndex:1 }}>IMS</span>
                  </Face>

                  {/* ── BACK ── */}
                  <Face id="back" />

                  {/* ── LEFT ── */}
                  <Face id="left">
                    {[40,80,120].map(y => (
                      <div key={y} style={{ position:'absolute', top:y, left:8, right:8, height:1, background:'rgba(0,0,0,0.12)' }} />
                    ))}
                  </Face>

                  {/* ── RIGHT ── */}
                  <Face id="right">
                    {[40,80,120].map(y => (
                      <div key={y} style={{ position:'absolute', top:y, left:8, right:8, height:1, background:'rgba(0,0,0,0.18)' }} />
                    ))}
                  </Face>

                  {/* ── BOTTOM ── */}
                  <Face id="bottom" />

                  {/* ── TOP (with lid + inner glow) ── */}
                  <div style={{
                    position:'absolute', width:W, height:W, top:0, left:0,
                    transform: TRANSFORMS.top,
                    ...FACES.top, border: FACES.top.border,
                    background: FACES.top.bg,
                    backfaceVisibility:'hidden',
                    overflow:'visible',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {/* Inner glow – blooms when lid opens */}
                    <AnimatePresence>
                      {innerGlow && (
                        <motion.div
                          initial={{ opacity:0, scale:0.2 }}
                          animate={{ opacity:1, scale:1.6 }}
                          transition={{ duration:0.65, ease:'easeOut' }}
                          style={{
                            position:'absolute', inset:0,
                            background:'radial-gradient(circle, #fff 0%, rgba(255,107,0,0.95) 35%, rgba(255,107,0,0.3) 65%, transparent 100%)',
                            boxShadow:'0 0 80px 40px rgba(255,107,0,0.7)',
                            zIndex:5,
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Lid – opens by rotating away (rotateX from bottom edge) */}
                    {/* We wrap in a local-perspective div so the lid has its own depth */}
                    <div style={{ position:'absolute', inset:0, perspective:500, perspectiveOrigin:'50% 100%', zIndex:10 }}>
                      <motion.div
                        animate={{ rotateX: lidOpen ? -148 : 0 }}
                        transition={{ type:'spring', stiffness:75, damping:11, delay:0.05 }}
                        style={{
                          width:'100%', height:'100%',
                          transformOrigin:'bottom center',
                          background:'linear-gradient(135deg,#FDE68A 0%,#FCD34D 55%,#FBBF24 100%)',
                          border:'3.5px solid #92400E',
                          boxShadow:'inset 0 3px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.12)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          borderRadius:'2px 2px 0 0',
                        }}
                      >
                        <span style={{ fontSize:13, fontWeight:900, color:'rgba(120,53,15,0.45)', letterSpacing:'0.25em' }}>IMS</span>
                        {/* Lid crease */}
                        <div style={{ position:'absolute', bottom:'28%', left:0, right:0, height:1.5, background:'rgba(146,64,14,0.22)' }} />
                        {/* Centre dot */}
                        <div style={{ position:'absolute', bottom:'8px', left:'50%', transform:'translateX(-50%)', width:10, height:10, borderRadius:'50%', background:'rgba(146,64,14,0.2)' }} />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
                {/* ── /3D BOX ── */}
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>

      {/* Ground shadow */}
      <motion.div
        animate={{ opacity: isDone ? 0 : 0.55, scaleX: 1 + clicks * 0.04 }}
        transition={{ duration:0.4 }}
        style={{ width:W, height:16, marginTop:6,
                 background:'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.55) 0%, transparent 70%)' }}
      />

      {/* Progress dots */}
      <AnimatePresence>
        {!isDone && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, y:6 }}
            style={{ display:'flex', gap:13, marginTop:46 }}
            role="progressbar" aria-valuenow={clicks} aria-valuemax={TOTAL_CLICKS}
          >
            {Array.from({ length:TOTAL_CLICKS }).map((_,i) => (
              <motion.div
                key={i}
                animate={i < clicks
                  ? { scale:1.35, backgroundColor:'#FF6B00', borderColor:'#FF8C00', boxShadow:'0 0 12px rgba(255,107,0,0.9),0 0 24px rgba(255,107,0,0.4)' }
                  : { scale:1,    backgroundColor:'rgba(255,255,255,0.1)', borderColor:'rgba(255,255,255,0.2)', boxShadow:'none' }}
                transition={{ type:'spring', stiffness:400, damping:14 }}
                style={{ width:11, height:11, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.2)' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
