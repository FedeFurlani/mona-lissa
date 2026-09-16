import { useCart } from "../context/CartContext";

type Props = {
  onOpen: () => void;
};

export function PedidoFab({ onOpen }: Props) {
  const { count, bump } = useCart();
  if (count === 0) return null;

  return (
    <button key={bump} className="pedido-fab" type="button" onClick={onOpen} aria-label="Ver pedido">
      Pedido
      <em>{count}</em>
    </button>
  );
}
