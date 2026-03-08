import { useState, useCallback } from 'react';
import { X, Upload, FileText, Image, Tag, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadDocument } from '../services/api';

const DOC_TYPES = [
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'marksheet', label: 'Marksheet / Certificate' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'voter_id', label: 'Voter ID' },
    { value: 'other', label: 'Other Document' },
];

export default function UploadModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', type: '', description: '', tags: '' });
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFile = (f) => {
        if (!f) return;
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowed.includes(f.type)) return toast.error('Only PDF, JPG, PNG files allowed');
        if (f.size > 10 * 1024 * 1024) return toast.error('File size must be under 10MB');
        setFile(f);
        if (!form.name) setForm((prev) => ({ ...prev, name: f.name.replace(/\.[^/.]+$/, '') }));
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    }, [form.name]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a file to upload');
        if (!form.type) return toast.error('Please select a document type');

        const fd = new FormData();
        fd.append('file', file);
        fd.append('name', form.name);
        fd.append('type', form.type);
        fd.append('description', form.description);
        fd.append('tags', form.tags);

        setLoading(true);
        try {
            await uploadDocument(fd);
            toast.success(`"${form.name}" uploaded successfully! 🎉`);
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: 'rgba(99,102,241,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload size={18} color="var(--primary-light)" />
                        </div>
                        <h3>Upload Document</h3>
                    </div>
                    <button className="modal-close" onClick={onClose} id="upload-modal-close"><X size={16} /></button>
                </div>

                <div className="modal-body">
                    {/* Drop Zone */}
                    <div
                        className={`drop-zone ${dragOver ? 'dragover' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input').click()}
                        id="drop-zone"
                    >
                        <input
                            type="file"
                            id="file-input"
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFile(e.target.files[0])}
                        />
                        {file ? (
                            <>
                                {file.type.includes('image') ? <Image size={40} className="drop-icon" /> : <FileText size={40} className="drop-icon" />}
                                <div className="file-preview">
                                    ✅ {file.name} ({formatSize(file.size)})
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Click to change file</p>
                            </>
                        ) : (
                            <>
                                <Upload size={40} className="drop-icon" />
                                <p><strong>Drop your file here</strong> or click to browse</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Supports PDF, JPG, PNG up to 10MB</p>
                            </>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Document Name</label>
                                <div className="input-wrapper">
                                    <FileText size={16} className="input-icon" />
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="e.g. My Aadhaar Card"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                        id="doc-name"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Document Type</label>
                                <select
                                    className="form-select"
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    required
                                    id="doc-type"
                                >
                                    <option value="">Select type...</option>
                                    {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Add a description for this document..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                id="doc-description"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tags (comma separated)</label>
                            <div className="input-wrapper">
                                <Tag size={16} className="input-icon" />
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="e.g. important, family, government"
                                    value={form.tags}
                                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    id="doc-tags"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }} id="upload-cancel">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }} id="upload-submit">
                                {loading ? (
                                    <span className="flex flex-center gap-2">
                                        <span className="loading-dots"><span /><span /><span /></span> Uploading...
                                    </span>
                                ) : (
                                    <span className="flex flex-center gap-2"><Upload size={14} /> Upload Document</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
