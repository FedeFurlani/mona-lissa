import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Catalog } from "./components/Catalog";
import { CartDrawer } from "./components/CartDrawer";
import { PedidoFab } from "./components/PedidoFab";
import { About, Footer, HowItWorks } from "./components/Sections";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <Header onOpenCart={() => setCartOpen(true)} />
      <main>
        <Hero />
        {/* <Marquee /> */}
        <Catalog />
        {/* <Combos /> */}
        {/* <News /> */}
        <HowItWorks />
        <About />
      </main>
      <Footer />
      <PedidoFab onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </CartProvider>
  );
}

/* function Marquee() {
  const words = [
    "Hawaii",
    "Paula",
    "Coco Vai",
    "Marina",
    "Pistacho Caramelo",
    "Antitabaco",
    "Ruta 66",
    "Caritas",
    "Avon",
    "Palo Santo",
  ];
  const line = [...words, ...words];
  return (
    <div className="marquee" aria-hidden>
      <div>
        {line.map((word, i) => (
          <span key={`${word}-${i}`}>{word}</span>
        ))}
      </div>
    </div>
  );
} */
