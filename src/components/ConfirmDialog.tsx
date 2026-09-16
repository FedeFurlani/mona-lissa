type Action = {
  label: string;
  href?: string;
  danger?: boolean;
  primary?: boolean;
  onClick?: () => void;
};

type Props = {
  open: boolean;
  title: string;
  text?: string;
  detail?: string[];
  actions: Action[];
  onClose: () => void;
};

export function ConfirmDialog({ open, title, text, detail, actions, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="aviso-backdrop" onClick={onClose}>
      <div className="aviso" role="dialog" aria-modal="true" aria-labelledby="aviso-titulo" onClick={(e) => e.stopPropagation()}>
        <h2 id="aviso-titulo">{title}</h2>
        {text && <p className="aviso-texto">{text}</p>}
        {detail && detail.length > 0 && (
          <div className="aviso-detalle">
            {detail.map((linea) => (
              <p key={linea}>{linea}</p>
            ))}
          </div>
        )}
        <div className="aviso-acciones">
          {actions.map((accion) =>
            accion.href ? (
              <a key={accion.label} className={btnClass(accion)} href={accion.href} target="_blank" rel="noreferrer">
                {accion.label}
              </a>
            ) : (
              <button
                key={accion.label}
                className={btnClass(accion)}
                type="button"
                onClick={() => {
                  onClose();
                  accion.onClick?.();
                }}
              >
                {accion.label}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function btnClass(accion: Action): string {
  if (accion.danger) return "aviso-btn danger";
  if (accion.primary) return "aviso-btn primary";
  return "aviso-btn";
}
