import React, { useEffect, useState } from 'react';

const stages = [
  { id: 'kubectl', label: 'kubectl apply', detail: 'You submit a pod spec as YAML/JSON.' },
  { id: 'api', label: 'API server', detail: 'Validates the spec and writes it to etcd.' },
  { id: 'etcd', label: 'etcd', detail: 'Stores the desired cluster state.' },
  { id: 'sched', label: 'Scheduler', detail: 'Picks a node using filtering + scoring.' },
  { id: 'kubelet', label: 'Kubelet', detail: 'Agent on the node picks up the assignment.' },
  { id: 'runtime', label: 'Container runtime', detail: 'Pulls the image, starts the container.' },
  { id: 'running', label: 'Pod running', detail: 'Kubelet reports status back to the API server.' },
];

const BOX_W = 220;
const BOX_H = 60;
const GAP = 46;
const ACCENT = '#D85A30';

export default function SketchFlowPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDetail, setOpenDetail] = useState(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % stages.length);
    }, 1500);
    return () => clearInterval(id);
  }, [playing]);

  const containerH = stages.length * (BOX_H + GAP);
  const active = stages[activeIndex];

  return (
    <div style={{ fontFamily: "'Comic Sans MS', cursive", color: '#222', padding: '1rem' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <button
          onClick={() => setPlaying((p) => !p)}
          style={{
            border: '2px solid #222',
            borderRadius: 8,
            padding: '6px 14px',
            background: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 700,
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <span style={{ fontSize: 13, color: '#666' }}>
          Click any stage to pin its detail
        </span>
      </div>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="sketchy" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
          </filter>
        </defs>
      </svg>

      <div style={{ position: 'relative', width: BOX_W + 40, height: containerH, maxWidth: '100%' }}>
        <svg
          width={BOX_W + 40}
          height={containerH}
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
        >
          {stages.slice(1).map((s, i) => {
            const y1 = i * (BOX_H + GAP) + BOX_H;
            const y2 = (i + 1) * (BOX_H + GAP);
            const x = BOX_W / 2;
            return (
              <line
                key={s.id}
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke="#444"
                strokeWidth={2}
                filter="url(#sketchy)"
              />
            );
          })}
        </svg>

        {stages.map((stage, i) => {
          const y = i * (BOX_H + GAP);
          const isActive = i === activeIndex;
          return (
            <div
              key={stage.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setActiveIndex(i);
                setOpenDetail((cur) => (cur === stage.id ? null : stage.id));
              }}
              onKeyDown={(e) => e.key === 'Enter' && setOpenDetail(stage.id)}
              style={{
                position: 'absolute',
                left: 0,
                top: y,
                width: BOX_W,
                height: BOX_H,
                cursor: 'pointer',
              }}
            >
              <svg width={BOX_W} height={BOX_H} style={{ position: 'absolute', overflow: 'visible' }}>
                <rect
                  x={3}
                  y={3}
                  width={BOX_W - 6}
                  height={BOX_H - 6}
                  rx={10}
                  fill={isActive ? ACCENT : '#fff'}
                  stroke="#222"
                  strokeWidth={isActive ? 3 : 2}
                  filter="url(#sketchy)"
                  style={{ transition: 'fill 0.3s, stroke-width 0.3s' }}
                />
              </svg>
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '0 10px',
                  fontSize: 16,
                  fontWeight: 700,
                  color: isActive ? '#fff' : '#222',
                  pointerEvents: 'none',
                }}
              >
                {stage.label}
              </span>
            </div>
          );
        })}

        <div
          style={{
            position: 'absolute',
            left: BOX_W / 2 - 8,
            top: activeIndex * (BOX_H + GAP) - 12,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: ACCENT,
            border: '2px solid #222',
            transition: 'top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {openDetail && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            border: '2px solid #222',
            borderRadius: 10,
            background: '#FFF8ED',
            maxWidth: 420,
          }}
        >
          {stages.find((s) => s.id === openDetail)?.detail}
        </div>
      )}
    </div>
  );
}
