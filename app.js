// Initialize data
let currentUser = null;
let selectedEventId = null;

// Default data
const defaultData = {
    users: [
        { id: '1', email: 'owner@club.com', password: 'owner123', name: 'Club Owner', role: 'owner' },
        { id: '2', email: 'admin@club.com', password: 'admin123', name: 'Club Admin', role: 'admin' },
        { id: '3', email: 'user@club.com', password: 'user123', name: 'John Doe', role: 'user' }
    ],
    events: [
        {
            id: '1',
            title: 'Friday Night Party',
            description: 'Join us for an amazing night of music and dancing with top DJs!',
            date: '2025-12-20',
            time: '21:00',
            price: 50,
            capacity: 200,
            booked: 45,
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
            enabled: true
        },
        {
            id: '2',
            title: 'Live DJ Performance',
            description: 'Experience the best electronic music with world-class DJs',
            date: '2025-12-25',
            time: '22:00',
            price: 75,
            capacity: 150,
            booked: 89,
            image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
            enabled: true
        },
        {
            id: '3',
            title: 'New Year Celebration',
            description: 'Ring in the new year with style and elegance',
            date: '2025-12-31',
            time: '20:00',
            price: 150,
            capacity: 300,
            booked: 234,
            image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
            enabled: true
        }
    ],
    bookings: [
        { id: '1', userId: '3', eventId: '1', status: 'confirmed', amount: 50, date: new Date().toISOString() }
    ],
    settings: {
        clubName: 'Elite Club',
        clubLogo: '🎉'
    }
};

// Initialize localStorage
function initData() {
    if (!localStorage.getItem('clubData')) {
        localStorage.setItem('clubData', JSON.stringify(defaultData));
    }
}

// Get data
function getData() {
    return JSON.parse(localStorage.getItem('clubData'));
}

// Save data
function saveData(data) {
    localStorage.setItem('clubData', JSON.stringify(data));
}

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const data = getData();
    const user = data.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard(user.role);
    } else {
        const errorMsg = document.getElementById('errorMsg');
        errorMsg.textContent = '❌ Invalid email or password';
        errorMsg.classList.remove('hidden');
    }
});

// Quick login
function quickLogin(email, password) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

