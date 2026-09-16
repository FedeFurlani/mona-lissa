import { useCart } from "../context/CartContext";
import type { Product } from "../types";

type Props = {
  product: Product;
  variant?: string;
  onNeedVariant?: () => void;
};

export function PedidoControls({ product, variant, onNeedVariant }: Props) {
  const { add, decrement, quantityOf } = useCart();
  const qty = quantityOf(product.id, variant);
  const needsChoice = Boolean(product.variants?.length) && !variant;

  if (qty === 0) {
    return (
      <button
        className="btn btn-pedido"
        type="button"
        onClick={() => (needsChoice ? onNeedVariant?.() : add(product.id, 1, variant))}
      >
        {needsChoice ? "Elegir" : "Agregar al pedido"}
      </button>
    );
  }

  return (
    <div className="pedido-controls">
      <button
        className="btn btn-pedido on"
        type="button"
        onClick={() => (needsChoice ? onNeedVariant?.() : add(product.id, 1, variant))}
      >
        Otro
        <em>{qty}</em>
      </button>
      <button className="btn btn-quitar" type="button" onClick={() => decrement(product.id, variant)}>
        Quitar
      </button>
    </div>
  );
}
