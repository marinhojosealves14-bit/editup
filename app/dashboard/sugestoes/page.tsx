"use client"

import { useEffect, useMemo, useState } from "react"
import { Lightbulb, MessageSquarePlus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { authFetch } from "@/lib/supabase"

type Suggestion = {
  id: string
  title: string
  category: string
  message: string
  author: string
  email: string
  createdAt: string
}

const categories = ["Interface", "Orçamentos", "Aprovação", "Clientes", "Financeiro", "Outra ideia"]

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState(categories[0])
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [isSending, setIsSending] = useState(false)

  const canSend = title.trim().length >= 3 && message.trim().length >= 10
  const latestSuggestions = useMemo(() => suggestions.slice(0, 4), [suggestions])

  useEffect(() => {
    let cancelled = false

    const loadSuggestions = async () => {
      try {
        const response = await authFetch("/api/suggestions")
        if (!response.ok) return
        const payload = (await response.json().catch(() => ({}))) as { suggestions?: Suggestion[] }
        if (!cancelled && Array.isArray(payload.suggestions)) {
          setSuggestions(payload.suggestions)
        }
      } catch {
        // A área segue utilizável mesmo se o histórico não carregar.
      }
    }

    void loadSuggestions()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async () => {
    if (!canSend) return

    try {
      setIsSending(true)
      setError("")
      const response = await authFetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, message }),
      })
      const payload = (await response.json().catch(() => ({}))) as { suggestion?: Suggestion; error?: string }
      if (!response.ok || !payload.suggestion) {
        throw new Error(payload.error ?? "Não foi possível enviar a sugestão.")
      }

      setSuggestions((current) => [payload.suggestion!, ...current])
      setTitle("")
      setMessage("")
      setCategory(categories[0])
      setSent(true)
      window.setTimeout(() => setSent(false), 2800)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível enviar a sugestão.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card className="rounded-[24px] border-border bg-card shadow-[var(--exec-shadow)]">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Sugestões para o Mallow</CardTitle>
              <CardDescription>
                Envie ideias de melhoria, bugs de fluxo ou features que fariam diferença no seu trabalho.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="suggestion-title">
                Título da sugestão
              </label>
              <Input
                id="suggestion-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex: salvar preset de aprovação"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="suggestion-category">
                Área
              </label>
              <select
                id="suggestion-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 rounded-md border border-border bg-input px-3.5 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="suggestion-message">
                Detalhe o que você quer melhorar
              </label>
              <Textarea
                id="suggestion-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Conte o problema, como você resolve hoje e como o Mallow poderia ajudar."
                className="min-h-40"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={() => void handleSubmit()} disabled={!canSend || isSending} className="gap-2">
                <Send className="h-4 w-4" />
                {isSending ? "Enviando..." : "Enviar sugestão"}
              </Button>
              {sent && <p className="text-sm font-medium text-emerald-600">Sugestão recebida. Valeu por melhorar o produto.</p>}
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </div>
          </div>

          <aside className="rounded-[20px] border border-border bg-secondary/45 p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground">Como priorizamos</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Ideias que reduzem trabalho manual, melhoram aprovação com cliente ou aumentam faturamento entram primeiro no roadmap.
            </p>

            <div className="mt-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">Enviadas neste workspace</p>
              {latestSuggestions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Nenhuma sugestão enviada ainda.
                </div>
              ) : (
                latestSuggestions.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">{item.category}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </CardContent>
      </Card>
    </div>
  )
}
