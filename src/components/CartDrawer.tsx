import { useState } from "react";
import { productById } from "../data/catalog";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/money";
import { buildOrderMessage, orderLines, whatsappUrl } from "../lib/whatsapp";
import { ConfirmDialog } from "./ConfirmDialog";
import { IconClose, IconWhatsApp } from "./Icons";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const { items, setQuantity, remove, total, clear, count } = useCart();
  const [aviso, setAviso] = useState<"vaciar" | "enviar" | null>(null);
  const activos = items.filter((item) => item.quantity > 0);
  const orderUrl = whatsappUrl(buildOrderMessage(activos, total));

  return (
    <>
      <div className={open ? "drawer-root open" : "drawer-root"}>
        <button className="drawer-backdrop" type="button" onClick={onClose} aria-label="Cerrar pedido" />
        <aside className="drawer" role="dialog" aria-label="Tu pedido">
          <header>
            <h2>Tu pedido</h2>
            <div className="drawer-head-actions">
              {activos.length > 0 && (
                <button className="linkish danger" type="button" onClick={() => setAviso("vaciar")}>
                  Vaciar
                </button>
              )}
              <button className="icon-btn" type="button" onClick={onClose} aria-label="Cerrar">
                <IconClose />
              </button>
            </div>
          </header>

          {activos.length === 0 ? (
            <p className="empty">Tu carrito está vacío</p>
          ) : (
            <>
              <ul className="cart-list">
                {activos.map((item) => {
                  const product = productById[item.productId];
                  const unit = product.price === 0 ? "Consulta" : `${formatPrice(product.price)} c/u`;
                  return (
                    <li key={item.key} className="cart-item">
                      <div className="cart-item-copy">
                        <strong>{product.name}</strong>
                        {item.variant && <small>{item.variant}</small>}
                        <small>{unit}</small>
                        <button className="linkish" type="button" onClick={() => remove(item.key)}>
                          Eliminar
                        </button>
                      </div>
                      <div className="qty-pill">
                        <button type="button" onClick={() => setQuantity(item.key, item.quantity - 1)} aria-label="Quitar uno">
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => setQuantity(item.key, item.quantity + 1)} aria-label="Sumar uno">
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <footer className="drawer-foot">
                <p className="pedido-total">
                  <span>Total</span>
                  <strong>{total > 0 ? formatPrice(total) : "A confirmar"}</strong>
                </p>
                <button className="btn btn-whatsapp" type="button" disabled={count === 0} onClick={() => setAviso("enviar")}>
                  <IconWhatsApp size={18} />
                  Hacer pedido por WhatsApp
                </button>
                <p className="entrega-nota">La entrega se acuerda después de hacer el pedido.</p>
              </footer>
            </>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={aviso === "vaciar"}
        title="Vaciar pedido"
        text="¿Querés sacar todos los productos del pedido?"
        onClose={() => setAviso(null)}
        actions={[
          { label: "Cancelar" },
          { label: "Vaciar", danger: true, onClick: clear },
        ]}
      />
      <ConfirmDialog
        open={aviso === "enviar"}
        title="Enviar pedido"
        text="La entrega se acuerda después de hacer el pedido."
        detail={[...orderLines(activos), total > 0 ? `Total: ${formatPrice(total)}` : "Total: a confirmar"]}
        onClose={() => setAviso(null)}
        actions={[
          { label: "Volver" },
          { label: "WhatsApp", href: orderUrl, primary: true },
        ]}
      />
    </>
  );
}
