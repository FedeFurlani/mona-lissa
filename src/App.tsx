import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Catalog } from "./components/Catalog";
import { CartDrawer } from "./components/CartDrawer";
import { About, Combos, Footer, HowItWorks, News, WhatsAppFab } from "./components/Sections";
import { useCart } from "./context/CartContext";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <Header onOpenCart={() => setCartOpen(true)} />
      <main>
        <Hero />
        <Marquee />
        <Catalog />
        <Combos />
        <News />
        <HowItWorks />
        <About />
      </main>
      <Footer />
      <WhatsAppFab />
      <Toast />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </CartProvider>
  );
}

function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  return <div className="toast">Sumado: {toast}</div>;
}

function Marquee() {
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
}
