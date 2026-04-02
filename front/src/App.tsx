import React, { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pt-br";
import { darkTheme, lightTheme } from "./theme";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tarefas from "./pages/Tarefas";
import TarefaDetalhe from "./pages/TarefaDetalhe";
import Desenvolvedores from "./pages/Desenvolvedores";
import Cadastros from "./pages/Cadastros";

const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    const savedTheme = localStorage.getItem("theme-mode");
    return savedTheme === "light" ? "light" : "dark";
  });

  const theme = useMemo(
    () => (themeMode === "light" ? lightTheme : darkTheme),
    [themeMode],
  );

  const alternarTema = () => {
    setThemeMode((prev) => {
      const nextMode = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme-mode", nextMode);
      return nextMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Layout themeMode={themeMode} onToggleTheme={alternarTema}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/tarefas/:id" element={<TarefaDetalhe />} />
              <Route path="/desenvolvedores" element={<Desenvolvedores />} />
              <Route path="/cadastros" element={<Cadastros />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
