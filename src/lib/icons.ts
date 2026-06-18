// Motion Tab Icons Configuration — Terminal Design
export const tabIcons = {
  camera: {
    active: 'camera',
    inactive: 'camera-outline',
  },
  analytics: {
    active: 'chart-bar',
    inactive: 'chart-bar',
  },
  coach: {
    active: 'dumbbell',
    inactive: 'human-male-fitness',
  },
  settings: {
    active: 'cog',
    inactive: 'cog-outline',
  },
} as const;

export type TabName = keyof typeof tabIcons;
