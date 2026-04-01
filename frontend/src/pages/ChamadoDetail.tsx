import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import type { Chamado } from '../types/chamado'
import {
  STATUS_LABELS,
  PRIORIDADE_LABELS,
  STATUS_COLORS,
  PRIORIDADE_COLORS,
} from '../types/chamado'
import { chamadoService } from '../services/chamadoService'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

interface DetailRowProps {
  label: string
  value: React.ReactNode
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
        {label}
      </Typography>
      <Typography variant="body1" mt={0.5}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

export default function ChamadoDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [chamado, setChamado] = useState<Chamado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    chamadoService
      .getById(Number(id))
      .then(setChamado)
      .catch(() => setError('Erro ao carregar o chamado.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!chamado?.id) return
    if (!window.confirm('Tem certeza que deseja excluir este chamado?')) return
    try {
      await chamadoService.delete(chamado.id)
      navigate('/')
    } catch {
      setError('Erro ao excluir o chamado.')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !chamado) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <SupportAgentIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6">Sistema de Chamados</Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={() => navigate('/')}>
              Voltar
            </Button>
          }>
            {error || 'Chamado não encontrado.'}
          </Alert>
        </Container>
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
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            color="inherit"
          >
            Voltar
          </Button>
        </Stack>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              mb={3}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Chamado #{chamado.id}
                </Typography>
                <Typography variant="h5" mt={0.5}>
                  {chamado.titulo}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={STATUS_LABELS[chamado.status]}
                  color={STATUS_COLORS[chamado.status]}
                />
                <Chip
                  label={PRIORIDADE_LABELS[chamado.prioridade]}
                  color={PRIORIDADE_COLORS[chamado.prioridade]}
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <DetailRow label="Descrição" value={
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {chamado.descricao}
                  </Typography>
                } />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailRow label="Solicitante" value={chamado.solicitante} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailRow label="Responsável" value={chamado.responsavel} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailRow label="Categoria" value={chamado.categoria} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailRow
                  label="Data de Abertura"
                  value={
                    chamado.dataAbertura
                      ? dayjs(chamado.dataAbertura).format('DD/MM/YYYY [às] HH:mm')
                      : undefined
                  }
                />
              </Grid>

              {chamado.dataFechamento && (
                <Grid item xs={12} sm={6}>
                  <DetailRow
                    label="Data de Fechamento"
                    value={dayjs(chamado.dataFechamento).format('DD/MM/YYYY [às] HH:mm')}
                  />
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Excluir
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/chamados/${chamado.id}/editar`)}
              >
                Editar
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
