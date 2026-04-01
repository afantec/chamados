import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import ChamadoList from './pages/ChamadoList'
import ChamadoForm from './pages/ChamadoForm'
import ChamadoDetail from './pages/ChamadoDetail'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0',
    },
    secondary: {
      main: '#e65100',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChamadoList />} />
          <Route path="/chamados/novo" element={<ChamadoForm />} />
          <Route path="/chamados/:id/editar" element={<ChamadoForm />} />
          <Route path="/chamados/:id" element={<ChamadoDetail />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
