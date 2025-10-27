import React, { useEffect, useState } from 'react';
export default function Regions() {
    const [items, setItems] = useState([]); const [open, setOpen] = useState(false); const [edit, setEdit] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    useEffect(() => { fetch('http://localhost:5000/api/regions').then(r => r.json()).then(d => setItems(d || [])).catch(() => setItems([{ id: 1, name: 'North', description: 'Northern Grid' }])) }, [])
    function submit(e) { e.preventDefault(); const method = edit ? 'PUT' : 'POST'; const url = edit ? `http://localhost:5000/api/regions/${edit.id}` : 'http://localhost:5000/api/regions'; fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(() => { setOpen(false); window.location.reload() }).catch(() => { setOpen(false); window.location.reload() }) }
    function del(id) { if (!confirm('Delete region?')) return; fetch(`http://localhost:5000/api/regions/${id}`, { method: 'DELETE' }).then(() => window.location.reload()).catch(() => window.location.reload()) }
    return (
        <div className="fade-page">
            <div className="d-flex justify-content-between mb-3"><h4 style={{ fontWeight: 700 }}>Regions</h4><button className="btn btn-custom" onClick={() => { setForm({ name: '', description: '' }); setEdit(null); setOpen(true) }}>Add Region</button></div>
            <div className="card p-3">
                <table className="table">
                    <thead><tr><th>#</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
                    <tbody>
                        {items.map((r, i) => (<tr key={r.id || i}><td>{i + 1}</td><td>{r.name}</td><td>{r.description}</td><td><button className="btn btn-sm btn-outline-primary action-btn" onClick={() => { setForm(r); setEdit(r); setOpen(true) }}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => del(r.id)}>Delete</button></td></tr>))}
                    </tbody>
                </table>
            </div>
            {open && (<div className="modal show d-block"><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h5 className="modal-title">{edit ? 'Edit Region' : 'Add Region'}</h5><button className="btn-close" onClick={() => setOpen(false)}></button></div><form onSubmit={submit}><div className="modal-body"><div className="mb-2"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div><div className="mb-2"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-custom" type="submit">Save</button></div></form></div></div></div>)}
        </div>
    )
}