import React, { useEffect, useState } from 'react';
export default function Employees() {
    const [list, setList] = useState([]); const [open, setOpen] = useState(false); const [edit, setEdit] = useState(null);
    const [form, setForm] = useState({ name: '', role: '', plant: '', email: '' });
    useEffect(() => { fetch('http://localhost:5000/api/employees').then(r => r.json()).then(d => setList(d || [])).catch(() => setList([{ id: 1, name: 'Asha Patel', role: 'Engineer', plant: 'North Solar', email: 'asha@example.com' }])) }, [])
    function submit(e) { e.preventDefault(); const method = edit ? 'PUT' : 'POST'; const url = edit ? `http://localhost:5000/api/employees/${edit.id}` : 'http://localhost:5000/api/employees'; fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(() => { setOpen(false); window.location.reload() }).catch(() => { setOpen(false); window.location.reload() }) }
    function del(id) { if (!confirm('Delete employee?')) return; fetch(`http://localhost:5000/api/employees/${id}`, { method: 'DELETE' }).then(() => window.location.reload()).catch(() => window.location.reload()) }
    return (
        <div className="fade-page">
            <div className="d-flex justify-content-between mb-3"><h4 style={{ fontWeight: 700 }}>Employees</h4><button className="btn btn-custom" onClick={() => { setForm({ name: '', role: '', plant: '', email: '' }); setEdit(null); setOpen(true) }}>Add Employee</button></div>
            <div className="card p-3">
                <table className="table">
                    <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Plant</th><th>Email</th><th>Actions</th></tr></thead>
                    <tbody>{list.map((e, i) => (<tr key={e.id || i}><td>{i + 1}</td><td>{e.name}</td><td>{e.role}</td><td>{e.plant}</td><td>{e.email}</td><td><button className="btn btn-sm btn-outline-primary action-btn" onClick={() => { setForm(e); setEdit(e); setOpen(true) }}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => del(e.id)}>Delete</button></td></tr>))}</tbody>
                </table>
            </div>
            {open && (<div className="modal show d-block"><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h5 className="modal-title">{edit ? 'Edit Employee' : 'Add Employee'}</h5><button className="btn-close" onClick={() => setOpen(false)}></button></div><form onSubmit={submit}><div className="modal-body"><div className="mb-2"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div><div className="mb-2"><label className="form-label">Role</label><input className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div><div className="mb-2"><label className="form-label">Plant</label><input className="form-control" value={form.plant} onChange={e => setForm({ ...form, plant: e.target.value })} /></div><div className="mb-2"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-custom" type="submit">Save</button></div></form></div></div></div>)}
        </div>
    )
}