import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de privacidade | Mallow",
  description: "Política de privacidade da plataforma Mallow.",
}

const sections = [
  {
    title: "1. Quem somos",
    body: [
      "A Mallow é uma plataforma SaaS para editores de vídeo organizarem clientes, propostas, produção, aprovações, arquivos, financeiro, página profissional e recursos de operação.",
      "Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos dados pessoais quando você acessa ou utiliza a plataforma.",
      "Para fins de contato sobre privacidade e LGPD, utilize o e-mail oficial mallowdigital@yahoo.com.",
    ],
  },
  {
    title: "2. Dados que podemos coletar",
    body: [
      "Dados de conta: nome, e-mail, foto de perfil, identificadores de autenticação, preferências, plano contratado e informações necessárias para login.",
      "Dados de operação: clientes cadastrados, projetos, propostas, valores, status, prazos, comentários, links de aprovação, recursos salvos, sugestões enviadas e informações financeiras inseridas pelo usuário.",
      "Dados de integrações: quando você conecta serviços externos, como Google Drive, podemos tratar dados necessários para vincular pastas, arquivos, links, permissões e status da integração.",
      "Dados técnicos: endereço IP, navegador, dispositivo, registros de acesso, eventos de uso, erros, páginas acessadas e dados necessários para segurança, melhoria e diagnóstico da plataforma.",
      "Dados de pagamento: informações de assinatura, plano, status de pagamento e identificadores de transação. Dados completos de cartão são processados por provedores externos e não ficam armazenados pela Mallow.",
    ],
  },
  {
    title: "3. Como usamos os dados",
    body: [
      "Usamos os dados para criar e autenticar contas, entregar funcionalidades da plataforma, salvar preferências, organizar clientes e projetos, gerar links de aprovação, processar assinaturas, prestar suporte e melhorar a experiência.",
      "Também podemos usar dados técnicos para prevenir fraude, proteger a segurança da plataforma, corrigir erros, cumprir obrigações legais e entender quais recursos precisam ser melhorados.",
    ],
  },
  {
    title: "4. Base legal e LGPD",
    body: [
      "Tratamos dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD), incluindo hipóteses como execução de contrato, consentimento, cumprimento de obrigação legal, exercício regular de direitos e legítimo interesse.",
      "Quando o tratamento depender de consentimento, você poderá revogá-lo, respeitados os efeitos de tratamentos já realizados e obrigações legais aplicáveis.",
    ],
  },
  {
    title: "5. Compartilhamento com terceiros",
    body: [
      "Podemos compartilhar dados com fornecedores necessários para operar a plataforma, como hospedagem, autenticação, banco de dados, armazenamento, pagamentos, analytics, envio de e-mails, suporte e integrações autorizadas por você.",
      "Esses terceiros devem tratar os dados apenas conforme necessário para prestar seus serviços. A Mallow não vende dados pessoais de usuários.",
    ],
  },
  {
    title: "6. Google Drive e arquivos",
    body: [
      "Quando você conecta o Google Drive, a Mallow utiliza as permissões concedidas para executar ações solicitadas, como listar, vincular, copiar, abrir ou organizar arquivos relacionados à sua operação.",
      "Você pode revogar permissões diretamente na sua conta Google ou nas configurações da plataforma, quando disponível. Revogar a integração pode limitar funcionalidades dependentes do Drive.",
    ],
  },
  {
    title: "7. Cookies e tecnologias semelhantes",
    body: [
      "Podemos usar cookies, armazenamento local e tecnologias semelhantes para manter sessão, lembrar preferências, medir uso, melhorar desempenho e reforçar segurança.",
      "Você pode configurar seu navegador para bloquear cookies, mas isso pode afetar o funcionamento de login, preferências e recursos da plataforma.",
    ],
  },
  {
    title: "8. Segurança",
    body: [
      "Adotamos medidas técnicas e organizacionais para proteger dados contra acesso não autorizado, perda, alteração, vazamento ou uso indevido.",
      "Nenhum sistema é totalmente imune a riscos. Por isso, recomendamos que você use senha forte, não compartilhe credenciais e mantenha controle sobre os acessos vinculados à sua conta.",
    ],
  },
  {
    title: "9. Retenção e exclusão",
    body: [
      "Mantemos dados pelo tempo necessário para prestar o serviço, cumprir obrigações legais, resolver disputas, prevenir fraude, manter segurança e preservar registros operacionais.",
      "Você pode solicitar exclusão ou correção de dados. Algumas informações podem permanecer armazenadas quando houver obrigação legal, necessidade de auditoria, segurança ou exercício regular de direitos.",
    ],
  },
  {
    title: "10. Direitos do titular",
    body: [
      "Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade, informação sobre compartilhamento e revisão de decisões automatizadas, quando aplicável.",
      "Para exercer seus direitos, envie uma solicitação para mallowdigital@yahoo.com. Podemos pedir informações adicionais para confirmar sua identidade antes de atender ao pedido.",
    ],
  },
  {
    title: "11. Menores de idade",
    body: [
      "A Mallow não é direcionada a crianças. Caso identifiquemos uso indevido por menor sem autorização adequada, poderemos remover dados e restringir a conta.",
    ],
  },
  {
    title: "12. Transferência internacional",
    body: [
      "Alguns fornecedores de infraestrutura e tecnologia podem processar dados fora do Brasil. Nesses casos, buscamos utilizar provedores com medidas adequadas de segurança e proteção de dados.",
    ],
  },
  {
    title: "13. Alterações desta política",
    body: [
      "Esta Política pode ser atualizada para refletir melhorias, novas funcionalidades, exigências legais ou mudanças operacionais. A versão mais recente estará sempre disponível nesta página.",
    ],
  },
  {
    title: "14. Contato",
    body: [
      "Para dúvidas sobre privacidade, proteção de dados, exercício de direitos ou solicitações relacionadas à sua conta, entre em contato pelo e-mail oficial mallowdigital@yahoo.com.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f6fafb] text-[#254342]">
      <LegalHeader />
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm font-semibold tracking-[-0.035em] text-[#62bd36]">Última atualização: 20 de maio de 2026</p>
        <h1 className="mt-4 text-[42px] font-semibold leading-[1.02] tracking-[-0.075em] text-[#254342] sm:text-[62px]">
          Política de privacidade
        </h1>
        <p className="mt-5 max-w-3xl text-[18px] font-medium leading-8 tracking-[-0.04em] text-[#667085]">
          Esta política explica como a Mallow trata dados pessoais e informações da sua operação dentro da plataforma.
        </p>

        <div className="mt-10 rounded-[18px] border border-[#e3e9ef] bg-white p-5 shadow-[0_20px_60px_rgba(37,67,66,0.05)] sm:p-8">
          <div className="space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-[22px] font-semibold tracking-[-0.055em] text-[#254342]">{section.title}</h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-[16px] font-medium leading-8 tracking-[-0.035em] text-[#667085]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function LegalHeader() {
  return (
    <header className="border-b border-[#e3e9ef] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 overflow-hidden rounded-[10px] bg-white">
            <Image src="/logo.png" alt="Mallow" width={40} height={40} className="h-full w-full object-contain" />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.04em] text-[#254342]">Mallow</span>
        </Link>
        <Link href="/cadastro" className="rounded-full bg-[#9de96c] px-5 py-2.5 text-sm font-semibold tracking-[-0.035em] text-[#21351f] transition-colors hover:bg-[#8bdd5c]">
          Começar agora
        </Link>
      </div>
    </header>
  )
}
