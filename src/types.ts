export type CategoryId =
  | "textiles"
  | "ambientes"
  | "auto"
  | "equipos"
  | "aceites"
  | "avon"
  | "combos";

export type Badge = "nuevo" | "promo" | "favorito";

export type Product = {
  id: string;
  name: string;
  brand: "Saphirus" | "Avon" | "Caritas" | "Ruta 66" | "Mona Lissa";
  category: CategoryId;
  price: number;
  compareAt?: number;
  size?: string;
  description: string;
  notes?: string;
  scent?: string;
  color: string;
  accent: string;
  image?: string;
  badges?: Badge[];
  variants?: string[];
  variantLabel?: string;
};

export type CartItem = {
  key: string;
  productId: string;
  quantity: number;
  variant?: string;
};

export type NewsItem = {
  id: string;
  title: string;
  date: string;
  tag: string;
  body: string;
  image?: string;
};

export type CheckoutForm = {
  name: string;
  zone: string;
  delivery: "entrega" | "retiro";
  notes: string;
};
