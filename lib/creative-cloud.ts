const CREATIVE_CLOUD_SUPPORT_WHATSAPP = "5581997985738"

export const getCreativeCloudSubscribedAt = (redeemAvailableUntil?: string) => {
  const redeemUntil = redeemAvailableUntil ? new Date(redeemAvailableUntil) : null

  if (!redeemUntil || Number.isNaN(redeemUntil.getTime())) {
    return new Date()
  }

  const subscribedAt = new Date(redeemUntil)
  subscribedAt.setDate(subscribedAt.getDate() - 3)
  return subscribedAt
}

export const getCreativeCloudRedeemWhatsAppUrl = (redeemAvailableUntil?: string) => {
  const subscribedAt = getCreativeCloudSubscribedAt(redeemAvailableUntil)
  const subscribedDate = subscribedAt.toLocaleDateString("pt-BR")
  const message = `quero resgatar minha assinatura da creative cloud, assinei dia ${subscribedDate} e desejo acesso de 1 mês`

  return `https://wa.me/${CREATIVE_CLOUD_SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`
}
