function getProducts() {
    apiFetch('/api/products')
        .then(res => res.json())
        .then(data => {
            const productListBody = document.querySelector('#product-list tbody');
            if (!productListBody) return;
            productListBody.innerHTML = '';

            data.forEach(product => {
                const row = document.createElement('tr');

                // Cells
                row.appendChild(createCell(product.id));
                row.appendChild(createCell(product.name));
                row.appendChild(createCell(`$${Number(product.price).toFixed(2)}`));
                row.appendChild(createCell(product.quantity));

                // Order input cell (FIX: properly wrapped inside a <td>)
                const orderCell = document.createElement('td');
                const orderInput = document.createElement('input');
                orderInput.type = 'number';
                orderInput.min = '0';
                orderInput.value = '0';
                orderInput.className = 'form-control form-control-sm order-qty';
                orderCell.appendChild(orderInput);
                row.appendChild(orderCell);

                // Actions cell
                const actionsCell = document.createElement('td');
                const editLink = document.createElement('a');
                editLink.href = `/editProduct/${product.id}`;
                editLink.textContent = 'Edit';
                editLink.className = 'btn btn-primary btn-sm mr-2';

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'btn btn-danger btn-sm';
                deleteBtn.onclick = () => deleteProduct(product.id);

                actionsCell.appendChild(editLink);
                actionsCell.appendChild(deleteBtn);
                row.appendChild(actionsCell);

                productListBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}

function createCell(text) {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
}

function createProduct() {
    const data = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        quantity: parseInt(document.getElementById('quantity').value, 10)
    };

    apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al crear el producto');
        return res.json();
    })
    .then(() => {
        window.location.href = '/products';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo crear el producto.');
    });
}

function updateProduct() {
    const productId = document.getElementById('product-id').value;
    const data = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        quantity: parseInt(document.getElementById('quantity').value, 10)
    };

    apiFetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al actualizar');
        return res.json();
    })
    .then(() => {
        window.location.href = '/products';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo actualizar el producto.');
    });
}

function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    apiFetch(`/api/products/${productId}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error('Error al eliminar');
            getProducts();
        })
        .catch(error => console.error('Error:', error));
}

function orderProducts() {
    const selectedProducts = [];
    const productRows = document.querySelectorAll('#product-list tbody tr');

    productRows.forEach(row => {
        const quantityInput = row.querySelector('.order-qty');
        const quantity = parseInt(quantityInput?.value || '0', 10);
        if (quantity > 0) {
            const productId = row.querySelector('td:nth-child(1)').textContent.trim();
            selectedProducts.push({ product_id: parseInt(productId, 10), quantity });
        }
    });

    if (selectedProducts.length === 0) {
        alert('Por favor, selecciona al menos un producto.');
        return;
    }

    apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ products: selectedProducts })
    })
    .then(async res => {
        // Capturar el contenido como texto primero para evitar el crash de JSON.parse
        const text = await res.text();
        let data;
        try {
            data = text ? JSON.parse(text) : {}; // Intentar parsear el JSON
        } catch (err) {
            // Si no es JSON (ej. error 500 en HTML), guardar el texto como mensaje
            data = { message: text }; 
        }

        if (!res.ok) {
            throw new Error(data.message || `Error HTTP ${res.status}`);
        }
        return data;
    })
    .then(data => {
        if (data.order_id) {
            alert(`¡Orden #${data.order_id} creada exitosamente! Total: $${Number(data.total).toFixed(2)}`);
            getProducts();
            if (confirm('¿Quieres ver tus órdenes?')) {
                window.location.href = '/orders';
            }
        } else {
            alert('Error al crear la orden: ' + (data.message || 'Intenta nuevamente.'));
        }
    })
    .catch(error => {
        console.error('Error al procesar la orden:', error);
        alert('Ocurrió un error al procesar la orden. Revisa la consola para más detalles.\n\n' + error.message);
    });
}
