import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const data = await api.getScenarios();
      setScenarios(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadScenarios(); }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir este cenário?')) return;
    await api.deleteScenario(id);
    loadScenarios();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cenários</h1>
          <p className="text-gray-500 mt-1">Histórico de cenários de precificação</p>
        </div>
        <Link to="/scenarios/new" className="btn-primary">
          + Novo Cenário
        </Link>
      </div>

      {loading ? (
        <div className="card">
          <p className="text-gray-500">Carregando cenários...</p>
        </div>
      ) : scenarios.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">Nenhum cenário criado</h3>
          <p className="text-gray-500 mt-1">Crie seu primeiro cenário de precificação.</p>
          <Link to="/scenarios/new" className="btn-primary inline-block mt-4">
            Criar Cenário
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => navigate(`/scenarios/${scenario.id}`)}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{scenario.name}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-gray-500">
                    {scenario.client_name && <span>Cliente: {scenario.client_name}</span>}
                    {scenario.seller_name && <span>Vendedor: {scenario.seller_name}</span>}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Criado: {new Date(scenario.created_at).toLocaleDateString('pt-BR')}</span>
                    <span>Atualizado: {new Date(scenario.updated_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/scenarios/${scenario.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={(e) => handleDelete(scenario.id, e)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Excluir
                  </button>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
