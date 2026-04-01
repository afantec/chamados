import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import type { Chamado, Status, Prioridade } from '../types/chamado'
import { STATUS_LABELS, PRIORIDADE_LABELS } from '../types/chamado'
import { chamadoService } from '../services/chamadoService'

const CATEGORIAS = [
  'Infraestrutura',
  'Software',
  'Hardware',
  'Rede',
  'Segurança',
  'Banco de Dados',
  'Acesso',
  'Outros',
]

const emptyForm: Chamado = {
  titulo: '',
  descricao: '',
  status: 'ABERTO',
  prioridade: 'MEDIA',
  categoria: '',
  solicitante: '',
  responsavel: '',
}

export default function ChamadoForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)

  const [form, setForm] = useState<Chamado>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditing)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isEditing && id) {
      setFetchLoading(true)
      chamadoService
        .getById(Number(id))
        .then((data) => setForm(data))
        .catch(() => setError('Erro ao carregar o chamado.'))
        .finally(() => setFetchLoading(false))
    }
  }, [id, isEditing])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.titulo.trim()) errors.titulo = 'Título é obrigatório'
    else if (form.titulo.length > 255) errors.titulo = 'Título deve ter no máximo 255 caracteres'
    if (!form.descricao.trim()) errors.descricao = 'Descrição é obrigatória'
    if (!form.solicitante.trim()) errors.solicitante = 'Solicitante é obrigatório'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError(null)
    try {
      if (isEditing && id) {
        await chamadoService.update(Number(id), form)
      } else {
        await chamadoService.create(form)
      }
      navigate('/')
    } catch {
      setError('Erro ao salvar o chamado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Chamado, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <SupportAgentIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Chamados
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              color="inherit"
              sx={{ mr: 1 }}
            >
              Voltar
            </Button>
            <Typography variant="h5">
              {isEditing ? 'Editar Chamado' : 'Novo Chamado'}
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Título"
                  value={form.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  fullWidth
                  required
                  error={Boolean(fieldErrors.titulo)}
                  helperText={fieldErrors.titulo}
                  inputProps={{ maxLength: 255 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  value={form.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  error={Boolean(fieldErrors.descricao)}
                  helperText={fieldErrors.descricao}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Solicitante"
                  value={form.solicitante}
                  onChange={(e) => handleChange('solicitante', e.target.value)}
                  fullWidth
                  required
                  error={Boolean(fieldErrors.solicitante)}
                  helperText={fieldErrors.solicitante}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Responsável"
                  value={form.responsavel ?? ''}
                  onChange={(e) => handleChange('responsavel', e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.status}
                    label="Status"
                    onChange={(e) => handleChange('status', e.target.value as Status)}
                  >
                    {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                      <MenuItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Prioridade</InputLabel>
                  <Select
                    value={form.prioridade}
                    label="Prioridade"
                    onChange={(e) => handleChange('prioridade', e.target.value as Prioridade)}
                  >
                    {(Object.keys(PRIORIDADE_LABELS) as Prioridade[]).map((p) => (
                      <MenuItem key={p} value={p}>
                        {PRIORIDADE_LABELS[p]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={form.categoria ?? ''}
                    label="Categoria"
                    onChange={(e) => handleChange('categoria', e.target.value)}
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {CATEGORIAS.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={4}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
