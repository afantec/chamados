import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Collapse,
  InputAdornment,
  alpha,
  FormControl,
  InputLabel,
  Select,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import type {
  Tarefa,
  TarefaRequest,
  Status,
  Tipo,
  Desenvolvedor,
  Versao,
  FiltrosTarefa,
} from "../types";
import { tarefaService } from "../services/tarefaService";
import { statusService } from "../services/statusService";
import { tipoService } from "../services/tipoService";
import { desenvolvedorService } from "../services/desenvolvedorService";
import { versaoService } from "../services/versaoService";
import ConfirmDialog from "../components/ConfirmDialog";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

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

const isStatusFinalizado = (descricao?: string): boolean => {
  const normalizado = descricao?.trim().toLowerCase();
  return normalizado === "finalizado" || normalizado === "finalizada";
};

const csvEscape = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
};

const formatCsvDate = (value?: string): string => {
  if (!value) {
    return "";
  }

  const date = dayjs(value);
  if (!date.isValid()) {
    return value;
  }

  return date.format("YYYY-MM-DD HH:mm:ss");
};

const emptyForm = (): TarefaRequest => ({
  codigo: "",
  descricao: "",
  tipoId: 0,
  desenvolvedorId: null,
  statusId: 0,
  versaoId: null,
  prioridade: 5,
  percentualCompleto: 0,
  branchNome: "",
  dataEntrega: null,
  dataFinalizacao: null,
  ambiente: "",
});

