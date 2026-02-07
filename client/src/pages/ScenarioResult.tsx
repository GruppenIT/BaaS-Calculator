import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ScenarioResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getScenario(Number(id)).then(setScenario).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="card"><p className="text-gray-500">Carregando...</p></div>;
  }

  if (!scenario) {
    return <div className="card"><p className="text-red-500">Cenário não encontrado.</p></div>;
  }

  const results = scenario.results;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/scenarios')} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{scenario.name}</h1>
          <div className="flex gap-4 mt-1 text-sm text-gray-500">
            {scenario.client_name && <span>Cliente: {scenario.client_name}</span>}
            {scenario.seller_name && <span>Vendedor: {scenario.seller_name}</span>}
            <span>Data: {new Date(scenario.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <Link to={`/scenarios/${id}/edit`} className="btn-primary">
          Editar
        </Link>
      </div>

      {/* Risk and Info */}
      <div className="card">
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Risco</span>
            <p className={`font-semibold text-lg ${
              results.risk_level === 'Alto' ? 'text-red-600' :
              results.risk_level === 'Médio' ? 'text-yellow-600' : 'text-green-600'
            }`}>{results.risk_level}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Dólar</span>
            <p className="font-semibold text-lg">R$ {scenario.dollar_rate?.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Impostos</span>
            <p className="font-semibold text-lg">{((scenario.tax_rate || 0) * 100).toFixed(0)}%</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">VMs</span>
            <p className="font-semibold text-lg">{scenario.vm_count}</p>
          </div>
          {scenario.physical_server_count > 0 && (
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Serv. Físicos</span>
              <p className="font-semibold text-lg">{scenario.physical_server_count}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="card overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Análise de Precificação</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Item</th>
              <th className="text-right py-3 px-3 font-semibold text-red-600 bg-red-50 rounded-tl-lg">
                Agressivo
                <br /><span className="text-xs font-normal">(forte concorrência)</span>
              </th>
              <th className="text-right py-3 px-3 font-semibold text-yellow-600 bg-yellow-50">
                Moderado
                <br /><span className="text-xs font-normal">(certa concorrência)</span>
              </th>
              <th className="text-right py-3 px-3 font-semibold text-green-600 bg-green-50 rounded-tr-lg">
                Conservador
                <br /><span className="text-xs font-normal">(pouca concorrência)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-xs text-gray-500 border-b border-gray-100">
              <td className="py-2 px-3">Margem aplicada</td>
              <td className="text-right py-2 px-3">{(results.margins.aggressive * 100).toFixed(0)}%</td>
              <td className="text-right py-2 px-3">{(results.margins.moderate * 100).toFixed(0)}%</td>
              <td className="text-right py-2 px-3">{(results.margins.conservative * 100).toFixed(0)}%</td>
            </tr>

            {/* Licenciamento Veeam */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-3">
                <p className="font-medium">{results.line_items.veeam_licensing.description}</p>
              </td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.veeam_licensing.aggressive)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.veeam_licensing.moderate)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.veeam_licensing.conservative)}</td>
            </tr>

            {/* O365 */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-3">
                <p className="font-medium">{results.line_items.o365_licensing.description}</p>
              </td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.o365_licensing.aggressive)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.o365_licensing.moderate)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.o365_licensing.conservative)}</td>
            </tr>

            {/* Cloud Connect */}
            {(results.line_items.cloud_connect.aggressive > 0 || results.line_items.cloud_connect.moderate > 0) && (
              <tr className="border-b border-gray-100">
                <td className="py-3 px-3">
                  <p className="font-medium">{results.line_items.cloud_connect.description}</p>
                </td>
                <td className="text-right py-3 px-3">{formatCurrency(results.line_items.cloud_connect.aggressive)}</td>
                <td className="text-right py-3 px-3">{formatCurrency(results.line_items.cloud_connect.moderate)}</td>
                <td className="text-right py-3 px-3">{formatCurrency(results.line_items.cloud_connect.conservative)}</td>
              </tr>
            )}

            {/* Server Monthly */}
            {results.line_items.server_monthly.aggressive > 0 && (
              <>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <td className="py-2 px-3">ROI do servidor (risco {results.risk_level})</td>
                  <td className="text-right py-2 px-3">{results.line_items.server_roi_months.aggressive}</td>
                  <td className="text-right py-2 px-3">{results.line_items.server_roi_months.moderate}</td>
                  <td className="text-right py-2 px-3">{results.line_items.server_roi_months.conservative}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3">
                    <p className="font-medium">{results.line_items.server_monthly.description}</p>
                  </td>
                  <td className="text-right py-3 px-3">{formatCurrency(results.line_items.server_monthly.aggressive)}</td>
                  <td className="text-right py-3 px-3">{formatCurrency(results.line_items.server_monthly.moderate)}</td>
                  <td className="text-right py-3 px-3">{formatCurrency(results.line_items.server_monthly.conservative)}</td>
                </tr>
              </>
            )}

            {/* Cloud Storage */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-3">
                <p className="font-medium">{results.line_items.cloud_storage.description}</p>
              </td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.cloud_storage.aggressive)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.cloud_storage.moderate)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.cloud_storage.conservative)}</td>
            </tr>

            {/* Management Monthly */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-3">
                <p className="font-medium">{results.line_items.management_monthly.description}</p>
              </td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.management_monthly.aggressive)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.management_monthly.moderate)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.line_items.management_monthly.conservative)}</td>
            </tr>

            {/* Separator */}
            <tr className="border-b-2 border-gray-200">
              <td colSpan={4} className="py-1"></td>
            </tr>

            {/* Impostos */}
            <tr className="border-b border-gray-100 text-gray-600">
              <td className="py-3 px-3 font-medium">Impostos ({((scenario.tax_rate || 0) * 100).toFixed(0)}%)</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.totals.tax.aggressive)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.totals.tax.moderate)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(results.totals.tax.conservative)}</td>
            </tr>

            {/* Total */}
            <tr className="bg-gray-50 font-bold text-base">
              <td className="py-4 px-3 rounded-bl-lg">Total Mensal</td>
              <td className="text-right py-4 px-3 text-red-700">{formatCurrency(results.totals.total_monthly.aggressive)}</td>
              <td className="text-right py-4 px-3 text-yellow-700">{formatCurrency(results.totals.total_monthly.moderate)}</td>
              <td className="text-right py-4 px-3 text-green-700 rounded-br-lg">{formatCurrency(results.totals.total_monthly.conservative)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Setup (one-time) */}
      {results.line_items.management_setup.aggressive > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cobrança Única (Setup)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Item</th>
                <th className="text-right py-3 px-3 font-semibold text-red-600">Agressivo</th>
                <th className="text-right py-3 px-3 font-semibold text-yellow-600">Moderado</th>
                <th className="text-right py-3 px-3 font-semibold text-green-600">Conservador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-3 font-medium">{results.line_items.management_setup.description}</td>
                <td className="text-right py-3 px-3">{formatCurrency(results.line_items.management_setup.aggressive)}</td>
                <td className="text-right py-3 px-3">{formatCurrency(results.line_items.management_setup.moderate)}</td>
                <td className="text-right py-3 px-3">{formatCurrency(results.line_items.management_setup.conservative)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Description Text */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Descritivo da Oferta</h2>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
          {results.description_text}
        </div>
      </div>

      {/* Input Summary */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Parâmetros do Cenário</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <ParamRow label="Licenciamento Veeam" value={scenario.needs_veeam_licensing ? 'SIM' : 'NÃO'} />
          <ParamRow label="Serviços Gerenciados" value={scenario.needs_managed_services ? 'SIM' : 'NÃO'} />
          <ParamRow label="Hardware Repositório Local" value={scenario.needs_local_hardware ? 'SIM' : 'NÃO'} />
          <ParamRow label="Armazenamento Nuvem" value={scenario.needs_cloud_storage ? 'SIM' : 'NÃO'} />
          <ParamRow label="Backup Office 365" value={scenario.needs_o365_backup ? 'SIM' : 'NÃO'} />
          <ParamRow label="Backup Duplo" value={scenario.has_dual_backup ? 'SIM' : 'NÃO'} />
          <ParamRow label="VMs" value={String(scenario.vm_count)} />
          <ParamRow label="Servidores Físicos" value={String(scenario.physical_server_count)} />
          <ParamRow label="Nível de Pontos" value={scenario.veeam_points_level} />
          {scenario.needs_veeam_licensing && (
            <ParamRow label="Edição Veeam" value={scenario.veeam_edition} />
          )}
          {scenario.needs_cloud_storage && (
            <ParamRow label="Armazenamento Nuvem" value={`${scenario.cloud_storage_tb} TB`} />
          )}
          {scenario.needs_o365_backup && (
            <ParamRow label="Mailboxes" value={String(scenario.mailbox_count)} />
          )}
        </div>
      </div>
    </div>
  );
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
