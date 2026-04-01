import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Skeleton,
  alpha,
  Tooltip,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BugReportIcon from "@mui/icons-material/BugReport";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { Tarefa } from "../types";
import { tarefaService } from "../services/tarefaService";

const STATUS_COLORS: Record<string, string> = {
  Aberto: "#00d4ff",
  "Em Andamento": "#ffab00",
  "Em Revisão": "#a855f7",
  "Aguardando Aprovação": "#ff9800",
  Finalizado: "#00e676",
  Finalizada: "#00e676",
  Cancelado: "#ff1744",
};

const PRIORIDADE_COLOR = (p: number) => {
  if (p >= 8) return "#ff1744";
  if (p >= 5) return "#ffab00";
  return "#00e676";
};

const normalizarStatus = (status: string) => status.trim().toLowerCase();

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card
    sx={{
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ mt: 0.5, color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha(color, 0.12),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tarefaService
      .listar()
      .then(setTarefas)
      .finally(() => setLoading(false));
  }, []);

  const statusCount = tarefas.reduce<Record<string, number>>((acc, t) => {
    const s = t.status.descricao;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const abertas = tarefas.filter((t) => t.status.descricao === "Aberto").length;
  const emAndamento = tarefas.filter(
    (t) => t.status.descricao === "Em Andamento",
  ).length;
  const finalizadas = tarefas.filter((t) => {
    const status = normalizarStatus(t.status.descricao);
    return status === "finalizado" || status === "finalizada";
  }).length;
  const bugs = tarefas.filter((t) => t.tipo.descricao === "Bug").length;

  const recentes = [...tarefas]
    .sort(
      (a, b) =>
        new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime(),
    )
    .slice(0, 8);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Visão geral das demandas da área de sustentação
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 3 }}
            />
          ) : (
            <StatCard
              title="Total de Tarefas"
              value={tarefas.length}
              icon={<AssignmentIcon />}
              color="#00d4ff"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 3 }}
            />
          ) : (
            <StatCard
              title="Em Andamento"
              value={emAndamento}
              icon={<TrendingUpIcon />}
              color="#ffab00"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 3 }}
            />
          ) : (
            <StatCard
              title="Finalizadas"
              value={finalizadas}
              icon={<CheckCircleOutlineIcon />}
              color="#00e676"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 3 }}
            />
          ) : (
            <StatCard
              title="Bugs Abertos"
              value={bugs}
              icon={<BugReportIcon />}
              color="#ff1744"
              subtitle="tipo Bug"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Status breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Por Status
              </Typography>
              <Box
                sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} height={40} sx={{ borderRadius: 1 }} />
                    ))
                  : Object.entries(statusCount).map(([status, count]) => (
                      <Box key={status}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {status}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={STATUS_COLORS[status] || "#94a3b8"}
                          >
                            {count}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            tarefas.length ? (count / tarefas.length) * 100 : 0
                          }
                          sx={{
                            "& .MuiLinearProgress-bar": {
                              background: STATUS_COLORS[status] || "#94a3b8",
                            },
                          }}
                        />
                      </Box>
                    ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent tasks */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Tarefas Recentes
                </Typography>
                <Tooltip title="Ver todas as tarefas">
                  <IconButton
                    size="small"
                    onClick={() => navigate("/tarefas")}
                    sx={{ color: "primary.main" }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} height={56} sx={{ borderRadius: 2 }} />
                    ))
                  : recentes.map((t) => (
                      <Box
                        key={t.id}
                        onClick={() => navigate(`/tarefas/${t.id}`)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${alpha("#00d4ff", 0.08)}`,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha("#00d4ff", 0.06),
                            borderColor: alpha("#00d4ff", 0.2),
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: PRIORIDADE_COLOR(t.prioridade),
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            noWrap
                            sx={{ color: "text.primary" }}
                          >
                            <span
                              style={{
                                color: "#00d4ff",
                                marginRight: 8,
                                fontFamily: "monospace",
                              }}
                            >
                              {t.codigo}
                            </span>
                            {t.descricao}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.tipo.descricao} ·{" "}
                            {t.desenvolvedor?.nome || "Não atribuído"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Chip
                            label={t.status.descricao}
                            size="small"
                            sx={{
                              bgcolor: alpha(
                                STATUS_COLORS[t.status.descricao] || "#94a3b8",
                                0.15,
                              ),
                              color:
                                STATUS_COLORS[t.status.descricao] || "#94a3b8",
                              border: `1px solid ${alpha(STATUS_COLORS[t.status.descricao] || "#94a3b8", 0.3)}`,
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              minWidth: 80,
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={t.percentualCompleto}
                              sx={{ flex: 1, height: 4 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.65rem" }}
                            >
                              {t.percentualCompleto}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                {!loading && tarefas.length === 0 && (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Nenhuma tarefa cadastrada.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
