import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { client } from '../../utils/client';
import { Form } from './Form';

vi.mock('../../utils/client', () => ({
  client: {
    post: vi.fn(),
  },
}));

describe('Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = () => {
    render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );
  };

  test('shows a validation error when registration passwords do not match', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(
      screen.getByRole('button', { name: /don't have an account\? sign up/i }),
    );
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password321');
    await user.click(screen.getByRole('button', { name: /^sign up$/i }));

    expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
  });

  test('shows the next step when registration validation passes', async () => {
    const user = userEvent.setup();
    vi.mocked(client.post).mockResolvedValue({
      message: 'User registered successfully.',
      data: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        isActivated: false,
        activationToken: 'activation-token',
      },
    });

    renderForm();

    await user.click(
      screen.getByRole('button', { name: /don't have an account\? sign up/i }),
    );
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^sign up$/i }));

    expect(
      screen.getByText(/user registered successfully\./i),
    ).toBeInTheDocument();
    expect(screen.getByText(/activate\/activation-token/i)).toBeInTheDocument();
  });
});
