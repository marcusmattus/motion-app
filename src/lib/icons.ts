// Motion Tab Icons Configuration
export const tabIcons = {
  Today: {
    active: 'calendar-check',
    inactive: 'calendar-check-outline',
  },
  Progress: {
    active: 'chart-line',
    inactive: 'trending-up',
  },
  Social: {
    active: 'account-group',
    inactive: 'account-group-outline',
  },
  Coach: {
    active: 'dumbbell',
    inactive: 'human-male-fitness',
  },
  Settings: {
    active: 'cog',
    inactive: 'cog-outline',
  },
} as const;

export type TabName = keyof typeof tabIcons;
