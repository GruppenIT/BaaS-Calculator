import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getScenarios().then(setScenarios).finally(() => setLoading(false));
  }, []);

  const recentScenarios = scenarios.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Painel de controle do BaaS Calculator</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/scenarios/new" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Novo Cenário</h3>
              <p className="text-sm text-gray-500">Criar precificação</p>
            </div>
          </div>
        </Link>

        <Link to="/scenarios" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cenários</h3>
              <p className="text-sm text-gray-500">{scenarios.length} cenário(s) salvo(s)</p>
            </div>
          </div>
        </Link>

        {isAdmin && (
          <Link to="/dados" className="card hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cadastros</h3>
                <p className="text-sm text-gray-500">Dados de referência</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Recent Scenarios */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Cenários Recentes</h2>
          <Link to="/scenarios" className="text-sm text-blue-600 hover:text-blue-800">
            Ver todos
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Carregando...</p>
        ) : recentScenarios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum cenário criado ainda.</p>
            <Link to="/scenarios/new" className="btn-primary inline-block mt-3">
              Criar primeiro cenário
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentScenarios.map((scenario) => (
              <Link
                key={scenario.id}
                to={`/scenarios/${scenario.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{scenario.name}</p>
                  <p className="text-sm text-gray-500">
                    {scenario.client_name && `${scenario.client_name} - `}
                    {new Date(scenario.updated_at).toLocaleDateString('pt-BR')}
                    {scenario.author_name && <span className="text-gray-400"> - por {scenario.author_name}</span>}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
