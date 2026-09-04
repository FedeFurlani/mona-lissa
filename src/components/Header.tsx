import { useState } from "react";
import { BRAND, WHATSAPP_DISPLAY } from "../config";
import { useCart } from "../context/CartContext";
import { whatsappUrl } from "../lib/whatsapp";
import { IconCart, IconClose, IconWhatsApp } from "./Icons";

type Props = {
  onOpenCart: () => void;
};

const links = [
  ["#catalogo", "Catálogo"],
  ["#novedades", "Novedades"],
  ["#combos", "Combos"],
  ["#como-pedir", "Cómo pedir"],
  ["#ana", "Ana"],
] as const;

export function Header({ onOpenCart }: Props) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#inicio" onClick={() => setOpen(false)}>
          <img src="/images/logo.png" alt={BRAND} />
          <span>
            <strong>Mona Lissa</strong>
            <small>Fragancias</small>
          </span>
        </a>
        <nav className={open ? "nav open" : "nav"}>
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-btn menu-btn" type="button" onClick={() => setOpen((v) => !v)} aria-label="Menú">
            {open ? <IconClose /> : <MenuGlyph />}
          </button>
          <a className="ghost-link" href={whatsappUrl("Hola Ana! 🌸")} target="_blank" rel="noreferrer">
            <IconWhatsApp size={18} />
            <span className="hide-sm">{WHATSAPP_DISPLAY}</span>
          </a>
          <button className="cart-btn" type="button" onClick={onOpenCart} aria-label="Abrir carrito">
            <IconCart />
            {count > 0 && <em>{count}</em>}
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
