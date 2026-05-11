import { createTheme, Button, Card, NumberInput, type MantineColorsTuple } from '@mantine/core';

const wcGreen: MantineColorsTuple = [
  '#e6f4ee', '#c0e2d0', '#98cfb1', '#6fbc91', '#46a972',
  '#1d9652', '#006847', '#005038', '#003826', '#001f13',
];

const wcRed: MantineColorsTuple = [
  '#fce9e8', '#f6bfbb', '#ef958f', '#e96b62', '#e24136',
  '#d52b1e', '#aa2218', '#801a12', '#55110c', '#2b0906',
];

const wcGold: MantineColorsTuple = [
  '#fef9e8', '#fdefc0', '#fce499', '#fad972', '#f8cf4a',
  '#f4c430', '#c39d26', '#92761d', '#614e13', '#30270a',
];

const wcNavy: MantineColorsTuple = [
  '#e8eaf1', '#c1c6d9', '#99a2c1', '#727ea9', '#4a5a91',
  '#2a3d7d', '#1a2d6e', '#0b1b3b', '#071228', '#030914',
];

export const theme = createTheme({
  primaryColor: 'wcGreen',
  primaryShade: { light: 6, dark: 4 },
  colors: { wcGreen, wcRed, wcGold, wcNavy },
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: '"Bricolage Grotesque", Inter, system-ui, sans-serif',
    sizes: {
      h1: { fontSize: '1.75rem' },
      h2: { fontSize: '1.375rem' },
      h3: { fontSize: '1.125rem' },
    },
  },
  defaultRadius: 'lg',
  radius: { xl: '1rem', '2xl': '1.5rem', pill: '999px' },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.06)',
    sm: '0 1px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    md: '0 8px 24px -8px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
    lg: '0 16px 40px -12px rgba(0,0,0,0.16), 0 4px 12px -4px rgba(0,0,0,0.10)',
    xl: '0 24px 64px -16px rgba(0,0,0,0.20), 0 8px 24px -8px rgba(0,0,0,0.12)',
  },
  components: {
    Button: Button.extend({
      defaultProps: { radius: 'xl' },
    }),
    Card: Card.extend({
      defaultProps: { radius: 'lg', shadow: 'sm', withBorder: true },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: { size: 'md', radius: 'md' },
    }),
  },
});
