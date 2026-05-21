"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ArrowUpDown, Calendar, Check, ChevronDown, Circle, Copy, ExternalLink, Filter, Flag, Link2, ListChecks, MessageCircle, MoreHorizontal, Paperclip, Plus, ScrollText, Trash2, User } from "lucide-react"
import { useAppSession } from "@/components/app/app-provider"
import { useAppPreferences } from "@/components/app/preferences-provider"
import { CONTACT_METHOD_LABELS } from "@/lib/app-data"
import { authFetch } from "@/lib/supabase"
import { parseReviewFeedback, serializeReviewFeedback } from "@/lib/review-utils"
import { FeedbackBanner } from "@/components/dashboard/feedback-banner"
import { PageLoadingState } from "@/components/dashboard/page-loading-state"
import {
  createWorkspaceTask,
  deleteWorkspaceTask,
  fetchWorkspaceClients,
  fetchWorkspaceTasks,
  getCachedWorkspaceClients,
  getCachedWorkspaceTasks,
  subscribeWorkspaceSync,
  updateWorkspaceTask,
} from "@/lib/workspace-db"
import { WorkspaceTask } from "@/lib/workspace-store"
import { cn } from "@/lib/utils"
import {
  createDefaultTaskChecklist,
  createDefaultTaskScope,
  formatTimelineDate,
  getChecklistProgress,
  getNextTaskAction,
  summarizeScope,
} from "@/lib/workflow-insights"
import { DrivePickerButton } from "@/components/google-drive/drive-picker-button"
import { copyTextToClipboard } from "@/lib/clipboard"

const columns = [
  { id: "agenda", title: "Agendado", accent: "text-slate-500", badge: "border-slate-400" },
  { id: "em-producao", title: "Produzindo", accent: "text-rose-500", badge: "border-rose-400" },
  { id: "waiting-response", title: "Aguardando", accent: "text-amber-500", badge: "border-amber-400" },
  { id: "desaprovado", title: "Para revisar", accent: "text-blue-500", badge: "border-blue-500" },
  { id: "concluido", title: "Concluído", accent: "text-emerald-500", badge: "border-emerald-500" },
] as const

const escopoSugestoes = {
  quantidadeVideos: ["1 vídeo", "2 vídeos", "3 vídeos", "5 vídeos", "10 vídeos"],
  duracaoEsperada: ["Até 30s", "Até 60s", "1 a 3 min", "3 a 5 min", "5 a 10 min"],
  formatos: ["9:16", "16:9", "1:1", "9:16 + 16:9", "Pacote multi-formato"],
  revisoesIncluidas: ["1 revisão", "2 revisões", "3 revisões", "Ilimitadas com bom senso"],
  prazoPrometido: ["24 horas", "48 horas", "3 dias", "5 dias", "7 dias"],
  extrasCombinados: ["Legenda", "Thumb", "Motion simples", "Sound design", "Sem extras"],
} as const

const initialTask = {
  titulo: "",
  descricao: "",
  clienteId: "",
  prazo: "",
  checklist: createDefaultTaskChecklist(),
  escopo: createDefaultTaskScope(),
}

const dedupeTasks = (items: WorkspaceTask[]) => {
  const seen = new Set<string>()

  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) {
      return false
    }

    seen.add(item.id)
    return true
  })
}

