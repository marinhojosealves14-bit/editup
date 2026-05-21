import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"
import crypto from "node:crypto"

config({ path: ".env.local" })

const email = "muriloeditor2023@gmail.com"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente.")
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const now = new Date("2026-05-20T12:00:00-03:00")
const isoDays = (days) => {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const demoClientNames = [
  "Luma Labs HQ",
  "Beto Shorts",
  "mori",
  "FitFlow Brasil",
  "Agência Nexo",
  "Catarina Beauty",
]

const demoTaskTitles = [
  "Reels Luma HQ - campanha de lançamento",
  "Motion pack - mori",
  "Beto Shorts #18 - corte viral",
  "FitFlow - revisão final do anúncio",
  "Nexo Ads - teaser 30s",
  "Catarina Beauty - reels de transformação",
  "Luma Labs HQ - thumbnail final",
]

const demoFinanceDescriptions = [
  "Entrada - campanha Luma HQ",
  "Entrada - pacote Beto Shorts",
  "Entrada - motion mori",
  "Entrada - anúncio FitFlow",
  "Entrada - teaser Agência Nexo",
  "Saída - freelancer motion",
  "Saída - banco de músicas",
  "Saída - assets premium",
]

const demoExpenseNames = [
  "Adobe Creative Cloud",
  "Google Drive",
  "Internet fibra",
  "Banco de músicas",
]

const demoQuoteClients = [
  "Luma Labs HQ",
  "Beto Shorts",
  "mori",
  "Catarina Beauty",
]

const fail = (label, error) => {
  if (error) {
    throw new Error(`${label}: ${error.message}`)
  }
}

const isMissingTable = (error) =>
  error?.message?.includes("Could not find the table") ||
  error?.message?.includes("does not exist") ||
  error?.message?.includes("schema cache")

const isMissingColumn = (error) =>
  error?.message?.includes("Could not find the") ||
  error?.message?.includes("column") ||
  error?.message?.includes("schema cache")

const deleteWhereIn = async (table, column, values, extra = {}) => {
  if (!values.length) return
  let query = supabase.from(table).delete()
  for (const [key, value] of Object.entries(extra)) {
    query = query.eq(key, value)
  }
  const { error } = await query.in(column, values)
  if (isMissingTable(error)) {
    console.warn(`Ignorando ${table}: tabela ausente no schema cache.`)
    return
  }
  fail(`delete ${table}`, error)
}

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("id,email,full_name")
  .eq("email", email)
  .single()

fail("buscar perfil", profileError)

const userId = profile.id

await supabase
  .from("profiles")
  .update({
    full_name: "Murilo",
    professional_title: "Editor de vídeo e motion designer",
    bio: "Editor focado em Reels, anúncios e entregas rápidas para creators e marcas.",
    location: "Recife, PE",
    plan: "pro",
    subscription_tier: "pro",
    subscription_status: "active",
    can_publish_jobs: true,
  })
  .eq("id", userId)

await deleteWhereIn("approval_links", "file_name", ["beto-shorts-v18.mp4", "fitflow-review-final.mp4"], { user_id: userId })
await deleteWhereIn("board_cards", "title", demoTaskTitles, { user_id: userId })
await deleteWhereIn("finance_transactions", "description", demoFinanceDescriptions, { user_id: userId })
await deleteWhereIn("fixed_expenses", "name", demoExpenseNames, { user_id: userId })
await deleteWhereIn("quote_requests", "client_name", demoQuoteClients, { editor_id: userId })
await deleteWhereIn("clients", "name", demoClientNames, { user_id: userId })

const { data: clients, error: clientsError } = await supabase
  .from("clients")
  .insert([
    {
      user_id: userId,
      name: "Luma Labs HQ",
      phone: "81997988131",
      country_code: "+55",
      edit_level: "profissional",
      average_duration: 45,
      frequency: "3 vídeos por semana",
      drive_link: "https://drive.google.com/drive/folders/luma-labs-hq",
      drive_folder_id: "demo_luma_labs_hq",
      drive_folder_name: "Luma Labs HQ",
      created_at: isoDays(-18),
    },
    {
      user_id: userId,
      name: "Beto Shorts",
      phone: "81988881234",
      country_code: "+55",
      edit_level: "medio",
      average_duration: 60,
      frequency: "pacote semanal",
      drive_link: "https://drive.google.com/drive/folders/beto-shorts",
      drive_folder_id: "demo_beto_shorts",
      drive_folder_name: "Beto Shorts",
      created_at: isoDays(-14),
    },
    {
      user_id: userId,
      name: "mori",
      phone: "81977771234",
      country_code: "+55",
      edit_level: "profissional",
      average_duration: 30,
      frequency: "motion sob demanda",
      drive_link: "https://drive.google.com/drive/folders/mori-motion",
      drive_folder_id: "demo_mori",
      drive_folder_name: "mori",
      created_at: isoDays(-11),
    },
    {
      user_id: userId,
      name: "FitFlow Brasil",
      phone: "11991553321",
      country_code: "+55",
      edit_level: "profissional",
      average_duration: 25,
      frequency: "2 anúncios por mês",
      drive_link: "https://drive.google.com/drive/folders/fitflow",
      drive_folder_id: "demo_fitflow",
      drive_folder_name: "FitFlow Brasil",
      created_at: isoDays(-9),
    },
    {
      user_id: userId,
      name: "Agência Nexo",
      phone: "81990001122",
      country_code: "+55",
      edit_level: "profissional",
      average_duration: 35,
      frequency: "campanhas mensais",
      drive_link: "https://drive.google.com/drive/folders/agencia-nexo",
      drive_folder_id: "demo_nexo",
      drive_folder_name: "Agência Nexo",
      created_at: isoDays(-6),
    },
    {
      user_id: userId,
      name: "Catarina Beauty",
      phone: "81981112233",
      country_code: "+55",
      edit_level: "simples",
      average_duration: 20,
      frequency: "reels quinzenal",
      drive_link: "https://drive.google.com/drive/folders/catarina-beauty",
      drive_folder_id: "demo_catarina",
      drive_folder_name: "Catarina Beauty",
      created_at: isoDays(-3),
    },
  ])
  .select("id,name")

fail("criar clientes", clientsError)

const clientByName = Object.fromEntries(clients.map((client) => [client.name, client]))
const approvalToken = crypto.randomBytes(16).toString("hex")

const { data: tasks, error: tasksError } = await supabase
  .from("board_cards")
  .insert([
    {
      user_id: userId,
      title: "Reels Luma HQ - campanha de lançamento",
      description: "Pacote com 3 Reels: hook forte, cortes dinâmicos, legenda animada e CTA final.",
      client_id: clientByName["Luma Labs HQ"].id,
      client_name: "Luma Labs HQ",
      due_date: isoDays(1),
      column_id: "agenda",
      position: 1,
      drive_link: "https://drive.google.com/drive/folders/luma-labs-hq",
      client_status: "pendente",
      notification_read: false,
      created_at: isoDays(-3),
    },
    {
      user_id: userId,
      title: "Motion pack - mori",
      description: "Animações de abertura, lower thirds e transições para pack de conteúdo.",
      client_id: clientByName.mori.id,
      client_name: "mori",
      due_date: isoDays(2),
      column_id: "em-producao",
      position: 1,
      drive_link: "https://drive.google.com/drive/folders/mori-motion",
      client_status: "em revisão interna",
      notification_read: true,
      created_at: isoDays(-5),
    },
    {
      user_id: userId,
      title: "Beto Shorts #18 - corte viral",
      description: "Corte vertical com retenção nos 3 primeiros segundos e final com call-to-action.",
      client_id: clientByName["Beto Shorts"].id,
      client_name: "Beto Shorts",
      due_date: isoDays(0),
      column_id: "waiting-response",
      position: 1,
      drive_link: "https://drive.google.com/file/d/beto-shorts-v18/view",
      approval_link: `http://localhost:3000/aprovacao/${approvalToken}`,
      client_status: "aguardando cliente",
      notification_read: false,
      created_at: isoDays(-4),
    },
    {
      user_id: userId,
      title: "FitFlow - revisão final do anúncio",
      description: "Cliente pediu troca de trilha e ajuste de cor nas cenas da academia.",
      client_id: clientByName["FitFlow Brasil"].id,
      client_name: "FitFlow Brasil",
      due_date: isoDays(1),
      column_id: "desaprovado",
      position: 1,
      drive_link: "https://drive.google.com/file/d/fitflow-review-final/view",
      client_feedback: "Trocar trilha por algo mais energético e reduzir 2 segundos no encerramento.",
      client_status: "precisa de revisão",
      notification_read: false,
      created_at: isoDays(-2),
    },
    {
      user_id: userId,
      title: "Nexo Ads - teaser 30s",
      description: "Teaser aprovado para campanha de tráfego. Entrega final enviada.",
      client_id: clientByName["Agência Nexo"].id,
      client_name: "Agência Nexo",
      due_date: isoDays(-1),
      column_id: "concluido",
      position: 1,
      drive_link: "https://drive.google.com/file/d/nexo-teaser-30s/view",
      approved: true,
      client_status: "aprovado",
      notification_read: true,
      created_at: isoDays(-8),
    },
    {
      user_id: userId,
      title: "Catarina Beauty - reels de transformação",
      description: "Reels de antes/depois com cortes limpos e legenda estilo creator.",
      client_id: clientByName["Catarina Beauty"].id,
      client_name: "Catarina Beauty",
      due_date: isoDays(4),
      column_id: "agenda",
      position: 2,
      drive_link: "https://drive.google.com/drive/folders/catarina-beauty",
      client_status: "briefing recebido",
      notification_read: true,
      created_at: isoDays(-1),
    },
    {
      user_id: userId,
      title: "Luma Labs HQ - thumbnail final",
      description: "Capa final para vídeo de lançamento. Aguardando confirmação da variação escolhida.",
      client_id: clientByName["Luma Labs HQ"].id,
      client_name: "Luma Labs HQ",
      due_date: isoDays(3),
      column_id: "em-producao",
      position: 2,
      drive_link: "https://drive.google.com/drive/folders/luma-labs-hq",
      client_status: "em produção",
      notification_read: true,
      created_at: isoDays(-2),
    },
  ])
  .select("id,title")

fail("criar tarefas", tasksError)

const betoTask = tasks.find((task) => task.title === "Beto Shorts #18 - corte viral")
if (betoTask) {
  const { error } = await supabase.from("approval_links").insert({
    user_id: userId,
    task_id: betoTask.id,
    token: approvalToken,
    file_id: "demo_beto_shorts_v18",
    file_name: "beto-shorts-v18.mp4",
    file_url: "https://drive.google.com/file/d/beto-shorts-v18/view",
    source_type: "manual",
    expires_at: isoDays(7),
    status: "active",
  })
  if (isMissingTable(error)) {
    console.warn("Ignorando approval_links: tabela ausente no schema cache.")
  } else {
    fail("criar link de aprovação", error)
  }
}

const { error: financeError } = await supabase.from("finance_transactions").insert([
  { user_id: userId, kind: "entrada", amount: 1045, description: "Entrada - campanha Luma HQ", category: "Produção", client_name: "Luma Labs HQ", transaction_date: isoDays(-2) },
  { user_id: userId, kind: "entrada", amount: 850, description: "Entrada - pacote Beto Shorts", category: "Recorrência", client_name: "Beto Shorts", transaction_date: isoDays(-5) },
  { user_id: userId, kind: "entrada", amount: 1200, description: "Entrada - motion mori", category: "Motion", client_name: "mori", transaction_date: isoDays(-7) },
  { user_id: userId, kind: "entrada", amount: 690, description: "Entrada - anúncio FitFlow", category: "Ads", client_name: "FitFlow Brasil", transaction_date: isoDays(-10) },
  { user_id: userId, kind: "entrada", amount: 1500, description: "Entrada - teaser Agência Nexo", category: "Campanha", client_name: "Agência Nexo", transaction_date: isoDays(-14) },
  { user_id: userId, kind: "saida", amount: 300, description: "Saída - freelancer motion", category: "Equipe", client_name: "mori", transaction_date: isoDays(-4) },
  { user_id: userId, kind: "saida", amount: 69.9, description: "Saída - banco de músicas", category: "Assinaturas", client_name: "", transaction_date: isoDays(-12) },
  { user_id: userId, kind: "saida", amount: 145, description: "Saída - assets premium", category: "Recursos", client_name: "", transaction_date: isoDays(-6) },
])
fail("criar financeiro", financeError)

const { error: expensesError } = await supabase.from("fixed_expenses").insert([
  { user_id: userId, name: "Adobe Creative Cloud", amount: 89.9, category: "Software" },
  { user_id: userId, name: "Google Drive", amount: 19.9, category: "Armazenamento" },
  { user_id: userId, name: "Internet fibra", amount: 119.9, category: "Operação" },
  { user_id: userId, name: "Banco de músicas", amount: 69.9, category: "Assinaturas" },
])
fail("criar gastos fixos", expensesError)

const quotePayload = [
  {
    editor_id: userId,
    client_name: "Luma Labs HQ",
    client_contact: "contato@lumalabs.co",
    video_type: "reels",
    duration: "1-3min",
    level: "premium",
    extras: { legenda: true, motion: true, thumb: true, categoryLabel: "Reels / Shorts" },
    total_price: 1045,
    deadline: "5 dias úteis",
    status: "finalizado",
    form_answers: { objetivo: "Campanha de lançamento", formato: "Reels", referencias: "Apple/Stripe style" },
    pricing_breakdown: { category: { label: "Reels / Shorts", price: 70 }, addOns: [{ label: "Motion", price: 90 }, { label: "Thumbnail", price: 35 }] },
    calculated_price: 1045,
    manual_adjustment: 0,
    editor_message: "Incluí motion e thumbnail para deixar a campanha mais forte.",
    finalized_at: isoDays(-2),
    created_at: isoDays(-4),
  },
  {
    editor_id: userId,
    client_name: "Beto Shorts",
    client_contact: "81988881234",
    video_type: "podcast",
    duration: "31-60s",
    level: "profissional",
    extras: { legenda: true, motion: false, thumb: true, categoryLabel: "Corte de podcast" },
    total_price: 850,
    deadline: "3 dias úteis",
    status: "pendente",
    form_answers: { objetivo: "Cortes semanais", quantidade: "5 vídeos" },
    pricing_breakdown: { category: { label: "Corte de podcast", price: 150 }, addOns: [{ label: "Thumbnail", price: 35 }] },
    calculated_price: 900,
    manual_adjustment: -50,
    editor_message: "Desconto aplicado por pacote semanal.",
    created_at: isoDays(-3),
  },
  {
    editor_id: userId,
    client_name: "mori",
    client_contact: "@mori.motion",
    video_type: "institucional",
    duration: "ate-30s",
    level: "premium",
    extras: { legenda: false, motion: true, thumb: false, categoryLabel: "Motion pack" },
    total_price: 1200,
    deadline: "4 dias úteis",
    status: "draft",
    form_answers: { objetivo: "Pack de motions para conteúdo recorrente" },
    pricing_breakdown: { category: { label: "Motion pack", price: 1200 }, addOns: [] },
    calculated_price: 1200,
    manual_adjustment: 0,
    editor_message: "Rascunho salvo para revisar antes de enviar.",
    created_at: isoDays(-1),
  },
  {
    editor_id: userId,
    client_name: "Catarina Beauty",
    client_contact: "81981112233",
    video_type: "reels",
    duration: "31-60s",
    level: "essencial",
    extras: { legenda: true, motion: false, thumb: false, categoryLabel: "Reels / Shorts" },
    total_price: 390,
    deadline: "2 dias úteis",
    status: "pendente",
    form_answers: { objetivo: "Reels de transformação", estilo: "clean / beauty" },
    pricing_breakdown: { category: { label: "Reels / Shorts", price: 70 }, addOns: [{ label: "Legenda", price: 40 }] },
    calculated_price: 390,
    manual_adjustment: 0,
    editor_message: "Orçamento para primeira entrega.",
    created_at: isoDays(0),
  },
]

const { error: quoteError } = await supabase.from("quote_requests").insert(quotePayload)
if (isMissingColumn(quoteError)) {
  const legacyQuotePayload = quotePayload.map((quote) => ({
    editor_id: quote.editor_id,
    client_name: quote.client_name,
    client_contact: quote.client_contact,
    video_type: quote.video_type,
    duration: quote.duration,
    level: quote.level,
    extras: quote.extras,
    total_price: quote.total_price,
    deadline: quote.deadline,
    created_at: quote.created_at,
  }))
  const { error } = await supabase.from("quote_requests").insert(legacyQuotePayload)
  fail("criar orçamentos legacy", error)
} else {
  fail("criar orçamentos", quoteError)
}

console.log(JSON.stringify({
  ok: true,
  userId,
  clients: clients.length,
  tasks: tasks.length,
  financeTransactions: demoFinanceDescriptions.length,
  fixedExpenses: demoExpenseNames.length,
  quotes: demoQuoteClients.length,
}, null, 2))
