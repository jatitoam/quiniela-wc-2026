export const gradients = {
  hosts: 'linear-gradient(135deg, var(--mantine-color-wcGreen-6) 0%, var(--mantine-color-wcGreen-7) 55%, var(--mantine-color-wcRed-5) 100%)',
  pitch: 'linear-gradient(180deg, var(--mantine-color-wcGreen-5) 0%, var(--mantine-color-wcGreen-7) 100%)',
  gold:  'linear-gradient(135deg, var(--mantine-color-wcGold-4) 0%, var(--mantine-color-wcGold-6) 100%)',
  sky:   'linear-gradient(180deg, var(--mantine-color-wcNavy-5) 0%, var(--mantine-color-wcNavy-7) 100%)',
} as const;

export type GradientName = keyof typeof gradients;
