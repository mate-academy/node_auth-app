import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { client } from '../../utils/client';
import { ActivationPage } from './ActivationPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../utils/client', () => ({
  client: {
    get: vi.fn(),
  },
}));

const renderActivationPage = (initialEntry = '/activate/test-token') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/activate/:token" element={<ActivationPage />} />
        <Route path="/activate" element={<ActivationPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ActivationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('shows success message and redirects to login after activation', async () => {
    vi.mocked(client.get).mockResolvedValue({
      message: 'Account activated successfully.',
      data: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        isActivated: true,
      },
    });

    renderActivationPage();

    expect(screen.getByText(/activating your account/i)).toBeInTheDocument();
    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText(/account activated successfully\./i),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows error message and redirects to home when activation fails', async () => {
    vi.mocked(client.get).mockRejectedValue(
      new Error('Activation token is invalid or expired'),
    );

    renderActivationPage();

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText(/activation token is invalid or expired/i),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('shows missing token error and redirects to home', async () => {
    renderActivationPage('/activate');

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText(/activation token is missing/i),
    ).toBeInTheDocument();
    expect(client.get).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});
