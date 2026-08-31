import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Default to light if no theme is saved
    return savedTheme ? savedTheme === 'dark' : false;
  });
  
  // Aplicar tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Create custom MUI theme based on the active dark mode state
  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: darkMode ? '#6366f1' : '#4f46e5', // Indigo-500 in dark mode, Indigo-600 in light mode
        },
        background: {
          default: darkMode ? '#121b2d' : '#f8fafc',
          paper: darkMode ? '#1c283f' : '#ffffff',
        },
        text: {
          primary: darkMode ? '#f8fafc' : '#0f172a',
          secondary: darkMode ? '#94a3b8' : '#64748b',
        },
      },
      shape: {
        borderRadius: 12, // Premium rounded shapes matching the bento system
      },
      typography: {
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
              padding: '10px 20px',
              fontFamily: 'inherit',
              transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: darkMode ? '0 0 14px rgba(99, 102, 241, 0.35)' : '0 0 14px rgba(79, 70, 229, 0.25)',
                filter: 'brightness(1.1)',
                transform: 'none !important', // Ensure absolute static hover
              },
              '&:active': {
                filter: 'brightness(0.95)',
                transform: 'none !important',
              },
            },
            contained: {
              backgroundColor: darkMode ? '#6366f1' : '#4f46e5',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: darkMode ? '#4f46e5' : '#4338ca',
              },
            },
            outlined: {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              color: darkMode ? '#f8fafc' : '#4f46e5',
              '&:hover': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(79, 70, 229, 0.04)',
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: '16px', // exact 1rem as requested
              border: darkMode ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid rgba(79, 70, 229, 0.2)',
              backgroundImage: 'none',
              backgroundColor: darkMode ? '#1c283f' : '#ffffff',
              boxShadow: darkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 35px rgba(99, 102, 241, 0.15)'
                : '0 25px 50px -12px rgba(79, 70, 229, 0.08)',
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              fontSize: '1.25rem',
              fontWeight: 800,
              padding: '24px 24px 16px',
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: {
              padding: '8px 24px 24px',
            },
          },
        },
        MuiDialogActions: {
          styleOverrides: {
            root: {
              padding: '16px 24px 24px',
              gap: '8px',
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.15)' : 'rgba(248, 250, 252, 0.5)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1px',
                borderColor: darkMode ? '#6366f1' : '#4f46e5',
                boxShadow: darkMode ? '0 0 10px rgba(99, 102, 241, 0.2)' : '0 0 8px rgba(79, 70, 229, 0.15)',
              },
            },
            input: {
              padding: '12px 14px',
              fontSize: '0.9rem',
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            select: {
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '0.9rem',
            },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              borderRadius: '12px',
              marginTop: '4px',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              fontSize: '0.9rem',
              padding: '10px 16px',
            },
          },
        },
        MuiSwitch: {
          styleOverrides: {
            root: {
              width: 44,
              height: 24,
              padding: 0,
            },
            switchBase: {
              padding: 0,
              margin: 2,
              transitionDuration: '300ms',
              '&.Mui-checked': {
                transform: 'translateX(20px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                  backgroundColor: darkMode ? '#6366f1' : '#4f46e5',
                  opacity: 1,
                  border: 0,
                },
              },
            },
            thumb: {
              boxSizing: 'border-box',
              width: 20,
              height: 20,
            },
            track: {
              borderRadius: 24 / 2,
              backgroundColor: darkMode ? '#334155' : '#e2e8f0',
              opacity: 1,
              transition: 'background-color 0.25s',
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: darkMode ? '#1c283f' : '#0f172a',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
              color: '#f8fafc',
            },
          },
        },
      },
    });
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};