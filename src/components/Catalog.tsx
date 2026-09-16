import { useMemo, useState } from "react";
import { categories, products } from "../data/catalog";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/money";
import { asset } from "../lib/assets";
import { consultProductMessage, whatsappUrl } from "../lib/whatsapp";
import type { CategoryId, Product } from "../types";
import { BottleMark, IconClose, IconHeart, IconSearch, IconWhatsApp } from "./Icons";

const FAV_KEY = "mona-lissa-favs";

function readFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function Catalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "todos">("todos");
  const [selected, setSelected] = useState<Product | null>(null);
  const [favs, setFavs] = useState<string[]>(readFavs);
  const [onlyFavs, setOnlyFavs] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (onlyFavs && !favs.includes(product.id)) return false;
      if (category !== "todos" && product.category !== category) return false;
      if (!q) return true;
      return [product.name, product.brand, product.scent, product.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, category, onlyFavs, favs]);

  function toggleFav(id: string) {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <section className="catalog" id="catalogo">
      <div className="section-head">
        <div>
          <p className="eyebrow">El catálogo</p>
          <h2>Elegí, sumá al carrito y mandame el pedido.</h2>
        </div>
        <p className="section-note">
          Los precios son de referencia y los confirmo por WhatsApp según stock y campaña.
        </p>
      </div>

      <div className="filters">
        <label className="search">
          <IconSearch />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar aroma, marca o producto"
          />
        </label>
        <div className="chips">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={category === item.id ? "chip active" : "chip"}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className={onlyFavs ? "chip active" : "chip"}
            onClick={() => setOnlyFavs((v) => !v)}
          >
            Favoritos
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">No encontré eso. Probá otro aroma o pedime el catálogo Avon.</p>
      ) : (
        <div className="grid">
          {list.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              fav={favs.includes(product.id)}
              onFav={() => toggleFav(product.id)}
              onOpen={() => setSelected(product)}
            />
          ))}
        </div>
      )}

      {selected && (
        <ProductModal
          product={selected}
          fav={favs.includes(selected.id)}
          onFav={() => toggleFav(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function ProductCard({
  product,
  fav,
  onFav,
  onOpen,
}: {
  product: Product;
  fav: boolean;
  onFav: () => void;
  onOpen: () => void;
}) {
  const { add } = useCart();
  const needsVariant = Boolean(product.variants?.length);

  return (
    <article className="card">
      <button className="card-visual" type="button" onClick={onOpen} style={{ background: product.color }}>
        {product.image ? (
          <img src={asset(product.image)} alt="" />
        ) : (
          <BottleMark color={product.accent} />
        )}
        {product.badges?.map((badge) => (
          <span key={badge} className={`badge badge-${badge}`}>
            {badge}
          </span>
        ))}
      </button>
      <div className="card-body">
        <p className="brand-line">{product.brand}</p>
        <h3>{product.name}</h3>
        <p className="meta">
          {product.size}
          {product.scent ? ` · ${product.scent}` : ""}
        </p>
        <div className="card-row">
          <strong>
            {formatPrice(product.price)}
            {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
          </strong>
          <div className="card-actions">
            <button className={fav ? "icon-btn on" : "icon-btn"} type="button" onClick={onFav} aria-label="Favorito">
              <IconHeart filled={fav} />
            </button>
            <button
              className="btn btn-tiny"
              type="button"
              onClick={() => (needsVariant ? onOpen() : add(product.id))}
            >
              {needsVariant ? "Elegir" : "Sumar"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductModal({
  product,
  fav,
  onFav,
  onClose,
}: {
  product: Product;
  fav: boolean;
  onFav: () => void;
  onClose: () => void;
}) {
  const { add } = useCart();
  const [variant, setVariant] = useState(product.variants?.[0] ?? "");
  const [qty, setQty] = useState(1);

  function addToCart() {
    add(product.id, qty, product.variants ? variant : undefined);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn close" type="button" onClick={onClose} aria-label="Cerrar">
          <IconClose />
        </button>
        <div className="modal-visual" style={{ background: product.color }}>
          {product.image ? <img src={asset(product.image)} alt="" /> : <BottleMark color={product.accent} />}
        </div>
        <div className="modal-body">
          <p className="brand-line">{product.brand}</p>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          {product.notes && <p className="notes">{product.notes}</p>}
          {product.variants && (
            <label className="field">
              {product.variantLabel}
              <select value={variant} onChange={(e) => setVariant(e.target.value)}>
                {product.variants.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          )}
          <div className="qty">
            <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))}>
              −
            </button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((n) => n + 1)}>
              +
            </button>
            <strong>{formatPrice(product.price * Math.max(qty, 1))}</strong>
          </div>
          <div className="modal-actions">
            <button className="btn btn-dark" type="button" onClick={addToCart}>
              {product.price === 0 ? "Pedir consulta" : "Sumar al carrito"}
            </button>
            <a
              className="btn btn-pink"
              href={whatsappUrl(consultProductMessage(product.name, variant || undefined))}
              target="_blank"
              rel="noreferrer"
            >
              <IconWhatsApp size={18} />
              Consultar
            </a>
            <button className={fav ? "icon-btn on" : "icon-btn"} type="button" onClick={onFav}>
              <IconHeart filled={fav} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
