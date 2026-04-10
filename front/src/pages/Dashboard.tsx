import React, { useEffect, useMemo, useState } from "react";
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
import type { Status, Tarefa } from "../types";
import { tarefaService } from "../services/tarefaService";

const STATUS_COLOR_LIST = [
  "#00d4ff",
  "#ff1744",
  "#00e676",
  "#a855f7",
  "#ffab00",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#ec4899",
  "#84cc16",
  "#06b6d4",
  "#eab308",
];

const FALLBACK_STATUS_COLOR = "#94a3b8";

const getStatusColorByIndex = (index: number): string =>
  STATUS_COLOR_LIST[index % STATUS_COLOR_LIST.length];

const getStatusColor = (
  statusItem?: Pick<Status, "id" | "descricao"> | null,
  statusColorMap?: Record<number, string>,
): string => {
  if (statusItem?.id && statusColorMap?.[statusItem.id]) {
    return statusColorMap[statusItem.id];
  }

  const descricao = statusItem?.descricao?.trim();
  if (!descricao) {
    return FALLBACK_STATUS_COLOR;
  }

  const hash = descricao
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return getStatusColorByIndex(hash);
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

  const statusList = useMemo(
    () =>
      [
        ...new Map(
          tarefas.map((tarefa) => [tarefa.status.id, tarefa.status]),
        ).values(),
      ].sort((a, b) => a.id - b.id),
    [tarefas],
  );

  const statusColorMap = useMemo(
    () =>
      statusList.reduce<Record<number, string>>((acc, item, index) => {
        acc[item.id] = getStatusColorByIndex(index);
        return acc;
      }, {}),
    [statusList],
  );

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
                  : Object.entries(statusCount).map(([status, count]) => {
                      const statusItem = statusList.find(
                        (item) => item.descricao === status,
                      );
                      const statusColor = getStatusColor(
                        statusItem,
                        statusColorMap,
                      );

                      return (
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
                              color={statusColor}
                            >
                              {count}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              tarefas.length
                                ? (count / tarefas.length) * 100
                                : 0
                            }
                            sx={{
                              "& .MuiLinearProgress-bar": {
                                background: statusColor,
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
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
                  : recentes.map((t) => {
                      const statusCor = getStatusColor(
                        t.status,
                        statusColorMap,
                      );

                      return (
                        <Box
                          key={t.id}
                          onClick={() => navigate(`/tarefas/${t.id}`)}
                          sx={(theme) => ({
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${alpha(statusCor, 0.1)}`,
                            background:
                              theme.palette.mode === "dark"
                                ? `linear-gradient(90deg, ${alpha(statusCor, 0.05)} 0%, ${alpha(statusCor, 0.03)} 36%, ${alpha(theme.palette.background.paper, 0.985)} 100%)`
                                : `linear-gradient(90deg, ${alpha(statusCor, 0.05)} 0%, ${alpha(statusCor, 0.03)} 36%, ${theme.palette.background.paper} 100%)`,
                            boxShadow: `0 4px 12px ${alpha(statusCor, 0.1)}`,
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.2s ease",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              inset: 0,
                              background: `linear-gradient(135deg, ${alpha(statusCor, 0.04)} 0%, transparent 60%)`,
                              pointerEvents: "none",
                            },
                            "&:hover": {
                              transform: "translateY(-1px)",
                              borderColor: alpha(statusCor, 0.7),
                              boxShadow: `0 8px 18px ${alpha(statusCor, 0.3)}`,
                            },
                          })}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 32,
                              borderRadius: 1,
                              bgcolor: statusCor,
                              flexShrink: 0,
                              boxShadow: `0 0 8px ${alpha(statusCor, 0.22)}`,
                            }}
                          />
                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              noWrap
                              sx={{ color: "text.primary" }}
                            >
                              <span
                                style={{
                                  color: statusCor,
                                  marginRight: 8,
                                  fontFamily: "monospace",
                                }}
                              >
                                {t.codigo}
                              </span>
                              {t.descricao}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            <Chip
                              label={t.status.descricao}
                              size="small"
                              sx={{
                                bgcolor: alpha(statusCor, 0.15),
                                color: statusCor,
                                border: `1px solid ${alpha(statusCor, 0.3)}`,
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
                                sx={{
                                  flex: 1,
                                  height: 4,
                                  borderRadius: 3,
                                  bgcolor: alpha(statusCor, 0.18),
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: statusCor,
                                  },
                                }}
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
                      );
                    })}
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
