import { createTheme, alpha } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00d4ff',
            light: '#6ef9ff',
            dark: '#00a3c4',
            contrastText: '#000',
        },
        secondary: {
            main: '#7c3aed',
            light: '#a855f7',
            dark: '#5b21b6',
            contrastText: '#fff',
        },
        success: { main: '#00e676', dark: '#00b248' },
        warning: { main: '#ffab00' },
        error: { main: '#ff1744' },
        background: { default: '#05071a', paper: '#0d1128' },
        text: { primary: '#e2e8f0', secondary: '#94a3b8' },
        divider: alpha('#00d4ff', 0.12),
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', sans-serif",
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { fontWeight: 600, letterSpacing: '0.05em' },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'linear-gradient(135deg, #05071a 0%, #0a0d2e 50%, #05071a 100%)',
                    backgroundAttachment: 'fixed',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#0d1128',
                    border: `1px solid ${alpha('#00d4ff', 0.1)}`,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#0d1128',
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
            },
        },
        MuiTextField: {
            defaultProps: { size: 'small' },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, borderRadius: 6 },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#0d1128',
                    backgroundImage: 'none',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: { borderRadius: 4 },
                bar: { borderRadius: 4 },
            },
        },
    },
});

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0ea5e9',
            light: '#38bdf8',
            dark: '#0284c7',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
            contrastText: '#111827',
        },
        success: { main: '#16a34a', dark: '#15803d' },
        warning: { main: '#f59e0b' },
        error: { main: '#dc2626' },
        background: { default: '#f3f7fb', paper: '#ffffff' },
        text: { primary: '#0f172a', secondary: '#475569' },
        divider: alpha('#0ea5e9', 0.14),
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', sans-serif",
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { fontWeight: 600, letterSpacing: '0.05em' },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'linear-gradient(135deg, #f8fbff 0%, #eef5ff 55%, #f8fbff 100%)',
                    backgroundAttachment: 'fixed',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#ffffff',
                    border: `1px solid ${alpha('#0ea5e9', 0.12)}`,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
            },
        },
        MuiTextField: {
            defaultProps: { size: 'small' },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, borderRadius: 6 },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#ffffff',
                    backgroundImage: 'none',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: { borderRadius: 4 },
                bar: { borderRadius: 4 },
            },
        },
    },
});

export { darkTheme, lightTheme };

export default darkTheme;
