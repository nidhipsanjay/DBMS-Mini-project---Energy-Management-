import React, { useEffect, useState } from 'react';


export default function Plants() {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const initial = { name: '', region: '', type: '', capacity: '' };
    const [form, setForm] = useState(initial);


    useEffect(() => { fetchList() }, [])
    function fetchList() {
        setLoading(true);
        fetch('http://localhost:5000/api/plants')
            .then(r => r.json()).then(data => { setPlants(data || []); setLoading(false) })
            .catch(() => { // dummy fallback
                setPlants([{ id: 1, name: 'North Solar Station', region: 'North', type: 'Solar', capacity: 50 }]); setLoading(false)
            })
    }
    function openCreate() { setForm(initial); setEditItem(null); setModalOpen(true) }
    function openEdit(p) { setForm(p); setEditItem(p); setModalOpen(true) }
    function handleDelete(id) { if (!window.confirm('Delete this plant?')) return; fetch(`http://localhost:5000/api/plants/${id}`, { method: 'DELETE' }).then(fetchList).catch(fetchList) }
    function handleSubmit(e) {
        e.preventDefault();
        const method = editItem ? 'PUT' : 'POST';
        const url = editItem ? `http://localhost:5000/api/plants/${editItem.id}` : 'http://localhost:5000/api/plants';
        fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
            .then(() => { setModalOpen(false); fetchList() }).catch(() => { setModalOpen(false); fetchList() });
    }
    return (
        <div className="fade-page">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 style={{ fontWeight: 700 }}>Power Plants</h4>
                <div>
                    <button className="btn btn-custom" onClick={openCreate}><i className="fa fa-plus"></i> Add Plant</button>
                </div>
            </div>


            <div className="card p-3">
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr><th>#</th><th>Name</th><th>Region</th><th>Type</th><th>Capacity (MW)</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan={6}>Loading...</td></tr>}
                            {!loading && plants.length === 0 && <tr><td colSpan={6}>No plants found</td></tr>}
                            {plants.map((p, i) => (
                                <tr key={p.id || i}>
                                    <td>{i + 1}</td>
                                    <td>{p.name}</td>
                                    <td>{p.region}</td>
                                    <td>{p.type}</td>
                                    <td>{p.capacity}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary action-btn" onClick={() => openEdit(p)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {modalOpen && (
                <div className="modal show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editItem ? 'Edit Plant' : 'Create Plant'}</h5>
                                <button className="btn-close" onClick={() => setModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-2">
                                        <label className="form-label">Name</label>
                                        <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Region</label>
                                        <input className="form-control" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Type</label>
                                        <input className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Capacity (MW)</label>
                                        <input className="form-control" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                                    <button className="btn btn-custom" type="submit">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
