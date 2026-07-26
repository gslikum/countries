import React from 'react';
import { useTheme } from '../context/ThemeContext';

export function Header({ theme: propTheme, onToggleTheme }) {
  let theme = propTheme;
  let toggleTheme = onToggleTheme;

  try {
    const context = useTheme();
    if (!theme) theme = context.theme;
    if (!toggleTheme) toggleTheme = context.toggleTheme;
  } catch (e) {
    // If used outside ThemeProvider and no props given, fallback gracefully
    if (!theme) theme = 'light';
  }

  return (
    <header style={{
      backgroundColor: 'var(--bg-element)',
      boxShadow: 'var(--card-shadow)',
      padding: '1.25rem 0',
      marginBottom: '2rem',
      transition: 'background-color 0.2s ease'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
          Where in the world?
        </h1>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            padding: '0.4rem 0.6rem',
            borderRadius: '4px'
          }}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </header>
  );
}

