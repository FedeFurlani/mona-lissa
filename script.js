const CART_KEY = 'mona-lissa-pedido';
const cart = {};
let TIENDA = { rubros: [], productos: [], textos: {}, version: '' };
let isCartOpen = false;
let entregaTimer = null;
let ctaTimer = null;

function escHtml(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function idSeguro(valor) {
    const id = String(valor || '');
    return /^[a-z0-9-]{1,60}$/.test(id) ? id : '';
}

function iconoSeguro(valor) {
    const icono = String(valor || 'fa-spray-can');
    return /^fa-[a-z0-9-]+$/.test(icono) ? icono : 'fa-spray-can';
}

function rutaDescarga(valor) {
    const ruta = String(valor || '');
    return /^catalogos\/[a-z0-9.-]+\.pdf$/i.test(ruta) ? ruta : '';
}

function productoPorId(id) {
    return (TIENDA.productos || []).find((p) => p.id === id) || null;
}

function whatsappId() {
    return (TIENDA.textos && TIENDA.textos.contacto && TIENDA.textos.contacto.whatsappId) || '';
}

function instagramUrl() {
    return (TIENDA.textos && TIENDA.textos.contacto && TIENDA.textos.contacto.instagram) || 'https://instagram.com/monalissa_sj';
}

function srcProducto(foto) {
    if (!foto) return '';
    if (/^https?:\/\//i.test(foto)) return foto;
    return 'IMAGENES/' + encodeURIComponent(foto) + (TIENDA.version ? '?v=' + encodeURIComponent(TIENDA.version) : '');
}

function precioNumero(precio) {
    if (!precio) return null;
    const numero = Number(String(precio).replace(/\D/g, ''));
    return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function formatoPesos(numero) {
    return '$' + String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function guardarPedido() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) { /* el pedido sigue en esta visita */ }
}

function cargarPedido() {
    try {
        const data = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
        if (!data || typeof data !== 'object') return;
        Object.entries(data).forEach(([id, item]) => {
            const clave = idSeguro(id);
            if (!clave || !item || typeof item !== 'object' || !item.name) return;
            cart[clave] = {
                name: String(item.name),
                corto: String(item.corto || item.name),
                quantity: Math.max(0, Number(item.quantity) || 0),
                price: String(item.price || ''),
                img: String(item.img || '')
            };
        });
    } catch (error) { /* un pedido viejo no tiene que romper la página */ }
}

function toggleCart() {
    isCartOpen = !isCartOpen;
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-overlay');
    if (isCartOpen) {
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            modal.classList.remove('translate-x-full');
        }, 10);
    } else {
        overlay.classList.add('opacity-0');
        modal.classList.add('translate-x-full');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function sumaPedido() {
    let suma = 0;
    let sinPrecio = 0;
    Object.values(cart).forEach((item) => {
        const valor = precioNumero(item.price);
        if (valor === null) sinPrecio += item.quantity;
        else suma += valor * item.quantity;
    });
    return { suma, sinPrecio };
}

function updateCartCount() {
    const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    const countNav = document.getElementById('cart-count-nav');
    const btnClear = document.getElementById('btn-clear-cart');
    const flotante = document.getElementById('pedido-flotante');
    const flotanteCant = document.getElementById('flotante-cant');
    const label = document.getElementById('btn-send-label');
    if (label) label.textContent = whatsappId() ? 'Enviar pedido por WhatsApp' : 'Enviar pedido';

    if (total > 0) {
        countNav.innerText = total;
        countNav.classList.remove('hidden');
        const { suma, sinPrecio } = sumaPedido();
        if (flotanteCant) {
            flotanteCant.innerText = suma > 0 ? formatoPesos(suma) : '—';
        }
        if (flotante) {
            flotante.classList.remove('hidden');
            flotante.classList.add('flex');
        }
        if (btnClear) {
            btnClear.classList.remove('hidden');
            btnClear.classList.add('flex');
        }
    } else {
        countNav.classList.add('hidden');
        if (flotante) {
            flotante.classList.add('hidden');
            flotante.classList.remove('flex');
        }
        if (btnClear) {
            btnClear.classList.add('hidden');
            btnClear.classList.remove('flex');
        }
    }

    document.querySelectorAll('[data-enviar-pedido]').forEach((btn) => {
        if (total > 0) btn.removeAttribute('disabled');
        else btn.setAttribute('disabled', 'true');
    });
}

function abrirAviso({ titulo, texto, detalle, acciones }) {
    document.getElementById('aviso-titulo').textContent = titulo;
    const avisoTexto = document.getElementById('aviso-texto');
    avisoTexto.textContent = texto || '';
    const lista = document.getElementById('aviso-detalle');
    lista.innerHTML = (detalle || []).map((linea) => `<p>${escHtml(linea)}</p>`).join('');
    const caja = document.getElementById('aviso-acciones');
    caja.innerHTML = '';
    acciones.forEach((accion) => {
        const el = document.createElement(accion.href ? 'a' : 'button');
        if (!accion.href) el.type = 'button';
        else {
            el.href = accion.href;
            if (/^https?:/i.test(accion.href)) {
                el.target = '_blank';
                el.rel = 'noopener';
            }
        }
        el.className = 'flex-1 text-center font-semibold py-3 rounded-xl ' + (accion.peligro
            ? 'bg-ml-rose text-white'
            : accion.principal
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-ml-dark');
        el.textContent = accion.label;
        if (!accion.href) {
            el.addEventListener('click', () => {
                cerrarAviso();
                if (accion.alClick) accion.alClick();
            });
        }
        caja.appendChild(el);
    });
    const modal = document.getElementById('aviso');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarAviso() {
    const modal = document.getElementById('aviso');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function clearCart() {
    if (!Object.keys(cart).length) return;
    abrirAviso({
        titulo: 'Vaciar pedido',
        texto: '¿Querés sacar todos los productos del pedido?',
        acciones: [
            { label: 'Cancelar' },
            { label: 'Vaciar', peligro: true, alClick: vaciarPedido }
        ]
    });
}

function vaciarPedido() {
    Object.keys(cart).forEach((key) => { delete cart[key]; });
    updateCartCount();
    renderCart();
}

function addToCart(id) {
    const clave = idSeguro(id);
    const prod = productoPorId(clave);
    if (!prod || rutaDescarga(prod.descarga)) return;
    const fotoSrc = prod.foto ? srcProducto(prod.foto) : '';
    if (!cart[clave]) {
        cart[clave] = {
            name: prod.cart || prod.nombre,
            corto: prod.nombre,
            quantity: 1,
            price: prod.precio || '',
            img: fotoSrc
        };
    } else {
        cart[clave].quantity += 1;
        cart[clave].name = prod.cart || prod.nombre;
        cart[clave].corto = prod.nombre;
        cart[clave].price = prod.precio || '';
        if (fotoSrc) cart[clave].img = fotoSrc;
    }
    updateCartCount();
    renderCart();
    const flotante = document.getElementById('pedido-flotante');
    if (flotante && !flotante.classList.contains('hidden')) {
        flotante.classList.remove('pedido-pop');
        void flotante.offsetWidth;
        flotante.classList.add('pedido-pop');
    }
}

function syncCartConCatalogo() {
    Object.keys(cart).forEach((id) => {
        const prod = productoPorId(id);
        if (!prod || prod.activo === false) return;
        cart[id].name = prod.cart || prod.nombre;
        cart[id].corto = prod.nombre;
        cart[id].price = prod.precio || '';
        if (prod.foto) cart[id].img = srcProducto(prod.foto);
    });
}

function quitarProducto(id) {
    delete cart[id];
    updateCartCount();
    renderCart();
}

function changeQuantity(id, delta) {
    if (!cart[id]) return;
    cart[id].quantity = Math.max(0, cart[id].quantity + delta);
    if (cart[id].quantity === 0) delete cart[id];
    updateCartCount();
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    if (Object.keys(cart).length === 0) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-20">
                <i class="fa-solid fa-cart-arrow-down text-5xl"></i>
                <p>Tu pedido está vacío</p>
            </div>`;
        pintarTotal();
        actualizarBotones();
        guardarPedido();
        return;
    }

    Object.keys(cart).forEach((id) => {
        const item = cart[id];
        const clave = idSeguro(id);
        if (!clave) return;
        const foto = item.img
            ? `<img src="${escHtml(item.img)}" alt="" class="w-14 h-14 rounded-xl object-cover bg-rose-50 shrink-0">`
            : `<span class="w-14 h-14 rounded-xl bg-rose-50 text-ml-rose flex items-center justify-center shrink-0"><i class="fa-solid fa-spray-can"></i></span>`;
        const controles = item.quantity > 0
            ? `<div class="flex items-center gap-1 bg-gray-50 rounded-full border border-gray-200 p-1 shrink-0">
                    <button type="button" onclick="changeQuantity('${clave}', -1)" class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-ml-rose hover:bg-rose-50" aria-label="Quitar uno"><i class="fa-solid fa-minus text-xs"></i></button>
                    <span class="font-bold text-sm w-5 text-center">${item.quantity}</span>
                    <button type="button" onclick="changeQuantity('${clave}', 1)" class="w-8 h-8 rounded-full bg-ml-rose shadow-sm text-white flex items-center justify-center font-bold" aria-label="Sumar uno"><i class="fa-solid fa-plus text-xs"></i></button>
                </div>`
            : '';
        container.innerHTML += `
            <div class="flex items-center gap-3 mb-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                ${foto}
                <div class="min-w-0 flex-1">
                    <p class="font-bold text-sm text-ml-dark leading-tight">${escHtml(item.corto || item.name)}</p>
                    <p class="text-xs text-gray-500 mt-0.5">${item.price ? escHtml(item.price) + ' c/u' : 'Precio a confirmar'}</p>
                    <button type="button" onclick="quitarProducto('${clave}')" class="mt-1 text-xs text-gray-400 hover:text-ml-rose">Eliminar</button>
                </div>
                ${controles}
            </div>`;
    });
    pintarTotal();
    actualizarBotones();
    guardarPedido();
}

function pintarTotal() {
    const monto = document.getElementById('pedido-monto');
    const nota = document.getElementById('pedido-nota');
    if (!monto) return;
    const { suma, sinPrecio } = sumaPedido();
    if (suma > 0) monto.textContent = formatoPesos(suma);
    else if (sinPrecio > 0) monto.textContent = 'A confirmar';
    else monto.textContent = '$0';
    if (nota) {
        nota.textContent = sinPrecio
            ? (suma > 0 ? 'Hay productos sin precio en la lista' : 'El precio se confirma al pedir')
            : '';
    }
}

function quitarDeTarjeta(id) {
    if (!cart[id]) return;
    if (cart[id].quantity <= 1) quitarProducto(id);
    else changeQuantity(id, -1);
}

function cantidadRubroEnPedido(bloque) {
    let cant = 0;
    bloque.querySelectorAll('[data-lista-item]').forEach((fila) => {
        const item = cart[fila.dataset.listaItem];
        if (item) cant += item.quantity;
    });
    return cant;
}

function actualizarEtiquetasRubro() {
    document.querySelectorAll('[data-lista-rubro]').forEach((bloque) => {
        const panel = bloque.querySelector('[data-lista-rubro-panel]');
        const etiqueta = bloque.querySelector('[data-lista-rubro-ver]');
        const badge = bloque.querySelector('[data-lista-rubro-cant]');
        const abierto = panel && !panel.classList.contains('hidden');
        const cant = cantidadRubroEnPedido(bloque);
        if (etiqueta) etiqueta.textContent = abierto ? 'Cerrar' : 'Ver';
        if (!badge) return;
        if (cant > 0) {
            badge.textContent = String(cant);
            badge.classList.remove('hidden');
            badge.classList.add('inline-flex');
        } else {
            badge.textContent = '';
            badge.classList.add('hidden');
            badge.classList.remove('inline-flex');
        }
    });
}

function actualizarBotones() {
    actualizarEtiquetasRubro();
    document.querySelectorAll('#lista-pedido [data-controles]').forEach((caja) => {
        const id = caja.dataset.controles;
        const btn = caja.querySelector('[data-agregar]');
        if (!btn || !idSeguro(id)) return;
        const item = cart[id];
        const cant = item ? item.quantity : 0;
        const fila = caja.closest('[data-lista-item]');
        if (fila) {
            fila.classList.toggle('bg-rose-100', cant > 0);
            fila.classList.toggle('border-l-4', cant > 0);
            fila.classList.toggle('border-l-ml-rose', cant > 0);
            fila.classList.toggle('shadow-sm', cant > 0);
        }
        let quitarBtn = caja.querySelector('[data-quitar]');
        let marca = caja.querySelector('[data-lista-cant]');
        btn.className = 'w-9 h-9 rounded-full bg-ml-rose text-white font-bold text-lg flex items-center justify-center shrink-0';
        btn.textContent = '+';
        if (cant > 0) {
            if (!quitarBtn) {
                quitarBtn = document.createElement('button');
                quitarBtn.type = 'button';
                quitarBtn.dataset.quitar = id;
                quitarBtn.addEventListener('click', () => quitarDeTarjeta(id));
                caja.insertBefore(quitarBtn, btn);
            }
            quitarBtn.className = 'w-9 h-9 rounded-full border-2 border-ml-rose text-ml-rose font-bold text-lg flex items-center justify-center shrink-0 bg-white';
            quitarBtn.textContent = '−';
            if (!marca) {
                marca = document.createElement('span');
                marca.dataset.listaCant = id;
                caja.insertBefore(marca, btn);
            }
            marca.className = 'min-w-[1.5rem] text-center font-bold text-ml-dark';
            marca.textContent = String(cant);
        } else {
            if (quitarBtn) quitarBtn.remove();
            if (marca) marca.remove();
        }
    });
}

function armarMensaje() {
    const pedidos = Object.values(cart).filter((item) => item.quantity > 0);
    let message = '¡Hola Ana! 👋\nQuiero hacer el siguiente pedido:\n\n';
    pedidos.forEach((item) => {
        const valor = precioNumero(item.price);
        const subtotal = valor === null ? 'a confirmar' : formatoPesos(valor * item.quantity);
        message += `👉 *${item.quantity}x* ${item.name} — ${subtotal}\n`;
    });
    message += '\n';
    const { suma, sinPrecio } = sumaPedido();
    if (suma > 0) message += `*Subtotal: ${formatoPesos(suma)}*\n`;
    const entrega = (TIENDA.textos && TIENDA.textos.entrega && TIENDA.textos.entrega.length)
        ? TIENDA.textos.entrega
        : ['Coordinamos entrega', 'Consultá los catálogos'];
    message += entrega.join('\n') + '\n';
    if (suma > 0) message += `*Total: ${formatoPesos(suma)}*${sinPrecio ? ' (hay productos sin precio)' : ''}\n`;
    message += '\n¿Me confirmás disponibilidad? ¡Gracias!';
    return { message, pedidos, suma, entrega };
}

function sendOrder() {
    const { message, pedidos, suma, entrega } = armarMensaje();
    if (!pedidos.length) return;
    const detalle = pedidos.map((item) => {
        const valor = precioNumero(item.price);
        const subtotal = valor === null ? 'a confirmar' : formatoPesos(valor * item.quantity);
        return `${item.quantity} × ${item.corto || item.name} — ${subtotal}`;
    });
    if (suma > 0) detalle.push(`Total: ${formatoPesos(suma)}`);
    const id = whatsappId();
    const acciones = [{ label: 'Volver' }];
    if (id) {
        acciones.push({
            label: 'WhatsApp',
            href: 'https://wa.me/' + id + '?text=' + encodeURIComponent(message),
            principal: true
        });
    } else {
        acciones.push({
            label: 'Copiar pedido',
            principal: true,
            alClick: () => copiarPedido(message)
        });
    }
    abrirAviso({
        titulo: 'Enviar pedido',
        texto: id ? entrega.join('\n') : 'Copiá el pedido y mandalo por Instagram a @monalissa_sj.',
        detalle,
        acciones
    });
}

function copiarPedido(message) {
    const hecho = () => abrirAviso({
        titulo: 'Pedido copiado',
        texto: 'Pegalo en Instagram y Ana te confirma.',
        acciones: [
            { label: 'Listo' },
            { label: 'Instagram', href: instagramUrl(), principal: true }
        ]
    });
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).then(hecho).catch(() => hecho());
        return;
    }
    hecho();
}

function pintarListaPedido() {
    const caja = document.getElementById('lista-pedido');
    if (!caja) return;
    const rubros = [...(TIENDA.rubros || [])]
        .filter((r) => r.activo !== false)
        .sort((a, b) => (a.orden - b.orden) || a.nombre.localeCompare(b.nombre, 'es'));
    const productos = [...(TIENDA.productos || [])]
        .filter((p) => p.activo !== false)
        .sort((a, b) => (a.orden - b.orden) || a.nombre.localeCompare(b.nombre, 'es'));

    if (!rubros.length) {
        caja.innerHTML = '<p class="text-center text-gray-500 py-10">Todavía no hay productos cargados.</p>';
        actualizarBotones();
        return;
    }

    caja.innerHTML = rubros.map((rubro) => {
        const rid = idSeguro(rubro.id);
        if (!rid) return '';
        const items = productos.filter((p) => p.rubroId === rubro.id);
        if (!items.length) return '';
        const subsecciones = [];
        const vistos = new Set();
        items.forEach((item) => {
            const clave = item.seccion || rubro.nombre;
            if (!vistos.has(clave)) {
                vistos.add(clave);
                subsecciones.push(clave);
            }
        });
        const varias = subsecciones.length > 1;
        const bloques = subsecciones.map((sub) => {
            const delSub = items.filter((item) => (item.seccion || rubro.nombre) === sub);
            const filas = delSub.map((info) => {
                const id = idSeguro(info.id);
                if (!id) return '';
                const ruta = rutaDescarga(info.descarga);
                const esDescarga = Boolean(ruta);
                const nombreArchivo = esDescarga ? ruta.split('/').pop() : '';
                const precio = esDescarga ? 'Descargar' : (info.precio || 'A confirmar');
                const precioClass = (info.precio || esDescarga) ? 'text-ml-rose' : 'text-gray-400';
                const detalle = varias
                    ? (info.detalle || '')
                    : [info.seccion && info.seccion !== rubro.nombre ? info.seccion : '', info.detalle].filter(Boolean).join(' · ');
                const foto = info.foto ? srcProducto(info.foto) : '';
                const icono = iconoSeguro(info.icono);
                const mini = foto
                    ? `<button type="button" data-lista-ver="${escHtml(id)}" class="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden block" aria-label="Ver detalle">
                            <img src="${escHtml(foto)}" alt="" class="w-full h-full object-cover bg-rose-50 pointer-events-none">
                            <span class="absolute inset-x-0 bottom-0 bg-ml-dark/70 text-white text-[9px] font-semibold py-0.5 text-center leading-none pointer-events-none">Ver</span>
                       </button>`
                    : `<button type="button" data-lista-ver="${escHtml(id)}" class="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-rose-50 text-ml-rose flex items-center justify-center" aria-label="Ver detalle">
                            <i class="fa-solid ${icono} pointer-events-none"></i>
                            <span class="absolute inset-x-0 bottom-0 bg-ml-dark/70 text-white text-[9px] font-semibold py-0.5 text-center leading-none pointer-events-none">Ver</span>
                       </button>`;
                const datos = [
                    ...(info.rinde ? [info.rinde] : []),
                    ...(info.extra || []),
                    ...(info.coccion ? [info.coccion] : [])
                ];
                const datosHtml = datos.map((texto) => `<li class="flex items-start gap-2"><i class="fa-solid fa-check text-ml-plum text-xs w-3.5 text-center mt-0.5 shrink-0"></i><span>${escHtml(texto)}</span></li>`).join('');
                return `
                    <div data-lista-item="${escHtml(id)}" class="border-b border-rose-100 last:border-0 -mx-3 transition-colors cursor-pointer">
                        <div class="flex items-center gap-3 py-2.5 px-3">
                            ${mini}
                            ${esDescarga
                                ? `<a href="${escHtml(ruta)}" download="${escHtml(nombreArchivo)}" class="min-w-0 flex-1 block">
                                    <p class="font-semibold text-ml-dark leading-tight">${escHtml(info.nombre)}</p>
                                    ${detalle ? `<p class="text-xs text-gray-500 mt-0.5">${escHtml(detalle)}</p>` : ''}
                                    <p class="text-sm font-bold text-ml-rose mt-1">Descargar</p>
                                   </a>`
                                : `<div class="min-w-0 flex-1" data-lista-sumar="${escHtml(id)}">
                                    <p class="font-semibold text-ml-dark leading-tight">${escHtml(info.nombre)}</p>
                                    ${detalle ? `<p class="text-xs text-gray-500 mt-0.5">${escHtml(detalle)}</p>` : ''}
                                    <p class="text-sm font-bold ${precioClass} mt-1">${escHtml(precio)}</p>
                                   </div>`}
                            ${esDescarga
                                ? `<a href="${escHtml(ruta)}" download="${escHtml(nombreArchivo)}" class="w-9 h-9 rounded-full bg-ml-rose text-white flex items-center justify-center shrink-0" aria-label="Descargar ${escHtml(info.nombre)}"><i class="fa-solid fa-download text-sm"></i></a>`
                                : `<div data-controles="${escHtml(id)}" class="flex items-center justify-end gap-1 shrink-0 min-w-[7rem]">
                                    <button type="button" data-agregar="${escHtml(id)}" class="w-9 h-9 rounded-full bg-ml-rose text-white font-bold text-lg flex items-center justify-center">+</button>
                                   </div>`}
                        </div>
                        <div data-lista-detalle="${escHtml(id)}" class="hidden mx-3 mb-3 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-ml-cream p-3.5 shadow-inner">
                            <p class="text-[10px] uppercase tracking-[0.2em] text-ml-plum font-semibold mb-2">Detalle</p>
                            ${info.descripcion ? `<p class="text-sm text-ml-dark/80 leading-relaxed mb-3">${escHtml(info.descripcion)}</p>` : ''}
                            <ul class="space-y-1.5 text-xs text-ml-dark/70">${datosHtml}</ul>
                            ${esDescarga
                                ? `<a href="${escHtml(ruta)}" download="${escHtml(nombreArchivo)}" class="mt-3 inline-flex text-sm font-semibold text-ml-rose">Descargar PDF</a>`
                                : `<button type="button" class="mt-3 text-sm font-semibold text-ml-rose" data-ver-modal="${escHtml(id)}">Ver ficha</button>`}
                        </div>
                    </div>`;
            }).join('');
            const encabezado = varias
                ? `<div class="px-3 pt-3 pb-1 flex items-center gap-2">
                        <span class="text-[11px] uppercase tracking-[0.18em] font-semibold text-ml-rose">${escHtml(sub)}</span>
                        <span class="flex-1 border-t border-rose-100"></span>
                   </div>`
                : '';
            return `${encabezado}${filas}`;
        }).join('');
        return `
            <div data-lista-rubro="${escHtml(rid)}">
                <button type="button" data-toggle-rubro="${escHtml(rid)}" class="w-full bg-ml-rose text-white font-serif font-extrabold text-lg px-4 py-2.5 rounded-xl mb-1 flex items-center gap-2 text-left">
                    <i class="fa-solid ${iconoSeguro(rubro.icono)} text-base"></i>
                    <span class="flex-1">${escHtml(rubro.nombre)}</span>
                    <span data-lista-rubro-cant class="hidden min-w-[1.4rem] h-6 px-1.5 rounded-full bg-yellow-400 text-ml-dark text-xs font-sans font-bold items-center justify-center"></span>
                    <span data-lista-rubro-ver class="text-xs font-sans font-semibold uppercase tracking-wide bg-white/20 px-2.5 py-1 rounded-full">Ver</span>
                </button>
                <div data-lista-rubro-panel class="hidden bg-white border border-rose-100 rounded-xl px-3 pb-1">${bloques}</div>
            </div>`;
    }).join('');
    actualizarBotones();
}

function medidasVistaPedido() {
    const nav = document.querySelector('nav');
    const flotante = document.getElementById('pedido-flotante');
    const arriba = (nav ? nav.getBoundingClientRect().height : 80) + 12;
    const flotanteVisible = flotante && !flotante.classList.contains('hidden');
    const abajo = flotanteVisible ? flotante.getBoundingClientRect().height + 28 : 16;
    return { arriba, abajo };
}

function enfocarEnVista(el) {
    if (!el) return;
    const { arriba, abajo } = medidasVistaPedido();
    const disponible = Math.max(120, window.innerHeight - arriba - abajo);
    el.style.scrollMarginTop = `${arriba}px`;
    el.style.scrollMarginBottom = `${abajo}px`;
    const alto = el.getBoundingClientRect().height;
    el.scrollIntoView({
        behavior: 'smooth',
        block: alto <= disponible ? 'center' : 'start',
        inline: 'nearest'
    });
}

function toggleListaRubro(id) {
    const bloque = document.querySelector(`[data-lista-rubro="${id}"]`);
    if (!bloque) return;
    const panel = bloque.querySelector('[data-lista-rubro-panel]');
    if (!panel) return;
    const abierto = !panel.classList.contains('hidden');
    document.querySelectorAll('[data-lista-rubro-panel]').forEach((el) => el.classList.add('hidden'));
    if (!abierto) {
        panel.classList.remove('hidden');
        actualizarEtiquetasRubro();
        void bloque.offsetHeight;
        enfocarEnVista(bloque);
    } else {
        actualizarEtiquetasRubro();
    }
}

function toggleListaInfo(id) {
    const detalle = document.querySelector(`[data-lista-detalle="${id}"]`);
    const boton = document.querySelector(`[data-lista-ver="${id}"]`);
    if (!detalle || !boton) return;
    const abierto = !detalle.classList.contains('hidden');
    document.querySelectorAll('[data-lista-detalle]').forEach((el) => el.classList.add('hidden'));
    document.querySelectorAll('[data-lista-ver] span').forEach((el) => { el.textContent = 'Ver'; });
    if (!abierto) {
        detalle.classList.remove('hidden');
        const etiqueta = boton.querySelector('span');
        if (etiqueta) etiqueta.textContent = '✕';
        const fila = detalle.closest('[data-lista-item]');
        const el = fila || detalle;
        const { arriba, abajo } = medidasVistaPedido();
        const rect = el.getBoundingClientRect();
        if (rect.top < arriba || rect.bottom > window.innerHeight - abajo) enfocarEnVista(el);
    }
}

function verProducto(id) {
    const info = productoPorId(id);
    if (!info) return;
    const foto = document.getElementById('producto-foto');
    if (info.foto) {
        foto.src = srcProducto(info.foto);
        foto.alt = info.nombre;
        foto.classList.remove('hidden');
    } else {
        foto.removeAttribute('src');
        foto.alt = '';
        foto.classList.add('hidden');
    }
    document.getElementById('producto-seccion').textContent = [info.seccion, info.etiqueta].filter(Boolean).join(' · ');
    document.getElementById('producto-nombre').textContent = info.nombre;
    document.getElementById('producto-masa').textContent = info.detalle || '';
    const ruta = rutaDescarga(info.descarga);
    const precio = document.getElementById('producto-precio');
    precio.textContent = ruta ? 'Descargar' : (info.precio || 'Precio a confirmar');
    precio.classList.toggle('text-gray-400', !info.precio && !ruta);
    precio.classList.toggle('text-ml-rose', Boolean(ruta));
    document.getElementById('producto-desc').textContent = info.descripcion || '';
    const datos = [
        ...(info.rinde ? [info.rinde] : []),
        ...(info.extra || [])
    ];
    document.getElementById('producto-datos').innerHTML = datos.map((texto) => `<li class="flex items-center gap-2"><i class="fa-solid fa-check text-ml-plum text-xs w-3 text-center"></i>${escHtml(texto)}</li>`).join('');
    const clave = idSeguro(info.id);
    const nombreArchivo = ruta ? ruta.split('/').pop() : '';
    document.getElementById('producto-accion').innerHTML = ruta
        ? `<a href="${escHtml(ruta)}" download="${escHtml(nombreArchivo)}" class="w-full bg-ml-rose hover:bg-ml-wine text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"><i class="fa-solid fa-download"></i> Descargar</a>`
        : `<button type="button" data-agregar="${escHtml(clave)}" class="w-full bg-ml-rose hover:bg-ml-wine text-white py-3 rounded-xl font-semibold">Agregar al pedido</button>`;
    const modal = document.getElementById('producto-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    actualizarBotones();
}

function cerrarProducto() {
    const modal = document.getElementById('producto-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value != null && value !== '') el.textContent = value;
}

function pintarEntrega(opciones) {
    const frases = (opciones && opciones.length) ? opciones : ['Coordinamos entrega', 'Consultá los catálogos'];
    document.querySelectorAll('[data-entrega-slide]').forEach((slide) => {
        const pista = slide.querySelector('.entrega-slide-pista');
        if (!pista) return;
        const conIconos = slide.className.includes('text-ml-plum');
        pista.innerHTML = frases.map((frase, i) => {
            const icono = conIconos
                ? (i === 0 ? '<i class="fa-solid fa-house"></i> ' : '<i class="fa-solid fa-book-open"></i> ')
                : '';
            const justify = conIconos ? 'justify-center md:justify-start' : 'justify-center';
            return `<p class="entrega-slide-item ${justify}">${icono}${escHtml(frase)}</p>`;
        }).join('') + (frases.length > 1 ? '' : '');
        pista.style.transform = 'translateY(0)';
    });
}

function iniciarEntrega() {
    if (entregaTimer) clearInterval(entregaTimer);
    const slides = [...document.querySelectorAll('[data-entrega-slide]')];
    const estados = slides.map((el) => ({
        pista: el.querySelector('.entrega-slide-pista'),
        total: el.querySelectorAll('.entrega-slide-item').length,
        actual: 0
    })).filter((item) => item.pista && item.total > 1);
    if (!estados.length) return;
    entregaTimer = setInterval(() => {
        estados.forEach((estado) => {
            estado.actual = (estado.actual + 1) % estado.total;
            estado.pista.style.transform = `translateY(-${estado.actual * 1.5}em)`;
        });
    }, 2800);
}

function aplicarTextos(textos) {
    if (!textos) return;
    const hero = textos.hero || {};
    setText('hero-ubicacion', hero.ubicacion);
    setText('hero-titulo', hero.titulo);
    setText('hero-titulo-italic', hero.tituloItalic);
    setText('hero-subtitulo', hero.subtitulo);
    setText('hero-frase', hero.frase);
    const lista = textos.lista || {};
    setText('lista-eyebrow', lista.eyebrow);
    setText('lista-titulo', lista.titulo);
    setText('lista-descripcion', lista.descripcion);
    const nosotros = textos.nosotros || {};
    setText('nosotros-eyebrow', nosotros.eyebrow);
    setText('nosotros-titulo', nosotros.titulo);
    setText('nosotros-cuerpo', nosotros.cuerpo);
    const contacto = textos.contacto || {};
    document.querySelectorAll('[data-contacto-ciudad]').forEach((el) => {
        if (contacto.ciudad) el.textContent = contacto.ciudad;
    });
    document.querySelectorAll('[data-contacto-wa]').forEach((el) => {
        if (contacto.whatsapp) el.textContent = contacto.whatsapp;
    });
    const destino = contacto.whatsappId
        ? 'https://wa.me/' + contacto.whatsappId
        : (contacto.instagram || instagramUrl());
    const icono = contacto.whatsappId ? 'fa-brands fa-whatsapp' : 'fa-brands fa-instagram';
    document.querySelectorAll('[data-contacto-link]').forEach((a) => { a.href = destino; });
    document.querySelectorAll('[data-contacto-icono]').forEach((el) => { el.className = icono + ' text-xl'; });
    const footer = textos.footer || {};
    setText('footer-descripcion', footer.descripcion);
    pintarEntrega(textos.entrega);
    if (Array.isArray(hero.cta) && hero.cta.length) {
        window.__ctaFrases = hero.cta;
        const frase = document.getElementById('cta-frase');
        if (frase) frase.textContent = hero.cta[0];
    }
    updateCartCount();
}

function iniciarCta() {
    if (ctaTimer) clearInterval(ctaTimer);
    const frase = document.getElementById('cta-frase');
    if (!frase) return;
    let actual = 0;
    ctaTimer = setInterval(() => {
        const textos = window.__ctaFrases || [];
        if (textos.length < 2) return;
        frase.classList.add('sale');
        setTimeout(() => {
            actual = (actual + 1) % textos.length;
            frase.textContent = textos[actual];
            frase.classList.remove('sale');
        }, 450);
    }, 2800);
}

async function aplicarCatalogo() {
    const caja = document.getElementById('lista-pedido');
    try {
        const respuesta = await fetch('catalogo.json', { cache: 'no-store' });
        if (!respuesta.ok) throw new Error('catalogo');
        const catalogo = await respuesta.json();
        TIENDA = {
            rubros: catalogo.rubros || [],
            productos: catalogo.productos || [],
            textos: catalogo.textos || {},
            version: catalogo.actualizado || ''
        };
        aplicarTextos(TIENDA.textos);
        syncCartConCatalogo();
        pintarListaPedido();
        updateCartCount();
        renderCart();
        iniciarEntrega();
        iniciarCta();
    } catch (error) {
        if (caja) caja.innerHTML = '<p class="text-center text-gray-500 py-10">No se pudo cargar el catálogo. Abrí el sitio con un servidor local.</p>';
    }
}

function iniciarPortada() {
    const slides = [...document.querySelectorAll('#portada .portada-slide')];
    const dots = document.getElementById('portada-dots');
    if (!slides.length || !dots) return;
    let actual = 0;
    let timer;
    function mostrar(indice) {
        actual = (indice + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('activa', i === actual));
        [...dots.children].forEach((dot, i) => {
            dot.classList.toggle('bg-white', i === actual);
            dot.classList.toggle('bg-white/40', i !== actual);
        });
    }
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'w-2.5 h-2.5 rounded-full bg-white/40';
        dot.setAttribute('aria-label', 'Foto ' + (i + 1));
        dot.addEventListener('click', () => {
            mostrar(i);
            clearInterval(timer);
            timer = setInterval(() => mostrar(actual + 1), 4000);
        });
        dots.appendChild(dot);
    });
    mostrar(0);
    timer = setInterval(() => mostrar(actual + 1), 4000);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const destino = document.querySelector(anchor.getAttribute('href'));
        if (!destino) return;
        e.preventDefault();
        destino.scrollIntoView({ behavior: 'smooth' });
    });
});

document.addEventListener('click', (event) => {
    const ver = event.target.closest('[data-lista-ver]');
    if (ver) {
        event.stopPropagation();
        toggleListaInfo(ver.dataset.listaVer);
        return;
    }
    const ficha = event.target.closest('[data-ver-modal]');
    if (ficha) {
        verProducto(ficha.dataset.verModal);
        return;
    }
    const rubro = event.target.closest('[data-toggle-rubro]');
    if (rubro) {
        toggleListaRubro(rubro.dataset.toggleRubro);
        return;
    }
    const agregar = event.target.closest('[data-agregar]');
    if (agregar) {
        addToCart(agregar.dataset.agregar);
        return;
    }
    const sumar = event.target.closest('[data-lista-sumar]');
    if (sumar) addToCart(sumar.dataset.listaSumar);
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const aviso = document.getElementById('aviso');
    if (aviso && !aviso.classList.contains('hidden')) {
        cerrarAviso();
        return;
    }
    if (isCartOpen) {
        toggleCart();
        return;
    }
    cerrarProducto();
});

cargarPedido();
updateCartCount();
renderCart();
iniciarPortada();
iniciarEntrega();
aplicarCatalogo();
