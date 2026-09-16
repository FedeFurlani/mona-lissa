import { news } from "../data/news";
import { products } from "../data/catalog";
import { whatsappUrl } from "../lib/whatsapp";
import { formatPrice } from "../lib/money";
import { useCart } from "../context/CartContext";
import { OWNER, WHATSAPP_DISPLAY } from "../config";
import { asset } from "../lib/assets";
import { IconWhatsApp } from "./Icons";

export function Combos() {
  const { add } = useCart();
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
              <button className="btn btn-tiny" type="button" onClick={() => add(product.id, 1, product.variants?.[0])}>
                Sumar
              </button>
            </div>
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
          <h2>Cuatro pasos y el aroma está en camino.</h2>
        </div>
      </div>
      <ol className="steps">
        <li>
          <span>01</span>
          <h3>Recorré el catálogo</h3>
          <p>Filtrá por textiles, auto, equipos o Avon. Si no ves un aroma, consultame igual.</p>
        </li>
        <li>
          <span>02</span>
          <h3>Armá el carrito</h3>
          <p>Sumá cantidades y variantes. El carrito se guarda en este celular.</p>
        </li>
        <li>
          <span>03</span>
          <h3>Mandalo por WhatsApp</h3>
          <p>Completá tu nombre y zona. El pedido me llega a {WHATSAPP_DISPLAY}.</p>
        </li>
        <li>
          <span>04</span>
          <h3>Coordinamos entrega</h3>
          <p>Confirmamos stock, precio y cómo lo recibís. Pago a convenir.</p>
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
      <img src={asset("/images/logo.png")} alt="" />
      <div>
        <strong>Mona Lissa Fragancias</strong>
        <p>Saphirus y Avon · Salud y belleza · Coordinamos entrega</p>
      </div>
      <a href={whatsappUrl("Hola Ana! 🌸")} target="_blank" rel="noreferrer">
        WhatsApp {WHATSAPP_DISPLAY}
      </a>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <a className="fab" href={whatsappUrl("Hola Ana! 🌸 Vi el catálogo de Mona Lissa y quería consultarte.")} target="_blank" rel="noreferrer">
      <IconWhatsApp size={26} />
      <span>WhatsApp</span>
    </a>
  );
}
