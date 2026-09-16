import { asset } from "../lib/assets";

export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <h1>
          Fragancias para tu casa,
          <em> tu auto y vos.</em>
        </h1>
        <p className="lead">
          Hola, soy Ana. Armá tu pedido y mandalo por WhatsApp. Después coordinamos la entrega.
        </p>
        <div className="hero-cta">
          <a className="btn btn-dark" href="#catalogo">
            Ver catálogo
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <img src={asset("/images/productos-saphirus.png")} alt="Productos Saphirus" />
      </div>
    </section>
  );
}
