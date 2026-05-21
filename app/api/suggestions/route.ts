import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { readEditUpState, writeEditUpState } from "@/lib/editup-state"
import { enforceApiRateLimit, ensureSameOrigin, requireAdminAuthenticatedUser, sanitizePlainText } from "@/lib/api-admin"

export const runtime = "nodejs"

const suggestionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.string().trim().min(2).max(40),
  message: z.string().trim().min(10).max(2000),
})

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAdminAuthenticatedUser(request)
    const state = await readEditUpState()

    return NextResponse.json({
      suggestions: state.productSuggestions
        .filter((item) => item.userId === user.id)
        .slice(0, 20),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível carregar sugestões."
    return NextResponse.json({ error: message }, { status: message === "Não autenticado." ? 401 : 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const originError = ensureSameOrigin(request)
    if (originError) return originError
    const rateLimitError = enforceApiRateLimit(request, "suggestions:post", 30)
    if (rateLimitError) return rateLimitError

    const { user } = await requireAdminAuthenticatedUser(request)
    const body = suggestionSchema.parse(await request.json().catch(() => ({})))
    const title = sanitizePlainText(body.title)
    const category = sanitizePlainText(body.category)
    const message = sanitizePlainText(body.message)

    if (!title || !category || !message) {
      return NextResponse.json({ error: "Preencha a sugestão antes de enviar." }, { status: 400 })
    }

    const state = await readEditUpState()
    const suggestion = {
      id: crypto.randomUUID(),
      userId: user.id,
      author: user.user_metadata?.name || user.email?.split("@")[0] || "Editor",
      email: user.email ?? "",
      title,
      category,
      message,
      createdAt: new Date().toISOString(),
    }

    state.productSuggestions.unshift(suggestion)
    state.productSuggestions = state.productSuggestions.slice(0, 500)
    await writeEditUpState(state)

    return NextResponse.json({ success: true, suggestion })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Envie um título e uma descrição mais completos." }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Não foi possível enviar a sugestão."
    return NextResponse.json({ error: message }, { status: message === "Não autenticado." ? 401 : 500 })
  }
}
