import { news } from "../data/news";
import { products } from "../data/catalog";
import { whatsappUrl } from "../lib/whatsapp";
import { formatPrice } from "../lib/money";
import { OWNER, WHATSAPP_DISPLAY } from "../config";
import { PedidoControls } from "./PedidoControls";
import { asset } from "../lib/assets";
import { IconWhatsApp } from "./Icons";

export function Combos() {
  const combos = products.filter((product) => product.category === "combos");

  return (
    <section className="combos" id="combos">
      <div className="section-head">
        <div>
          <p className="eyebrow">Combos</p>
          <h2>Ahorrá eligiendo de a dos o de a tres.</h2>
        </div>
        <a className="ghost-link" href="#catalogo">
          Ver todo el catálogo
        </a>
      </div>
      <div className="combo-grid">
        {combos.map((product) => (
          <article key={product.id} className="combo-card">
            <p className="tag">Promo</p>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="card-row">
              <strong>
                {formatPrice(product.price)}
                {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
              </strong>
            </div>
            <PedidoControls product={product} variant={product.variants?.[0]} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function News() {
  return (
    <section className="news" id="novedades">
      <div className="section-head">
        <div>
          <p className="eyebrow">Novedades</p>
          <h2>Lo que está llegando este mes.</h2>
        </div>
      </div>
      <div className="news-grid">
        {news.map((item) => (
          <article key={item.id} className="news-card">
            {item.image && <img src={asset(item.image)} alt="" />}
            <div>
              <p className="tag">
                {item.tag} · {item.date}
              </p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="how" id="como-pedir">
      <div className="section-head">
        <div>
          <p className="eyebrow">Cómo pedir</p>
          <h2>Armá el pedido y mandalo por WhatsApp.</h2>
        </div>
      </div>
      <ol className="steps">
        <li>
          <span>01</span>
          <h3>Recorré el catálogo</h3>
          <p>Elegí algo de Saphirus o de Avon y tocá Agregar al pedido.</p>
        </li>
        <li>
          <span>02</span>
          <h3>Ajustá cantidades</h3>
          <p>Con Otro y Quitar armás exactamente lo que querés. El pedido se guarda en este celular.</p>
        </li>
        <li>
          <span>03</span>
          <h3>Mandalo por WhatsApp</h3>
          <p>Confirmá el detalle y se abre el mensaje a {WHATSAPP_DISPLAY}.</p>
        </li>
        <li>
          <span>04</span>
          <h3>La entrega se acuerda después</h3>
          <p>Después del pedido coordinamos stock, pago y cómo lo recibís.</p>
        </li>
      </ol>
    </section>
  );
}

export function About() {
  return (
    <section className="about" id="ana">
      <div className="about-copy">
        <p className="eyebrow">Quién te atiende</p>
        <h2>Hola, mi nombre es {OWNER}.</h2>
        <p>
          Soy revendedora de Saphirus y Avon. Te armo el pedido a medida: fragancias para telas,
          ambientes, el auto y cosmética de campaña. Consultame por los catálogos y coordinamos
          entrega.
        </p>
        <a className="btn btn-pink" href={whatsappUrl(`Hola ${OWNER}! 🌸 Te escribo desde el catálogo de Mona Lissa.`)} target="_blank" rel="noreferrer">
          <IconWhatsApp size={18} />
          Escribirme al {WHATSAPP_DISPLAY}
        </a>
      </div>
      <div className="about-visual">
        <img src={asset("/images/logo.png")} alt="Mona Lissa" />
        <img src={asset("/images/productos-grid.png")} alt="Productos" />
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={asset("/images/logo.png")} alt="" />
          <div>
            <strong>Mona Lissa</strong>
            <p>Fragancias · Saphirus y Avon</p>
            <p className="footer-note">Ana coordina la entrega después de tu pedido.</p>
          </div>
        </div>
        <a className="footer-wa" href={whatsappUrl("Hola Ana! 🌸")} target="_blank" rel="noreferrer">
          <IconWhatsApp size={22} />
          <span>
            <small>WhatsApp</small>
            <b>{WHATSAPP_DISPLAY}</b>
          </span>
        </a>
      </div>
    </footer>
  );
}

