import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  Switch,
  FormControlLabel,
  alpha,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import type { Desenvolvedor } from "../types";
import { desenvolvedorService } from "../services/desenvolvedorService";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyForm = () => ({ nome: "", email: "", ativo: true });

const Desenvolvedores: React.FC = () => {
  const [desenvolvedores, setDesenvolvedores] = useState<Desenvolvedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showInativos, setShowInativos] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await desenvolvedorService.listar();
      setDesenvolvedores(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const listagem = showInativos
    ? desenvolvedores
    : desenvolvedores.filter((d) => d.ativo);

  const handleAbrirCriar = () => {
    setEditId(null);
    setForm(emptyForm());
    setError("");
    setDialogOpen(true);
  };

  const handleAbrirEditar = (dev: Desenvolvedor) => {
    setEditId(dev.id);
    setForm({ nome: dev.nome, email: dev.email, ativo: dev.ativo });
    setError("");
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    setError("");
    if (!form.nome.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("E-mail inválido.");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await desenvolvedorService.atualizar(editId, form);
      } else {
        await desenvolvedorService.criar(form);
      }
      setDialogOpen(false);
      carregar();
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
      await desenvolvedorService.deletar(deleteId);
      setDeleteId(null);
      carregar();
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (nome: string) =>
    nome
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const AVATAR_COLORS = [
    "#00d4ff",
    "#7c3aed",
    "#00e676",
    "#ffab00",
    "#ff1744",
    "#a855f7",
  ];
  const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

  return (
    <Box>
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
            Desenvolvedores
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {listagem.length} desenvolvedor{listagem.length !== 1 ? "es" : ""}{" "}
            {!showInativos ? "ativo" : ""}
            {listagem.length !== 1 && !showInativos ? "s" : ""}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInativos}
                onChange={(e) => setShowInativos(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Mostrar inativos
              </Typography>
            }
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAbrirCriar}
          >
            Novo Desenvolvedor
          </Button>
        </Box>
      </Box>

      {/* Cards grid */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ height: 160 }} />
            </Grid>
          ))}
        </Grid>
      ) : listagem.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            border: `1px dashed ${alpha("#00d4ff", 0.2)}`,
            borderRadius: 2,
          }}
        >
          <PersonIcon
            sx={{ fontSize: 48, color: alpha("#00d4ff", 0.3), mb: 1 }}
          />
          <Typography color="text.secondary">
            Nenhum desenvolvedor cadastrado.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {listagem.map((dev) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={dev.id}>
              <Card
                sx={{
                  opacity: dev.ativo ? 1 : 0.55,
                  transition: "all 0.2s",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                  >
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: alpha(avatarColor(dev.id), 0.2),
                        color: avatarColor(dev.id),
                        fontWeight: 700,
                        fontSize: "1rem",
                        border: `1.5px solid ${alpha(avatarColor(dev.id), 0.4)}`,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(dev.nome)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {dev.nome}
                        </Typography>
                        <Chip
                          label={dev.ativo ? "Ativo" : "Inativo"}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            bgcolor: dev.ativo
                              ? alpha("#00e676", 0.15)
                              : alpha("#94a3b8", 0.15),
                            color: dev.ativo ? "#00e676" : "#94a3b8",
                            border: `1px solid ${dev.ativo ? alpha("#00e676", 0.3) : alpha("#94a3b8", 0.2)}`,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        display="block"
                      >
                        {dev.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 0.5,
                      mt: 1.5,
                    }}
                  >
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleAbrirEditar(dev)}
                        sx={{ color: "#ffab00" }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteId(dev.id)}
                        sx={{ color: "#ff1744" }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Criar/Editar */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editId ? "Editar Desenvolvedor" : "Novo Desenvolvedor"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Collapse in={!!error}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Collapse>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nome *"
              fullWidth
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              autoFocus
            />
            <TextField
              label="E-mail *"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.ativo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ativo: e.target.checked }))
                  }
                />
              }
              label="Ativo"
            />
          </Box>
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
        title="Excluir Desenvolvedor"
        message="Tem certeza que deseja excluir este desenvolvedor? Tarefas vinculadas podem ser afetadas."
        onConfirm={handleDeletar}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Box>
  );
};

export default Desenvolvedores;
