import { BRAND_FULL, OWNER, WHATSAPP_NUMBER } from "../config";
import { productById } from "../data/catalog";
import type { CartItem, CheckoutForm } from "../types";
import { formatPrice } from "./money";

export function whatsappUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function consultProductMessage(name: string, variant?: string): string {
  const extra = variant ? ` (${variant})` : "";
  return `Hola ${OWNER}! 🌸 Vi *${name}*${extra} en el catálogo de ${BRAND_FULL} y quería consultarte stock y entrega.`;
}

export function catalogRequestMessage(): string {
  return `Hola ${OWNER}! 🌸 Soy de ${BRAND_FULL}. ¿Me pasás el catálogo de Avon vigente y me contás cómo armar el pedido?`;
}

export function buildOrderMessage(items: CartItem[], form: CheckoutForm, total: number): string {
  const lines = items.map((item) => {
    const product = productById[item.productId];
    const variant = item.variant ? ` — ${item.variant}` : "";
    const lineTotal = product.price * item.quantity;
    const priceBit = product.price === 0 ? "consulta" : formatPrice(lineTotal);
    return `• ${item.quantity}× ${product.name}${variant} (${priceBit})`;
  });

  const delivery = form.delivery === "entrega" ? "Coordinar entrega" : "Retiro a convenir";

  return [
    `Hola ${OWNER}! 🌸 Quiero hacer un pedido en *${BRAND_FULL}*`,
    "",
    ...lines,
    "",
    `*Total estimado:* ${formatPrice(total)}`,
    "_Los precios se confirman al armar el pedido._",
    "",
    `*Nombre:* ${form.name}`,
    `*Zona:* ${form.zone || "A coordinar"}`,
    `*Modalidad:* ${delivery}`,
    form.notes ? `*Notas:* ${form.notes}` : "*Notas:* —",
  ].join("\n");
}
