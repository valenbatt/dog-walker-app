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

  const [newClient, setNewClient] = useState({ name: '', dog: '', breed: '', phone: '', plan: 'Lunes a Viernes', price: '', turno: 'Mañana (8:00)', notes: '' });
  const [newTx, setNewTx] = useState({ type: 'ingreso', desc: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => localStorage.setItem('dogwalker_clients', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('dogwalker_finances', JSON.stringify(finances)), [finances]);

  const totalIngresos = finances.filter(f => f.type === 'ingreso').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalGastos = finances.filter(f => f.type === 'gasto').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIngresos - totalGastos;

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(c => 
      c.dog.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const monthlyFinances = useMemo(() => finances.filter(f => f.date.startsWith(selectedMonth)), [finances, selectedMonth]);
  const monthlyIngresos = monthlyFinances.filter(f => f.type === 'ingreso').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const monthlyGastos = monthlyFinances.filter(f => f.type === 'gasto').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const monthlyBalance = monthlyIngresos - monthlyGastos;

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name || !newClient.dog) return;
    setClients([...clients, { ...newClient, id: Date.now(), price: Number(newClient.price) || 0 }]);
    setNewClient({ name: '', dog: '', breed: '', phone: '', plan: 'Lunes a Viernes', price: '', turno: 'Mañana (8:00)', notes: '' });
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Concepto', 'Tipo', 'Monto (ARS)'];
    // Usamos ; para Excel en español y \uFEFF para los acentos
    const rows = monthlyFinances.map(f => `${f.date};"${f.desc.replace(/"/g, '""')}";${f.type};${f.amount}`);
    rows.push(`"";"";"";""`);
    rows.push(`"RESUMEN DEL MES";"Ingresos";"+";${monthlyIngresos}`);
    rows.push(`"";"Gastos";"-";${monthlyGastos}`);
    rows.push(`"";"TOTAL NETO";"";${monthlyBalance}`);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(';') + "\n" + rows.join('\n');
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Balance_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#f8fafc', minHeight: '100vh', padding: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: '800', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🐾 Dog Walker Pro
        </h1>
        <nav style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
          {['dashboard', 'clientes', 'calendario', 'finanzas'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={getTabStyle(activeTab === tab)}>{tab}</button>
          ))}
        </nav>
      </header>

      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <StatCard title="Perros Activos" value={clients.length} color="#f8fafc" />
          <StatCard title="Facturación Histórica" value={`$${totalIngresos.toLocaleString()}`} color="#34d399" />
          <StatCard title="Gastos Históricos" value={`$${totalGastos.toLocaleString()}`} color="#f87171" />
          <StatCard title="Rentabilidad Global" value={`$${balance.toLocaleString()}`} color={balance >= 0 ? '#38bdf8' : '#f87171'} />
        </div>
      )}

      {activeTab === 'clientes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '32px', alignItems: 'start' }}>
          <form onSubmit={handleAddClient} style={glassCard}>
            <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.2rem', fontWeight: '600' }}>Alta de Cliente</h3>
            <input placeholder="Nombre del Dueño" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} style={inputStyle} required />
            <input placeholder="Nombre del Perro" value={newClient.dog} onChange={e => setNewClient({...newClient, dog: e.target.value})} style={inputStyle} required />
            <input placeholder="Teléfono / WhatsApp" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} style={inputStyle} />
            <input placeholder="Precio x Salida (ARS)" type="number" value={newClient.price} onChange={e => setNewClient({...newClient, price: e.target.value})} style={inputStyle} />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <select value={newClient.plan} onChange={e => setNewClient({...newClient, plan: e.target.value})} style={{...inputStyle, flex: 1}}>
                <option>L-V</option>
                <option>3x Sem</option>
              </select>
              <select value={newClient.turno} onChange={e => setNewClient({...newClient, turno: e.target.value})} style={{...inputStyle, flex: 1}}>
                <option>Mañana (8:00)</option>
                <option>Mediodía (11:30)</option>
                <option>Tarde (16:00)</option>
              </select>
            </div>
            
            <textarea placeholder="Notas..." value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})} style={{ ...inputStyle, minHeight: '80px' }} />
            <button type="submit" style={btnStylePrimary}>Guardar Ficha</button>
          </form>

          <div>
            <input type="text" placeholder="🔍 Buscar perro o dueño..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: '100%', maxWidth: '400px', marginBottom: '24px' }}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filteredClients.map(c => (
                <div key={c.id} style={{...glassCard, borderTop: '4px solid #818cf8'}}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1.4rem' }}>🐕 {c.dog}</h4>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><strong>Dueño:</strong> {c.name} ({c.phone})</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginTop: '8px' }}>
                      <span><strong>Turno:</strong><br/>{c.turno}</span>
                      <span style={{textAlign: 'right'}}><strong>Tarifa:</strong><br/><span style={{ color: '#34d399' }}>${c.price}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendario' && (
        <div style={glassCard}>
          <h2 style={{marginTop: 0}}>Calendario Semanal Fijo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginTop: '24px' }}>
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(dia => (
              <div key={dia}>
                <h3 style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>{dia}</h3>
                {['Mañana (8:00)', 'Mediodía (11:30)', 'Tarde (16:00)'].map(turno => (
                  <div key={turno} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', marginBottom: '12px', minHeight: '100px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 'bold', marginBottom: '8px' }}>{turno}</div>
                    {clients.filter(c => c.turno === turno).map(c => (
                      <div key={c.id} style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px', marginBottom: '4px' }}>
                        🐾 {c.dog}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'finanzas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Formulario Finanzas Mantenido igual pero con estilos Glass */}
          <form onSubmit={e => { e.preventDefault(); setFinances([...finances, { ...newTx, id: Date.now(), amount: Number(newTx.amount) }]); }} style={glassCard}>
            <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Nuevo Movimiento</h3>
            <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} style={inputStyle}>
              <option value="ingreso">Ingreso (+)</option>
              <option value="gasto">Gasto (-)</option>
            </select>
            <input placeholder="Concepto" value={newTx.desc} onChange={e => setNewTx({...newTx, desc: e.target.value})} style={inputStyle} required />
            <input placeholder="Monto (ARS)" type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} style={inputStyle} required />
            <button type="submit" style={btnStylePrimary}>Registrar</button>
          </form>

          <div style={glassCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ ...inputStyle, width: 'auto' }} />
              <button onClick={exportToCSV} style={{ ...btnStylePrimary, background: '#34d399', color: '#064e3b', width: 'auto' }}>⬇ Exportar Excel</button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px' }}>Fecha</th>
                  <th style={{ padding: '12px' }}>Concepto</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {monthlyFinances.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 12px' }}>{f.date}</td>
                    <td style={{ padding: '16px 12px' }}>{f.desc}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', color: f.type === 'ingreso' ? '#34d399' : '#f87171', fontWeight: 'bold' }}>
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

// Estilos Glassmorphism
const glassCard = {
  background: 'rgba(30, 41, 59, 0.4)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '32px',
  borderRadius: '24px',
  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const StatCard = ({ title, value, color }) => (
  <div style={{...glassCard, padding: '24px'}}>
    <div style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '500', marginBottom: '12px' }}>{title}</div>
    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: color }}>{value}</div>
  </div>
);

const inputStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '14px 16px',
  borderRadius: '12px',
  color: '#f8fafc',
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border 0.3s ease'
};

const btnStylePrimary = {
  background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
  color: '#ffffff',
  border: 'none',
  padding: '14px',
  borderRadius: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  fontSize: '1rem',
  width: '100%',
  boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
};

const getTabStyle = (isActive) => ({
  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
  color: isActive ? '#fff' : '#94a3b8',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  textTransform: 'capitalize',
  transition: 'all 0.3s ease'
});
