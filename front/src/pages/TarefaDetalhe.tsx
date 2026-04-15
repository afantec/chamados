import React, { useEffect, useMemo, useRef, useState } from "react";
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
  MenuItem,
  alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddCommentIcon from "@mui/icons-material/AddComment";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import LabelIcon from "@mui/icons-material/Label";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloudIcon from "@mui/icons-material/Cloud";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";
import CodeIcon from "@mui/icons-material/Code";
import PreviewIcon from "@mui/icons-material/Preview";
import EditNoteIcon from "@mui/icons-material/EditNote";
import type {
  Tarefa,
  Anotacao,
  AnotacaoRequest,
  ArquivoTarefa,
  Status,
  TarefaRequest,
  Tipo,
  Desenvolvedor,
  Versao,
} from "../types";
import { tarefaService } from "../services/tarefaService";
import { anotacaoService } from "../services/anotacaoService";
import { statusService } from "../services/statusService";
import { tipoService } from "../services/tipoService";
import { desenvolvedorService } from "../services/desenvolvedorService";
import { versaoService } from "../services/versaoService";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAlerts } from "../context/AlertContext";
import dayjs from "dayjs";

const STATUS_COLOR_LIST = [
  "#069ee5",
  "#c43d4ae3",
  "#00e676",
  "#02a7e3",
  "#ffab00",
  "#02a626",
  "#f97316",
  "#6366f1",
  "#ec4899",
  "#84cc16",
  "#049b9b",
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

const TIPO_COLORS: Record<string, string> = {
  Bug: "#fe1919",
  Melhoria: "#0a63df",
  Suporte: "#f5ac03",
  Versão: "#84e603",
};

const PRIORIDADE_COLOR = (p: number) => {
  if (p >= 8) return "#00e676";
  if (p >= 5) return "#ffab00";
  return "#ff1744";
};

const EXTENSOES_PERMITIDAS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".bmp",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
].join(",");

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  editable?: boolean;
  editing?: boolean;
  onClick?: () => void;
}> = ({ icon, label, value, editable = false, editing = false, onClick }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 0.75 }}>
    <Box
      sx={{ color: "text.secondary", display: "flex", flexShrink: 0, mt: 0.35 }}
    >
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
      <Box
        onClick={editable && !editing ? onClick : undefined}
        sx={{
          mt: 0.25,
          borderRadius: 1.5,
          px: editable && !editing ? 1 : 0,
          py: editable && !editing ? 0.5 : 0,
          cursor: editable && !editing ? "pointer" : "default",
          transition: "background-color 0.2s ease",
          "&:hover":
            editable && !editing
              ? { bgcolor: alpha("#00d4ff", 0.06) }
              : undefined,
        }}
      >
        {value ?? (
          <Typography variant="body2" color="text.disabled">
            {editable ? "Clique para editar" : "—"}
          </Typography>
        )}
      </Box>
    </Box>
  </Box>
);

type EditableField =
  | "codigo"
  | "descricao"
  | "tipoId"
  | "statusId"
  | "desenvolvedorId"
  | "versaoId"
  | "branchNome"
  | "ambiente"
  | "dataEntrega"
  | "dataFinalizacao"
  | "prioridade"
  | "percentualCompleto";

const isStatusFinalizado = (descricao?: string): boolean => {
  const normalizado = descricao?.trim().toLowerCase();
  return normalizado === "finalizado" || normalizado === "finalizada";
};

const formatDateForInput = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD") : "";
};

const buildTarefaPayload = (source: Tarefa): TarefaRequest => ({
  codigo: source.codigo,
  descricao: source.descricao,
  tipoId: source.tipo.id,
  desenvolvedorId: source.desenvolvedor?.id ?? null,
  statusId: source.status.id,
  versaoId: source.versao?.id ?? null,
  prioridade: source.prioridade,
  percentualCompleto: source.percentualCompleto,
  branchNome: source.branchNome ?? "",
  dataEntrega: formatDateForInput(source.dataEntrega) || null,
  dataFinalizacao: formatDateForInput(source.dataFinalizacao) || null,
  ambiente: source.ambiente ?? "",
});

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const applyInlineFormatting = (value: string): string =>
  value
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<u>$1</u>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