const parseStoredProjectValue = (rawValue: string | null | undefined) => {
  if (!rawValue?.trim()) return null

  const normalized = rawValue.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export default function AgendaPage() {
  const searchParams = useSearchParams()
  const { currentUser } = useAppSession()
  const { formatCurrency } = useAppPreferences()
  const [clientes, setClientes] = useState<Array<{ id: string; nome: string; fotoUrl?: string }>>([])
  const [tarefas, setTarefas] = useState<WorkspaceTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackError, setFeedbackError] = useState("")
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [isUpdatingTask, setIsUpdatingTask] = useState(false)
  const [draggingTaskId, setDraggingTaskId] = useState("")
  const [deletingTaskId, setDeletingTaskId] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detalhesOpen, setDetalhesOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [conclusaoOpen, setConclusaoOpen] = useState(false)
  const [tarefaSelecionada, setTarefaSelecionada] = useState<WorkspaceTask | null>(null)
  const [novaTarefa, setNovaTarefa] = useState(initialTask)
  const [linkDriveConclusao, setLinkDriveConclusao] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [accountPixKey, setAccountPixKey] = useState("")
  const [selectedDriveVideo, setSelectedDriveVideo] = useState<{ id: string; name: string; url?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const openedTaskFromQueryRef = useRef("")
  const requestedTaskId = searchParams.get("taskId")

  useEffect(() => {
    if (!currentUser) return
    const cachedClients = getCachedWorkspaceClients(currentUser.id)
    const cachedTasks = getCachedWorkspaceTasks(currentUser.id)

    if (cachedClients) {
      setClientes(cachedClients.map((cliente) => ({ id: cliente.id, nome: cliente.nome, fotoUrl: cliente.fotoUrl })))
    }

    if (cachedTasks) {
      setTarefas(dedupeTasks(cachedTasks))
      setIsLoading(false)
    }

    const syncData = async (showLoader = false) => {
      try {
        if (showLoader) {
          setIsLoading(true)
        }
        setFeedbackError("")
        const [workspaceClients, workspaceTasks] = await Promise.all([
          fetchWorkspaceClients(currentUser.id, { force: true }),
          fetchWorkspaceTasks(currentUser.id, { force: true }),
        ])
        setClientes(workspaceClients.map((cliente) => ({ id: cliente.id, nome: cliente.nome, fotoUrl: cliente.fotoUrl })))
        setTarefas(dedupeTasks(workspaceTasks))
      } catch (error) {
        console.error(error)
        setFeedbackError(error instanceof Error ? error.message : "Não foi possível carregar a produção.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!cachedClients || !cachedTasks) {
      void syncData(true)
    }

    return subscribeWorkspaceSync(() => {
      const nextCachedClients = getCachedWorkspaceClients(currentUser.id)
      const nextCachedTasks = getCachedWorkspaceTasks(currentUser.id)

      if (nextCachedClients) {
        setClientes(nextCachedClients.map((cliente) => ({ id: cliente.id, nome: cliente.nome, fotoUrl: cliente.fotoUrl })))
      }

      if (nextCachedTasks) {
        setTarefas(dedupeTasks(nextCachedTasks))
        setIsLoading(false)
      }
    })
  }, [currentUser])

  useEffect(() => {
    const loadPixKey = async () => {
      const response = await authFetch("/api/preferences")
      const payload = (await response.json().catch(() => ({}))) as { preferences?: { pixKey?: string } }
      if (response.ok) {
        setAccountPixKey(payload.preferences?.pixKey ?? "")
      }
    }

    void loadPixKey()
  }, [])

  const orderedColumns = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        tasks: dedupeTasks(tarefas).filter((task) => task.colunaId === column.id),
      })),
    [tarefas]
  )
  const clientLookup = useMemo(
    () => new Map(clientes.map((cliente) => [cliente.id, cliente])),
    [clientes]
  )

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      setFeedbackError("Entre novamente antes de criar um projeto.")
      return
    }
    const cliente = clientes.find((item) => item.id === novaTarefa.clienteId)
    if (!cliente) {
      setFeedbackError("Escolha um cliente antes de criar a entrega.")
      return
    }

    setIsSubmittingTask(true)
    setFeedbackMessage("")
    setFeedbackError("")

    try {
      const createdTask = await createWorkspaceTask(currentUser.id, {
        titulo: novaTarefa.titulo,
        descricao: novaTarefa.descricao,
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        prazo: new Date(novaTarefa.prazo).toISOString(),
        checklist: novaTarefa.checklist,
        escopo: novaTarefa.escopo,
      })

      setTarefas((prev) => dedupeTasks([createdTask, ...prev]))
      setNovaTarefa(initialTask)
      setDialogOpen(false)
      setFeedbackMessage("Projeto criado com sucesso.")
    } catch (error) {
      console.error(error)
      setFeedbackError(error instanceof Error ? error.message : "Não foi possível criar o projeto.")
    } finally {
      setIsSubmittingTask(false)
    }
  }

  const moveTask = async (taskId: string, columnId: WorkspaceTask["colunaId"]) => {
    if (!currentUser) {
      setFeedbackError("Entre novamente antes de atualizar o projeto.")
      return
    }
    setIsUpdatingTask(true)
    setFeedbackMessage("")
    setFeedbackError("")

    try {
      const updatedTask = await updateWorkspaceTask(currentUser.id, taskId, {
        colunaId: columnId,
      })

      if (updatedTask) {
        setTarefas((prev) => dedupeTasks(prev.map((task) => (task.id === taskId ? updatedTask : task))))
        setFeedbackMessage("Projeto atualizado com sucesso.")
      }
    } catch (error) {
      console.error(error)
      setFeedbackError(error instanceof Error ? error.message : "Não foi possível atualizar o projeto.")
    } finally {
      setIsUpdatingTask(false)
    }
  }

  const handleColumnDrop = async (columnId: WorkspaceTask["colunaId"]) => {
    if (!draggingTaskId) return
    const draggedTask = tarefas.find((task) => task.id === draggingTaskId)
    setDraggingTaskId("")

    if (!draggedTask || draggedTask.colunaId === columnId) return
    await moveTask(draggedTask.id, columnId)
  }

  const openApprovalLink = (task: WorkspaceTask) => {
    setTarefaSelecionada(task)
    setLinkDialogOpen(true)
  }

  const openTaskDetails = (task: WorkspaceTask) => {
    setTarefaSelecionada({
      ...task,
      checklist: task.checklist ?? createDefaultTaskChecklist(),
      escopo: task.escopo ?? createDefaultTaskScope(),
      timeline: task.timeline ?? [],
    })
    setDetalhesOpen(true)
  }

  useEffect(() => {
    if (!requestedTaskId || openedTaskFromQueryRef.current === requestedTaskId || tarefas.length === 0) return

    const requestedTask = tarefas.find((task) => task.id === requestedTaskId)
    if (!requestedTask) return

    openedTaskFromQueryRef.current = requestedTaskId
    openTaskDetails(requestedTask)
  }, [requestedTaskId, tarefas])

  const handleSaveTaskContext = async () => {
    if (!currentUser || !tarefaSelecionada) return

    setIsUpdatingTask(true)
    setFeedbackMessage("")
    setFeedbackError("")

    try {
      const updatedTask = await updateWorkspaceTask(currentUser.id, tarefaSelecionada.id, {
        checklist: tarefaSelecionada.checklist ?? createDefaultTaskChecklist(),
        escopo: tarefaSelecionada.escopo ?? createDefaultTaskScope(),
      })

      if (updatedTask) {
        setTarefas((prev) => dedupeTasks(prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))))
        setTarefaSelecionada(updatedTask)
        setFeedbackMessage("Contexto do projeto salvo com sucesso.")
      }
      setDetalhesOpen(false)
    } catch (error) {
      console.error(error)
      setFeedbackError(error instanceof Error ? error.message : "Não foi possível salvar o contexto do projeto.")
    } finally {
      setIsUpdatingTask(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser) {
      setFeedbackError("Entre novamente antes de excluir o projeto.")
      return
    }

    setDeletingTaskId(taskId)
    setFeedbackMessage("")
    setFeedbackError("")

    try {
      await deleteWorkspaceTask(currentUser.id, taskId)
      setTarefas((prev) => prev.filter((task) => task.id !== taskId))
      if (tarefaSelecionada?.id === taskId) {
        setTarefaSelecionada(null)
        setLinkDialogOpen(false)
        setConclusaoOpen(false)
      }
      setFeedbackMessage("Projeto excluído com sucesso.")
    } catch (error) {
      console.error(error)
      setFeedbackError(error instanceof Error ? error.message : "Não foi possível excluir o projeto.")
    } finally {
      setDeletingTaskId("")
    }
  }

  const handleGenerateApproval = async () => {
    if (!currentUser) {
      setFeedbackError("Entre novamente antes de gerar o link de aprovação.")
      return
    }

    if (!tarefaSelecionada) {
      setFeedbackError("Escolha uma tarefa antes de gerar o link de aprovação.")
      return
    }

    if (!linkDriveConclusao.trim() && !selectedDriveVideo?.id) {
      setFeedbackError("Adicione um link do Drive ou selecione um vídeo antes de gerar o link de aprovação.")
      return
    }

    setIsUpdatingTask(true)
    setFeedbackMessage("")
    setFeedbackError("")

    try {
      const existingReview = parseReviewFeedback(tarefaSelecionada.feedbackCliente)
      const parsedPrice =
        existingReview.priceUsd ??
        parseStoredProjectValue(tarefaSelecionada.escopo?.valorCombinado) ??
        null
      const approvalResponse = await authFetch("/api/approval-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: tarefaSelecionada.id,
          driveLink: linkDriveConclusao.trim(),
          priceUsd: parsedPrice,
          pixKey: pixKey.trim(),
          googleDriveFileId: selectedDriveVideo?.id,
          googleDriveFileName: selectedDriveVideo?.name,
        }),
      })
      const approvalPayload = (await approvalResponse.json().catch(() => ({}))) as { error?: string; approvalLink?: string; driveLink?: string }
      if (!approvalResponse.ok || !approvalPayload.approvalLink) {
        throw new Error(approvalPayload.error ?? "Não foi possível gerar o link de aprovação.")
      }
      const finalDriveLink = approvalPayload.driveLink || selectedDriveVideo?.url || linkDriveConclusao.trim()

      const updatedTask = await updateWorkspaceTask(currentUser.id, tarefaSelecionada.id, {
        linkDrive: finalDriveLink,
        linkAprovacao: approvalPayload.approvalLink,
        colunaId: "waiting-response",
        statusCliente: "pendente",
        notificationRead: true,
        feedbackCliente: serializeReviewFeedback({
          priceUsd: parsedPrice,
          pixKey: pixKey.trim(),
          revisionItems: [],
        }),
      })

      if (updatedTask) {
        setTarefas((prev) => dedupeTasks(prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))))
        setTarefaSelecionada(updatedTask)
        setFeedbackMessage("Link de aprovação gerado com sucesso.")
      }

      setLinkDriveConclusao("")
      setPixKey("")
      setSelectedDriveVideo(null)
      setConclusaoOpen(false)
      setLinkDialogOpen(true)
    } catch (error) {
      console.error(error)
      setFeedbackError(error instanceof Error ? error.message : "Não foi possível gerar o link de aprovação.")
    } finally {
      setIsUpdatingTask(false)
    }
  }

  const handleCopy = async () => {
    if (!tarefaSelecionada?.linkAprovacao) return
    const didCopy = await copyTextToClipboard(tarefaSelecionada.linkAprovacao)
    if (!didCopy) {
      setFeedbackError("Não foi possível copiar automaticamente. Selecione o link e copie manualmente.")
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))

  const selectedTaskReview = tarefaSelecionada ? parseReviewFeedback(tarefaSelecionada.feedbackCliente) : null
  const formattedSelectedPrice =
    selectedTaskReview?.priceUsd != null
      ? formatCurrency(selectedTaskReview.priceUsd, "USD")
      : null

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden bg-card text-foreground">
      <div className="border-b border-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.045em] text-foreground">Agenda</h1>
            <div className="mt-5 flex items-center gap-5 border-b border-border">
              <button className="relative inline-flex items-center gap-2 pb-3 text-sm font-medium text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#8b5cf6]">
                <ListChecks className="h-4 w-4 text-[#8b5cf6]" />
                Todos
              </button>
              <button className="inline-flex items-center gap-2 pb-3 text-sm font-medium text-muted-foreground">
                5 visualizações
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 rounded-xl bg-black px-5 text-white hover:bg-black/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova ação
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card flex max-h-[90vh] w-[min(100%-2rem,56rem)] max-w-4xl flex-col overflow-hidden p-0">
            <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
              <DialogTitle className="text-foreground">Novo projeto</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Crie uma entrega vinculada a um cliente existente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
                <div className="space-y-2">
                  <Label className="text-foreground">Título</Label>
                  <Input
                    value={novaTarefa.titulo}
                    onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
                    className="border-border bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                    <Label className="text-foreground">Descrição</Label>
                  <Textarea
                    value={novaTarefa.descricao}
                    onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                    className="border-border bg-background min-h-24"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Cliente</Label>
                    <Select value={novaTarefa.clienteId} onValueChange={(value) => setNovaTarefa({ ...novaTarefa, clienteId: value })}>
                      <SelectTrigger className="border-border bg-background">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card">
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Prazo</Label>
                    <Input
                      type="datetime-local"
                      value={novaTarefa.prazo}
                      onChange={(e) => setNovaTarefa({ ...novaTarefa, prazo: e.target.value })}
                      className="border-border bg-background"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4 rounded-xl border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Kickoff do projeto</p>
                    <p className="text-xs text-muted-foreground">Marque só o que já foi alinhado antes de começar.</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      ["briefingRecebido", "Briefing recebido"],
                      ["arquivosRecebidos", "Arquivos recebidos"],
                      ["referenciaAprovada", "Referência aprovada"],
                      ["formatoDefinido", "Formato definido"],
                      ["prazoConfirmado", "Prazo confirmado"],
                      ["pagamentoAlinhado", "Pagamento alinhado"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={novaTarefa.checklist[key as keyof typeof novaTarefa.checklist]}
                          onChange={(e) =>
                            setNovaTarefa({
                              ...novaTarefa,
                              checklist: {
                                ...novaTarefa.checklist,
                                [key]: e.target.checked,
                              },
                            })
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 rounded-xl border border-border bg-background p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-foreground">Quantidade de vídeos</Label>
                      <Input
                        list="quantidade-videos-opcoes"
                        value={novaTarefa.escopo.quantidadeVideos}
                        onChange={(e) => setNovaTarefa({ ...novaTarefa, escopo: { ...novaTarefa.escopo, quantidadeVideos: e.target.value } })}
                        className="border-border bg-background"
                        placeholder="Ex.: 3 vídeos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Duração esperada</Label>
                      <Input
                        list="duracao-esperada-opcoes"
                        value={novaTarefa.escopo.duracaoEsperada}
                        onChange={(e) => setNovaTarefa({ ...novaTarefa, escopo: { ...novaTarefa.escopo, duracaoEsperada: e.target.value } })}
                        className="border-border bg-background"
                        placeholder="Ex.: Até 60s"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Formatos</Label>
                      <Input
                        list="formatos-opcoes"
                        value={novaTarefa.escopo.formatos}
                        onChange={(e) => setNovaTarefa({ ...novaTarefa, escopo: { ...novaTarefa.escopo, formatos: e.target.value } })}
                        className="border-border bg-background"
                        placeholder="Ex.: 9:16 + 16:9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Revisões incluídas</Label>
                      <Input
                        list="revisoes-opcoes"
                        value={novaTarefa.escopo.revisoesIncluidas}
                        onChange={(e) => setNovaTarefa({ ...novaTarefa, escopo: { ...novaTarefa.escopo, revisoesIncluidas: e.target.value } })}
                        className="border-border bg-background"
                        placeholder="Ex.: 2 revisões"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Valor combinado</Label>
                      <Input value={novaTarefa.escopo.valorCombinado} onChange={(e) => setNovaTarefa({ ...novaTarefa, escopo: { ...novaTarefa.escopo, valorCombinado: e.target.value } })} className="border-border bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Prazo prometido</Label>
                      <Input
                        list="prazo-prometido-opcoes"
                        value={novaTarefa.escopo.prazoPrometido}
                        onChange={(e) => setNovaTarefa({ ...novaTarefa, escopo: { ...novaTarefa.escopo, prazoPrometido: e.target.value } })}
                        className="border-border bg-background"
                        placeholder="Ex.: 48 horas"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Extras combinados</Label>
                    <Input
                      list="extras-opcoes"
                      value={novaTarefa.escopo.extrasCombinados}
                      onChange={(e) => setNovaTarefa({ ...novaTarefa, escopo: { ...novaTarefa.escopo, extrasCombinados: e.target.value } })}
                      className="border-border bg-background"
                      placeholder="Ex.: Legenda + Thumb"
                    />
                  </div>
                </div>
                <datalist id="quantidade-videos-opcoes">
                  {escopoSugestoes.quantidadeVideos.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                <datalist id="duracao-esperada-opcoes">
                  {escopoSugestoes.duracaoEsperada.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                <datalist id="formatos-opcoes">
                  {escopoSugestoes.formatos.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                <datalist id="revisoes-opcoes">
                  {escopoSugestoes.revisoesIncluidas.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                <datalist id="prazo-prometido-opcoes">
                  {escopoSugestoes.prazoPrometido.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                <datalist id="extras-opcoes">
                  {escopoSugestoes.extrasCombinados.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div className="shrink-0 border-t border-border bg-card px-6 py-4">
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!clientes.length || isSubmittingTask}
                >
                  {isSubmittingTask ? "Criando..." : "Criar projeto"}
                </Button>
                {!clientes.length && (
                  <p className="mt-2 text-xs text-muted-foreground">Adicione um cliente primeiro para montar sua agenda.</p>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Button variant="outline" className="h-11 rounded-xl border-border bg-card px-4 text-foreground">
          <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
          Filtro
        </Button>
        <Button variant="outline" className="h-11 rounded-xl border-border bg-card px-4 text-foreground">
          <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
          Ordenar
        </Button>
      </div>

      <FeedbackBanner message={feedbackMessage} type="success" />
      <FeedbackBanner message={feedbackError} type="error" />

      {isLoading ? (
        <PageLoadingState
          title="Carregando agenda"
          description="Estamos organizando as entregas por etapa para você retomar o fluxo rapidamente."
        />
      ) : (
      <div className="w-full max-w-full overflow-x-auto overscroll-x-contain pb-5">
        <div className="flex min-w-max items-start gap-6 pr-4">
        {orderedColumns.map((column) => (
          <section
            key={column.id}
            className="min-h-[680px] w-[360px] shrink-0 rounded-sm border border-transparent bg-[#fbfbfc]"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void handleColumnDrop(column.id)}
          >
            <div className="border-b border-border bg-card px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Circle className={cn("h-4 w-4", column.accent)} />
                  <h2 className="text-base font-semibold tracking-[-0.035em] text-foreground">{column.title}</h2>
                  <span className="text-xs font-medium text-muted-foreground">{column.tasks.length}</span>
                </div>
                {column.id === "agenda" ? (
                  <button type="button" onClick={() => setDialogOpen(true)} className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Plus className="h-5 w-5" />
                  </button>
                ) : (
                  <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="space-y-4 p-4">
              {column.tasks.length === 0 && (
                <div className="min-h-[132px] rounded-xl bg-[#f7f7f8] p-4 text-sm text-muted-foreground">
                  Solte uma ação aqui.
                </div>
              )}

              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggingTaskId(task.id)}
                  onDragEnd={() => setDraggingTaskId("")}
                  className={cn(
                    "group cursor-grab space-y-3 rounded-xl border border-border bg-card p-4 shadow-[0_10px_22px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-0.5 active:cursor-grabbing",
                    column.id === "em-producao" && "border-t-4 border-t-rose-500",
                    draggingTaskId === task.id && "opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-6 tracking-[-0.025em] text-foreground">{task.titulo}</p>
                      {task.descricao && <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-muted-foreground">{task.descricao}</p>}
                    </div>
                    <MoreHorizontal className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn("inline-flex h-7 items-center gap-1 rounded-md px-2", column.id === "waiting-response" ? "bg-rose-50 text-rose-500" : "bg-secondary")}>
                      <Flag className={cn("h-3.5 w-3.5", column.accent)} />
                      {column.id === "waiting-response" ? "Hoje" : task.prazo ? formatDate(task.prazo).split(",")[0] : "Sem prazo"}
                    </span>
                    <span className="inline-flex h-7 items-center gap-1 rounded-md bg-secondary px-2">
                      <Paperclip className="h-3.5 w-3.5" />
                      {task.linkDrive ? 1 : 0}
                    </span>
                    <span className="inline-flex h-7 items-center gap-1 rounded-md bg-secondary px-2">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {task.feedbackCliente ? 1 : 0}
                    </span>
                    {parseStoredProjectValue(task.escopo?.valorCombinado) ? (
                      <span className="inline-flex h-7 items-center rounded-md bg-secondary px-2 font-medium text-foreground">
                        {formatCurrency(parseStoredProjectValue(task.escopo?.valorCombinado) ?? 0)}
                      </span>
                    ) : null}
                    <span
                      className="ml-auto flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/15 bg-cover bg-center text-primary"
                      style={clientLookup.get(task.clienteId)?.fotoUrl ? { backgroundImage: `url(${clientLookup.get(task.clienteId)?.fotoUrl})` } : undefined}
                      title={task.clienteNome}
                    >
                      {!clientLookup.get(task.clienteId)?.fotoUrl && <User className="h-4 w-4" />}
                    </span>
                  </div>

                  {task.linkDrive && (
                    <Link
                      href={task.linkDrive}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Abrir vídeo entregue
                    </Link>
                  )}

                  <div className="flex flex-wrap gap-2 border-t border-border pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="outline" className="h-8 border-border bg-card px-2 text-xs" size="sm" onClick={() => openTaskDetails(task)}>
                      <ScrollText className="mr-2 h-4 w-4" />
                      Detalhes
                    </Button>
                    {task.clienteId ? (
                      <Button asChild variant="outline" className="h-8 border-border bg-card px-2 text-xs" size="sm">
                        <Link href={`/dashboard/clientes/${task.clienteId}`}>
                          <User className="mr-2 h-4 w-4" />
                          CRM
                        </Link>
                      </Button>
                    ) : null}
                    {column.id !== "concluido" && column.id === "em-producao" && (
                      <Button
                        variant={task.linkAprovacao ? "outline" : "default"}
                        className={cn(
                          "h-8 px-2 text-xs",
                          task.linkAprovacao
                            ? "border-border bg-card"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                        size="sm"
                        onClick={() => {
                          setTarefaSelecionada(task)
                          const existingReview = parseReviewFeedback(task.feedbackCliente)
                          setLinkDriveConclusao(task.linkDrive ?? "")
                          setPixKey(existingReview.pixKey || accountPixKey)
                          setConclusaoOpen(true)
                        }}
                      >
                        {task.linkAprovacao ? "Renovar aprovação" : "Gerar aprovação"}
                      </Button>
                    )}
                    {column.id !== "concluido" && task.linkAprovacao && (
                      <Button variant="outline" className="h-8 border-border bg-card px-2 text-xs" size="sm" onClick={() => openApprovalLink(task)}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Ver link
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="h-8 border-border bg-card px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      size="sm"
                      onClick={() => void handleDeleteTask(task.id)}
                      disabled={deletingTaskId === task.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingTaskId === task.id ? "Excluindo..." : "Excluir"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        </div>
      </div>
      )}

      <Dialog open={detalhesOpen} onOpenChange={setDetalhesOpen}>
        <DialogContent className="border-border bg-card flex max-h-[90vh] w-[min(100%-2rem,64rem)] max-w-4xl flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
            <DialogTitle className="text-foreground">Contexto do projeto</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Kickoff e histórico do que aconteceu com esta entrega.
            </DialogDescription>
          </DialogHeader>
          {tarefaSelecionada && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-medium text-foreground">{tarefaSelecionada.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{getNextTaskAction(tarefaSelecionada)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Checklist de kickoff</Label>
                  <span className="text-xs text-muted-foreground">{getChecklistProgress(tarefaSelecionada.checklist)}%</span>
                </div>
                <Progress value={getChecklistProgress(tarefaSelecionada.checklist)} />
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["briefingRecebido", "Briefing recebido"],
                    ["arquivosRecebidos", "Arquivos recebidos"],
                    ["referenciaAprovada", "Referência aprovada"],
                    ["formatoDefinido", "Formato definido"],
                    ["prazoConfirmado", "Prazo confirmado"],
                    ["pagamentoAlinhado", "Pagamento alinhado"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={Boolean(tarefaSelecionada.checklist?.[key as keyof NonNullable<typeof tarefaSelecionada.checklist>])}
                        onChange={(e) =>
                          setTarefaSelecionada({
                            ...tarefaSelecionada,
                            checklist: {
                              ...(tarefaSelecionada.checklist ?? createDefaultTaskChecklist()),
                              [key]: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-border bg-background p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["quantidadeVideos", "Quantidade de vídeos"],
                    ["duracaoEsperada", "Duração esperada"],
                    ["formatos", "Formatos"],
                    ["revisoesIncluidas", "Revisões incluídas"],
                    ["valorCombinado", "Valor combinado"],
                    ["prazoPrometido", "Promised deadline"],
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-foreground">{label}</Label>
                      <Input
                        value={tarefaSelecionada.escopo?.[key as keyof NonNullable<typeof tarefaSelecionada.escopo>] ?? ""}
                        onChange={(e) =>
                          setTarefaSelecionada({
                            ...tarefaSelecionada,
                            escopo: {
                              ...(tarefaSelecionada.escopo ?? createDefaultTaskScope()),
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="border-border bg-card"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Extras combinados</Label>
                  <Textarea
                    value={tarefaSelecionada.escopo?.extrasCombinados ?? ""}
                    onChange={(e) =>
                      setTarefaSelecionada({
                        ...tarefaSelecionada,
                        escopo: {
                          ...(tarefaSelecionada.escopo ?? createDefaultTaskScope()),
                          extrasCombinados: e.target.value,
                        },
                      })
                    }
                    className="border-border bg-card min-h-24"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                <Label className="text-foreground">Linha do tempo</Label>
                <div className="space-y-3">
                  {(tarefaSelecionada.timeline ?? []).length > 0 ? (
                    (tarefaSelecionada.timeline ?? []).map((event) => (
                      <div key={event.id} className="rounded-lg border border-border px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{event.title}</p>
                          <span className="text-xs text-muted-foreground">{formatTimelineDate(event.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    ))
                  ) : (
                  <p className="text-sm text-muted-foreground">Ainda não há histórico registrado para esta tarefa.</p>
                  )}
                </div>
              </div>
              </div>

              <div className="shrink-0 border-t border-border bg-card px-6 py-4">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => void handleSaveTaskContext()} disabled={isUpdatingTask}>
                {isUpdatingTask ? "Saving..." : "Save context"}
              </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={conclusaoOpen} onOpenChange={setConclusaoOpen}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Gerar link de aprovação</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Adicione os dados da entrega que o cliente vai revisar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Link do vídeo</Label>
              <Input
                value={linkDriveConclusao}
                onChange={(e) => setLinkDriveConclusao(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="border-border bg-background"
              />
            </div>
            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Ou selecione um vídeo do Google Drive</p>
                  <p className="text-xs text-muted-foreground">O link ficará ativo por 24 horas e depois será removido automaticamente.</p>
                </div>
                <DrivePickerButton
                  mode="video"
                  onPick={(item) => setSelectedDriveVideo({ id: item.id, name: item.name, url: item.url })}
                />
              </div>
              <div className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground">
                {selectedDriveVideo ? (
                  <span>
                    Vídeo selecionado: <span className="font-medium text-foreground">{selectedDriveVideo.name}</span>
                  </span>
                ) : (
                  "No Drive video selected."
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Chave Pix</Label>
              <Input
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="your-pix-key"
                className="border-border bg-background"
              />
            </div>
            {currentUser && (
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-medium text-foreground">Editor profile shown to the client</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p className="text-foreground">{currentUser.profile.fullName || currentUser.name}</p>
                  <p>{currentUser.profile.professionalTitle || "Editor de vídeo"}</p>
                  {currentUser.profile.bio && <p>{currentUser.profile.bio}</p>}
                  <p>
                    Contato: {CONTACT_METHOD_LABELS[currentUser.profile.contactMethod]}{" "}
                    {currentUser.profile.contactValue}
                  </p>
                </div>
              </div>
            )}
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleGenerateApproval}
              disabled={(!linkDriveConclusao.trim() && !selectedDriveVideo?.id) || isUpdatingTask}
            >
              {isUpdatingTask ? "Gerando..." : "Gerar link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Link de aprovação</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Quando o cliente responder, a agenda será atualizada automaticamente para concluído ou refação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {formattedSelectedPrice && (
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                Valor do projeto: <span className="font-medium text-foreground">{formattedSelectedPrice}</span>
              </div>
            )}
            {selectedTaskReview?.pixKey && (
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                Chave Pix pronta: <span className="font-medium break-all text-foreground">{selectedTaskReview.pixKey}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input value={tarefaSelecionada?.linkAprovacao ?? ""} readOnly className="border-border bg-background" />
              <Button variant="outline" size="icon" className="border-border" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {tarefaSelecionada?.linkDrive && (
              <Link href={tarefaSelecionada.linkDrive} target="_blank" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-4 w-4" />
                Abrir vídeo entregue
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