const Tarefas: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosTarefa>({});
  const [showFiltros, setShowFiltros] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState("");

  const [status, setStatus] = useState<Status[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [desenvolvedores, setDesenvolvedores] = useState<Desenvolvedor[]>([]);
  const [versoes, setVersoes] = useState<Versao[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<TarefaRequest>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const statusFinalizado = status.find((s) => s.descricao === "Finalizado");
  const [tarefasOriginais, setTarefasOriginais] = useState<Tarefa[]>([]);

  const aplicarFiltros = useCallback(
    (lista: Tarefa[], filtroObj: FiltrosTarefa) => {
      return lista.filter((tarefa) => {
        if (!filtroObj.statusId && isStatusFinalizado(tarefa.status.descricao)) {
          return false;
        }
        if (
          filtroObj.descricao &&
          !tarefa.descricao
            .toLowerCase()
            .includes(filtroObj.descricao.toLowerCase())
        ) {
          return false;
        }
        if (filtroObj.statusId && tarefa.status.id !== filtroObj.statusId) {
          return false;
        }
        if (filtroObj.tipoId && tarefa.tipo.id !== filtroObj.tipoId) {
          return false;
        }
        if (
          filtroObj.desenvolvedorId &&
          tarefa.desenvolvedor?.id !== filtroObj.desenvolvedorId
        ) {
          return false;
        }
        if (filtroObj.versaoId && tarefa.versao?.id !== filtroObj.versaoId) {
          return false;
        }
        const dataCriacao = dayjs(tarefa.dataCriacao).startOf("day");
        if (
          filtroObj.dataCriacaoInicio &&
          dataCriacao.isBefore(
            dayjs(filtroObj.dataCriacaoInicio).startOf("day"),
          )
        ) {
          return false;
        }
        if (
          filtroObj.dataCriacaoFim &&
          dataCriacao.isAfter(dayjs(filtroObj.dataCriacaoFim).startOf("day"))
        ) {
          return false;
        }
        return true;
      });
    },
    [],
  );

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tarefaService.listar();
      const listaOriginal = Array.isArray(data) ? data : [];
      setTarefasOriginais(listaOriginal);
      const filtrada = aplicarFiltros(listaOriginal, filtros);
      setTarefas(filtrada);
      setError("");
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Erro ao carregar lista de tarefas.",
      );
    } finally {
      setLoading(false);
    }
  }, [aplicarFiltros, filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    Promise.all([
      statusService.listar(),
      tipoService.listar(),
      desenvolvedorService.listarAtivos(),
      versaoService.listar(),
    ]).then(([s, t, d, v]) => {
      setStatus(s);
      setTipos(t);
      setDesenvolvedores(d);
      setVersoes(v);
    });
  }, []);

  const handleAbrirCriar = () => {
    setEditId(null);
    setForm(emptyForm());
    setError("");
    setDialogOpen(true);
  };

  const handleAbrirEditar = (tarefa: Tarefa) => {
    setEditId(tarefa.id);
    setForm({
      codigo: tarefa.codigo,
      descricao: tarefa.descricao,
      tipoId: tarefa.tipo.id,
      desenvolvedorId: tarefa.desenvolvedor?.id ?? null,
      statusId: tarefa.status.id,
      versaoId: tarefa.versao?.id ?? null,
      prioridade: tarefa.prioridade,
      percentualCompleto: tarefa.percentualCompleto,
      branchNome: tarefa.branchNome ?? "",
      dataEntrega: tarefa.dataEntrega ?? null,
      dataFinalizacao: tarefa.dataFinalizacao ?? null,
      ambiente: tarefa.ambiente ?? "",
    });
    setError("");
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    setError("");
    if (
      !form.codigo ||
      !form.descricao ||
      !form.tipoId ||
      !form.statusId ||
      !form.prioridade
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (
      statusFinalizado &&
      form.statusId === statusFinalizado.id &&
      !form.ambiente
    ) {
      setError("Ambiente é obrigatório quando o status é Finalizado.");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await tarefaService.atualizar(editId, form);

        // Ao editar com versão selecionada, adiciona item nas notas da versão
        if (form.versaoId) {
          const versaoSelecionada = versoes.find((v) => v.id === form.versaoId);
          const tipoSelecionado = tipos.find((t) => t.id === form.tipoId);
          if (versaoSelecionada && tipoSelecionado) {
            const novoItem = `- [${tipoSelecionado.descricao}] ${form.descricao}`;
            const descricaoAtualizada = versaoSelecionada.descricao
              ? `${versaoSelecionada.descricao}\n${novoItem}`
              : novoItem;
            try {
              await versaoService.atualizar(versaoSelecionada.id, {
                numeroVersao: versaoSelecionada.numeroVersao,
                descricao: descricaoAtualizada,
              });
              setVersoes((prev) =>
                prev.map((v) =>
                  v.id === versaoSelecionada.id
                    ? { ...v, descricao: descricaoAtualizada }
                    : v,
                ),
              );
            } catch {
              // Não bloqueia o fluxo se falhar ao atualizar a versão
            }
          }
        }

        await carregar();
      } else {
        await tarefaService.criar(form);
        setFiltros({});
        setBuscaTexto("");
        const data = await tarefaService.listar();
        const listaOriginal = Array.isArray(data) ? data : [];
        setTarefasOriginais(listaOriginal);
        setTarefas(listaOriginal);
        setError("");
      }
      setForm(emptyForm());
      setEditId(null);
      setDialogOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletar = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await tarefaService.deletar(deleteId);
      setDeleteId(null);
      carregar();
    } finally {
      setDeleting(false);
    }
  };

  const handleBuscar = () => {
    setFiltros((prev) => ({ ...prev, descricao: buscaTexto || undefined }));
  };

  const handleLimparFiltros = () => {
    setFiltros({});
    setBuscaTexto("");
  };

  const handleExportarCsv = () => {
    const headers = [
      "Codigo",
      "Descricao",
      "Tipo",
      "Desenvolvedor",
      "Status",
      "Versao",
      "Prioridade",
      "Completo",
      "Branch",
      "Criacao",
      "Entrega",
      "Finalizacao",
      "Ambiente",
      "Anotacoes",
    ];

    const rows = tarefas.map((tarefa) => {
      const anotacoes = tarefa.anotacoes?.length
        ? tarefa.anotacoes
            .map((a) => `${a.id} - ${a.descricao} (${formatCsvDate(a.dataAnotacao)})`)
            .join(" | ")
        : "";

      return [
        tarefa.codigo,
        tarefa.descricao,
        tarefa.tipo?.descricao,
        tarefa.desenvolvedor?.nome,
        tarefa.status?.descricao,
        tarefa.versao?.numeroVersao,
        tarefa.prioridade,
        tarefa.percentualCompleto,
        tarefa.branchNome,
        formatCsvDate(tarefa.dataCriacao),
        formatCsvDate(tarefa.dataEntrega),
        formatCsvDate(tarefa.dataFinalizacao),
        tarefa.ambiente,
        anotacoes,
      ];
    });

    const csvContent = [
      headers.map(csvEscape).join(";"),
      ...rows.map((row) => row.map(csvEscape).join(";")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = dayjs().format("YYYYMMDD_HHmmss");

    link.href = url;
    link.download = `tarefas_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filtroAtivo = Object.values(filtros).some(
    (v) => v !== undefined && v !== null && v !== "",
  );

  const columns: GridColDef[] = [
    {
      field: "codigo",
      headerName: "Código",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            fontFamily: "monospace",
            color: "primary.main",
            fontWeight: 600,
            fontSize: "0.8rem",
          }}
        >
          {params.value as string}
        </Typography>
      ),
    },
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" noWrap>
          {params.value as string}
        </Typography>
      ),
    },
    {
      field: "tipo",
      headerName: "Tipo",
      width: 150,
      valueGetter: (_value, row: Tarefa) => row?.tipo?.descricao ?? "—",
      renderCell: (params: GridRenderCellParams) => {
        const tipo =
          (params.row as Tarefa | undefined)?.tipo?.descricao ??
          (params.value as string) ??
          "—";
        return (
          <Chip
            label={tipo}
            size="small"
            sx={{
              bgcolor: alpha(TIPO_COLORS[tipo] || "#94a3b8", 0.15),
              color: TIPO_COLORS[tipo] || "#94a3b8",
              fontWeight: 600,
              fontSize: "0.7rem",
              border: `1px solid ${alpha(TIPO_COLORS[tipo] || "#94a3b8", 0.3)}`,
            }}
          />
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      valueGetter: (_value, row: Tarefa) => row?.status?.descricao ?? "—",
      renderCell: (params: GridRenderCellParams) => {
        const s =
          (params.row as Tarefa | undefined)?.status?.descricao ??
          (params.value as string) ??
          "—";
        return (
          <Chip
            label={s}
            size="small"
            sx={{
              bgcolor: alpha(STATUS_COLORS[s] || "#94a3b8", 0.15),
              color: STATUS_COLORS[s] || "#94a3b8",
              fontWeight: 600,
              fontSize: "0.7rem",
              border: `1px solid ${alpha(STATUS_COLORS[s] || "#94a3b8", 0.3)}`,
            }}
          />
        );
      },
    },
    {
      field: "desenvolvedor",
      headerName: "Desenvolvedor",
      width: 160,
      valueGetter: (_value, row: Tarefa) => row?.desenvolvedor?.nome ?? "—",
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          color={params.value === "—" ? "text.disabled" : "text.primary"}
        >
          {params.value as string}
        </Typography>
      ),
    },
    {
      field: "dataCriacao",
      headerName: "Data Criação",
      width: 130,
      valueGetter: (_value, row: Tarefa) => row?.dataCriacao ?? "",
      renderCell: (params: GridRenderCellParams) => {
        const valor = params.value as string;
        return (
          <Typography variant="body2" color="text.secondary">
            {valor ? dayjs(valor).format("DD/MM/YYYY") : "—"}
          </Typography>
        );
      },
    },
    {
      field: "prioridade",
      headerName: "Prioridade",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => {
        const p = params.value as number;
        return (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: alpha(PRIORIDADE_COLOR(p), 0.15),
              border: `2px solid ${PRIORIDADE_COLOR(p)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PRIORIDADE_COLOR(p),
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          >
            {p}
          </Box>
        );
      },
    },
    {
      field: "percentualCompleto",
      headerName: "Progresso",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}
        >
          <LinearProgress
            variant="determinate"
            value={params.value as number}
            sx={{ flex: 1, height: 6, borderRadius: 3 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 30 }}
          >
            {params.value as number}%
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Tarefa;
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Ver detalhes">
              <IconButton
                size="small"
                onClick={() => navigate(`/tarefas/${row.id}`)}
                sx={{ color: "primary.main" }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => handleAbrirEditar(row)}
                sx={{ color: "#ffab00" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                onClick={() => setDeleteId(row.id)}
                sx={{ color: "#ff1744" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        height: "calc(100vh - 140px)",
        minHeight: 520,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Tarefas
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""} encontrada
            {tarefas.length !== 1 ? "s" : ""}
            {filtroAtivo && " (filtros ativos)"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportarCsv}
            disabled={!tarefas.length}
          >
            Exportar CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAbrirCriar}
          >
            Nova Tarefa
          </Button>
        </Box>
      </Box>

      {/* Search & Filters */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Buscar por descrição..."
          value={buscaTexto}
          onChange={(e) => setBuscaTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
          sx={{ minWidth: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} />
              </InputAdornment>
            ),
            endAdornment: buscaTexto && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setBuscaTexto("");
                    setFiltros((f) => ({ ...f, descricao: undefined }));
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            label="Tipo"
            value={filtros.tipoId ?? ""}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                tipoId: e.target.value ? Number(e.target.value) : null,
              }))
            }
          >
            <MenuItem value="">Todos</MenuItem>
            {tipos.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.descricao}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filtros.statusId ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  statusId: e.target.value ? Number(e.target.value) : null,
                }))
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {status.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.descricao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Desenvolvedor</InputLabel>
            <Select
              label="Desenvolvedor"
              value={filtros.desenvolvedorId ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  desenvolvedorId: e.target.value
                    ? Number(e.target.value)
                    : null,
                }))
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {desenvolvedores.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DatePicker
            label="Criação Início"
            value={
              filtros.dataCriacaoInicio
                ? dayjs(filtros.dataCriacaoInicio)
                : null
            }
            onChange={(v: Dayjs | null) =>
              setFiltros((f) => ({
                ...f,
                dataCriacaoInicio: v ? v.format("YYYY-MM-DD") : null,
              }))
            }
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 180 },
              },
            }}
          />
          <DatePicker
            label="Criação Fim"
            value={
              filtros.dataCriacaoFim ? dayjs(filtros.dataCriacaoFim) : null
            }
            onChange={(v: Dayjs | null) =>
              setFiltros((f) => ({
                ...f,
                dataCriacaoFim: v ? v.format("YYYY-MM-DD") : null,
              }))
            }
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 180 },
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Versão</InputLabel>
            <Select
              label="Versão"
              value={filtros.versaoId ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  versaoId: e.target.value ? Number(e.target.value) : null,
                }))
              }
            >
              <MenuItem value="">Todas</MenuItem>
              {versoes.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.numeroVersao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleLimparFiltros}>
            Limpar
          </Button>
      </Box>

      {/* DataGrid */}
      <Collapse in={!!error && !dialogOpen}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Collapse>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          "& .MuiDataGrid-root": { borderRadius: 2 },
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <DataGrid
          rows={tarefas}
          getRowId={(row) => row.id ?? row.codigo}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{ border: "none" }}
        />
      </Box>

      {/* Criar/Editar Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ borderBottom: `1px solid ${alpha("#00d4ff", 0.1)}`, pb: 2 }}
        >
          {editId ? "Editar Tarefa" : "Nova Tarefa"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Collapse in={!!error}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Collapse>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Código *"
                fullWidth
                value={form.codigo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, codigo: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Descrição *"
                fullWidth
                value={form.descricao}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Tipo *</InputLabel>
                <Select
                  label="Tipo *"
                  value={form.tipoId || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tipoId: e.target.value as number }))
                  }
                >
                  {tipos.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.descricao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Status *</InputLabel>
                <Select
                  label="Status *"
                  value={form.statusId || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      statusId: e.target.value as number,
                    }))
                  }
                >
                  {status.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.descricao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Desenvolvedor</InputLabel>
                <Select
                  label="Desenvolvedor"
                  value={form.desenvolvedorId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      desenvolvedorId: (e.target.value as number) || null,
                    }))
                  }
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {desenvolvedores.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {editId && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Versão</InputLabel>
                  <Select
                    label="Versão"
                    value={form.versaoId ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        versaoId: (e.target.value as number) || null,
                      }))
                    }
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {versoes.map((v) => (
                      <MenuItem key={v.id} value={v.id}>
                        {v.numeroVersao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Prioridade * (1-10)"
                type="number"
                fullWidth
                value={form.prioridade}
                inputProps={{ min: 1, max: 10 }}
                onChange={(e) =>
                  setForm((f) => ({ ...f, prioridade: Number(e.target.value) }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="% Completo (0-100)"
                type="number"
                fullWidth
                value={form.percentualCompleto}
                inputProps={{ min: 0, max: 100 }}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    percentualCompleto: Number(e.target.value),
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Branch"
                fullWidth
                value={form.branchNome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, branchNome: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Data de Entrega"
                value={form.dataEntrega ? dayjs(form.dataEntrega) : null}
                onChange={(v: Dayjs | null) =>
                  setForm((f) => ({
                    ...f,
                    dataEntrega: v ? v.format("YYYY-MM-DD") : null,
                  }))
                }
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Data de Finalização"
                value={
                  form.dataFinalizacao ? dayjs(form.dataFinalizacao) : null
                }
                onChange={(v: Dayjs | null) =>
                  setForm((f) => ({
                    ...f,
                    dataFinalizacao: v ? v.format("YYYY-MM-DD") : null,
                  }))
                }
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label={
                  statusFinalizado && form.statusId === statusFinalizado.id
                    ? "Ambiente *"
                    : "Ambiente"
                }
                fullWidth
                value={form.ambiente}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ambiente: e.target.value }))
                }
                required={
                  !!(statusFinalizado && form.statusId === statusFinalizado.id)
                }
                helperText={
                  statusFinalizado && form.statusId === statusFinalizado.id
                    ? "Obrigatório para status Finalizado"
                    : ""
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSalvar} disabled={saving}>
            {saving ? "Salvando..." : editId ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
        onConfirm={handleDeletar}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Box>
  );
};

export default Tarefas;
