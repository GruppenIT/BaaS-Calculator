import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem');
      return;
    }

    if (newPassword.length < 4) {
      setError('A nova senha deve ter pelo menos 4 caracteres');
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setMessage('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">Informações da conta e alteração de senha</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Nome</span>
            <p className="font-medium text-gray-900">{user?.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Usuário</span>
            <p className="font-medium text-gray-900">{user?.username}</p>
          </div>
          <div>
            <span className="text-gray-500">Perfil</span>
            <p className="font-medium">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h2>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Senha Atual</label>
            <input type="password" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field" required />
          </div>
          <div>
            <label className="label">Nova Senha</label>
            <input type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field" required />
          </div>
          <div>
            <label className="label">Confirmar Nova Senha</label>
            <input type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field" required />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
