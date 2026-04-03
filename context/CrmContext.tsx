
import React, { useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Lead, Customer, Invoice, User, Role, Vendor, LeadNote, LeadReminder, LeadDocument,
  CompanyDetails, EmailApiCredentials, MobileApiCredentials, DocumentStatus,
  SystemLog, PermissionCategory, PermissionSection, ImportedFile, Announcement,
  Target, Notification, Email, WhatsAppMessage, Quote, WorkflowRule,
  SaleBy, WorkedBy, LeadStatus, LeadSource, ApplicationStatusItem, PassportStatusItem,
  DocumentType, RemarkStatus, ServiceType, LostReason,
  UserActivityLog, ChatMessage
} from '../types';
import * as MockData from '../services/mockData';
import { api } from '../services/api';
import { CrmContext } from './CrmContextCore';

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('crm_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [leadNotes, setLeadNotes] = useState<LeadNote[]>([]);
  const [leadReminders, setLeadReminders] = useState<LeadReminder[]>([]);
  const [leadDocuments, setLeadDocuments] = useState<LeadDocument[]>([]);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(MockData.mockCompanyDetails);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [applicationStatuses, setApplicationStatuses] = useState<ApplicationStatusItem[]>([]);
  const [passportStatuses, setPassportStatuses] = useState<PassportStatusItem[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [remarkStatuses, setRemarkStatuses] = useState<RemarkStatus[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [lostReasons, setLostReasons] = useState<LostReason[]>([]);
  const [saleBy, setSaleBy] = useState<SaleBy[]>([]);
  const [workedBy, setWorkedBy] = useState<WorkedBy[]>([]);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [currentLeadIdForQuote, setCurrentLeadIdForQuote] = useState<string | null>(null);

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [userActivityLogs, setUserActivityLogs] = useState<UserActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowRule | null>(null);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [permissionSections, setPermissionSections] = useState<PermissionSection[]>([]);
  const [importedLeadFiles, setImportedLeadFiles] = useState<ImportedFile[]>([]);
  const [importedContactFiles, setImportedContactFiles] = useState<ImportedFile[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [emailApiCredentials, setEmailApiCredentials] = useState<EmailApiCredentials>(MockData.mockEmailApiCredentials);
  const [mobileApiCredentials, setMobileApiCredentials] = useState<MobileApiCredentials>(MockData.mockMobileApiCredentials);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [whatsappMessages, setWhatsAppMessages] = useState<WhatsAppMessage[]>([]);

  const fetchChatMessages = useCallback(async () => {
    if (!currentUser) return;
    try {
      const chatData = await api.chat.getAllMessages();
      setMessages(chatData);
    } catch (err) {
      console.error('Failed to sync chat messages:', err);
    }
  }, [currentUser]);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
        const notifData = await api.notifications.getAll();
        setNotifications(notifData);
    } catch (err) {
        console.error('Failed to sync notifications:', err);
    }
  }, [currentUser]);

  /**
   * Application Handshake
   * Refactored to avoid clearing state during refreshes.
   */
  const fetchData = useCallback(async () => {
    if (!localStorage.getItem('crm_token')) return;

    // Only show global loading spinner if we don't have core data yet
    const hasData = leads.length > 0 || customers.length > 0;
    if (!hasData) {
        setIsLoading(true);
    }

    try {
      const [leadsData, customersData, invoicesData, configData, targetData, logData, importHistory] = await Promise.all([
        api.leads.getAll(),
        api.customers.getAll(),
        api.invoices.getAll(),
        api.config.init(),
        api.targets.getAll(),
        api.logs.getSystem(),
        api.data.getImportHistory()
      ]);
      
      setLeads(leadsData);
      setCustomers(customersData);
      setInvoices(invoicesData);
      setUsers(configData.users);
      setRoles(configData.roles);
      setVendors(configData.vendors);
      setLeadSources(configData.leadSources);
      setLeadStatuses(configData.leadStatuses);
      setApplicationStatuses(configData.applicationStatuses);
      setPassportStatuses(configData.passportStatuses);
      setDocumentTypes(configData.documentTypes);
      setRemarkStatuses(configData.remarkStatuses || []);
      setServiceTypes(configData.serviceTypes || []);
      setLostReasons(configData.lostReasons || []);
      setSaleBy(configData.saleBy || []);
      setWorkedBy(configData.workedBy || []);
      setTargets(targetData);
      setSystemLogs(logData);
      setImportedLeadFiles(importHistory);
      
      if (configData.companyDetails) setCompanyDetails(configData.companyDetails);
      
      setAnnouncements(MockData.mockAnnouncements);
      setWorkflowRules(MockData.mockWorkflowRules);
      setPermissionCategories(MockData.mockPermissionCategories);
      setPermissionSections(MockData.mockPermissionSections);

      // Async fetch non-critical components
      fetchChatMessages();
      fetchNotifications();
      
    } catch (err) {
      console.error('Data sync failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchChatMessages, fetchNotifications, leads.length, customers.length]);

  // Only trigger fetchData when the logged-in User ID changes (identity),
  // not when any property of the user (like imageUrl) changes.
  useEffect(() => { 
    if (currentUser?.id) fetchData(); 
  }, [currentUser?.id, fetchData]);

  useEffect(() => {
    if (!currentUser) return;
    const pollId = setInterval(() => {
        fetchChatMessages();
        fetchNotifications();
    }, 10000); // 10s is sufficient for "live-ish" updates
    return () => clearInterval(pollId);
  }, [currentUser, fetchChatMessages, fetchNotifications]);

  const login = async (email: string, password?: string) => {
    try {
        const res = await api.auth.login({ email, password });
        if (res.success && res.token) {
            localStorage.setItem('crm_token', res.token);
            localStorage.setItem('crm_currentUser', JSON.stringify(res.user));
            setCurrentUser(res.user);
            return true;
        }
        return false;
    } catch (err) { return false; }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_currentUser');
    setCurrentUser(null);
  }, []);

  const openLeadModal = useCallback((lead: Lead | null) => { setEditingLead(lead); setIsLeadModalOpen(true); }, []);
  const closeLeadModal = useCallback(() => setIsLeadModalOpen(false), []);

  const addLead = async (data: any) => { await api.leads.create(data); await fetchData(); };
  
  const updateLead = async (data: Lead) => { 
    const oldLeads = [...leads];
    setLeads(prev => prev.map(l => String(l.id) === String(data.id) ? { ...l, ...data } : l));
    
    try {
        await api.leads.update(data.id, data); 
        await fetchData(); 
    } catch (err) {
        setLeads(oldLeads);
        throw err;
    }
  };

  const deleteLead = async (id: string | number) => {
      await api.leads.delete(id);
      await fetchData();
  };

  const bulkAssignLeads = async (ids: any[], userId: any) => { await api.leads.bulkAssign(ids, userId); await fetchData(); };
  const bulkDeleteLeads = async (ids: any[]) => { await api.leads.bulkDelete(ids); await fetchData(); };
  const bulkUpdateLeadStatus = async (ids: any[], status: string) => { await api.leads.bulkStatus(ids, status); await fetchData(); };
  const convertLeadToCustomer = async (lead: Lead) => { 
    await api.leads.convert(lead.id, {
        customerIdString: `CUST-${Date.now()}`,
        saleById: currentUser?.id || lead.assignedToId,
        closeDate: new Date().toISOString().split('T')[0]
    });
    await fetchData();
  };

  const addCustomer = async (data: any) => { await api.customers.create(data); await fetchData(); };
  const updateCustomer = async (data: Customer) => { await api.customers.update(data.id, data); await fetchData(); };
  const deleteCustomer = async (id: any) => { await api.customers.delete(id); await fetchData(); };

  const addInvoice = async (data: any) => { await api.invoices.create(data); await fetchData(); };
  
  const updateInvoice = async (data: Invoice) => { 
    const oldInvoices = [...invoices];
    const customer = customers.find(c => String(c.id) === String(data.customerId));
    const updatedInvoice = { ...data, customerName: customer?.name || data.customerName };
    setInvoices(prev => prev.map(inv => String(inv.id) === String(data.id) ? updatedInvoice : inv));

    try {
        await api.invoices.update(data.id, data); 
        await fetchData(); 
    } catch (err) {
        setInvoices(oldInvoices);
        throw err;
    }
  };

  const deleteInvoice = async (id: any) => { await api.invoices.delete(id); await fetchData(); };

  const addUser = async (data: any) => { await api.users.create(data); await fetchData(); };
  const updateUser = async (data: User) => { await api.users.update(data.id, data); await fetchData(); };
  const deleteUser = async (id: any) => { await api.users.delete(id); await fetchData(); };

  const updateProfile = async (userId: string | number, data: Partial<User>) => { 
    try {
        await api.users.update(userId, data); 
        
        // Critically update the global state if editing own profile
        if (String(userId) === String(currentUser?.id)) {
            setCurrentUser(prev => {
                if (!prev) return null;
                const newUser = { ...prev, ...data };
                localStorage.setItem('crm_currentUser', JSON.stringify(newUser));
                return newUser;
            });
        }
        
        // Refresh silently to avoid blank table issues
        await fetchData(); 
    } catch (err) {
        console.error('Failed to update profile:', err);
        throw err;
    }
  };

  const getUserActivityLogs = useCallback((userId: any) => userActivityLogs.filter(l => String(l.userId) === String(userId)), [userActivityLogs]);
  
  const fetchUserActivityLogs = useCallback(async (userId: string | number) => {
    try {
        const logs = await api.logs.getUserActivity(userId);
        setUserActivityLogs(prev => [...prev.filter(l => String(l.userId) !== String(userId)), ...logs]);
    } catch (err) {
        console.error('Failed to fetch user activity logs:', err);
    }
  }, []);

  const fetchLeadActivities = useCallback(async (leadId: string | number) => {
    try {
        const [notes, reminders, docs, leadQuotes] = await Promise.all([
            api.leads.getNotes(leadId),
            api.leads.getReminders(leadId),
            api.leads.getDocuments(leadId),
            api.quotes.getByLead(leadId)
        ]);
        setLeadNotes(prev => [...prev.filter(n => String(n.leadId) !== String(leadId)), ...notes]);
        setLeadReminders(prev => [...prev.filter(r => String(r.leadId) !== String(leadId)), ...reminders]);
        setLeadDocuments(prev => [...prev.filter(d => String(d.leadId) !== String(leadId)), ...docs]);
        setQuotes(prev => [...prev.filter(q => String(q.leadId) !== String(leadId)), ...leadQuotes]);
    } catch (err) {
        console.error('Failed to fetch lead activities:', err);
    }
  }, []);

  const getNotesForLead = useCallback((leadId: string | number) => leadNotes.filter(n => String(n.leadId) === String(leadId)), [leadNotes]);
  
  const addNoteForLead = async (leadId: any, content: string) => {
    if (!currentUser) return;
    await api.leads.addNote(leadId, { content, author: currentUser.name });
    await Promise.all([
        fetchLeadActivities(leadId),
        fetchData()
    ]);
  };
  
  const updateNote = async (id: any, content: string) => {
    const note = leadNotes.find(n => String(n.id) === String(id));
    if(!note) return;
    await api.leads.updateNote(note.leadId, id, { content });
    await Promise.all([
        fetchLeadActivities(note.leadId),
        fetchData()
    ]);
  }; 
  
  const deleteNote = async (id: any, noteId: any) => {
    const note = leadNotes.find(n => String(n.id) === String(noteId));
    if(!note) return;
    await api.leads.deleteNote(note.leadId, noteId);
    await Promise.all([
        fetchLeadActivities(note.leadId),
        fetchData()
    ]);
  };

  const getRemindersForLead = useCallback((leadId: string | number) => leadReminders.filter(r => String(r.leadId) === String(leadId)), [leadReminders]);
  
  const addReminderForLead = async (leadId: any, note: string, dueDate: string) => {
    await api.leads.addReminder(leadId, { note, dueDate });
    await Promise.all([
        fetchLeadActivities(leadId),
        fetchData()
    ]);
  };
  
  const updateReminder = async (id: any, note: string, dueDate: string) => {
    const rem = leadReminders.find(r => String(r.id) === String(id));
    if(!rem) return;
    await api.leads.updateReminder(rem.leadId, id, { note, dueDate });
    await fetchLeadActivities(rem.leadId);
  };
  
  const deleteReminder = async (id: any, reminderId: any) => {
    const rem = leadReminders.find(r => String(r.id) === String(reminderId));
    if(!rem) return;
    await api.leads.deleteReminder(rem.leadId, reminderId);
    await Promise.all([
        fetchLeadActivities(rem.leadId),
        fetchData()
    ]);
  };
  
  const toggleReminderCompletion = async (id: any) => {
    const rem = leadReminders.find(r => String(r.id) === String(id));
    await api.leads.toggleReminder(id);
    if (rem) {
        await Promise.all([
            fetchLeadActivities(rem.leadId),
            fetchData()
        ]);
    }
  };

  const getDocumentsForLead = useCallback((leadId: string | number) => leadDocuments.filter(d => String(d.leadId) === String(leadId)), [leadDocuments]);
  const addDocumentForLead = async (leadId: any, name: string) => {
    await api.leads.addDocument(leadId, { name, status: 'Pending' });
    await fetchLeadActivities(leadId);
  };
  const updateDocumentStatus = async (leadId: any, docId: any, status: DocumentStatus, fileName?: string, fileType?: string, fileData?: string) => {
    await api.leads.updateDocument(leadId, docId, { status, fileName, fileType, fileData });
    await fetchLeadActivities(leadId);
  };
  const deleteDocumentForLead = async (leadId: any, docId: any) => {
    await api.leads.deleteDocument(leadId, docId);
    setLeadDocuments(prev => prev.filter(d => String(d.id) !== String(docId)));
  };

  const sendMessage = async (receiverId: any, content: string) => {
    if (!currentUser) return;
    const tempId = uuidv4();
    const newMessage: ChatMessage = { id: tempId, senderId: currentUser.id, receiverId, content, timestamp: new Date().toISOString(), isRead: false };
    setMessages(prev => [...prev, newMessage]);
    try {
        await api.chat.sendMessage({ receiverId, content });
        fetchChatMessages();
    } catch (err) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        throw err;
    }
  };

  const getMessagesWithUser = useCallback((userId: any) => {
      if (!currentUser) return [];
      const currentId = String(currentUser.id);
      const otherId = String(userId);
      return messages.filter(m => (String(m.senderId) === currentId && String(m.receiverId) === otherId) || (String(m.senderId) === otherId && String(m.receiverId) === currentId));
  }, [currentUser, messages]);

  const markMessagesAsRead = useCallback(async (userId: string | number) => {
    if (!currentUser) return;
    const currentId = String(currentUser.id);
    const senderId = String(userId);
    setMessages(prev => prev.map(m => (String(m.senderId) === senderId && String(m.receiverId) === currentId) ? { ...m, isRead: true } : m));
    try {
        await api.chat.markRead(senderId);
    } catch (err) {
        console.error('Failed to mark chat as read:', err);
    }
  }, [currentUser]);

  const openVendorModal = useCallback((v: Vendor | null) => { setEditingVendor(v); setIsVendorModalOpen(true); }, []);
  const closeVendorModal = useCallback(() => setIsVendorModalOpen(false), []);
  const addVendor = async (data: any) => { await api.vendors.create(data); await fetchData(); };
  const updateVendor = async (data: Vendor) => { await api.vendors.update(data.id, data); await fetchData(); };
  const deleteVendor = async (id: any) => { await api.vendors.delete(id); await fetchData(); };

  const openRoleModal = useCallback((r: Role | null) => { setEditingRole(r); setIsRoleModalOpen(true); }, []);
  const closeRoleModal = useCallback(() => setIsRoleModalOpen(false), []);
  const addRole = async (data: any) => { await api.users.createRole(data); await fetchData(); };
  const updateRole = async (data: Role) => { await api.users.updateRole(data.id, data); await fetchData(); };
  const deleteRole = async (id: any) => { await api.users.delete(id); await fetchData(); };

  const getQuotesForLead = useCallback((leadId: any) => quotes.filter(q => String(q.leadId) === String(leadId)), [quotes]);
  const openQuoteBuilder = useCallback((leadId: any, quote?: Quote | null) => { setCurrentLeadIdForQuote(String(leadId)); setEditingQuote(quote || null); setIsQuoteBuilderOpen(true); }, []);
  const closeQuoteBuilder = useCallback(() => setIsQuoteBuilderOpen(false), []);
  const addQuote = async (leadId: any, quote: any) => { 
    await api.quotes.create({ ...quote, leadId, quoteNumber: `QT-${Date.now()}` }); 
    const qData = await api.quotes.getByLead(leadId);
    setQuotes(prev => [...prev.filter(q => String(q.leadId) !== String(leadId)), ...qData]);
  };
  const updateQuote = async (quote: Quote) => { 
    await api.quotes.update(quote.id, quote); 
    const qData = await api.quotes.getByLead(quote.leadId);
    setQuotes(prev => [...prev.filter(q => String(q.leadId) !== String(quote.leadId)), ...qData]);
  };

  const updateCompanyDetails = async (details: CompanyDetails) => { await api.config.updateCompany(details); await fetchData(); };
  const updateEmailApiCredentials = useCallback(async (creds: EmailApiCredentials) => { setEmailApiCredentials(creds); }, []);
  const updateMobileApiCredentials = useCallback(async (creds: MobileApiCredentials) => { setMobileApiCredentials(creds); }, []);

  const addSaleBy = async (data: any) => { await api.master.create('sale-by', data); await fetchData(); };
  const updateSaleBy = async (data: SaleBy) => { await api.master.update('sale-by', data.id, data); await fetchData(); };
  const deleteSaleBy = async (id: any) => { await api.master.delete('sale-by', id); await fetchData(); };
  const addWorkedBy = async (data: any) => { await api.master.create('worked-by', data); await fetchData(); };
  const updateWorkedBy = async (data: WorkedBy) => { await api.master.update('worked-by', data.id, data); await fetchData(); };
  const deleteWorkedBy = async (id: any) => { await api.master.delete('worked-by', id); await fetchData(); };

  const markNotificationAsRead = async (id: any) => { 
    await api.notifications.markAsRead(id);
    setNotifications(prev => prev.map(n => String(n.id) === String(id) ? { ...n, isRead: true } : n)); 
  };
  const markAllNotificationsAsRead = async () => {
    await api.notifications.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  const addAnnouncement = async (data: any) => { setAnnouncements(prev => [...prev, { ...data, id: uuidv4(), authorId: currentUser?.id, scheduledAt: data.scheduledAt || new Date().toISOString() }]); };

  const openWorkflowModal = useCallback((rule: WorkflowRule | null) => { setEditingWorkflow(rule); setIsWorkflowModalOpen(true); }, []);
  const closeWorkflowModal = useCallback(() => setIsWorkflowModalOpen(false), []);
  
  const addWorkflowRule = async (data: any) => { setWorkflowRules(prev => [...prev, { ...data, id: uuidv4() }]); };
  const updateWorkflowRule = async (data: WorkflowRule) => { setWorkflowRules(prev => prev.map(r => r.id === data.id ? data : r)); };
  const deleteWorkflowRule = async (id: any) => { setWorkflowRules(prev => prev.filter(r => r.id !== id)); };

  const addPermissionCategory = async (cat: any) => { setPermissionCategories(prev => [...prev, { ...cat, id: uuidv4() }]); };
  const updatePermissionCategory = async (cat: PermissionCategory) => { setPermissionCategories(prev => prev.map(c => c.id === cat.id ? cat : c)); };
  const deletePermissionCategory = async (id: any) => { setPermissionCategories(prev => prev.filter(c => c.id !== id)); };
  const addPermissionSection = async (sec: any) => { setPermissionSections(prev => [...prev, { ...sec, id: uuidv4() }]); };
  const updatePermissionSection = async (sec: PermissionSection) => { setPermissionSections(prev => prev.map(s => s.id === sec.id ? sec : s)); };
  const deletePermissionSection = async (id: any) => { setPermissionSections(prev => prev.filter(s => s.id !== id)); };

  const importLeads = async (file: File, defaults: any) => { 
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const leadsArray = [];
        
        for(let i = 1; i < lines.length; i++) {
            if(!lines[i].trim()) continue;
            const values = lines[i].split(',');
            const lead: any = {};
            headers.forEach((header, index) => {
                lead[header.trim().toLowerCase()] = values[index]?.trim();
            });
            leadsArray.push(lead);
        }
        
        try {
            await api.data.importLeads({ leads: leadsArray, defaults, fileName: file.name });
            await fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };
    reader.readAsText(file);
  };
  
  const deleteImportedLeadFile = async (id: any) => { 
    await api.data.deleteImportRecord(id);
    await fetchData();
  };

  const logExport = async (module: string, count: number) => {
    await api.data.logExport({ module, count });
    await fetchData();
  };
  
  const addTarget = async (target: any) => { 
    await api.targets.create(target); 
    const tData = await api.targets.getAll();
    setTargets(tData);
  };
  const deleteTarget = async (id: any) => {
    await api.targets.delete(id);
    const tData = await api.targets.getAll();
    setTargets(tData);
  };

  const addLeadStatus = async (name: string) => { await api.master.create('lead-status', { name }); await fetchData(); };
  const updateLeadStatus = async (item: LeadStatus) => { await api.master.update('lead-status', item.id, item); await fetchData(); };
  const deleteLeadStatus = async (id: string | number) => { await api.master.delete('lead-status', id); await fetchData(); };
  
  const addApplicationStatus = async (name: string) => { await api.master.create('application-status', { name }); await fetchData(); };
  const updateApplicationStatus = async (item: ApplicationStatusItem) => { await api.master.update('application-status', item.id, item); await fetchData(); };
  const deleteApplicationStatus = async (id: string | number) => { await api.master.delete('application-status', id); await fetchData(); };

  const addPassportStatus = async (name: string) => { await api.master.create('passport-status', { name }); await fetchData(); };
  const updatePassportStatus = async (item: PassportStatusItem) => { await api.master.update('passport-status', item.id, item); await fetchData(); };
  const deletePassportStatus = async (id: string | number) => { await api.master.delete('passport-status', id); await fetchData(); };

  const addDocumentType = async (name: string) => { await api.master.create('document-type', { name }); await fetchData(); };
  const updateDocumentType = async (item: DocumentType) => { await api.master.update('document-type', item.id, item); await fetchData(); };
  const deleteDocumentType = async (id: string | number) => { await api.master.delete('document-type', id); await fetchData(); };

  const addRemarkStatus = async (name: string) => { await api.master.create('remark-status', { name }); await fetchData(); };
  const updateRemarkStatus = async (item: RemarkStatus) => { await api.master.update('remark-status', item.id, item); await fetchData(); };
  const deleteRemarkStatus = async (id: string | number) => { await api.master.delete('remark-status', id); await fetchData(); };

  const addLeadSource = async (name: string) => { await api.master.create('lead-source', { name }); await fetchData(); };
  const updateLeadSource = async (item: LeadSource) => { await api.master.update('lead-source', item.id, item); await fetchData(); };
  const deleteLeadSource = async (id: string | number) => { await api.master.delete('lead-source', id); await fetchData(); };

  const addServiceType = async (name: string) => { await api.master.create('service-type', { name }); await fetchData(); };
  const updateServiceType = async (item: ServiceType) => { await api.master.update('service-type', item.id, item); await fetchData(); };
  const deleteServiceType = async (id: string | number) => { await api.master.delete('service-type', id); await fetchData(); };

  const addLostReason = async (name: string) => { await api.master.create('lost-reason', { name }); await fetchData(); };
  const updateLostReason = async (item: LostReason) => { await api.master.update('lost-reason', item.id, item); await fetchData(); };
  const deleteLostReason = async (id: string | number) => { await api.master.delete('lost-reason', id); await fetchData(); };

  const getEmailsForLead = useCallback((leadId: string | number) => emails.filter(e => String(e.leadId) === String(leadId)), [emails]);
  const sendEmail = async (data: any) => { 
    await api.communications.sendEmail(data); 
    const eData = await api.communications.getEmails(data.leadId);
    setEmails(prev => [...prev.filter(e => String(e.leadId) !== String(data.leadId)), ...eData]);
  };
  const getWhatsAppMessagesForLead = useCallback((leadId: string | number) => whatsappMessages.filter(m => String(m.leadId) === String(leadId)), [whatsappMessages]);
  const sendWhatsAppMessage = async (leadId: any, content: string) => { 
    await api.communications.sendWhatsApp({ leadId, content }); 
    const wData = await api.communications.getWhatsApp(leadId);
    setWhatsAppMessages(prev => [...prev.filter(w => String(w.leadId) !== String(leadId)), ...wData]);
  };

  const getUnreadMessageCountForUser = useCallback((userId: string | number) => messages.filter(m => !m.isRead && String(m.senderId) === String(userId)).length, [messages]);
  const getLastMessageForUser = useCallback((userId: string | number) => {
    const userMsgs = messages.filter(m => String(m.senderId) === String(userId) || String(m.receiverId) === String(userId));
    return userMsgs[userMsgs.length - 1];
  }, [messages]);

  const getTotalUnreadMessages = useCallback(() => {
    if (!currentUser) return 0;
    return messages.filter(m => !m.isRead && String(m.receiverId) === String(currentUser.id)).length;
  }, [messages, currentUser]);

  const getUnreadNotificationCount = useCallback(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const contextValue = useMemo(() => ({
    currentUser, users, leads, customers, invoices, roles, vendors, leadNotes, leadReminders, leadDocuments,
    companyDetails, leadStatuses, leadSources, applicationStatuses, passportStatuses, documentTypes,
    remarkStatuses, serviceTypes, lostReasons, saleBy, workedBy,
    isLeadModalOpen, editingLead, isInvoiceModalOpen, editingInvoice,
    isUserModalOpen, editingUser, isRoleModalOpen, editingRole,
    isVendorModalOpen, editingVendor, isQuoteBuilderOpen, editingQuote, currentLeadIdForQuote,
    isLoading,
    systemLogs, userActivityLogs, notifications, announcements,
    workflowRules, isWorkflowModalOpen, editingWorkflow, permissionCategories, permissionSections,
    importedLeadFiles, importedContactFiles, targets, emailApiCredentials, mobileApiCredentials,
    login, logout,
    openLeadModal, closeLeadModal, addLead, updateLead, deleteLead, bulkAssignLeads, bulkDeleteLeads, bulkUpdateLeadStatus, convertLeadToCustomer,
    openCustomerModal: () => {}, closeCustomerModal: () => {},
    addCustomer, updateCustomer, deleteCustomer, getCustomerById: (id: string | number) => customers.find(c => String(c.id) === String(id)),
    generateNextCustomerId: () => `CUST-${customers.length + 1}`,
    openInvoiceModal: (i: Invoice | null) => { setEditingInvoice(i); setIsInvoiceModalOpen(true); }, 
    closeInvoiceModal: () => setIsInvoiceModalOpen(false), 
    addInvoice, updateInvoice, deleteInvoice,
    openUserModal: (u: User | null) => { setEditingUser(u); setIsUserModalOpen(true); }, 
    closeUserModal: () => setIsUserModalOpen(false), 
    addUser, updateUser, deleteUser, updateProfile, getUserActivityLogs, fetchUserActivityLogs,
    fetchLeadActivities,
    getNotesForLead, addNoteForLead, updateNote, deleteNote,
    getRemindersForLead, addReminderForLead, updateReminder, deleteReminder, toggleReminderCompletion,
    getDocumentsForLead, addDocumentForLead, updateDocumentStatus, deleteDocumentForLead,
    getMessagesWithUser, sendMessage, getTotalUnreadMessages,
    markMessagesAsRead, getUnreadMessageCountForUser, getLastMessageForUser,
    openVendorModal, closeVendorModal, addVendor, updateVendor, deleteVendor,
    openRoleModal, closeRoleModal, addRole, updateRole, deleteRole,
    getQuotesForLead, openQuoteBuilder, closeQuoteBuilder, addQuote, updateQuote,
    updateCompanyDetails, updateEmailApiCredentials, updateMobileApiCredentials,
    addSaleBy, updateSaleBy, deleteSaleBy, addWorkedBy, updateWorkedBy, deleteWorkedBy,
    markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount, fetchNotifications,
    addAnnouncement,
    openWorkflowModal, closeWorkflowModal, addWorkflowRule, updateWorkflowRule, deleteWorkflowRule,
    addPermissionCategory, updatePermissionCategory, deletePermissionCategory,
    addPermissionSection, updatePermissionSection, deletePermissionSection,
    importLeads, deleteImportedLeadFile, logExport, addTarget, deleteTarget,
    addLeadStatus, updateLeadStatus, deleteLeadStatus,
    addApplicationStatus, updateApplicationStatus, deleteApplicationStatus,
    addPassportStatus, updatePassportStatus, deletePassportStatus,
    addDocumentType, updateDocumentType, deleteDocumentType,
    addRemarkStatus, updateRemarkStatus, deleteRemarkStatus,
    addLeadSource, updateLeadSource, deleteLeadSource,
    addServiceType, updateServiceType, deleteServiceType,
    addLostReason, updateLostReason, deleteLostReason,
    getEmailsForLead, sendEmail, getWhatsAppMessagesForLead, sendWhatsAppMessage
  }), [
    currentUser, users, leads, customers, invoices, roles, vendors, leadNotes, leadReminders, leadDocuments,
    companyDetails, leadStatuses, leadSources, applicationStatuses, passportStatuses, documentTypes,
    remarkStatuses, serviceTypes, lostReasons, saleBy, workedBy,
    isLeadModalOpen, editingLead, isInvoiceModalOpen, editingInvoice,
    isUserModalOpen, editingUser, isRoleModalOpen, editingRole,
    isVendorModalOpen, editingVendor, isQuoteBuilderOpen, editingQuote, currentLeadIdForQuote,
    isLoading, systemLogs, userActivityLogs, notifications, announcements,
    workflowRules, isWorkflowModalOpen, editingWorkflow, permissionCategories, permissionSections,
    importedLeadFiles, importedContactFiles, targets, emailApiCredentials, mobileApiCredentials,
    login, logout, openLeadModal, closeLeadModal, addLead, updateLead, deleteLead, bulkAssignLeads, bulkDeleteLeads,
    bulkUpdateLeadStatus, convertLeadToCustomer, addCustomer, updateCustomer, deleteCustomer,
    getUserActivityLogs, fetchUserActivityLogs, fetchLeadActivities, getNotesForLead, addNoteForLead, updateNote, deleteNote,
    getRemindersForLead, addReminderForLead, updateReminder, deleteReminder, toggleReminderCompletion,
    getDocumentsForLead, addDocumentForLead, updateDocumentStatus, deleteDocumentForLead,
    getMessagesWithUser, sendMessage, getTotalUnreadMessages, markMessagesAsRead,
    getUnreadMessageCountForUser, getLastMessageForUser, openVendorModal, closeVendorModal,
    addVendor, updateVendor, deleteVendor, openRoleModal, closeRoleModal, addRole, updateRole,
    deleteRole, getQuotesForLead, openQuoteBuilder, closeQuoteBuilder, addQuote, updateQuote,
    updateCompanyDetails, updateEmailApiCredentials, updateMobileApiCredentials, addSaleBy,
    updateSaleBy, deleteSaleBy, addWorkedBy, updateWorkedBy, deleteWorkedBy,
    markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount, fetchNotifications, addAnnouncement, openWorkflowModal,
    closeWorkflowModal, addWorkflowRule, updateWorkflowRule, deleteWorkflowRule,
    addPermissionCategory, updatePermissionCategory, deletePermissionCategory,
    addPermissionSection, updatePermissionSection, deletePermissionSection, importLeads,
    deleteImportedLeadFile, logExport, addTarget, deleteTarget, addLeadStatus, updateLeadStatus, deleteLeadStatus,
    addApplicationStatus, updateApplicationStatus, deleteApplicationStatus, addPassportStatus,
    updatePassportStatus, deletePassportStatus, addDocumentType, updateDocumentType,
    deleteDocumentType, addRemarkStatus, updateRemarkStatus, deleteRemarkStatus, addLeadSource,
    updateLeadSource, deleteLeadSource, addServiceType, updateServiceType, deleteServiceType,
    addLostReason, updateLostReason, deleteLostReason, getEmailsForLead, sendEmail,
    getWhatsAppMessagesForLead, sendWhatsAppMessage, quotes, emails, whatsappMessages, messages
  ]);

  return <CrmContext.Provider value={contextValue}>{children}</CrmContext.Provider>;
};
