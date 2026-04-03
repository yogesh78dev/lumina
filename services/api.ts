
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'http://72.60.99.203:5001/api';

async function request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('crm_token');
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
        // Token might be expired or invalid
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_currentUser');
        if (window.location.hash !== '#/login') {
            window.location.hash = '#/login';
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
}

export const api = {
    auth: {
        login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
        getMe: () => request('/auth/me'),
    },
    dashboard: {
        getStats: () => request('/dashboard/stats'),
    },
    leads: {
        getAll: () => request('/leads'),
        create: (data: any) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string | number, data: any) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string | number) => request(`/leads/${id}`, { method: 'DELETE' }),
        convert: (id: string | number, data: any) => request(`/leads/convert/${id}`, { method: 'POST', body: JSON.stringify(data) }),
        bulkAssign: (ids: (string | number)[], userId: string | number) => request('/leads/bulk-assign', { method: 'POST', body: JSON.stringify({ ids, userId }) }),
        bulkStatus: (ids: (string | number)[], status: string) => request('/leads/bulk-status', { method: 'POST', body: JSON.stringify({ ids, status }) }),
        bulkDelete: (ids: (string | number)[]) => request('/leads/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
        getNotes: (id: string | number) => request(`/leads/${id}/notes`),
        addNote: (id: string | number, data: any) => request(`/leads/${id}/notes`, { method: 'POST', body: JSON.stringify(data) }),
        updateNote: (leadId: string | number, noteId: string | number, data: any) => request(`/leads/${leadId}/notes/${noteId}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteNote: (leadId: string | number, noteId: string | number) => request(`/leads/${leadId}/notes/${noteId}`, { method: 'DELETE' }),
        getReminders: (id: string | number) => request(`/leads/${id}/reminders`),
        addReminder: (id: string | number, data: any) => request(`/leads/${id}/reminders`, { method: 'POST', body: JSON.stringify(data) }),
        updateReminder: (leadId: string | number, reminderId: string | number, data: any) => request(`/leads/${leadId}/reminders/${reminderId}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteReminder: (leadId: string | number, reminderId: string | number) => request(`/leads/${leadId}/reminders/${reminderId}`, { method: 'DELETE' }),
        toggleReminder: (id: string | number) => request(`/leads/reminders/${id}/toggle`, { method: 'PUT' }),
        getDocuments: (id: string | number) => request(`/leads/${id}/documents`),
        addDocument: (id: string | number, data: any) => request(`/leads/${id}/documents`, { method: 'POST', body: JSON.stringify(data) }),
        updateDocument: (leadId: string | number, docId: string | number, data: any) => request(`/leads/${leadId}/documents/${docId}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteDocument: (leadId: string | number, docId: string | number) => request(`/leads/${leadId}/documents/${docId}`, { method: 'DELETE' }),
    },
    customers: {
        getAll: () => request('/customers'),
        create: (data: any) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string | number, data: any) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string | number) => request(`/customers/${id}`, { method: 'DELETE' }),
    },
    invoices: {
        getAll: () => request('/invoices'),
        create: (data: any) => request('/invoices', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string | number, data: any) => request(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string | number) => request(`/invoices/${id}`, { method: 'DELETE' }),
    },
    users: {
        getAll: () => request('/users'),
        create: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string | number, data: any) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string | number) => request(`/users/${id}`, { method: 'DELETE' }),
        getRoles: () => request('/users/roles'),
        createRole: (data: any) => request('/users/roles', { method: 'POST', body: JSON.stringify(data) }),
        updateRole: (id: string | number, data: any) => request(`/users/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteRole: (id: string | number) => request(`/users/roles/${id}`, { method: 'DELETE' }),
    },
    master: {
        create: (type: string, data: any) => request(`/master/${type}`, { method: 'POST', body: JSON.stringify(data) }),
        update: (type: string, id: string | number, data: any) => request(`/master/${type}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (type: string, id: string | number) => request(`/master/${type}/${id}`, { method: 'DELETE' }),
    },
    vendors: {
        getAll: () => request('/vendors'),
        create: (data: any) => request('/vendors', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string | number, data: any) => request(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string | number) => request(`/vendors/${id}`, { method: 'DELETE' }),
    },
    communications: {
        getEmails: (leadId: string | number) => request(`/communications/emails/${leadId}`),
        sendEmail: (data: any) => request('/communications/emails', { method: 'POST', body: JSON.stringify(data) }),
        getWhatsApp: (leadId: string | number) => request(`/communications/whatsapp/${leadId}`),
        sendWhatsApp: (data: any) => request('/communications/whatsapp', { method: 'POST', body: JSON.stringify(data) }),
    },
    quotes: {
        getByLead: (leadId: string | number) => request(`/quotes/lead/${leadId}`),
        create: (data: any) => request('/quotes', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string | number, data: any) => request(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    },
    targets: {
        getAll: () => request('/targets'),
        create: (data: any) => request('/targets', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id: string | number) => request(`/targets/${id}`, { method: 'DELETE' }),
    },
    logs: {
        getSystem: () => request('/logs/system'),
        getUserActivity: (userId: string | number) => request(`/logs/user/${userId}`),
        addSystem: (data: any) => request('/logs/system', { method: 'POST', body: JSON.stringify(data) }),
    },
    chat: {
        getAllMessages: () => request('/chat'),
        sendMessage: (data: any) => request('/chat', { method: 'POST', body: JSON.stringify(data) }),
        markRead: (senderId: string | number) => request(`/chat/read/${senderId}`, { method: 'PUT' }),
    },
    config: {
        init: () => request('/config/all'),
        updateCompany: (data: any) => request('/config/company', { method: 'PUT', body: JSON.stringify(data) }),
    },
    notifications: {
        getAll: () => request('/notifications'),
        markAsRead: (id: string | number) => request(`/notifications/${id}/read`, { method: 'PUT' }),
        markAllAsRead: () => request('/notifications/read-all', { method: 'PUT' }),
    },
    data: {
        getImportHistory: () => request('/data/import-history'),
        importLeads: (data: any) => request('/data/import-leads', { method: 'POST', body: JSON.stringify(data) }),
        deleteImportRecord: (id: string | number) => request(`/data/import-history/${id}`, { method: 'DELETE' }),
        logExport: (data: any) => request('/data/log-export', { method: 'POST', body: JSON.stringify(data) }),
    }
};
