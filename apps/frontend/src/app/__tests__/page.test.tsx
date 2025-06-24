import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('KrakenGaming');
  });

  it('renders the get started button', () => {
    render(<HomePage />);

    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeInTheDocument();
  });

  it('renders the community section', () => {
    render(<HomePage />);

    const communityText = screen.getByText(/join our community/i);
    expect(communityText).toBeInTheDocument();
  });
});
