import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'vendedor' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try { setUsers(await api.getUsers()); } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const resetForm = () => {
    setForm({ username: '', password: '', name: '', role: 'vendedor' });
    setEditing(null);
    setAdding(false);
    setError('');
  };

  const startEdit = (u: any) => {
    setEditing(u.id);
    setForm({ username: u.username, password: '', name: u.name, role: u.role });
    setAdding(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (adding) {
        if (!form.username || !form.password || !form.name) {
          setError('Preencha todos os campos obrigatórios');
          setSaving(false);
          return;
        }
        await api.createUser(form);
      } else if (editing) {
        await api.updateUser(editing, { name: form.name, role: form.role, password: form.password || undefined });
      }
      await loadUsers();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.deleteUser(id);
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500 mt-1">Gerenciamento de usuários do sistema</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null); setError(''); setForm({ username: '', password: '', name: '', role: 'vendedor' }); }} className="btn-primary">
          + Novo Usuário
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {(adding || editing) && (
        <div className="card border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {adding ? 'Novo Usuário' : 'Editar Usuário'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adding && (
              <div>
                <label className="label">Usuário *</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="input-field" placeholder="Login do usuário" />
              </div>
            )}
            <div>
              <label className="label">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="Nome completo" />
            </div>
            <div>
              <label className="label">{adding ? 'Senha *' : 'Nova Senha (deixe vazio para manter)'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field" placeholder={adding ? 'Senha do usuário' : 'Deixe vazio para manter'} />
            </div>
            <div>
              <label className="label">Perfil</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={resetForm} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-medium text-gray-600">Nome</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Usuário</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Perfil</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Criado em</th>
                <th className="text-right py-3 px-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{u.name}</td>
                  <td className="py-3 px-3 text-gray-600">{u.username}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : 'Vendedor'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => startEdit(u)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        Editar
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
