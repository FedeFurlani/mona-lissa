import { useState } from "react";
import { productById } from "../data/catalog";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/money";
import { buildOrderMessage, whatsappUrl } from "../lib/whatsapp";
import type { CheckoutForm } from "../types";
import { IconClose, IconWhatsApp } from "./Icons";

type Props = {
  open: boolean;
  onClose: () => void;
};

const emptyForm: CheckoutForm = {
  name: "",
  zone: "",
  delivery: "entrega",
  notes: "",
};

export function CartDrawer({ open, onClose }: Props) {
  const { items, setQuantity, remove, total, clear } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function sendOrder() {
    if (!form.name.trim()) return;
    const url = whatsappUrl(buildOrderMessage(items, form, total));
    window.open(url, "_blank", "noopener,noreferrer");
    clear();
    setForm(emptyForm);
    setCheckout(false);
    onClose();
  }

  return (
    <div className={open ? "drawer-root open" : "drawer-root"}>
      <button className="drawer-backdrop" type="button" onClick={onClose} aria-label="Cerrar carrito" />
      <aside className="drawer" role="dialog" aria-label="Carrito">
        <header>
          <h2>Tu pedido</h2>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </header>

        {items.length === 0 ? (
          <p className="empty">El carrito está vacío. Sumá un aroma y lo armamos juntas.</p>
        ) : checkout ? (
          <form
            className="checkout"
            onSubmit={(e) => {
              e.preventDefault();
              sendOrder();
            }}
          >
            <label className="field">
              Tu nombre
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ana, María..."
              />
            </label>
            <label className="field">
              Zona o barrio
              <input
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
                placeholder="Para coordinar la entrega"
              />
            </label>
            <fieldset className="segment">
              <legend>Cómo lo recibís</legend>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  checked={form.delivery === "entrega"}
                  onChange={() => setForm({ ...form, delivery: "entrega" })}
                />
                Coordinar entrega
              </label>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  checked={form.delivery === "retiro"}
                  onChange={() => setForm({ ...form, delivery: "retiro" })}
                />
                Retiro a convenir
              </label>
            </fieldset>
            <label className="field">
              Notas
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Aromas a elección, horario, si es para regalo..."
              />
            </label>
            <p className="checkout-total">
              Total estimado <strong>{formatPrice(total)}</strong>
            </p>
            <div className="drawer-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setCheckout(false)}>
                Volver
              </button>
              <button className="btn btn-pink" type="submit">
                <IconWhatsApp size={18} />
                Enviar a WhatsApp
              </button>
            </div>
          </form>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((item) => {
                const product = productById[item.productId];
                return (
                  <li key={item.key}>
                    <div>
                      <strong>{product.name}</strong>
                      {item.variant && <small>{item.variant}</small>}
                      <b>{formatPrice(product.price * item.quantity)}</b>
                    </div>
                    <div className="qty tiny">
                      <button type="button" onClick={() => setQuantity(item.key, item.quantity - 1)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => setQuantity(item.key, item.quantity + 1)}>
                        +
                      </button>
                      <button className="linkish" type="button" onClick={() => remove(item.key)}>
                        Quitar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <footer className="drawer-foot">
              <p>
                Total estimado <strong>{formatPrice(total)}</strong>
              </p>
              <p className="hint">Ana confirma precio, stock y entrega por WhatsApp.</p>
              <div className="drawer-actions">
                <button className="btn btn-ghost" type="button" onClick={clear}>
                  Vaciar
                </button>
                <button className="btn btn-dark" type="button" onClick={() => setCheckout(true)}>
                  Pedir por WhatsApp
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
