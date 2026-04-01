import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import FlagIcon from "@mui/icons-material/Flag";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import type { Status, Tipo, Versao } from "../types";
import { tipoService } from "../services/tipoService";
import { statusService } from "../services/statusService";
import { versaoService } from "../services/versaoService";
import ConfirmDialog from "../components/ConfirmDialog";

type Aba = "tipos" | "status" | "versoes";

interface CrudConfig<T extends { id: number; descricao: string }> {
  titulo: string;
  singular: string;
  itens: T[];
  loading: boolean;
  onNovo: () => void;
  onEditar: (item: T) => void;
  onExcluir: (id: number) => void;
  icon: React.ReactNode;
}

const emptyForm = { descricao: "" };

const CrudLista = <T extends { id: number; descricao: string }>({
  titulo,
  singular,
  itens,
  loading,
  onNovo,
  onEditar,
  onExcluir,
  icon,
}: CrudConfig<T>) => (
  <Card sx={{ height: "100%" }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              bgcolor: alpha("#00d4ff", 0.14),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {titulo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {itens.length} registro{itens.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onNovo}>
          Novo
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={1.5}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          ))}
        </Grid>
      ) : itens.length === 0 ? (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            border: `1px dashed ${alpha("#00d4ff", 0.2)}`,
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">
            Nenhum {singular.toLowerCase()} cadastrado.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {itens.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Box
                sx={{
                  p: 1.6,
                  borderRadius: 2,
                  border: `1px solid ${alpha("#00d4ff", 0.14)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: alpha("#00d4ff", 0.3),
                    bgcolor: alpha("#00d4ff", 0.05),
                  },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Chip
                    label={`#${item.id}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      mr: 1,
                      bgcolor: alpha("#94a3b8", 0.18),
                      color: "#94a3b8",
                    }}
                  />
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {item.descricao}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Tooltip title={`Editar ${singular.toLowerCase()}`}>
                    <IconButton
                      size="small"
                      onClick={() => onEditar(item)}
                      sx={{ color: "#ffab00" }}
                    >
                      <EditIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Excluir ${singular.toLowerCase()}`}>
                    <IconButton
                      size="small"
                      onClick={() => onExcluir(item.id)}
                      sx={{ color: "#ff1744" }}
                    >
                      <DeleteIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </CardContent>
  </Card>
);

const Cadastros: React.FC = () => {
  const [aba, setAba] = useState<Aba>("tipos");

  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [status, setStatus] = useState<Status[]>([]);
  const [versoes, setVersoes] = useState<Versao[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingVersoes, setLoadingVersoes] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formVersao, setFormVersao] = useState({
    numeroVersao: "",
    descricao: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const carregarTipos = useCallback(async () => {
    setLoadingTipos(true);
    try {
      const data = await tipoService.listar();
      setTipos(data);
    } finally {
      setLoadingTipos(false);
    }
  }, []);

  const carregarStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const data = await statusService.listar();
      setStatus(data);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const carregarVersoes = useCallback(async () => {
    setLoadingVersoes(true);
    try {
      const data = await versaoService.listar();
      setVersoes(data);
    } finally {
      setLoadingVersoes(false);
    }
  }, []);

  useEffect(() => {
    carregarTipos();
    carregarStatus();
    carregarVersoes();
  }, [carregarTipos, carregarStatus, carregarVersoes]);

  const meta = useMemo(
    () => ({
      tipos: {
        titulo: "Tipos",
        singular: "Tipo",
      },
      status: {
        titulo: "Status",
        singular: "Status",
      },
      versoes: {
        titulo: "Versões",
        singular: "Versão",
      },
    }),
    [],
  );

  const abrirNovo = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormVersao({ numeroVersao: "", descricao: "" });
    setError("");
    setDialogOpen(true);
  };

  const abrirEditar = (item: {
    id: number;
    descricao?: string;
    numeroVersao?: string;
  }) => {
    setEditId(item.id);
    if (aba === "versoes" && item.numeroVersao) {
      setFormVersao({
        numeroVersao: item.numeroVersao ?? "",
        descricao: (item as Versao).descricao ?? "",
      });
    } else {
      setForm({ descricao: item.descricao ?? "" });
    }
    setError("");
    setDialogOpen(true);
  };

  const salvar = async () => {
    setError("");

    if (aba === "versoes") {
      if (!formVersao.numeroVersao.trim()) {
        setError("Número da versão é obrigatório.");
        return;
      }
    } else {
      if (!form.descricao.trim()) {
        setError("Descrição é obrigatória.");
        return;
      }
    }

    setSaving(true);
    try {
      if (aba === "tipos") {
        if (editId) {
          await tipoService.atualizar(editId, form);
        } else {
          await tipoService.criar(form);
        }
        await carregarTipos();
      } else if (aba === "status") {
        if (editId) {
          await statusService.atualizar(editId, form);
        } else {
          await statusService.criar(form);
        }
        await carregarStatus();
      } else if (aba === "versoes") {
        const dto = {
          numeroVersao: formVersao.numeroVersao,
          descricao: formVersao.descricao || undefined,
        };
        if (editId) {
          await versaoService.atualizar(editId, dto);
        } else {
          await versaoService.criar(dto);
        }
        await carregarVersoes();
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setFormVersao({ numeroVersao: "", descricao: "" });
      setEditId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar registro.");
    } finally {
      setSaving(false);
    }
  };

  const excluir = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      if (aba === "tipos") {
        await tipoService.deletar(deleteId);
        await carregarTipos();
      } else if (aba === "status") {
        await statusService.deletar(deleteId);
        await carregarStatus();
      } else if (aba === "versoes") {
        await versaoService.deletar(deleteId);
        await carregarVersoes();
      }
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Cadastros
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Gerencie tipos, status e versões utilizados nas tarefas
        </Typography>
      </Box>

      <Card sx={{ mb: 2.5 }}>
        <Tabs
          value={aba}
          onChange={(_, val: Aba) => setAba(val)}
          sx={{ px: 1.5, pt: 0.5 }}
        >
          <Tab
            value="tipos"
            label="Tipos"
            icon={<CategoryIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            value="status"
            label="Status"
            icon={<FlagIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            value="versoes"
            label="Versões"
            icon={<AppRegistrationIcon fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {aba === "tipos" ? (
        <CrudLista<Tipo>
          titulo={meta.tipos.titulo}
          singular={meta.tipos.singular}
          itens={tipos}
          loading={loadingTipos}
          onNovo={abrirNovo}
          onEditar={abrirEditar}
          onExcluir={setDeleteId}
          icon={<CategoryIcon fontSize="small" />}
        />
      ) : aba === "status" ? (
        <CrudLista<Status>
          titulo={meta.status.titulo}
          singular={meta.status.singular}
          itens={status}
          loading={loadingStatus}
          onNovo={abrirNovo}
          onEditar={abrirEditar}
          onExcluir={setDeleteId}
          icon={<FlagIcon fontSize="small" />}
        />
      ) : (
        <Card sx={{ height: "100%" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    bgcolor: alpha("#00d4ff", 0.14),
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AppRegistrationIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {meta.versoes.titulo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {versoes.length} registro{versoes.length !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={abrirNovo}
              >
                Novo
              </Button>
            </Box>

            {loadingVersoes ? (
              <Grid container spacing={1.5}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Grid item xs={12} key={i}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                ))}
              </Grid>
            ) : versoes.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                  border: `1px dashed ${alpha("#00d4ff", 0.2)}`,
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary">
                  Nenhuma versão cadastrada.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={1.5}>
                {versoes.map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Box
                      sx={{
                        p: 1.6,
                        borderRadius: 2,
                        border: `1px solid ${alpha("#00d4ff", 0.14)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: alpha("#00d4ff", 0.3),
                          bgcolor: alpha("#00d4ff", 0.05),
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Chip
                          label={`#${item.id}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            mr: 1,
                            bgcolor: alpha("#94a3b8", 0.18),
                            color: "#94a3b8",
                          }}
                        />
                        <Typography variant="body2" fontWeight={600} noWrap>
                          v{item.numeroVersao}
                        </Typography>
                        {item.descricao && (
                          <Box sx={{ mt: 0.75 }}>
                            {item.descricao
                              .split("\n")
                              .filter((linha) => linha.trim())
                              .map((linha, index) => (
                                <Typography
                                  key={`${item.id}-${index}`}
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    lineHeight: 1.55,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {linha}
                                </Typography>
                              ))}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Editar versão">
                          <IconButton
                            size="small"
                            onClick={() => abrirEditar(item)}
                            sx={{ color: "#ffab00" }}
                          >
                            <EditIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir versão">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteId(item.id)}
                            sx={{ color: "#ff1744" }}
                          >
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth={aba === "versoes" ? "md" : "sm"}
        fullWidth
      >
        <DialogTitle>
          {editId ? "Editar" : "Nova"}{" "}
          {aba === "versoes" ? "Versão" : aba === "tipos" ? "Tipo" : "Status"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Collapse in={!!error}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Collapse>

          {aba === "versoes" ? (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label="Número da Versão *"
                fullWidth
                autoFocus
                value={formVersao.numeroVersao}
                onChange={(e) =>
                  setFormVersao((f) => ({ ...f, numeroVersao: e.target.value }))
                }
                placeholder="ex: 1.0.0"
              />
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={10}
                value={formVersao.descricao}
                onChange={(e) =>
                  setFormVersao((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </Box>
          ) : (
            <TextField
              label="Descrição *"
              fullWidth
              autoFocus
              value={form.descricao}
              onChange={(e) => setForm({ descricao: e.target.value })}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvar} disabled={saving}>
            {saving ? "Salvando..." : editId ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title={`Excluir ${aba === "versoes" ? "Versão" : aba === "tipos" ? "Tipo" : "Status"}`}
        message={`Tem certeza que deseja excluir este item?`}
        onConfirm={excluir}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Box>
  );
};

export default Cadastros;
