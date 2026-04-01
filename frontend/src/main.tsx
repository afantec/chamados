import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/pt-br'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <App />
    </LocalizationProvider>
  </React.StrictMode>,
)
