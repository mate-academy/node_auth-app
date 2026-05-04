import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { client } from './utils/client';
import App from './App';

vi.mock('./utils/client', () => ({
  client: {
    get: vi.fn(),
  },
}));

test('renders home page route', async () => {
  vi.mocked(client.get).mockRejectedValue(new Error('Not authenticated'));

  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/home page/i)).toBeInTheDocument();
});
