import React, { useState, useEffect, useMemo } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('dogwalker_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [finances, setFinances] = useState(() => {
    const saved = localStorage.getItem('dogwalker_finances');
    return saved ? JSON.parse(saved) : [];
  });

  const [newClient, setNewClient] = useState({ name: '', dog: '', breed: '', phone: '', plan: 'Lunes a Viernes', price: '', notes: '' });
  const [newTx, setNewTx] = useState({ type: 'ingreso', desc: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  useEffect(() => localStorage.setItem('dogwalker_clients', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('dogwalker_finances', JSON.stringify(finances)), [finances]);

  const totalIngresos = finances.filter(f => f.type === 'ingreso').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalGastos = finances.filter(f => f.type === 'gasto').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIngresos - totalGastos;

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const lower = searchTerm.toLowerCase();
    return clients.filter(c => 
      c.dog.toLowerCase().includes(lower) || 
      c.name.toLowerCase().includes(lower) || 
      c.breed.toLowerCase().includes(lower)
    );
  }, [clients, searchTerm]);

  const monthlyFinances = useMemo(() => {
    return finances.filter(f => f.date.startsWith(selectedMonth));
  }, [finances, selectedMonth]);

  const monthlyIngresos = monthlyFinances.filter(f => f.type === 'ingreso').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const monthlyGastos = monthlyFinances.filter(f => f.type === 'gasto').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const monthlyBalance = monthlyIngresos - monthlyGastos;

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

  const deleteClient = (id) => {
    if(window.confirm('¿Eliminar cliente?')) setClients(clients.filter(c => c.id !== id));
  };

  const deleteTx = (id) => {
    if(window.confirm('¿Eliminar movimiento?')) setFinances(finances.filter(f => f.id !== id));
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Concepto', 'Tipo', 'Monto (ARS)'];
    const rows = monthlyFinances.map(f => `${f.date},"${f.desc.replace(/"/g, '""')}",${f.type},${f.amount}`);
    
    rows.push(`"","","",""`);
    rows.push(`"RESUMEN DEL MES","Ingresos","+",${monthlyIngresos}`);
    rows.push(`"","Gastos","-",${monthlyGastos}`);
    rows.push(`"","TOTAL NETO","",${monthlyBalance}`);

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Balance_DogWalker_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: '700', color: '#38bdf8', letterSpacing: '-0.5px' }}>🐾 Dog Walker Pro</h1>
        <nav style={{ display: 'flex', gap: '12px', background: '#1e293b', padding: '6px', borderRadius: '12px' }}>
          {['dashboard', 'clientes', 'finanzas'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={getTabStyle(activeTab === tab)}>{tab}</button>
          ))}
        </nav>
      </header>

      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <StatCard title="Perros Activos" value={clients.length} color="#f8fafc" />
          <StatCard title="Facturación Histórica" value={`$${totalIngresos.toLocaleString()}`} color="#4ade80" />
          <StatCard title="Gastos Históricos" value={`$${totalGastos.toLocaleString()}`} color="#f87171" />
          <StatCard title="Rentabilidad Global" value={`$${balance.toLocaleString()}`} color={balance >= 0 ? '#38bdf8' : '#f87171'} />
        </div>
      )}

      {activeTab === 'clientes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'start' }}>
          <form onSubmit={handleAddClient} style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>Alta de Cliente</h3>
            <input placeholder="Nombre del Dueño" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} style={inputStyle} required />
            <input placeholder="Nombre del Perro" value={newClient.dog} onChange={e => setNewClient({...newClient, dog: e.target.value})} style={inputStyle} required />
            <input placeholder="Raza" value={newClient.breed} onChange={e => setNewClient({...newClient, breed: e.target.value})} style={inputStyle} />
            <input placeholder="Teléfono / WhatsApp" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} style={inputStyle} />
            <input placeholder="Precio por Salida (ARS)" type="number" value={newClient.price} onChange={e => setNewClient({...newClient, price: e.target.value})} style={inputStyle} />
            <select value={newClient.plan} onChange={e => setNewClient({...newClient, plan: e.target.value})} style={inputStyle}>
              <option>Lunes a Viernes</option>
              <option>3x Semana</option>
              <option>Fines de Semana</option>
              <option>Paseo Individual</option>
            </select>
            <textarea placeholder="Comportamiento / Notas..." value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
            <button type="submit" style={btnStyle}>Guardar Ficha</button>
          </form>

          <div>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="🔍 Buscar por perro, dueño o raza..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                style={{ ...inputStyle, width: '100%', maxWidth: '400px', background: '#1e293b' }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredClients.map(c => (
                <div key={c.id} style={{ ...cardStyle, borderTop: '4px solid #38bdf8', position: 'relative' }}>
                  <button onClick={() => deleteClient(c.id)} style={deleteBtnStyle}>×</button>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1.3rem' }}>🐕 {c.dog} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'normal' }}>({c.breed})</span></h4>
                  <div style={{ fontSize: '0.95rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><strong>Dueño:</strong> {c.name}</div>
                    <div><strong>WhatsApp:</strong> {c.phone}</div>
                    <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px' }}>
                      <strong>Frecuencia:</strong> {c.plan} <br/>
                      <span style={{ color: '#4ade80' }}>${c.price?.toLocaleString()} ARS / salida</span>
                    </div>
                    {c.notes && <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>📝 {c.notes}</div>}
                  </div>
                </div>
              ))}
              {filteredClients.length === 0 && <p style={{ color: '#94a3b8' }}>No hay clientes registrados o no coinciden con la búsqueda.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'finanzas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'start' }}>
          <form onSubmit={handleAddTx} style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>Cargar Movimiento</h3>
            <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} style={inputStyle}>
              <option value="ingreso">Ingreso (+)</option>
              <option value="gasto">Gasto (-)</option>
            </select>
            <input placeholder="Concepto (Ej: Paseos Lola, Pipetas)" value={newTx.desc} onChange={e => setNewTx({...newTx, desc: e.target.value})} style={inputStyle} required />
            <input placeholder="Monto Total (ARS)" type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} style={inputStyle} required />
            <input type="date" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} style={inputStyle} required />
            <button type="submit" style={btnStyle}>Registrar</button>
          </form>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0 }}>Historial Mensual</h3>
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={e => setSelectedMonth(e.target.value)} 
                  style={{ ...inputStyle, padding: '6px 12px', width: 'auto' }}
                />
              </div>
              <button onClick={exportToCSV} style={{ ...btnStyle, background: '#4ade80', color: '#064e3b', width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}>
                ⬇ Descargar Excel
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <th style={{ padding: '12px 8px' }}>Fecha</th>
                    <th style={{ padding: '12px 8px' }}>Concepto</th>
                    <th style={{ padding: '12px 8px' }}>Tipo</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Monto</th>
                    <th style={{ padding: '12px 8px', width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyFinances.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '12px 8px', fontSize: '0.9rem', color: '#cbd5e1' }}>{f.date}</td>
                      <td style={{ padding: '12px 8px' }}>{f.desc}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ background: f.type === 'ingreso' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', color: f.type === 'ingreso' ? '#4ade80' : '#f87171', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                          {f.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold', color: '#f8fafc' }}>
                        ${Number(f.amount).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button onClick={() => deleteTx(f.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                      </td>
                    </tr>
                  ))}
                  {monthlyFinances.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No hay movimientos en este mes.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px', padding: '20px', background: '#0f172a', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #334155' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ingresos del Mes</div>
                <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.2rem' }}>+ ${monthlyIngresos.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Gastos del Mes</div>
                <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '1.2rem' }}>- ${monthlyGastos.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Neto ({selectedMonth})</div>
                <div style={{ color: monthlyBalance >= 0 ? '#38bdf8' : '#f87171', fontWeight: 'bold', fontSize: '1.5rem' }}>
                  ${monthlyBalance.toLocaleString()}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ title, value, color }) => (
  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>{title}</div>
    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: color, letterSpacing: '-1px' }}>{value}</div>
  </div>
);

const getTabStyle = (isActive) => ({
  background: isActive ? '#38bdf8' : 'transparent',
  color: isActive ? '#0f172a' : '#94a3b8',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  textTransform: 'capitalize',
  transition: 'all 0.2s ease'
});

const cardStyle = { background: '#1e293b', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };
const inputStyle = { background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnStyle = { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', transition: 'opacity 0.2s', width: '100%' };
const deleteBtnStyle = { position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' };
