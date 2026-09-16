import { BRAND, OWNER, WHATSAPP_NUMBER } from "../config";
import { productById } from "../data/catalog";
import type { CartItem } from "../types";
import { formatPrice } from "./money";

export function whatsappUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function consultProductMessage(name: string, variant?: string): string {
  const extra = variant ? ` (${variant})` : "";
  return `Hola ${OWNER}! 🌸 Vi *${name}*${extra} en el catálogo de ${BRAND} y quería consultarte stock y entrega.`;
}

export function catalogRequestMessage(): string {
  return `Hola ${OWNER}! 🌸 Soy de ${BRAND}. ¿Me pasás el catálogo de Avon vigente y me contás cómo armar el pedido?`;
}

export function orderLines(items: CartItem[]): string[] {
  return items
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const product = productById[item.productId];
      const variant = item.variant ? ` — ${item.variant}` : "";
      const subtotal = product.price === 0 ? "a confirmar" : formatPrice(product.price * item.quantity);
      return `${item.quantity} × ${product.name}${variant} — ${subtotal}`;
    });
}

export function buildOrderMessage(items: CartItem[], total: number): string {
  const pedidos = items.filter((item) => item.quantity > 0);
  const sinPrecio = pedidos.some((item) => (productById[item.productId]?.price ?? 0) === 0);
  const lineas = pedidos.map((item) => {
    const product = productById[item.productId];
    const variant = item.variant ? ` ${item.variant}` : "";
    const subtotal = product.price === 0 ? "a confirmar" : formatPrice(product.price * item.quantity);
    return `👉 *${item.quantity}x* ${product.name}${variant} — ${subtotal}`;
  });

  const partes = [
    `¡Hola ${BRAND}! 🌸`,
    "Quiero realizar el siguiente pedido:",
    "",
    ...lineas,
    "",
  ];
  if (total > 0) partes.push(`*Subtotal: ${formatPrice(total)}*`);
  partes.push("Entrega: a acordar después del pedido");
  if (total > 0) {
    partes.push(`*Total: ${formatPrice(total)}*${sinPrecio ? " (hay productos sin precio en la lista)" : ""}`);
  }
  partes.push("", "¿Me confirmarían disponibilidad? ¡Gracias!");
  return partes.join("\n");
}