const renderAnotacaoHtml = (value?: string | null): string => {
  if (!value?.trim()) {
    return "<p style=\"margin:0;\">Sem conteúdo.</p>";
  }

  const safeValue = escapeHtml(value);
  const lines = safeValue.split(/\r?\n/);
  const blocks: string[] = [];
  let unorderedItems: string[] = [];
  let orderedItems: string[] = [];

  const flushLists = () => {
    if (unorderedItems.length) {
      blocks.push(
        `<ul style=\"margin:0 0 8px 0;padding-left:20px;\">${unorderedItems
          .map((item) => `<li>${applyInlineFormatting(item)}</li>`)
          .join("")}</ul>`,
      );
      unorderedItems = [];
    }

    if (orderedItems.length) {
      blocks.push(
        `<ol style=\"margin:0 0 8px 0;padding-left:20px;\">${orderedItems
          .map((item) => `<li>${applyInlineFormatting(item)}</li>`)
          .join("")}</ol>`,
      );
      orderedItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushLists();
      blocks.push('<div style="height:8px"></div>');
      return;
    }

    if (trimmed.startsWith("- ")) {
      orderedItems = [];
      unorderedItems.push(trimmed.slice(2));
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      unorderedItems = [];
      orderedItems.push(trimmed.replace(/^\d+\.\s/, ""));
      return;
    }

    flushLists();

    if (trimmed.startsWith("# ")) {
      blocks.push(
        `<h3 style=\"margin:0 0 8px;font-size:1rem;\">${applyInlineFormatting(trimmed.slice(2))}</h3>`,
      );
      return;
    }

    if (trimmed.startsWith("> ")) {
      blocks.push(
        `<blockquote style=\"margin:0 0 8px;padding-left:12px;border-left:3px solid #00d4ff;color:#cbd5e1;\">${applyInlineFormatting(trimmed.slice(2))}</blockquote>`,
      );
      return;
    }

    blocks.push(
      `<p style=\"margin:0 0 8px;\">${applyInlineFormatting(trimmed)}</p>`,
    );
  });

  flushLists();
  return blocks.join("");
};

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  minRows?: number;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  disabled = false,
  minRows = 6,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [preview, setPreview] = useState(false);

  const updateWithSelection = (
    nextValue: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    onChange(nextValue);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const applyWrap = (
    before: string,
    after: string,
    placeholder: string,
  ) => {
    const input = textareaRef.current;
    if (!input) {
      onChange(`${value}${before}${placeholder}${after}`);
      return;
    }

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const selectedText = value.slice(start, end) || placeholder;
    const nextValue = `${value.slice(0, start)}${before}${selectedText}${after}${value.slice(end)}`;

    updateWithSelection(nextValue, start + before.length, start + before.length + selectedText.length);
  };

  const applyLinePrefix = (prefix: string) => {
    const input = textareaRef.current;
    if (!input) {
      onChange(`${value}${value ? "\n" : ""}${prefix}`);
      return;
    }

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const selectedText = value.slice(start, end);
    const targetText = selectedText || "item";
    const prefixed = targetText
      .split("\n")
      .map((line, index) => `${prefix}${line || `item ${index + 1}`}`)
      .join("\n");
    const nextValue = `${value.slice(0, start)}${prefixed}${value.slice(end)}`;

    updateWithSelection(nextValue, start, start + prefixed.length);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    if (event.key.toLowerCase() === "b") {
      event.preventDefault();
      applyWrap("**", "**", "destaque");
    }

    if (event.key.toLowerCase() === "i") {
      event.preventDefault();
      applyWrap("*", "*", "itálico");
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          <Tooltip title="Título">
            <span>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => applyWrap("# ", "", "Título")}
              >
                <TitleIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Negrito">
            <span>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => applyWrap("**", "**", "texto")}
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Itálico">
            <span>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => applyWrap("*", "*", "texto")}
              >
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Lista com marcadores">
            <span>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => applyLinePrefix("- ")}
              >
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Lista numerada">
            <span>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => applyLinePrefix("1. ")}
              >
                <FormatListNumberedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Bloco de código">
            <span>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => applyWrap("`", "`", "codigo")}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Button
          size="small"
          variant="text"
          disabled={disabled}
          startIcon={preview ? <EditNoteIcon /> : <PreviewIcon />}
          onClick={() => setPreview((prev) => !prev)}
        >
          {preview ? "Voltar ao editor" : "Pré-visualizar"}
        </Button>
      </Box>

      <TextField
        multiline
        fullWidth
        minRows={minRows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Use a barra acima para criar títulos, listas, destaques e blocos de código."
        inputRef={(node) => {
          textareaRef.current = node as HTMLTextAreaElement | null;
        }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        Atalhos: Ctrl+B para negrito e Ctrl+I para itálico.
      </Typography>

      <Collapse in={preview}>
        <Box
          sx={{
            mt: 1.5,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha("#00d4ff", 0.15)}`,
            bgcolor: alpha("#00d4ff", 0.03),
            "& p, & ul, & ol, & blockquote": { color: "text.primary" },
            "& code": {
              bgcolor: alpha("#0f172a", 0.7),
              color: "#e2e8f0",
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              fontFamily: "monospace",
            },
          }}
          dangerouslySetInnerHTML={{ __html: renderAnotacaoHtml(value) }}
        />
      </Collapse>
    </Box>
  );
};

const TarefaDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createAlert } = useAlerts();
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<Status[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [desenvolvedores, setDesenvolvedores] = useState<Desenvolvedor[]>([]);
  const [versoes, setVersoes] = useState<Versao[]>([]);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState<TarefaRequest | null>(null);
  const [savingField, setSavingField] = useState<EditableField | null>(null);
  const [inlineError, setInlineError] = useState("");
  const [inlineSuccess, setInlineSuccess] = useState("");
  const [alertaDialog, setAlertaDialog] = useState(false);
  const [alertaMensagem, setAlertaMensagem] = useState("");
  const [savingAlert, setSavingAlert] = useState(false);
  const [alertaError, setAlertaError] = useState("");

  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [anotacaoDialog, setAnotacaoDialog] = useState(false);
  const [editAnotacao, setEditAnotacao] = useState<Anotacao | null>(null);
  const [anotacaoTexto, setAnotacaoTexto] = useState("");
  const [savingAnotacao, setSavingAnotacao] = useState(false);
  const [anotacaoError, setAnotacaoError] = useState("");

  const [deleteAnotacaoId, setDeleteAnotacaoId] = useState<number | null>(null);
  const [deletingAnotacao, setDeletingAnotacao] = useState(false);

  const [arquivos, setArquivos] = useState<ArquivoTarefa[]>([]);
  const [uploadingArquivo, setUploadingArquivo] = useState(false);
  const [arquivoError, setArquivoError] = useState("");
  const [arquivoSuccess, setArquivoSuccess] = useState("");
  const [deleteArquivoId, setDeleteArquivoId] = useState<number | null>(null);
  const [deletingArquivo, setDeletingArquivo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const carregar = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const t = await tarefaService.buscarPorId(Number(id));
      setTarefa(t);
      const anots = await anotacaoService.listarPorTarefa(Number(id));
      setAnotacoes(anots);
      try {
        const anexos = await tarefaService.listarArquivos(Number(id));
        setArquivos(anexos);
      } catch {
        setArquivos([]);
      }
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

  useEffect(() => {
    Promise.all([
      statusService.listar(),
      tipoService.listar(),
      desenvolvedorService.listarAtivos(),
      versaoService.listar(),
    ])
      .then(([statusList, tiposList, desenvolvedoresList, versoesList]) => {
        setStatus(statusList);
        setTipos(tiposList);
        setDesenvolvedores(desenvolvedoresList);
        setVersoes(versoesList);
      })
      .catch(() => {
        setStatus([]);
        setTipos([]);
        setDesenvolvedores([]);
        setVersoes([]);
      });
  }, []);

  const statusColorMap = useMemo(
    () =>
      [...status]
        .sort((a, b) => a.id - b.id)
        .reduce<Record<number, string>>((acc, item, index) => {
          acc[item.id] = getStatusColorByIndex(index);
          return acc;
        }, {}),
    [status],
  );

  const handleStartEditField = (field: EditableField) => {
    if (!tarefa) {
      return;
    }

    setEditingField(field);
    setDraft(buildTarefaPayload(tarefa));
    setInlineError("");
    setInlineSuccess("");
  };

  const handleCancelEditField = () => {
    setEditingField(null);
    setDraft(null);
    setInlineError("");
  };

  const updateDraftValue = <K extends keyof TarefaRequest>(
    field: K,
    value: TarefaRequest[K],
  ) => {
    if (!tarefa) {
      return;
    }

    setDraft(
      (prev) =>
        ({
          ...(prev ?? buildTarefaPayload(tarefa)),
          [field]: value,
        }) as TarefaRequest,
    );
  };

  const handleSaveEditField = async (nextDraft?: TarefaRequest) => {
    if (!tarefa || !editingField) {
      return;
    }

    const payloadBase = nextDraft ?? draft ?? buildTarefaPayload(tarefa);
    const payload: TarefaRequest = {
      ...payloadBase,
      codigo: payloadBase.codigo.trim(),
      descricao: payloadBase.descricao.trim(),
      tipoId: Number(payloadBase.tipoId),
      statusId: Number(payloadBase.statusId),
      desenvolvedorId: payloadBase.desenvolvedorId || null,
      versaoId: payloadBase.versaoId || null,
      prioridade: Number(payloadBase.prioridade),
      percentualCompleto: Number(payloadBase.percentualCompleto),
      branchNome: payloadBase.branchNome?.trim() ?? "",
      ambiente: payloadBase.ambiente?.trim() ?? "",
      dataEntrega: payloadBase.dataEntrega || null,
      dataFinalizacao: payloadBase.dataFinalizacao || null,
    };

    if (
      !payload.codigo ||
      !payload.descricao ||
      !payload.tipoId ||
      !payload.statusId
    ) {
      setInlineError("Preencha os campos obrigatórios antes de salvar.");
      return;
    }

    if (payload.prioridade < 1 || payload.prioridade > 10) {
      setInlineError("A prioridade deve estar entre 1 e 10.");
      return;
    }

    if (payload.percentualCompleto < 0 || payload.percentualCompleto > 100) {
      setInlineError("O progresso deve estar entre 0 e 100%.");
      return;
    }

    const statusFinalizado = status.find((item) =>
      isStatusFinalizado(item.descricao),
    );

    if (
      statusFinalizado &&
      payload.statusId === statusFinalizado.id &&
      !payload.ambiente
    ) {
      setInlineError("Ambiente é obrigatório quando o status é Finalizado.");
      return;
    }

    setSavingField(editingField);
    try {
      await tarefaService.atualizar(tarefa.id, payload);
      await carregar();
      setEditingField(null);
      setDraft(null);
      setInlineError("");
      setInlineSuccess("Campo atualizado com sucesso.");
    } catch (e: unknown) {
      setInlineSuccess("");
      setInlineError(
        e instanceof Error ? e.message : "Erro ao atualizar o campo.",
      );
    } finally {
      setSavingField(null);
    }
  };

  const handleInlineEditorKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSaveEditField();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleCancelEditField();
    }
  };

  const handleAbrirAlerta = () => {
    setAlertaMensagem("");
    setAlertaError("");
    setAlertaDialog(true);
  };

  const handleSalvarAlerta = async () => {
    if (!id) {
      return;
    }

    if (!alertaMensagem.trim()) {
      setAlertaError("A mensagem do alerta é obrigatória.");
      return;
    }

    setSavingAlert(true);
    try {
      await createAlert({
        message: alertaMensagem.trim(),
        tarefaId: Number(id),
      });
      setAlertaDialog(false);
      setAlertaMensagem("");
      setAlertaError("");
      setInlineError("");
      setInlineSuccess("Alerta criado com sucesso.");
    } catch (e: unknown) {
      setAlertaError(
        e instanceof Error ? e.message : "Erro ao salvar o alerta.",
      );
    } finally {
      setSavingAlert(false);
    }
  };

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

  const formatarTamanho = (bytes: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    const valor = bytes / Math.pow(1024, i);
    return `${valor.toFixed(valor >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const handleSelecionarArquivo = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !id) return;

    setArquivoError("");
    setArquivoSuccess("");
    setUploadingArquivo(true);

    try {
      await tarefaService.uploadArquivo(Number(id), file);
      const anexos = await tarefaService.listarArquivos(Number(id));
      setArquivos(anexos);
      setArquivoSuccess("Arquivo adicionado com sucesso.");
    } catch (e: unknown) {
      setArquivoError(
        e instanceof Error ? e.message : "Erro ao enviar arquivo.",
      );
    } finally {
      setUploadingArquivo(false);
    }
  };

  const handleDownloadArquivo = async (arquivo: ArquivoTarefa) => {
    if (!id) return;
    setArquivoError("");
    setArquivoSuccess("");

    try {
      const blob = await tarefaService.downloadArquivo(Number(id), arquivo.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = arquivo.nomeOriginal;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setArquivoError(
        e instanceof Error
          ? e.message
          : "Erro ao realizar download do arquivo.",
      );
    }
  };

  const handleDeletarArquivo = async () => {
    if (!id || !deleteArquivoId) return;

    setArquivoError("");
    setArquivoSuccess("");
    setDeletingArquivo(true);

    try {
      await tarefaService.deletarArquivo(Number(id), deleteArquivoId);
      setArquivos((prev) => prev.filter((a) => a.id !== deleteArquivoId));
      setDeleteArquivoId(null);
      setArquivoSuccess("Arquivo removido com sucesso.");
    } catch (e: unknown) {
      setArquivoError(
        e instanceof Error ? e.message : "Erro ao remover o arquivo.",
      );
    } finally {
      setDeletingArquivo(false);
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

  const statusColor = getStatusColor(tarefa.status, statusColorMap);
  const tipoColor = TIPO_COLORS[tarefa.tipo.descricao] || "#94a3b8";

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <IconButton
          onClick={() => navigate("/tarefas")}
          sx={{ color: "text.secondary" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            {editingField === "codigo" ? (
              <TextField
                size="small"
                autoFocus
                value={draft?.codigo ?? tarefa.codigo}
                onChange={(e) => updateDraftValue("codigo", e.target.value)}
                onBlur={() => void handleSaveEditField()}
                onKeyDown={handleInlineEditorKeyDown}
                disabled={savingField === "codigo"}
                sx={{ minWidth: 140 }}
              />
            ) : (
              <Typography
                onClick={() => handleStartEditField("codigo")}
                sx={{
                  fontFamily: "monospace",
                  color: "primary.main",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  borderRadius: 1,
                  px: 0.5,
                  py: 0.25,
                  "&:hover": {
                    bgcolor: alpha("#00d4ff", 0.08),
                  },
                }}
              >
                {tarefa.codigo}
              </Typography>
            )}

            {editingField === "tipoId" ? (
              <TextField
                select
                size="small"
                autoFocus
                value={draft?.tipoId ?? tarefa.tipo.id}
                onChange={(e) => {
                  const nextDraft: TarefaRequest = {
                    ...(draft ?? buildTarefaPayload(tarefa)),
                    tipoId: Number(e.target.value),
                  };
                  setDraft(nextDraft);
                  void handleSaveEditField(nextDraft);
                }}
                disabled={savingField === "tipoId"}
                sx={{ minWidth: 180 }}
              >
                {tipos.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.descricao}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Chip
                label={`Tipo: ${tarefa.tipo?.descricao || "—"}`}
                size="small"
                onClick={() => handleStartEditField("tipoId")}
                sx={{
                  bgcolor: alpha(tipoColor, 0.15),
                  color: tipoColor,
                  border: `1px solid ${alpha(tipoColor, 0.3)}`,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              />
            )}
            {editingField === "statusId" ? (
              <TextField
                select
                size="small"
                autoFocus
                value={draft?.statusId ?? tarefa.status.id}
                onChange={(e) => {
                  const nextDraft: TarefaRequest = {
                    ...(draft ?? buildTarefaPayload(tarefa)),
                    statusId: Number(e.target.value),
                  };
                  setDraft(nextDraft);
                  void handleSaveEditField(nextDraft);
                }}
                disabled={savingField === "statusId"}
                sx={{ minWidth: 180 }}
              >
                {status.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.descricao}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Chip
                label={`Status: ${tarefa.status?.descricao || "—"}`}
                size="small"
                onClick={() => handleStartEditField("statusId")}
                sx={{
                  bgcolor: alpha(statusColor, 0.15),
                  color: statusColor,
                  border: `1px solid ${alpha(statusColor, 0.3)}`,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              />
            )}
          </Box>

          {editingField === "descricao" ? (
            <TextField
              fullWidth
              size="small"
              autoFocus
              value={draft?.descricao ?? tarefa.descricao}
              onChange={(e) => updateDraftValue("descricao", e.target.value)}
              onBlur={() => void handleSaveEditField()}
              onKeyDown={handleInlineEditorKeyDown}
              disabled={savingField === "descricao"}
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{
                mt: 0.5,
                borderRadius: 1,
                px: 0.5,
                py: 0.25,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: alpha("#00d4ff", 0.05),
                },
              }}
              onClick={() => handleStartEditField("descricao")}
            >
              {tarefa.descricao}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<NotificationsActiveIcon />}
          onClick={handleAbrirAlerta}
          sx={{ flexShrink: 0 }}
        >
          Criar Alerta
        </Button>
      </Box>

      <Collapse in={!!inlineError || !!inlineSuccess}>
        <Alert
          severity={inlineError ? "error" : "success"}
          sx={{ mb: 2 }}
          onClose={() => {
            setInlineError("");
            setInlineSuccess("");
          }}
        >
          {inlineError || inlineSuccess}
        </Alert>
      </Collapse>

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
                    editable
                    editing={editingField === "desenvolvedorId"}
                    onClick={() => handleStartEditField("desenvolvedorId")}
                    value={
                      editingField === "desenvolvedorId" ? (
                        <TextField
                          select
                          size="small"
                          fullWidth
                          autoFocus
                          value={
                            draft?.desenvolvedorId ??
                            tarefa.desenvolvedor?.id ??
                            ""
                          }
                          onChange={(e) => {
                            const nextDraft: TarefaRequest = {
                              ...(draft ?? buildTarefaPayload(tarefa)),
                              desenvolvedorId: e.target.value
                                ? Number(e.target.value)
                                : null,
                            };
                            setDraft(nextDraft);
                            void handleSaveEditField(nextDraft);
                          }}
                          disabled={savingField === "desenvolvedorId"}
                        >
                          <MenuItem value="">Nenhum</MenuItem>
                          {desenvolvedores.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.nome}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <Typography
                          variant="body2"
                          color={
                            tarefa.desenvolvedor
                              ? "text.primary"
                              : "text.disabled"
                          }
                        >
                          {tarefa.desenvolvedor?.nome || "Clique para editar"}
                        </Typography>
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={<LabelIcon fontSize="small" />}
                    label="Versão"
                    editable
                    editing={editingField === "versaoId"}
                    onClick={() => handleStartEditField("versaoId")}
                    value={
                      editingField === "versaoId" ? (
                        <TextField
                          select
                          size="small"
                          fullWidth
                          autoFocus
                          value={draft?.versaoId ?? tarefa.versao?.id ?? ""}
                          onChange={(e) => {
                            const nextDraft: TarefaRequest = {
                              ...(draft ?? buildTarefaPayload(tarefa)),
                              versaoId: e.target.value
                                ? Number(e.target.value)
                                : null,
                            };
                            setDraft(nextDraft);
                            void handleSaveEditField(nextDraft);
                          }}
                          disabled={savingField === "versaoId"}
                        >
                          <MenuItem value="">Nenhuma</MenuItem>
                          {versoes.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.numeroVersao}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <Typography
                          variant="body2"
                          color={
                            tarefa.versao ? "text.primary" : "text.disabled"
                          }
                        >
                          {tarefa.versao?.numeroVersao || "Clique para editar"}
                        </Typography>
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={<AccountTreeIcon fontSize="small" />}
                    label="Branch"
                    editable
                    editing={editingField === "branchNome"}
                    onClick={() => handleStartEditField("branchNome")}
                    value={
                      editingField === "branchNome" ? (
                        <TextField
                          size="small"
                          fullWidth
                          autoFocus
                          value={draft?.branchNome ?? tarefa.branchNome ?? ""}
                          onChange={(e) =>
                            updateDraftValue("branchNome", e.target.value)
                          }
                          onBlur={() => void handleSaveEditField()}
                          onKeyDown={handleInlineEditorKeyDown}
                          disabled={savingField === "branchNome"}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: tarefa.branchNome
                              ? "monospace"
                              : "inherit",
                            color: tarefa.branchNome
                              ? "#a855f7"
                              : "text.disabled",
                          }}
                        >
                          {tarefa.branchNome || "Clique para editar"}
                        </Typography>
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={<CloudIcon fontSize="small" />}
                    label="Ambiente"
                    editable
                    editing={editingField === "ambiente"}
                    onClick={() => handleStartEditField("ambiente")}
                    value={
                      editingField === "ambiente" ? (
                        <TextField
                          size="small"
                          fullWidth
                          autoFocus
                          value={draft?.ambiente ?? tarefa.ambiente ?? ""}
                          onChange={(e) =>
                            updateDraftValue("ambiente", e.target.value)
                          }
                          onBlur={() => void handleSaveEditField()}
                          onKeyDown={handleInlineEditorKeyDown}
                          disabled={savingField === "ambiente"}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color={
                            tarefa.ambiente ? "text.primary" : "text.disabled"
                          }
                        >
                          {tarefa.ambiente || "Clique para editar"}
                        </Typography>
                      )
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
                    editable
                    editing={editingField === "dataEntrega"}
                    onClick={() => handleStartEditField("dataEntrega")}
                    value={
                      editingField === "dataEntrega" ? (
                        <TextField
                          type="date"
                          size="small"
                          fullWidth
                          autoFocus
                          value={
                            draft?.dataEntrega ??
                            formatDateForInput(tarefa.dataEntrega)
                          }
                          onChange={(e) =>
                            updateDraftValue("dataEntrega", e.target.value)
                          }
                          onBlur={() => void handleSaveEditField()}
                          onKeyDown={handleInlineEditorKeyDown}
                          disabled={savingField === "dataEntrega"}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color={
                            tarefa.dataEntrega
                              ? "text.primary"
                              : "text.disabled"
                          }
                        >
                          {tarefa.dataEntrega
                            ? dayjs(tarefa.dataEntrega).format("DD/MM/YYYY")
                            : "Clique para editar"}
                        </Typography>
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={<CalendarTodayIcon fontSize="small" />}
                    label="Data de Finalização"
                    editable
                    editing={editingField === "dataFinalizacao"}
                    onClick={() => handleStartEditField("dataFinalizacao")}
                    value={
                      editingField === "dataFinalizacao" ? (
                        <TextField
                          type="date"
                          size="small"
                          fullWidth
                          autoFocus
                          value={
                            draft?.dataFinalizacao ??
                            formatDateForInput(tarefa.dataFinalizacao)
                          }
                          onChange={(e) =>
                            updateDraftValue("dataFinalizacao", e.target.value)
                          }
                          onBlur={() => void handleSaveEditField()}
                          onKeyDown={handleInlineEditorKeyDown}
                          disabled={savingField === "dataFinalizacao"}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color={
                            tarefa.dataFinalizacao
                              ? "text.primary"
                              : "text.disabled"
                          }
                        >
                          {tarefa.dataFinalizacao
                            ? dayjs(tarefa.dataFinalizacao).format("DD/MM/YYYY")
                            : "Clique para editar"}
                        </Typography>
                      )
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5, borderColor: alpha("#00d4ff", 0.1) }} />

              {/* Progress */}
              <Box
                sx={{
                  borderRadius: 2,
                  px: 1,
                  py: 0.75,
                  cursor:
                    editingField === "percentualCompleto"
                      ? "default"
                      : "pointer",
                  "&:hover":
                    editingField === "percentualCompleto"
                      ? undefined
                      : { bgcolor: alpha("#00d4ff", 0.04) },
                }}
                onClick={() =>
                  editingField !== "percentualCompleto" &&
                  handleStartEditField("percentualCompleto")
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Progresso
                  </Typography>
                  {editingField === "percentualCompleto" ? (
                    <TextField
                      type="number"
                      size="small"
                      autoFocus
                      value={
                        draft?.percentualCompleto ?? tarefa.percentualCompleto
                      }
                      onChange={(e) =>
                        updateDraftValue(
                          "percentualCompleto",
                          Number(e.target.value),
                        )
                      }
                      onBlur={() => void handleSaveEditField()}
                      onKeyDown={handleInlineEditorKeyDown}
                      disabled={savingField === "percentualCompleto"}
                      inputProps={{ min: 0, max: 100 }}
                      sx={{ width: 96 }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {tarefa.percentualCompleto}%
                    </Typography>
                  )}
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
                {editingField === "prioridade" ? (
                  <TextField
                    type="number"
                    size="small"
                    autoFocus
                    value={draft?.prioridade ?? tarefa.prioridade}
                    onChange={(e) =>
                      updateDraftValue("prioridade", Number(e.target.value))
                    }
                    onBlur={() => void handleSaveEditField()}
                    onKeyDown={handleInlineEditorKeyDown}
                    disabled={savingField === "prioridade"}
                    inputProps={{ min: 1, max: 10 }}
                    sx={{ width: 96 }}
                  />
                ) : (
                  <Box
                    onClick={() => handleStartEditField("prioridade")}
                    sx={{
                      px: 1.5,
                      py: 0.25,
                      borderRadius: 2,
                      bgcolor: alpha(PRIORIDADE_COLOR(tarefa.prioridade), 0.15),
                      border: `1px solid ${alpha(PRIORIDADE_COLOR(tarefa.prioridade), 0.4)}`,
                      color: PRIORIDADE_COLOR(tarefa.prioridade),
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    {tarefa.prioridade}/10{" "}
                    {tarefa.prioridade >= 8
                      ? "🔴"
                      : tarefa.prioridade >= 5
                        ? "🟡"
                        : "🟢"}
                  </Box>
                )}
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
                        <Box
                          sx={{
                            lineHeight: 1.6,
                            "& p": { my: 0 },
                            "& ul, & ol": { my: 0, pl: 2.5 },
                            "& code": {
                              bgcolor: alpha("#0f172a", 0.7),
                              color: "#e2e8f0",
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              fontFamily: "monospace",
                            },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: renderAnotacaoHtml(anot.descricao),
                          }}
                        />
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
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirAnotacao(anot)}
                            sx={{ color: "#ffab00", width: 32, height: 32 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteAnotacaoId(anot.id)}
                            sx={{ color: "#ff1744", width: 32, height: 32 }}
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
          <Box sx={{ position: "sticky", top: 80 }}>
            <Card
              sx={{
                mb: 2,
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
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
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
                  <Divider sx={{ borderColor: alpha("#00d4ff", 0.1) }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
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
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
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
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Anotações
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {anotacoes.length}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Arquivos
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {arquivos.length}
                    </Typography>
                  </Box>
                  {tarefa.versao && (
                    <>
                      <Divider sx={{ borderColor: alpha("#00d4ff", 0.1) }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
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
                    Arquivos ({arquivos.length})
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<UploadFileIcon />}
                    disabled={uploadingArquivo}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingArquivo ? "Enviando..." : "Adicionar"}
                  </Button>
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={EXTENSOES_PERMITIDAS}
                  onChange={handleSelecionarArquivo}
                  style={{ display: "none" }}
                />

                <Collapse in={!!arquivoError}>
                  <Alert severity="error" sx={{ mb: 1.5 }}>
                    {arquivoError}
                  </Alert>
                </Collapse>

                <Collapse in={!!arquivoSuccess}>
                  <Alert severity="success" sx={{ mb: 1.5 }}>
                    {arquivoSuccess}
                  </Alert>
                </Collapse>

                {arquivos.length === 0 ? (
                  <Box
                    sx={{
                      py: 3,
                      textAlign: "center",
                      bgcolor: alpha("#00d4ff", 0.03),
                      borderRadius: 2,
                      border: `1px dashed ${alpha("#00d4ff", 0.15)}`,
                    }}
                  >
                    <Typography color="text.secondary" variant="body2">
                      Nenhum arquivo anexado.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {arquivos.map((arquivo) => (
                      <Box
                        key={arquivo.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 1.5,
                          border: `1px solid ${alpha("#00d4ff", 0.12)}`,
                          bgcolor: alpha("#00d4ff", 0.03),
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            wordBreak: "break-word",
                            lineHeight: 1.4,
                          }}
                        >
                          {arquivo.nomeOriginal}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatarTamanho(arquivo.tamanhoBytes)} •{" "}
                          {dayjs(arquivo.dataUpload).format("DD/MM/YYYY HH:mm")}
                        </Typography>
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadArquivo(arquivo)}
                          >
                            Download
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteArquivoId(arquivo.id)}
                          >
                            Excluir
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={alertaDialog}
        onClose={() => !savingAlert && setAlertaDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Criar Alerta</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Collapse in={!!alertaError}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {alertaError}
            </Alert>
          </Collapse>

          <TextField
            label="Mensagem do alerta"
            placeholder="Descreva o que precisa de atenção nesta tarefa"
            multiline
            minRows={4}
            fullWidth
            autoFocus
            value={alertaMensagem}
            onChange={(e) => setAlertaMensagem(e.target.value)}
            disabled={savingAlert}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAlertaDialog(false)} disabled={savingAlert}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSalvarAlerta}
            disabled={savingAlert}
          >
            {savingAlert ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Anotação Dialog */}
      <Dialog
        open={anotacaoDialog}
        onClose={() => setAnotacaoDialog(false)}
        maxWidth="md"
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

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
          >
            Descrição *
          </Typography>

          <RichTextEditor
            value={anotacaoTexto}
            onChange={setAnotacaoTexto}
            disabled={savingAnotacao}
            minRows={8}
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

      <ConfirmDialog
        open={!!deleteArquivoId}
        title="Excluir Arquivo"
        message="Tem certeza que deseja excluir este arquivo? A remoção também será feita fisicamente no diretório C:/Sustentacao."
        onConfirm={handleDeletarArquivo}
        onCancel={() => setDeleteArquivoId(null)}
        loading={deletingArquivo}
      />
    </Box>
  );
};

export default TarefaDetalhe;
