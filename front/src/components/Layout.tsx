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
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

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
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);

  const drawerWidth = open ? DRAWER_WIDTH : DRAWER_COLLAPSED;

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
          bgcolor: alpha("#0d1128", 0.85),
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${alpha("#00d4ff", 0.1)}`,
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
              background: "linear-gradient(90deg, #e2e8f0, #94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 600,
            }}
          >
            {navItems.find((n) => n.path === location.pathname)?.label ||
              "Sistema de Sustentação"}
          </Typography>
        </Toolbar>
      </AppBar>

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
            bgcolor: "#080e24",
            borderRight: `1px solid ${alpha("#00d4ff", 0.1)}`,
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