// Show dashboard
function showDashboard(role) {
    document.getElementById('loginPage').style.display = 'none';
    
    if (role === 'owner') {
        document.getElementById('ownerDashboard').classList.add('active');
        document.getElementById('ownerName').textContent = `Welcome, ${currentUser.name}`;
        loadOwnerDashboard();
    } else if (role === 'admin') {
        document.getElementById('adminDashboard').classList.add('active');
        document.getElementById('adminName').textContent = `Welcome, ${currentUser.name}`;
        loadAdminDashboard();
    } else {
        document.getElementById('userDashboard').classList.add('active');
        document.getElementById('userName').textContent = `Welcome, ${currentUser.name}`;
        loadUserDashboard();
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

// Owner Dashboard
function loadOwnerDashboard() {
    const data = getData();
    
    document.getElementById('totalUsers').textContent = data.users.filter(u => u.role === 'user').length;
    document.getElementById('totalEvents').textContent = data.events.length;
    document.getElementById('totalBookings').textContent = data.bookings.length;
    document.getElementById('totalRevenue').textContent = '$' + data.bookings.reduce((sum, b) => sum + b.amount, 0);
    
    switchOwnerTab('overview');
}

function switchOwnerTab(tab) {
    const tabs = document.querySelectorAll('#ownerDashboard .tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('ownerTabContent');
    const data = getData();
    
    if (tab === 'overview') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">System Overview</h2>
                <p style="color: #666; line-height: 1.8;">
                    Welcome to the Owner Dashboard. You have complete control over the club management system.
                    Use the tabs above to customize settings or manage administrators.
                </p>
            </div>
        `;
    } else if (tab === 'customization') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">App Customization</h2>
                <div class="form-group">
                    <label>Club Name</label>
                    <input type="text" id="clubName" value="${data.settings.clubName}">
                </div>
                <div class="form-group">
                    <label>Club Logo (Emoji)</label>
                    <input type="text" id="clubLogo" value="${data.settings.clubLogo}">
                </div>
                <button class="btn-success" onclick="saveSettings()">Save Changes</button>
            </div>
        `;
    } else if (tab === 'admins') {
        const admins = data.users.filter(u => u.role === 'admin');
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Manage Admins</h2>
                    <button class="btn-primary" onclick="addAdmin()">+ Add Admin</button>
                </div>
                ${admins.map(admin => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f5f5f5; border-radius: 10px; margin-bottom: 10px;">
                        <div>
                            <strong>${admin.name}</strong><br>
                            <small style="color: #666;">${admin.email}</small>
                        </div>
                        <button class="btn-danger" onclick="removeAdmin('${admin.id}')">Remove</button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function saveSettings() {
    const data = getData();
    data.settings.clubName = document.getElementById('clubName').value;
    data.settings.clubLogo = document.getElementById('clubLogo').value;
    saveData(data);
    alert('✅ Settings saved successfully!');
}

function addAdmin() {
    const email = prompt('Enter admin email:');
    const password = prompt('Enter admin password:');
    const name = prompt('Enter admin name:');
    
    if (email && password && name) {
        const data = getData();
        data.users.push({
            id: Date.now().toString(),
            email,
            password,
            name,
            role: 'admin'
        });
        saveData(data);
        switchOwnerTab('admins');
        alert('✅ Admin added successfully!');
    }
}

function removeAdmin(id) {
    if (confirm('Remove this admin?')) {
        const data = getData();
        data.users = data.users.filter(u => u.id !== id);
        saveData(data);
        switchOwnerTab('admins');
    }
}

// Admin Dashboard
function loadAdminDashboard() {
    const data = getData();
    
    document.getElementById('adminEvents').textContent = data.events.length;
    document.getElementById('adminBookings').textContent = data.bookings.length;
    document.getElementById('adminUsers').textContent = data.users.filter(u => u.role === 'user').length;
    document.getElementById('adminRevenue').textContent = '$' + data.bookings.reduce((sum, b) => sum + b.amount, 0);
    
    switchAdminTab('events');
}

function switchAdminTab(tab) {
    const tabs = document.querySelectorAll('#adminDashboard .tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('adminTabContent');
    const data = getData();
    
    if (tab === 'events') {
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Manage Events</h2>
                    <button class="btn-primary" onclick="createEvent()">+ Create Event</button>
                </div>
                <div class="event-grid">
                    ${data.events.map(event => `
                        <div class="event-card">
                            <img src="${event.image}" class="event-image" alt="${event.title}">
                            <div class="event-content">
                                <h3 class="event-title">${event.title}</h3>
                                <p class="event-desc">${event.description}</p>
                                <div class="event-meta">
                                    <span>📅 ${event.date}</span>
                                    <span>🕐 ${event.time}</span>
                                    <span>💰 $${event.price}</span>
                                    <span>👥 ${event.booked}/${event.capacity}</span>
                                </div>
                                <div style="display: flex; gap: 8px; margin-top: 10px;">
                                    <button class="btn-danger" onclick="deleteEvent('${event.id}')">Delete</button>
                                    <button class="btn-success" onclick="toggleEvent('${event.id}')">${event.enabled ? '✓ ON' : '✗ OFF'}</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (tab === 'bookings') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">All Bookings</h2>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Event</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.bookings.map(booking => {
                            const user = data.users.find(u => u.id === booking.userId);
                            const event = data.events.find(e => e.id === booking.eventId);
                            return `
                                <tr>
                                    <td>${user?.name || 'N/A'}</td>
                                    <td>${event?.title || 'N/A'}</td>
                                    <td>$${booking.amount}</td>
                                    <td><span class="badge-success">${booking.status}</span></td>
                                    <td>${new Date(booking.date).toLocaleDateString()}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tab === 'users') {
        const users = data.users.filter(u => u.role === 'user');
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">User Management</h2>
                ${users.map(user => `
                    <div style="padding: 15px; background: #f5f5f5; border-radius: 10px; margin-bottom: 10px;">
                        <strong>${user.name}</strong><br>
                        <small style="color: #666;">${user.email}</small>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function createEvent() {
    const title = prompt('Event Title:');
    const description = prompt('Event Description:');
    const date = prompt('Event Date (YYYY-MM-DD):');
    const time = prompt('Event Time (HH:MM):');
    const price = prompt('Price ($):');
    const capacity = prompt('Capacity:');
    
    if (title && description && date && time && price && capacity) {
        const data = getData();
        data.events.push({
            id: Date.now().toString(),
            title,
            description,
            date,
            time,
            price: Number(price),
            capacity: Number(capacity),
            booked: 0,
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
            enabled: true
        });
        saveData(data);
        loadAdminDashboard();
        alert('✅ Event created successfully!');
    }
}

function deleteEvent(id) {
    if (confirm('Delete this event?')) {
        const data = getData();
        data.events = data.events.filter(e => e.id !== id);
        saveData(data);
        switchAdminTab('events');
    }
}

function toggleEvent(id) {
    const data = getData();
    const event = data.events.find(e => e.id === id);
    event.enabled = !event.enabled;
    saveData(data);
    switchAdminTab('events');
}

// User Dashboard
function loadUserDashboard() {
    switchUserTab('events');
}

function switchUserTab(tab) {
    const tabs = document.querySelectorAll('#userDashboard .tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('userTabContent');
    const data = getData();
    
    if (tab === 'events') {
        const events = data.events.filter(e => e.enabled);
        content.innerHTML = `
            <div class="event-grid">
                ${events.map(event => `
                    <div class="event-card" onclick="viewEvent('${event.id}')">
                        <img src="${event.image}" class="event-image" alt="${event.title}">
                        <div class="event-content">
                            <h3 class="event-title">${event.title}</h3>
                            <p class="event-desc">${event.description}</p>
                            <div class="event-meta">
                                <span>📅 ${event.date}</span>
                                <span>🕐 ${event.time}</span>
                            </div>
                            <div class="event-footer">
                                <div class="event-price">$${event.price}</div>
                                <span class="${event.booked >= event.capacity ? 'badge-danger' : 'badge-success'}">
                                    ${event.capacity - event.booked} spots left
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (tab === 'bookings') {
        const myBookings = data.bookings.filter(b => b.userId === currentUser.id);
        if (myBookings.length === 0) {
            content.innerHTML = `
                <div class="card">
                    <div class="empty-state">
                        <div class="empty-icon">🎫</div>
                        <p>No bookings yet. Browse events to get started!</p>
                    </div>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="card">
                    <h2 class="card-title">My Bookings</h2>
                    ${myBookings.map(booking => {
                        const event = data.events.find(e => e.id === booking.eventId);
                        return `
                            <div style="display: flex; gap: 20px; padding: 20px; background: #f5f5f5; border-radius: 10px; margin-bottom: 15px; align-items: center;">
                                <img src="${event.image}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
                                <div style="flex: 1;">
                                    <h3>${event.title}</h3>
                                    <p style="color: #666;">📅 ${event.date} • 🕐 ${event.time}</p>
                                    <span class="badge-success">${booking.status}</span>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 24px; font-weight: 800; color: #667eea;">$${booking.amount}</div>
                                    <small style="color: #666;">${new Date(booking.date).toLocaleDateString()}</small>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    } else if (tab === 'profile') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">My Profile</h2>
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" value="${currentUser.name}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${currentUser.email}" disabled>
                </div>
                <button class="btn-primary">Save Changes</button>
            </div>
        `;
    }
}

function viewEvent(id) {
    selectedEventId = id;
    const data = getData();
    const event = data.events.find(e => e.id === id);
    
    document.getElementById('modalEventTitle').textContent = event.title;
    document.getElementById('modalEventBody').innerHTML = `
        <img src="${event.image}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">
        <p style="color: #666; line-height: 1.8; margin-bottom: 20px;">${event.description}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
            <div>
                <small style="color: #666;">DATE</small><br>
                <strong>📅 ${event.date}</strong>
            </div>
            <div>
                <small style="color: #666;">TIME</small><br>
                <strong>🕐 ${event.time}</strong>
            </div>
            <div>
                <small style="color: #666;">PRICE</small><br>
                <strong style="color: #667eea; font-size: 20px;">💰 $${event.price}</strong>
            </div>
            <div>
                <small style="color: #666;">AVAILABILITY</small><br>
                <strong>👥 ${event.capacity - event.booked} / ${event.capacity}</strong>
            </div>
        </div>
    `;
    
    const bookBtn = document.getElementById('modalBookBtn');
    if (event.booked >= event.capacity) {
        bookBtn.disabled = true;
        bookBtn.textContent = 'Sold Out';
    } else {
        bookBtn.disabled = false;
        bookBtn.textContent = 'Book Now';
    }
    
    document.getElementById('eventModal').classList.add('active');
}

function closeModal() {
    document.getElementById('eventModal').classList.remove('active');
    selectedEventId = null;
}

function bookEventFromModal() {
    const data = getData();
    const event = data.events.find(e => e.id === selectedEventId);
    
    if (confirm(`Book "${event.title}" for $${event.price}?`)) {
        data.bookings.push({
            id: Date.now().toString(),
            userId: currentUser.id,
            eventId: selectedEventId,
            status: 'confirmed',
            amount: event.price,
            date: new Date().toISOString()
        });
        
        event.booked++;
        saveData(data);
        
        alert('✅ Booking successful!');
        closeModal();
        switchUserTab('bookings');
    }
}

// Check if user is already logged in
function checkAuth() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        currentUser = JSON.parse(userStr);
        showDashboard(currentUser.role);
    }
}

// Initialize
initData();
checkAuth();