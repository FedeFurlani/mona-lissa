import { useMemo, useState } from "react";
import { products, saphirusCategories, type SaphirusFilterId } from "../data/catalog";
import { formatPrice } from "../lib/money";
import { asset } from "../lib/assets";
import { catalogRequestMessage, consultProductMessage, whatsappUrl } from "../lib/whatsapp";
import type { Product } from "../types";
import { BottleMark, IconClose, IconHeart, IconSearch, IconWhatsApp } from "./Icons";
import { PedidoControls } from "./PedidoControls";

const FAV_KEY = "mona-lissa-favs";

function readFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function matchesQuery(product: Product, query: string) {
  if (!query) return true;
  return [product.name, product.brand, product.scent, product.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function Catalog() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SaphirusFilterId>("todos");
  const [selected, setSelected] = useState<Product | null>(null);
  const [favs, setFavs] = useState<string[]>(readFavs);

  const q = query.trim().toLowerCase();

  const saphirusList = useMemo(() => {
    return products.filter((product) => {
      if (product.category === "avon" || product.category === "combos") return false;
      if (filter === "favoritos" && !favs.includes(product.id)) return false;
      if (filter !== "todos" && filter !== "favoritos" && product.category !== filter) return false;
      return matchesQuery(product, q);
    });
  }, [q, filter, favs]);

  const avonList = useMemo(() => {
    return products.filter((product) => product.category === "avon" && matchesQuery(product, q));
  }, [q]);

  function toggleFav(id: string) {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <>
      <section className="catalog" id="catalogo">
        <div className="section-head">
          <div>
            <p className="eyebrow">Saphirus</p>
            <h2>Textiles, ambientes, auto y equipos.</h2>
          </div>
          <p className="section-note">
            Los precios son de referencia. La entrega se acuerda después de hacer el pedido.
          </p>
        </div>

        <div className="filters">
          <label className="search">
            <IconSearch />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar aroma o producto"
            />
          </label>
          <div className="chips">
            {saphirusCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                className={filter === item.id ? "chip active" : "chip"}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {saphirusList.length === 0 ? (
          <p className="empty">
            {filter === "favoritos" && !q
              ? "Todavía no marcaste favoritos. Tocá el corazón en un producto para guardarlo acá."
              : "No encontré eso. Probá otro aroma."}
          </p>
        ) : (
          <ProductGrid
            products={saphirusList}
            favs={favs}
            onFav={toggleFav}
            onOpen={setSelected}
          />
        )}
      </section>

      <section className="catalog avon-catalog" id="avon">
        <div className="section-head">
          <div>
            <p className="eyebrow">Avon</p>
            <h2>Fragancias y el catálogo de campaña.</h2>
          </div>
          <a className="btn btn-pink" href={whatsappUrl(catalogRequestMessage())} target="_blank" rel="noreferrer">
            <IconWhatsApp size={18} />
            Pedir catálogo Avon
          </a>
        </div>

        {avonList.length === 0 ? (
          <p className="empty">No encontré eso en Avon. Pedime el catálogo de la campaña.</p>
        ) : (
          <ProductGrid products={avonList} favs={favs} onFav={toggleFav} onOpen={setSelected} />
        )}
      </section>

      {selected && (
        <ProductModal
          product={selected}
          fav={favs.includes(selected.id)}
          onFav={() => toggleFav(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function ProductGrid({
  products: list,
  favs,
  onFav,
  onOpen,
}: {
  products: Product[];
  favs: string[];
  onFav: (id: string) => void;
  onOpen: (product: Product) => void;
}) {
  return (
    <div className="grid">
      {list.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          fav={favs.includes(product.id)}
          onFav={() => onFav(product.id)}
          onOpen={() => onOpen(product)}
        />
      ))}
    </div>
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
          <button className={fav ? "icon-btn on" : "icon-btn"} type="button" onClick={onFav} aria-label="Favorito">
            <IconHeart filled={fav} />
          </button>
        </div>
        <PedidoControls product={product} onNeedVariant={onOpen} />
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
  const [variant, setVariant] = useState(product.variants?.[0] ?? "");

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
          <p className="modal-price">{formatPrice(product.price)}</p>
          <div className="modal-actions">
            <PedidoControls product={product} variant={product.variants ? variant : undefined} />
            <a
              className="btn btn-ghost"
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
