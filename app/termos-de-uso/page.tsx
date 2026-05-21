import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Termos de uso | Mallow",
  description: "Termos de uso da plataforma Mallow.",
}

const sections = [
  {
    title: "1. Aceitação dos termos",
    body: [
      "Ao criar uma conta, acessar ou utilizar a Mallow, você declara que leu, entendeu e concorda com estes Termos de Uso. Se você não concordar com algum ponto, não utilize a plataforma.",
      "A Mallow é uma plataforma SaaS voltada para editores de vídeo e profissionais criativos que precisam organizar clientes, propostas, produção, aprovações, arquivos, recursos e financeiro em um único ambiente.",
    ],
  },
  {
    title: "2. Conta e responsabilidade do usuário",
    body: [
      "Você é responsável por manter a confidencialidade das suas credenciais de acesso e por todas as atividades realizadas na sua conta.",
      "As informações inseridas na plataforma devem ser verdadeiras, atuais e compatíveis com a finalidade de uso. Você não deve criar contas falsas, usar dados de terceiros sem autorização ou tentar acessar áreas que não pertencem a você.",
    ],
  },
  {
    title: "3. Uso permitido da plataforma",
    body: [
      "Você pode utilizar a Mallow para gerenciar clientes, criar propostas, acompanhar produção, gerar links de aprovação, organizar dados financeiros, configurar página profissional, usar recursos internos e acessar funcionalidades disponíveis conforme o seu plano.",
      "É proibido usar a plataforma para atividades ilegais, envio de conteúdo malicioso, tentativa de invasão, engenharia reversa, exploração de falhas, spam, violação de direitos autorais ou qualquer conduta que prejudique outros usuários, a Mallow ou terceiros.",
    ],
  },
  {
    title: "4. Planos, teste grátis e pagamentos",
    body: [
      "A Mallow pode oferecer planos gratuitos, pagos, teste grátis por tempo limitado e funcionalidades liberadas conforme o nível de assinatura contratado.",
      "O teste grátis é disponibilizado uma única vez por conta, salvo autorização expressa da Mallow. Ao final do período de teste, recursos pagos podem ser bloqueados caso não exista assinatura ativa.",
      "Os pagamentos, quando aplicáveis, podem ser processados por provedores externos. A Mallow não armazena dados completos de cartão de crédito. Valores, recursos e condições comerciais podem ser atualizados mediante aviso ou publicação na própria plataforma.",
    ],
  },
  {
    title: "5. Conteúdos, arquivos e links de aprovação",
    body: [
      "Você mantém a titularidade dos conteúdos, arquivos, vídeos, informações de clientes e materiais inseridos na plataforma. Ao usar a Mallow, você concede permissão técnica para que esses dados sejam processados apenas na medida necessária para entregar as funcionalidades contratadas.",
      "Links de aprovação, comentários, versões de vídeo e dados de projeto são de responsabilidade do usuário que os cria. Você deve garantir que possui autorização para compartilhar arquivos, vídeos, marcas, imagens, músicas e demais materiais enviados pela plataforma.",
    ],
  },
  {
    title: "6. Integrações e serviços de terceiros",
    body: [
      "A Mallow pode se integrar a serviços como Google Drive, provedores de autenticação, ferramentas de pagamento, bancos de dados, analytics e infraestrutura de hospedagem.",
      "Esses serviços possuem termos e políticas próprias. Ao conectar uma integração, você autoriza a Mallow a acessar e tratar os dados necessários para executar a funcionalidade solicitada, respeitando as permissões concedidas por você.",
    ],
  },
  {
    title: "7. Marketplace, recursos e comunidade",
    body: [
      "Recursos, materiais, packs, vagas, comentários ou conteúdos compartilhados em áreas comunitárias devem respeitar direitos autorais, privacidade e boa-fé.",
      "A Mallow pode remover conteúdos, suspender acessos ou restringir funcionalidades quando houver violação destes Termos, denúncia relevante, risco de segurança ou uso abusivo.",
    ],
  },
  {
    title: "8. Disponibilidade e atualizações",
    body: [
      "A Mallow trabalha para manter a plataforma disponível e estável, mas não garante funcionamento ininterrupto, livre de erros ou imune a indisponibilidades causadas por manutenção, atualizações, internet, provedores externos ou eventos fora do nosso controle.",
      "Podemos modificar, melhorar, substituir ou descontinuar funcionalidades para aprimorar a experiência, segurança e desempenho da plataforma.",
    ],
  },
  {
    title: "9. Cancelamento e suspensão",
    body: [
      "Você pode deixar de usar a plataforma ou cancelar sua assinatura conforme as condições disponíveis no momento da contratação.",
      "A Mallow pode suspender ou encerrar contas em caso de fraude, inadimplência, violação destes Termos, risco à segurança, uso abusivo ou determinação legal.",
    ],
  },
  {
    title: "10. Limitação de responsabilidade",
    body: [
      "A Mallow não se responsabiliza por perdas indiretas, lucros cessantes, danos decorrentes de uso inadequado, falhas de terceiros, perda de acesso por credenciais comprometidas ou decisões comerciais tomadas com base em dados inseridos pelo próprio usuário.",
      "A plataforma é uma ferramenta de organização e operação. A responsabilidade por contratos, entregas, relacionamento com clientes, precificação, pagamentos externos e obrigações profissionais permanece com o usuário.",
    ],
  },
  {
    title: "11. Alterações destes termos",
    body: [
      "Estes Termos podem ser atualizados periodicamente. Quando houver mudanças relevantes, a Mallow poderá informar pela plataforma, por e-mail ou por outro meio razoável.",
      "O uso contínuo da plataforma após a atualização representa aceitação da versão mais recente.",
    ],
  },
  {
    title: "12. Privacidade e proteção de dados",
    body: [
      "O tratamento de dados pessoais realizado pela Mallow segue a nossa Política de Privacidade, disponível em /politica-de-privacidade.",
      "Ao utilizar a plataforma, você também concorda com as regras de tratamento de dados descritas nessa política.",
    ],
  },
  {
    title: "13. Contato",
    body: [
      "Em caso de dúvidas sobre estes Termos, sua conta ou o uso da plataforma, fale com a Mallow pelo e-mail oficial mallowdigital@yahoo.com.",
    ],
  },
]

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-[#f6fafb] text-[#254342]">
      <LegalHeader />
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm font-semibold tracking-[-0.035em] text-[#62bd36]">Última atualização: 20 de maio de 2026</p>
        <h1 className="mt-4 text-[42px] font-semibold leading-[1.02] tracking-[-0.075em] text-[#254342] sm:text-[62px]">
          Termos de uso
        </h1>
        <p className="mt-5 max-w-3xl text-[18px] font-medium leading-8 tracking-[-0.04em] text-[#667085]">
          Estes termos explicam as regras para usar a Mallow, uma plataforma criada para editores organizarem sua operação profissional.
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
