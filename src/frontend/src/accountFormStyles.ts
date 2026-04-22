import type { CSSProperties } from 'react';

export const accountFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginTop: 20,
  padding: 16,
  border: '1px solid #d7d7d7',
  borderRadius: 12,
} satisfies CSSProperties;

export const accountInputStyle = {
  padding: 8,
  fontSize: 14,
} satisfies CSSProperties;

export const accountErrorListStyle = {
  margin: 0,
  paddingLeft: 18,
  color: '#c00',
  fontSize: 13,
} satisfies CSSProperties;

export const accountErrorTextStyle = {
  color: '#c00',
  margin: 0,
  fontSize: 13,
} satisfies CSSProperties;

export const accountHelperTextStyle = {
  margin: 0,
  fontSize: 13,
  color: '#555',
} satisfies CSSProperties;

export const accountActionsStyle = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
} satisfies CSSProperties;
