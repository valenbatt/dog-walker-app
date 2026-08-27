import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('dogwalker_clients');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Martín Gómez', dog: 'Milo', breed: 'Golden Retriever', phone: '11-4567-8901', plan: 'Lunes a Viernes', price: 75000, notes: 'Sociable, tirar la pelota' },
      { id: 2, name: 'Lucía Fernández', dog: 'Luna', breed: 'Bulldog Francés', phone: '11-9876-5432', plan: '3x Semana', price: 48000, notes: 'Cuidado con el calor, llevar agua extra' }
    ];
  });

  const [finances, setFinances] = useState(() => {
    const saved = localStorage.getItem('dogwalker_finances');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'ingreso', desc: 'Abono Milo - Martín', amount: 75000, date: '2026-08-01' },
      { id: 2, type: 'gasto', desc: 'Bolsas biodegradables y premios', amount: 12000, date: '2026-08-05' }
    ];
  });

  const [newClient, setNewClient] = useState({ name: '', dog: '', breed: '', phone: '', plan: 'Lunes a Viernes', price: '', notes: '' });
  const [newTx, setNewTx] = useState({ type: 'ingreso', desc: '', amount: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    localStorage.setItem('dogwalker_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('dogwalker_finances', JSON.stringify(finances));
  }, [finances]);

  const totalIngresos = finances.filter(f => f.type === 'ingreso').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalGastos = finances.filter(f => f.type === 'gasto').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIngresos - totalGastos;

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name || !newClient.dog) return;
    setClients([...clients, { ...newClient, id: Date.now(), price: Number(newClient.price) || 0 }]);
    setNewClient({ name: '', dog: '', breed: '', phone: '', plan: 'Lunes a Viernes', price: '', notes: '' });
  };

  const handleAddTx = (e) => {
    e.preventDefault();
    if (!newTx.desc || !newTx.amount) return;
    setFinances([...finances, { ...newTx, id: Date.now(), amount: Number(newTx.amount) }]);
    setNewTx({ type: 'ingreso', desc: '', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>🐾 Dog Walker Pro · Gestión & Marca</h1>
        <nav style={{ display: 'flex', gap: '8px' }}>
          {['dashboard', 'clientes', 'finanzas'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? '#38bdf8' : '#1e293b',
                color: activeTab === tab ? '#0f172a' : '#f8fafc',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Perros Activos</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{clients.length}</div>
            </div>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Ingresos Totales</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80' }}>${totalIngresos.toLocaleString()}</div>
            </div>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Gastos Totales</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f87171' }}>${totalGastos.toLocaleString()}</div>
            </div>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Ganancia Neta</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: balance >= 0 ? '#38bdf8' : '#f87171' }}>${balance.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clientes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          <form onSubmit={handleAddClient} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>Nuevo Cliente / Mascota</h3>
            <input placeholder="Nombre del Dueño" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} style={inputStyle} required />
            <input placeholder="Nombre del Perro" value={newClient.dog} onChange={e => setNewClient({...newClient, dog: e.target.value})} style={inputStyle} required />
            <input placeholder="Raza" value={newClient.breed} onChange={e => setNewClient({...newClient, breed: e.target.value})} style={inputStyle} />
            <input placeholder="Teléfono / WhatsApp" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} style={inputStyle} />
            <input placeholder="Precio Mensual (ARS)" type="number" value={newClient.price} onChange={e => setNewClient({...newClient, price: e.target.value})} style={inputStyle} />
            <textarea placeholder="Notas / Comportamiento / Medicación" value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})} style={{ ...inputStyle, minHeight: '60px' }} />
            <button type="submit" style={btnStyle}>Agregar Ficha</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {clients.map(c => (
              <div key={c.id} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #38bdf8' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>🐕 {c.dog} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({c.breed})</span></h4>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Dueño:</strong> {c.name}</p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Contacto:</strong> {c.phone}</p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Plan:</strong> {c.plan} - ${c.price?.toLocaleString()} ARS</p>
                {c.notes && <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#cbd5e1', background: '#0f172a', padding: '6px', borderRadius: '4px' }}>📝 {c.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'finanzas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          <form onSubmit={handleAddTx} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>Registrar Movimiento</h3>
            <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} style={inputStyle}>
              <option value="ingreso">Ingreso (+)</option>
              <option value="gasto">Gasto (-)</option>
            </select>
            <input placeholder="Descripción (Ej: Abono Lola, Bolsitas)" value={newTx.desc} onChange={e => setNewTx({...newTx, desc: e.target.value})} style={inputStyle} required />
            <input placeholder="Monto (ARS)" type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} style={inputStyle} required />
            <input type="date" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} style={inputStyle} />
            <button type="submit" style={btnStyle}>Registrar</button>
          </form>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px' }}>
            <h3>Historial de Movimientos</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '8px' }}>Fecha</th>
                  <th style={{ padding: '8px' }}>Concepto</th>
                  <th style={{ padding: '8px' }}>Tipo</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {finances.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '8px', fontSize: '0.85rem' }}>{f.date}</td>
                    <td style={{ padding: '8px' }}>{f.desc}</td>
                    <td style={{ padding: '8px', textTransform: 'capitalize', color: f.type === 'ingreso' ? '#4ade80' : '#f87171' }}>{f.type}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: f.type === 'ingreso' ? '#4ade80' : '#f87171' }}>
                      {f.type === 'ingreso' ? '+' : '-'}${Number(f.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { background: '#0f172a', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#fff' };
const btnStyle = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
