/**
 * SketchFlow — hand-drawn, comic-style animated flow diagram.
 *
 * Renders a sequence of stages connected by sketchy (rough.js) arrows,
 * with a token animated along the path via Framer Motion. Built for
 * explaining systems concepts (k8s, cloud, AI) end-to-end in a blog post.
 *
 * Install:
 *   npm install roughjs framer-motion
 *
 * Fonts (optional but recommended for the comic feel), add to your
 * document head or _document.tsx / index.html:
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">
 *
 * Usage:
 *   import SketchFlow from './SketchFlow';
 *
 *   const stages = [
 *     { id: 'kubectl', label: 'kubectl apply', detail: 'You submit a pod spec as YAML/JSON.' },
 *     { id: 'api', label: 'API server', detail: 'Validates the spec and writes it to etcd.' },
 *     { id: 'etcd', label: 'etcd', detail: 'Stores the desired cluster state.' },
 *     { id: 'sched', label: 'Scheduler', detail: 'Picks a node using filtering + scoring.' },
 *     { id: 'kubelet', label: 'Kubelet', detail: 'Agent on the chosen node picks up the assignment.' },
 *     { id: 'runtime', label: 'Container runtime', detail: 'Pulls the image and starts the container.' },
 *     { id: 'running', label: 'Pod running', detail: 'Kubelet reports status back to the API server.' },
 *   ];
 *
 *   <SketchFlow
 *     stages={stages}
 *     direction="vertical"      // 'vertical' | 'horizontal'
 *     autoPlay
 *     onStageClick={(stage) => console.log(stage.id)}
 *   />
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import rough from 'roughjs';
import { motion, AnimatePresence } from 'framer-motion';

const BOX_W = 220;
const BOX_H = 64;
const GAP = 56;

function layoutStages(stages, direction) {
  return stages.map((stage, i) => {
    const x = direction === 'horizontal' ? i * (BOX_W + GAP) : 0;
    const y = direction === 'vertical' ? i * (BOX_H + GAP) : 0;
    return { ...stage, x, y };
  });
}

function SketchBox({ x, y, w, h, seed, active, color }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const rc = rough.svg(ref.current);
    const node = rc.rectangle(2, 2, w - 4, h - 4, {
      seed,
      roughness: active ? 2.4 : 1.6,
      stroke: color,
      strokeWidth: active ? 3 : 2,
      fill: active ? color : 'transparent',
      fillStyle: 'hachure',
      fillWeight: 1.5,
      hachureGap: 6,
    });
    ref.current.appendChild(node);
  }, [w, h, seed, active, color]);

  return (
    <svg
      ref={ref}
      width={w}
      height={h}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}
    />
  );
}

function SketchConnector({ from, to, seed, direction }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const rc = rough.svg(ref.current);
    const x1 = direction === 'horizontal' ? from.x + BOX_W : from.x + BOX_W / 2;
    const y1 = direction === 'horizontal' ? from.y + BOX_H / 2 : from.y + BOX_H;
    const x2 = direction === 'horizontal' ? to.x : to.x + BOX_W / 2;
    const y2 = direction === 'horizontal' ? to.y + BOX_H / 2 : to.y;
    const node = rc.line(x1, y1, x2, y2, {
      seed,
      roughness: 1.8,
      strokeWidth: 2,
      stroke: 'var(--sketch-line, #444)',
    });
    ref.current.appendChild(node);
  }, [from, to, seed, direction]);

  return (
    <svg
      ref={ref}
      style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
    />
  );
}

export default function SketchFlow({
  stages,
  direction = 'vertical',
  autoPlay = true,
  loop = true,
  speed = 1.4, // seconds per hop
  onStageClick,
  accent = '#D85A30',
}) {
  const laidOut = layoutStages(stages, direction);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDetail, setOpenDetail] = useState(null);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setActiveIndex((i) => {
        if (i + 1 >= laidOut.length) return loop ? 0 : i;
        return i + 1;
      });
    }, speed * 1000);
    return () => clearInterval(id);
  }, [autoPlay, loop, speed, laidOut.length]);

  const handleClick = useCallback(
    (stage, i) => {
      setActiveIndex(i);
      setOpenDetail((cur) => (cur === stage.id ? null : stage.id));
      onStageClick?.(stage);
    },
    [onStageClick]
  );

  const containerW = direction === 'horizontal' ? laidOut.length * (BOX_W + GAP) : BOX_W;
  const containerH = direction === 'vertical' ? laidOut.length * (BOX_H + GAP) : BOX_H;

  const active = laidOut[activeIndex];

  return (
    <div style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", color: '#222' }}>
      <div
        style={{
          position: 'relative',
          width: containerW,
          height: containerH,
          maxWidth: '100%',
        }}
      >
        {laidOut.slice(1).map((stage, i) => (
          <SketchConnector
            key={`edge-${stage.id}`}
            from={laidOut[i]}
            to={stage}
            seed={i + 1}
            direction={direction}
          />
        ))}

        {laidOut.map((stage, i) => (
          <div
            key={stage.id}
            role="button"
            tabIndex={0}
            onClick={() => handleClick(stage, i)}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(stage, i)}
            style={{ cursor: 'pointer' }}
          >
            <SketchBox
              x={stage.x}
              y={stage.y}
              w={BOX_W}
              h={BOX_H}
              seed={i + 100}
              active={i === activeIndex}
              color={i === activeIndex ? accent : '#444'}
            />
            <span
              style={{
                position: 'absolute',
                left: stage.x,
                top: stage.y,
                width: BOX_W,
                height: BOX_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0 10px',
                fontSize: 17,
                fontWeight: 700,
                color: i === activeIndex ? '#fff' : '#222',
                pointerEvents: 'none',
              }}
            >
              {stage.label}
            </span>
          </div>
        ))}

        {/* animated token hopping between stage centers */}
        <motion.div
          animate={{
            left: active.x + BOX_W / 2 - 9,
            top: active.y + (direction === 'vertical' ? -14 : BOX_H / 2 - 9),
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            position: 'absolute',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: accent,
            border: '2px solid #222',
          }}
        />
      </div>

      <AnimatePresence>
        {openDetail && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              marginTop: 16,
              padding: '12px 16px',
              border: '2px solid #222',
              borderRadius: 10,
              background: '#FFF8ED',
              maxWidth: 480,
            }}
          >
            {stages.find((s) => s.id === openDetail)?.detail}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
