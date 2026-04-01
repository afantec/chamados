import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  AppBar,
  Toolbar,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import type { Chamado, Status } from '../types/chamado'
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

export default function ChamadoList() {
  const navigate = useNavigate()
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<Status | ''>('')

  const loadChamados = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = statusFilter
        ? await chamadoService.getByStatus(statusFilter)
        : await chamadoService.getAll()
      setChamados(data)
    } catch {
      setError('Erro ao carregar os chamados. Verifique a conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadChamados()
  }, [loadChamados])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este chamado?')) return
    try {
      await chamadoService.delete(id)
      loadChamados()
    } catch {
      setError('Erro ao excluir o chamado.')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      type: 'number',
    },
    {
      field: 'titulo',
      headerName: 'Título',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'solicitante',
      headerName: 'Solicitante',
      width: 150,
    },
    {
      field: 'responsavel',
      headerName: 'Responsável',
      width: 150,
      renderCell: (params: GridRenderCellParams) => params.value || '—',
    },
    {
      field: 'prioridade',
      headerName: 'Prioridade',
      width: 120,
      renderCell: (params: GridRenderCellParams<Chamado>) => (
        <Chip
          label={PRIORIDADE_LABELS[params.value as keyof typeof PRIORIDADE_LABELS]}
          color={PRIORIDADE_COLORS[params.value as keyof typeof PRIORIDADE_COLORS]}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams<Chamado>) => (
        <Chip
          label={STATUS_LABELS[params.value as keyof typeof STATUS_LABELS]}
          color={STATUS_COLORS[params.value as keyof typeof STATUS_COLORS]}
          size="small"
        />
      ),
    },
    {
      field: 'dataAbertura',
      headerName: 'Abertura',
      width: 160,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? dayjs(params.value).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Chamado>) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Visualizar">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/chamados/${params.row.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/chamados/${params.row.id}/editar`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id as number)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]

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

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            mb={3}
          >
            <Typography variant="h5">Chamados</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filtrar por Status"
                  onChange={(e) => setStatusFilter(e.target.value as Status | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                    <MenuItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/chamados/novo')}
              >
                Novo Chamado
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <DataGrid
            rows={chamados}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: 'Nenhum chamado encontrado',
              footerRowSelected: (count) => `${count} linha(s) selecionada(s)`,
              MuiTablePagination: {
                labelRowsPerPage: 'Linhas por página:',
                labelDisplayedRows: ({ from, to, count }) =>
                  `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`,
              },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'grey.100',
                borderRadius: 1,
              },
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Paper>
      </Container>
    </Box>
  )
}
