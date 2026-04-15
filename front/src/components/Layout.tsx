import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Menu,
  CircularProgress,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useAlerts } from "../context/AlertContext";

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 64;

const navItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Tarefas", path: "/tarefas", icon: <AssignmentIcon /> },
  { label: "Desenvolvedores", path: "/desenvolvedores", icon: <GroupIcon /> },
  { label: "Cadastros", path: "/cadastros", icon: <ListAltIcon /> },
];

interface LayoutProps {
  children: React.ReactNode;
  themeMode: "dark" | "light";
  onToggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  themeMode,
  onToggleTheme,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const { alerts, loading: loadingAlerts, deactivateAlert } = useAlerts();
  const [alertAnchorEl, setAlertAnchorEl] = useState<null | HTMLElement>(null);
  const [processingAlertId, setProcessingAlertId] = useState<number | null>(null);

  const drawerWidth = open ? DRAWER_WIDTH : DRAWER_COLLAPSED;
  const alertMenuOpen = Boolean(alertAnchorEl);

  const handleOpenAlerts = (event: React.MouseEvent<HTMLElement>) => {
    setAlertAnchorEl(event.currentTarget);
  };

  const handleCloseAlerts = () => {
    setAlertAnchorEl(null);
  };

  const handleConcluirAlerta = async (alertId: number) => {
    setProcessingAlertId(alertId);
    try {
      await deactivateAlert(alertId);
    } finally {
      setProcessingAlertId(null);
    }
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          px: open ? 2 : 1,
          minHeight: "64px !important",
        }}
      >
        {open && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src="/favicon.png" alt="Logo" style={{ width: 26, height: 26 }} />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                background: "linear-gradient(90deg, #dbc607, #9e9404)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.03em",
              }}
            >
              Sustentação
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={() => setOpen(!open)}
          size="small"
          sx={{
            color: "primary.main",
            "&:hover": { bgcolor: alpha("#aca004", 0.1) },
          }}
        >
          {open ? <ChevronLeftIcon /> : <img src="/favicon.png" alt="Logo" style={{ width: 26, height: 26 }} />}
        </IconButton>
      </Toolbar>

      <Divider sx={{ borderColor: alpha("#b1a009", 0.1) }} />

      <List sx={{ flex: 1, py: 1.5, px: open ? 1 : 0.5 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Tooltip
              key={item.path}
              title={!open ? item.label : ""}
              placement="right"
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: open ? 2 : 1,
                    justifyContent: open ? "flex-start" : "center",
                    bgcolor: active ? alpha("#00d4ff", 0.12) : "transparent",
                    border: active
                      ? `1px solid ${alpha("#00d4ff", 0.25)}`
                      : "1px solid transparent",
                    color: active ? "primary.main" : "text.secondary",
                    "&:hover": {
                      bgcolor: alpha("#00d4ff", 0.08),
                      color: "primary.main",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "inherit",
                      minWidth: open ? 36 : "unset",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: active ? 600 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: alpha("#00d4ff", 0.1) }} />
      {open && (
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.disabled">
            v1.0.0 · Área de Sustentação
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor:
            themeMode === "dark"
              ? alpha("#0d1128", 0.85)
              : alpha("#ffffff", 0.85),
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${
            themeMode === "dark"
              ? alpha("#00d4ff", 0.1)
              : alpha("#0ea5e9", 0.16)
          }`,
          transition: "width 0.3s, margin 0.3s",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setOpen(true)}
              sx={{ mr: 2, color: "primary.main" }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{
              background:
                themeMode === "dark"
                  ? "linear-gradient(90deg, #e2e8f0, #94a3b8)"
                  : "linear-gradient(90deg, #0f172a, #334155)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 600,
            }}
          >
            {navItems.find((n) => n.path === location.pathname)?.label ||
              "Sistema de Sustentação"}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Alertas ativos">
              <IconButton
                onClick={handleOpenAlerts}
                size="small"
                sx={{
                  color: alerts.length ? "error.main" : "text.secondary",
                  border: `1px solid ${
                    alerts.length
                      ? alpha("#ef4444", 0.35)
                      : alpha("#94a3b8", 0.25)
                  }`,
                  bgcolor: alerts.length
                    ? alpha("#ef4444", 0.08)
                    : alpha("#94a3b8", 0.06),
                }}
              >
                <Badge badgeContent={alerts.length} color="error">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip
              title={themeMode === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              <IconButton
                onClick={onToggleTheme}
                size="small"
                sx={{
                  color: themeMode === "dark" ? "#facc15" : "#0284c7",
                  border: `1px solid ${
                    themeMode === "dark"
                      ? alpha("#facc15", 0.35)
                      : alpha("#0284c7", 0.35)
                  }`,
                  bgcolor:
                    themeMode === "dark"
                      ? alpha("#facc15", 0.1)
                      : alpha("#0284c7", 0.08),
                  "&:hover": {
                    bgcolor:
                      themeMode === "dark"
                        ? alpha("#facc15", 0.18)
                        : alpha("#0284c7", 0.16),
                  },
                }}
              >
                {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={alertAnchorEl}
        open={alertMenuOpen}
        onClose={handleCloseAlerts}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 380,
            maxWidth: "calc(100vw - 32px)",
            p: 1,
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Alertas ativos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {alerts.length} pendente(s)
          </Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />

        {loadingAlerts ? (
          <Box sx={{ px: 2, py: 3, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={22} />
          </Box>
        ) : alerts.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum alerta ativo no momento.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1 }}>
            {alerts.map((alerta) => (
              <Box
                key={alerta.id}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: `1px solid ${alpha("#00d4ff", 0.12)}`,
                  bgcolor: alpha("#00d4ff", 0.04),
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate(`/tarefas/${alerta.tarefaId}`);
                    handleCloseAlerts();
                  }}
                >
                  {alerta.tarefaCodigo}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize:"10px" }}>
                  {alerta.tarefaDescricao}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {alerta.message}
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {new Date(alerta.createdAt).toLocaleString("pt-BR")}
                  </Typography>
                  <Button
                    size="small"
                    color="success"
                    startIcon={<DoneAllIcon fontSize="small" />}
                    onClick={() => void handleConcluirAlerta(alerta.id)}
                    disabled={processingAlertId === alerta.id}
                  >
                    {processingAlertId === alerta.id ? "Concluindo..." : "Concluir"}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Menu>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: "width 0.3s",
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: themeMode === "dark" ? "#080e24" : "#f8fbff",
            borderRight: `1px solid ${
              themeMode === "dark"
                ? alpha("#00d4ff", 0.1)
                : alpha("#0ea5e9", 0.16)
            }`,
            overflow: "hidden",
            transition: "width 0.3s",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: "calc(100vh - 64px)",
          transition: "margin 0.3s",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
