import type { UserSystemNotification } from "@/lib/editup-state"

type SupabaseLike = {
  from: (table: string) => any
}

const getObject = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}

const getStoredNotifications = (appearanceTheme: unknown) => {
  const theme = getObject(appearanceTheme)
  const notifications = theme.__notifications

  if (!Array.isArray(notifications)) return []

  return notifications.filter(
    (item): item is UserSystemNotification =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.userId === "string" &&
      typeof item.title === "string" &&
      typeof item.message === "string" &&
      (item.kind === "approval-expired" || item.kind === "drive" || item.kind === "system") &&
      typeof item.createdAt === "string" &&
      typeof item.read === "boolean"
  )
}

export const findProfileUserIdByEmail = async (supabase: SupabaseLike, email: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (error) {
    console.error("Could not resolve notification inbox profile", error)
    return ""
  }

  return data?.id ? String(data.id) : ""
}

export const getProfileNotifications = async (supabase: SupabaseLike, userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("appearance_theme")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error("Could not load profile notifications", error)
    return []
  }

  return getStoredNotifications(data?.appearance_theme)
}

export const pushProfileNotification = async (
  supabase: SupabaseLike,
  userId: string,
  notification: UserSystemNotification
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("appearance_theme")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error("Could not load profile before notification update", error)
    return false
  }

  const appearanceTheme = getObject(data?.appearance_theme)
  const currentNotifications = getStoredNotifications(data?.appearance_theme)
  const nextNotifications = [
    notification,
    ...currentNotifications.filter((item) => item.id !== notification.id),
  ].slice(0, 200)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      appearance_theme: {
        ...appearanceTheme,
        __notifications: nextNotifications,
      },
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Could not save profile notification", updateError)
    return false
  }

  return true
}
