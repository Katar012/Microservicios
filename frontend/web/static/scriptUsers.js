function createCell(text) {
    const td = document.createElement('td');
    td.textContent = text || '';
    return td;
}

function getUsers() {
    apiFetch('/api/users')
        .then(res => res.json())
        .then(data => {
            const userListBody = document.querySelector('#user-list tbody');
            if (!userListBody) return;
            userListBody.innerHTML = '';

            data.forEach(user => {
                const row = document.createElement('tr');
                row.appendChild(createCell(user.name));
                row.appendChild(createCell(user.email));
                row.appendChild(createCell(user.username));

                const actionsCell = document.createElement('td');

                const editLink = document.createElement('a');
                editLink.href = `/editUser/${user.id}`;
                editLink.textContent = 'Edit';
                editLink.className = 'btn btn-primary btn-sm mr-2';

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'btn btn-danger btn-sm';
                deleteBtn.onclick = () => deleteUser(user.id);

                actionsCell.appendChild(editLink);
                actionsCell.appendChild(deleteBtn);
                row.appendChild(actionsCell);

                userListBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

function createUser() {
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al crear el usuario');
        window.location.href = '/users';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo crear el usuario.');
    });
}

function updateUser() {
    const userId = document.getElementById('user-id').value;
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value
    };

    const password = document.getElementById('password').value;
    if (password) data.password = password;

    apiFetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al actualizar usuario');
        window.location.href = '/users';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo actualizar el usuario.');
    });
}

function deleteUser(userId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    apiFetch(`/api/users/${userId}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error('Error al eliminar');
            getUsers();
        })
        .catch(error => console.error('Error:', error));
}

function handleLogin(event) {
    if (event) {
        event.preventDefault();
    }

    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');

    if (!usernameEl || !passwordEl) {
        console.error('Error: "username" or "password" input fields not found in DOM.');
        alert('Error en el formulario. Revisa la consola.');
        return;
    }

    const username = usernameEl.value.trim();
    const password = passwordEl.value.trim();

    if (!username || !password) {
        alert('Por favor, ingresa tu usuario y contraseña.');
        return;
    }

    apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    })
    .then(async res => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || `Error ${res.status}: Credenciales inválidas`);
        }
        return data;
    })
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        window.location.href = '/dashboard';
    })
    .catch(error => {
        console.error('Login error details:', error);
        alert(error.message || 'Error de conexión con el servidor.');
    });
}
