import { asset } from "../lib/assets";
import { catalogRequestMessage, whatsappUrl } from "../lib/whatsapp";
import { IconWhatsApp } from "./Icons";

export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow">Saphirus · Avon · entrega a coordinar</p>
        <h1>
          Fragancias para tu casa,
          <em> tu auto y vos.</em>
        </h1>
        <p className="lead">
          Hola, soy Ana. Armá el carrito con textiles, difusores, equipos y Avon. El pedido me llega
          por WhatsApp y coordinamos entrega.
        </p>
        <div className="hero-cta">
          <a className="btn btn-dark" href="#catalogo">
            Ver catálogo
          </a>
          <a className="btn btn-pink" href={whatsappUrl(catalogRequestMessage())} target="_blank" rel="noreferrer">
            <IconWhatsApp size={18} />
            Pedir catálogo Avon
          </a>
        </div>
        <ul className="hero-pills">
          <li>Precios de referencia</li>
          <li>Stock a confirmar</li>
          <li>Pago y entrega por WhatsApp</li>
        </ul>
      </div>
      <div className="hero-visual">
        <div className="seal">
          <img src={asset("/images/logo.png")} alt="Mona Lissa Fragancias" />
        </div>
        <img className="hero-shot shot-a" src={asset("/images/productos-saphirus.png")} alt="Productos Saphirus" />
        <img className="hero-shot shot-b" src={asset("/images/productos-grid.png")} alt="Textiles, ambientes y auto" />
      </div>
    </section>
  );
}
