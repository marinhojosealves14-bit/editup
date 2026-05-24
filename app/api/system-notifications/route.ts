import { NextRequest, NextResponse } from "next/server"
import { readEditUpState } from "@/lib/editup-state"
import { requireAdminAuthenticatedUser } from "@/lib/api-admin"
import { getProfileNotifications } from "@/lib/profile-notifications"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireAdminAuthenticatedUser(request)
    const state = await readEditUpState()
    const fileNotifications = state.userNotifications.filter((item) => item.userId === user.id)
    const profileNotifications = await getProfileNotifications(supabase, user.id)
    const notifications = [...profileNotifications, ...fileNotifications]
      .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 30)

    return NextResponse.json({ notifications })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível carregar os avisos do sistema."
    return NextResponse.json({ error: message }, { status: message === "Não autenticado." ? 401 : 500 })
  }
}
