import { useState, useEffect } from 'react';
import { contactsAPI } from '../../services/api';
import './Contacts.css';

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        contact_name: '', phone: '', relation: '', has_whatsapp: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const res = await contactsAPI.getContacts();
            if (res.data.success) setContacts(res.data.contacts);
        } catch (err) {
            setError('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ contact_name: '', phone: '', relation: '', has_whatsapp: false });
        setEditingContact(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (contact) => {
        setFormData({
            contact_name: contact.contact_name,
            phone: contact.phone,
            relation: contact.relation || '',
            has_whatsapp: contact.has_whatsapp
        });
        setEditingContact(contact);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (editingContact) {
                const res = await contactsAPI.updateContact(editingContact.id, formData);
                setSuccess(res.data.message);
            } else {
                const res = await contactsAPI.addContact(formData);
                setSuccess(res.data.message);
            }
            resetForm();
            loadContacts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save contact');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (contact) => {
        if (!window.confirm(`Remove ${contact.contact_name} from emergency contacts?`)) return;
        try {
            const res = await contactsAPI.deleteContact(contact.id);
            setSuccess(res.data.message);
            loadContacts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete contact');
        }
    };

    const relationIcons = {
        'Mother': '👩', 'Father': '👨', 'Sister': '👧', 'Brother': '👦',
        'Husband': '💑', 'Wife': '💑', 'Friend': '🤝', 'Colleague': '🏢',
        'Neighbor': '🏘️', 'Other': '👤'
    };

    if (loading) {
        return (
            <div className="contacts-loading">
                <div className="contacts-loading-spinner"></div>
                <p>Loading contacts...</p>
            </div>
        );
    }

    return (
        <div className="contacts-page">
            <div className="contacts-header">
                <div className="contacts-header-text">
                    <h1>👥 Emergency Contacts</h1>
                    <p>Add up to 10 trusted contacts who'll be alerted during emergencies</p>
                </div>
                <div className="contacts-count-badge">
                    <span className="contacts-count">{contacts.length}</span>
                    <span className="contacts-max">/ 10</span>
                </div>
            </div>

            {error && (
                <div className="contacts-alert contacts-alert-error animate-fadeInUp">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    {error}
                    <button onClick={() => setError('')} className="alert-close">✕</button>
                </div>
            )}

            {success && (
                <div className="contacts-alert contacts-alert-success animate-fadeInUp">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {success}
                    <button onClick={() => setSuccess('')} className="alert-close">✕</button>
                </div>
            )}

            {/* Contact Cards */}
            <div className="contacts-grid">
                {contacts.map((contact, index) => (
                    <div key={contact.id} className="contact-card glass-card animate-fadeInUp"
                        style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className="contact-card-header">
                            <div className="contact-avatar">
                                {relationIcons[contact.relation] || contact.contact_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="contact-info">
                                <h3 className="contact-name">{contact.contact_name}</h3>
                                <p className="contact-phone">{contact.phone}</p>
                            </div>
                        </div>
                        <div className="contact-card-meta">
                            {contact.relation && (
                                <span className="contact-relation-badge">{contact.relation}</span>
                            )}
                            {contact.has_whatsapp && (
                                <span className="contact-whatsapp-badge">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    WhatsApp
                                </span>
                            )}
                        </div>
                        <div className="contact-card-actions">
                            <button onClick={() => handleEdit(contact)} className="contact-btn contact-btn-edit" title="Edit Contact">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                            <button onClick={() => handleDelete(contact)} className="contact-btn contact-btn-delete" title="Remove Contact">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Contact Button */}
                {contacts.length < 10 && (
                    <button onClick={() => { resetForm(); setShowForm(true); }}
                        className="contact-card contact-card-add glass-card animate-fadeInUp"
                        style={{ animationDelay: `${contacts.length * 0.05}s` }}>
                        <div className="add-contact-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="add-contact-text">Add Contact</span>
                    </button>
                )}
            </div>

            {/* Add/Edit Contact Modal */}
            {showForm && (
                <div className="contacts-modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
                    <div className="contacts-modal glass-card animate-fadeInUp">
                        <div className="contacts-modal-header">
                            <h2>{editingContact ? '✏️ Edit Contact' : '➕ Add Emergency Contact'}</h2>
                            <button onClick={resetForm} className="modal-close-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="contacts-form">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input type="text" value={formData.contact_name}
                                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    placeholder="e.g., Amma, Papa, Priya" required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 9876543210" required />
                            </div>
                            <div className="form-group">
                                <label>Relation</label>
                                <select value={formData.relation}
                                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}>
                                    <option value="">Select relation</option>
                                    {Object.keys(relationIcons).map(r => (
                                        <option key={r} value={r}>{relationIcons[r]} {r}</option>
                                    ))}
                                </select>
                            </div>
                            <label className="form-checkbox">
                                <input type="checkbox" checked={formData.has_whatsapp}
                                    onChange={(e) => setFormData({ ...formData, has_whatsapp: e.target.checked })} />
                                <span className="checkbox-custom"></span>
                                <span>This contact has WhatsApp</span>
                            </label>
                            <div className="form-actions">
                                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={submitting} className="btn-primary">
                                    {submitting ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {contacts.length === 0 && !showForm && (
                <div className="contacts-empty animate-fadeInUp">
                    <div className="contacts-empty-icon">👥</div>
                    <h3>No Emergency Contacts Yet</h3>
                    <p>Add trusted people who'll be instantly notified when you trigger an SOS alert.</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                        Add Your First Contact
                    </button>
                </div>
            )}
        </div>
    );
}
