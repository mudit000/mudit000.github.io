# SketchFlow

A reusable "comic style" animated flow diagram component for explaining
systems concepts (Kubernetes, cloud, AI) end-to-end in a blog post.

- Sketchy, hand-drawn boxes and connectors via **rough.js**
- A token that hops between stages via **Framer Motion**
- Click any stage to pin its detail text open, or let it auto-play
- Works vertically (good for a mobile-width blog column) or horizontally

## Install

```bash
npm install roughjs framer-motion
```

Drop `SketchFlow.jsx` into your components folder. Optionally load a
handwriting-style font for the full comic feel:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">
```

Other good hand-drawn fonts to try: `Caveat`, `Architects Daughter`,
`Patrick Hand`.

## Basic usage

```jsx
import SketchFlow from './SketchFlow';

const stages = [
  { id: 'kubectl', label: 'kubectl apply', detail: 'You submit a pod spec as YAML/JSON.' },
  { id: 'api',     label: 'API server',     detail: 'Validates the spec and writes it to etcd.' },
  { id: 'etcd',    label: 'etcd',           detail: 'Stores the desired cluster state.' },
  { id: 'sched',   label: 'Scheduler',      detail: 'Picks a node using filtering + scoring.' },
  { id: 'kubelet', label: 'Kubelet',        detail: 'Agent on the node picks up the assignment.' },
  { id: 'runtime', label: 'Container runtime', detail: 'Pulls the image, starts the container.' },
  { id: 'running', label: 'Pod running',    detail: 'Kubelet reports status back to the API server.' },
];

<SketchFlow stages={stages} direction="vertical" autoPlay speed={1.4} />
```

## Going into more detail on one stage

For posts where you want to zoom into a single stage (e.g. "how the
scheduler actually scores nodes"), nest a second `SketchFlow` with its
own sub-stages, triggered by `onStageClick`:

```jsx
const [zoomedStage, setZoomedStage] = useState(null);

<SketchFlow stages={stages} onStageClick={(s) => setZoomedStage(s.id)} />

{zoomedStage === 'sched' && (
  <SketchFlow
    stages={schedulerSubStages}
    direction="horizontal"
    accent="#3B8BD4"
  />
)}
```

This keeps the top-level flow uncluttered while still letting curious
readers drill in — same visual language, smaller scope.

## Notes

- The component computes rough.js shapes client-side in a `useEffect`,
  so it needs to run in the browser (fine for Next.js `"use client"`
  components or a plain CRA/Vite app; wrap in `dynamic(..., { ssr: false })`
  if you're on Next.js and rendering at build time).
- `speed` controls autoplay pace in seconds per hop; set `autoPlay={false}`
  if you'd rather let the reader click through manually.
- Swap `accent` per post to color-code categories (e.g. blue for
  networking posts, coral for scheduling/compute posts).
