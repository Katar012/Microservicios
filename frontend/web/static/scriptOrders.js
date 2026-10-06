function loadOrders() {
    const container = document.getElementById('orders-list');
    container.innerHTML = '<div class="alert alert-info">Cargando órdenes...</div>';

    apiFetch('/api/orders')
        .then(async response => {
            const data = await response.json();
            if (response.status === 401) {
                container.innerHTML = '<div class="alert alert-warning">Debes iniciar sesión para ver tus órdenes.</div>';
                return;
            }
            if (!response.ok || !Array.isArray(data)) {
                container.innerHTML = `<div class="alert alert-danger">${(data && data.message) || 'No se pudieron cargar las órdenes.'}</div>`;
                return;
            }
            renderOrders(data, container);
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<div class="alert alert-danger">Ocurrió un error al cargar las órdenes.</div>';
        });
}

function renderOrders(orders, container) {
    if (orders.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Aún no tienes órdenes.</div>';
        return;
    }

    const html = orders.map(order => {
        const items = (order.items || []).map(item => `
            <tr>
                <td>#${escapeHtml(item.product_id)}</td>
                <td>${Number(item.quantity)}</td>
                <td>$${Number(item.unit_price).toFixed(2)}</td>
                <td>$${Number(item.subtotal).toFixed(2)}</td>
            </tr>
        `).join('');

        return `
        <div class="card mb-3">
            <div class="card-header">
                <strong>Orden #${escapeHtml(order.id)}</strong> — ${escapeHtml(order.created_at || '')} —
                <span class="badge badge-secondary">${escapeHtml(order.status)}</span>
                <span class="float-right">Total: <strong>$${Number(order.total).toFixed(2)}</strong></span>
            </div>
            <div class="card-body p-0">
                <table class="table table-sm table-striped mb-0">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${items}</tbody>
                </table>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = html;
}

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
