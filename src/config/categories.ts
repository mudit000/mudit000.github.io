// src/config/categories.ts
//
// Single source of truth for category metadata. Import this anywhere
// you need a category's label, color, or accent hex — post layouts,
// nav links, category listing pages, and SketchFlow diagrams should
// all pull from here instead of hardcoding colors per post.

export const categories = {
  k8s: {
    label: 'Kubernetes',
    slug: 'k8s',
    accent: '#D85A30', // coral — compute / scheduling / orchestration
    description: 'Cluster internals, scheduling, networking, and operations.',
  },
  cloud: {
    label: 'Cloud',
    slug: 'cloud',
    accent: '#378ADD', // blue — networking / infrastructure
    description: 'Cloud architecture, networking, and infrastructure patterns.',
  },
  ai: {
    label: 'AI',
    slug: 'ai',
    accent: '#7F77DD', // purple — models / abstract concepts
    description: 'Machine learning concepts, from fundamentals to architecture.',
  },
} as const;

export type CategoryKey = keyof typeof categories;

export function getCategory(key: CategoryKey) {
  return categories[key];
}

export function allCategories() {
  return Object.values(categories);
}
