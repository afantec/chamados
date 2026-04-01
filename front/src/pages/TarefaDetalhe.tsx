import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Collapse,
  Tooltip,
  Skeleton,
  alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddCommentIcon from "@mui/icons-material/AddComment";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import LabelIcon from "@mui/icons-material/Label";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloudIcon from "@mui/icons-material/Cloud";
import type { Tarefa, Anotacao, AnotacaoRequest } from "../types";
import { tarefaService } from "../services/tarefaService";
import { anotacaoService } from "../services/anotacaoService";
import ConfirmDialog from "../components/ConfirmDialog";
import dayjs from "dayjs";

const STATUS_COLORS: Record<string, string> = {
  Aberto: "#00d4ff",
  "Em Andamento": "#ffab00",
  "Em Revisão": "#a855f7",
  "Aguardando Aprovação": "#ff9800",
  Finalizado: "#00e676",
  Cancelado: "#ff1744",
};

const TIPO_COLORS: Record<string, string> = {
  Bug: "#ff1744",
  Melhoria: "#00d4ff",
  "Suporte Técnico": "#ffab00",
  "Evolução de Versão": "#a855f7",
};

const PRIORIDADE_COLOR = (p: number) => {
  if (p >= 8) return "#ff1744";
  if (p >= 5) return "#ffab00";
  return "#00e676";
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}> = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75 }}>
    <Box sx={{ color: "text.secondary", display: "flex", flexShrink: 0 }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontSize: "0.65rem",
        }}
      >
        {label}
      </Typography>
      <Box sx={{ mt: 0.25 }}>
        {value ?? (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        )}
      </Box>
    </Box>
  </Box>
);

const TarefaDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [anotacaoDialog, setAnotacaoDialog] = useState(false);
  const [editAnotacao, setEditAnotacao] = useState<Anotacao | null>(null);
  const [anotacaoTexto, setAnotacaoTexto] = useState("");
  const [savingAnotacao, setSavingAnotacao] = useState(false);
  const [anotacaoError, setAnotacaoError] = useState("");

  const [deleteAnotacaoId, setDeleteAnotacaoId] = useState<number | null>(null);
  const [deletingAnotacao, setDeletingAnotacao] = useState(false);

  const carregar = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const t = await tarefaService.buscarPorId(Number(id));
      setTarefa(t);
      const anots = await anotacaoService.listarPorTarefa(Number(id));
      setAnotacoes(anots);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAbrirAnotacao = (anot?: Anotacao) => {
    setEditAnotacao(anot ?? null);
    setAnotacaoTexto(anot?.descricao ?? "");
    setAnotacaoError("");
    setAnotacaoDialog(true);
  };

  const handleSalvarAnotacao = async () => {
    if (!anotacaoTexto.trim()) {
      setAnotacaoError("A descrição é obrigatória.");
      return;
    }
    setSavingAnotacao(true);
    const dto: AnotacaoRequest = {
      descricao: anotacaoTexto.trim(),
      tarefaId: Number(id),
    };
    try {
      if (editAnotacao) {
        await anotacaoService.atualizar(editAnotacao.id, dto);
      } else {
        await anotacaoService.criar(dto);
      }
      setAnotacaoDialog(false);
      const anots = await anotacaoService.listarPorTarefa(Number(id));
      setAnotacoes(anots);
    } catch (e: unknown) {
      setAnotacaoError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSavingAnotacao(false);
    }
  };

  const handleDeletarAnotacao = async () => {
    if (!deleteAnotacaoId) return;
    setDeletingAnotacao(true);
    try {
      await anotacaoService.deletar(deleteAnotacaoId);
      setDeleteAnotacaoId(null);
      setAnotacoes((prev) => prev.filter((a) => a.id !== deleteAnotacaoId));
    } finally {
      setDeletingAnotacao(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton height={44} width={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton height={400} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton height={400} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (notFound || !tarefa) {
    return (
      <Box>
        <Alert severity="error">Tarefa não encontrada.</Alert>
        <Button
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/tarefas")}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  const statusColor = STATUS_COLORS[tarefa.status.descricao] || "#94a3b8";
  const tipoColor = TIPO_COLORS[tarefa.tipo.descricao] || "#94a3b8";

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton
          onClick={() => navigate("/tarefas")}
          sx={{ color: "text.secondary" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontFamily: "monospace",
                color: "primary.main",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              {tarefa.codigo}
            </Typography>
            <Chip
              label={tarefa.status.descricao}
              size="small"
              sx={{
                bgcolor: alpha(statusColor, 0.15),
                color: statusColor,
                border: `1px solid ${alpha(statusColor, 0.3)}`,
                fontWeight: 700,
              }}
            />
            <Chip
              label={tarefa.tipo.descricao}
              size="small"
              sx={{
                bgcolor: alpha(tipoColor, 0.15),
                color: tipoColor,
                border: `1px solid ${alpha(tipoColor, 0.3)}`,
                fontWeight: 700,
              }}
            />
          </Box>
          <Typography variant="h5" fontWeight={600} sx={{ mt: 0.5 }}>
            {tarefa.descricao}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate("/tarefas", { state: { editId: tarefa.id } })}
        >
          Editar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="subtitle2"
                color="primary.main"
                fontWeight={700}
                sx={{
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Informações
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={<PersonIcon fontSize="small" />}
                    label="Desenvolvedor"
                    value={
                      tarefa.desenvolvedor ? (
                        <Typography variant="body2">
                          {tarefa.desenvolvedor.nome}
                        </Typography>
                      ) : undefined
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={<LabelIcon fontSize="small" />}
                    label="Versão"
                    value={
                      tarefa.versao ? (
                        <Typography variant="body2">
                          {tarefa.versao.numeroVersao}
                        </Typography>
                      ) : undefined
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={<AccountTreeIcon fontSize="small" />}
                    label="Branch"
                    value={
                      tarefa.branchNome ? (
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", color: "#a855f7" }}
                        >
                          {tarefa.branchNome}
                        </Typography>
                      ) : undefined
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={<CloudIcon fontSize="small" />}
                    label="Ambiente"
                    value={
                      tarefa.ambiente ? (
                        <Typography variant="body2">
                          {tarefa.ambiente}
                        </Typography>
                      ) : undefined
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={<CalendarTodayIcon fontSize="small" />}
                    label="Criado em"
                    value={
                      <Typography variant="body2">
                        {dayjs(tarefa.dataCriacao).format("DD/MM/YYYY")}
                      </Typography>
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={<CalendarTodayIcon fontSize="small" />}
                    label="Data de Entrega"
                    value={
                      tarefa.dataEntrega ? (
                        <Typography variant="body2">
                          {dayjs(tarefa.dataEntrega).format("DD/MM/YYYY")}
                        </Typography>
                      ) : undefined
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={<CalendarTodayIcon fontSize="small" />}
                    label="Data de Finalização"
                    value={
                      tarefa.dataFinalizacao ? (
                        <Typography variant="body2">
                          {dayjs(tarefa.dataFinalizacao).format("DD/MM/YYYY")}
                        </Typography>
                      ) : undefined
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5, borderColor: alpha("#00d4ff", 0.1) }} />

              {/* Progress */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Progresso
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {tarefa.percentualCompleto}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={tarefa.percentualCompleto}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Priority */}
              <Box
                sx={{
                  mt: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Prioridade:
                </Typography>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.25,
                    borderRadius: 2,
                    bgcolor: alpha(PRIORIDADE_COLOR(tarefa.prioridade), 0.15),
                    border: `1px solid ${alpha(PRIORIDADE_COLOR(tarefa.prioridade), 0.4)}`,
                    color: PRIORIDADE_COLOR(tarefa.prioridade),
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {tarefa.prioridade}/10{" "}
                  {tarefa.prioridade >= 8
                    ? "🔴"
                    : tarefa.prioridade >= 5
                      ? "🟡"
                      : "🟢"}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Anotações */}
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
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  Anotações ({anotacoes.length})
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddCommentIcon />}
                  onClick={() => handleAbrirAnotacao()}
                >
                  Adicionar
                </Button>
              </Box>

              {anotacoes.length === 0 ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign: "center",
                    bgcolor: alpha("#00d4ff", 0.03),
                    borderRadius: 2,
                    border: `1px dashed ${alpha("#00d4ff", 0.15)}`,
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    Nenhuma anotação cadastrada.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {anotacoes.map((anot) => (
                    <Box
                      key={anot.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha("#00d4ff", 0.04),
                        border: `1px solid ${alpha("#00d4ff", 0.1)}`,
                        display: "flex",
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                        >
                          {anot.descricao}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {dayjs(anot.dataAnotacao).format(
                            "DD/MM/YYYY [às] HH:mm",
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirAnotacao(anot)}
                            sx={{ color: "#ffab00" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteAnotacaoId(anot.id)}
                            sx={{ color: "#ff1744" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar summary */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              position: "sticky",
              top: 80,
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${statusColor}, ${alpha(statusColor, 0.3)})`,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="subtitle2"
                color="primary.main"
                fontWeight={700}
                sx={{
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Resumo
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={tarefa.status.descricao}
                    size="small"
                    sx={{
                      bgcolor: alpha(statusColor, 0.15),
                      color: statusColor,
                      fontWeight: 700,
                      border: `1px solid ${alpha(statusColor, 0.3)}`,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Tipo
                  </Typography>
                  <Chip
                    label={tarefa.tipo.descricao}
                    size="small"
                    sx={{
                      bgcolor: alpha(tipoColor, 0.15),
                      color: tipoColor,
                      fontWeight: 700,
                      border: `1px solid ${alpha(tipoColor, 0.3)}`,
                    }}
                  />
                </Box>
                <Divider sx={{ borderColor: alpha("#00d4ff", 0.1) }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Prioridade
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={PRIORIDADE_COLOR(tarefa.prioridade)}
                  >
                    {tarefa.prioridade}/10
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Progresso
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {tarefa.percentualCompleto}%
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Anotações
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {anotacoes.length}
                  </Typography>
                </Box>
                {tarefa.versao && (
                  <>
                    <Divider sx={{ borderColor: alpha("#00d4ff", 0.1) }} />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Versão
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ fontFamily: "monospace", color: "#a855f7" }}
                      >
                        {tarefa.versao.numeroVersao}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Anotação Dialog */}
      <Dialog
        open={anotacaoDialog}
        onClose={() => setAnotacaoDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editAnotacao ? "Editar Anotação" : "Nova Anotação"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Collapse in={!!anotacaoError}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {anotacaoError}
            </Alert>
          </Collapse>
          <TextField
            label="Descrição *"
            fullWidth
            multiline
            rows={4}
            value={anotacaoTexto}
            onChange={(e) => setAnotacaoTexto(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setAnotacaoDialog(false)}
            disabled={savingAnotacao}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSalvarAnotacao}
            disabled={savingAnotacao}
          >
            {savingAnotacao
              ? "Salvando..."
              : editAnotacao
                ? "Salvar"
                : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Anotação */}
      <ConfirmDialog
        open={!!deleteAnotacaoId}
        title="Excluir Anotação"
        message="Tem certeza que deseja excluir esta anotação?"
        onConfirm={handleDeletarAnotacao}
        onCancel={() => setDeleteAnotacaoId(null)}
        loading={deletingAnotacao}
      />
    </Box>
  );
};

export default TarefaDetalhe;
