import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('Scaffold & Baseline Architecture (M1)', () => {
  it('renders application header title', () => {
    render(<App />);
    expect(screen.getByText(/Where in the world\?/i)).toBeInDocument();
  });

  it('toggles light and dark mode theme', () => {
    render(<App />);
    const themeBtn = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeBtn).toBeInDocument();
    
    const initialText = themeBtn.textContent;
    fireEvent.click(themeBtn);
    expect(themeBtn.textContent).not.toBe(initialText);
  });
});
