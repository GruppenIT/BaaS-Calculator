import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

const defaultForm = {
  name: '',
  client_name: '',
  seller_name: '',
  opportunity_number: '',
  opportunity_name: '',
  needs_veeam_licensing: true,
  needs_managed_services: true,
  needs_local_hardware: false,
  needs_cloud_storage: true,
  needs_o365_backup: false,
  vm_count: 10,
  physical_server_count: 0,
  veeam_points_level: '10k points',
  veeam_edition: 'Veeam Backup & Replication ENT Plus',
  local_storage_tb: 0,
  cloud_storage_tb: 1,
  mailbox_count: 0,
  server_acquisition_cost: 0,
  has_dual_backup: false,
  dollar_rate: 5.50,
  tax_rate: 0.18,
};

export default function ScenarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(defaultForm);
  const [referenceData, setReferenceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const dados = await api.getAllDados();
        setReferenceData(dados);

        if (dados.taxConfig?.[0]) {
          setForm(f => ({ ...f, tax_rate: dados.taxConfig[0].rate }));
        }

        if (isEdit) {
          const scenario = await api.getScenario(Number(id));
          setForm({
            name: scenario.name || '',
            client_name: scenario.client_name || '',
            seller_name: scenario.seller_name || '',
            opportunity_number: scenario.opportunity_number || '',
            opportunity_name: scenario.opportunity_name || '',
            needs_veeam_licensing: !!scenario.needs_veeam_licensing,
            needs_managed_services: !!scenario.needs_managed_services,
            needs_local_hardware: !!scenario.needs_local_hardware,
            needs_cloud_storage: !!scenario.needs_cloud_storage,
            needs_o365_backup: !!scenario.needs_o365_backup,
            vm_count: scenario.vm_count || 0,
            physical_server_count: scenario.physical_server_count || 0,
            veeam_points_level: scenario.veeam_points_level || '10k points',
            veeam_edition: scenario.veeam_edition || 'Veeam Backup & Replication ENT Plus',
            local_storage_tb: scenario.local_storage_tb || 0,
            cloud_storage_tb: scenario.cloud_storage_tb || 0,
            mailbox_count: scenario.mailbox_count || 0,
            server_acquisition_cost: scenario.server_acquisition_cost || 0,
            has_dual_backup: !!scenario.has_dual_backup,
            dollar_rate: scenario.dollar_rate || 5.50,
            tax_rate: scenario.tax_rate || 0.18,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const updateField = (key: string, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!form.name.trim()) {
        setError('Nome do cenário é obrigatório');
        setSaving(false);
        return;
      }

      let result;
      if (isEdit) {
        result = await api.updateScenario(Number(id), form);
      } else {
        result = await api.createScenario(form);
      }
      navigate(`/scenarios/${result.id || id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card"><p className="text-gray-500">Carregando...</p></div>;
  }

  const editions = referenceData?.editions?.map((e: any) => e.edition) || [
    'Veeam Backup & Replication ENT Plus',
    'Veeam Backup & Replication ENT',
    'Veeam Backup & Replication STAN',
  ];

  const pointsLevels = referenceData?.pointsIntervals?.map((i: any) => i.interval_name) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Cenário' : 'Novo Cenário'}
          </h1>
          <p className="text-gray-500 mt-1">Preencha os dados para calcular a precificação</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identification */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Identificação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome do Cenário *</label>
              <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)}
                className="input-field" placeholder="Ex: BaaS - Empresa XYZ" required />
            </div>
            <div>
              <label className="label">Cliente</label>
              <input type="text" value={form.client_name} onChange={(e) => updateField('client_name', e.target.value)}
                className="input-field" placeholder="Nome do cliente" />
            </div>
            <div>
              <label className="label">Vendedor</label>
              <input type="text" value={form.seller_name} onChange={(e) => updateField('seller_name', e.target.value)}
                className="input-field" placeholder="Nome do vendedor" />
            </div>
            <div>
              <label className="label"># Oportunidade</label>
              <input type="text" value={form.opportunity_number} onChange={(e) => updateField('opportunity_number', e.target.value)}
                className="input-field" placeholder="Número da oportunidade" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Nome da Oportunidade</label>
              <input type="text" value={form.opportunity_name} onChange={(e) => updateField('opportunity_name', e.target.value)}
                className="input-field" placeholder="Nome da oportunidade" />
            </div>
          </div>
        </div>

        {/* Scope Questions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Escopo do Serviço</h2>
          <div className="space-y-4">
            <ToggleQuestion
              label="Cliente necessita de licenciamento do Veeam?"
              hint="Em certos cenários o cliente pode já possuir o Veeam no seu ambiente."
              value={form.needs_veeam_licensing}
              onChange={(v) => updateField('needs_veeam_licensing', v)}
            />
            <ToggleQuestion
              label="Cliente necessita de Serviços Gerenciados?"
              hint="O serviço inclui a operação das rotinas de backup realizada pela Gruppen."
              value={form.needs_managed_services}
              onChange={(v) => updateField('needs_managed_services', v)}
            />
            <ToggleQuestion
              label="Precisa de hardware para repositório local?"
              hint="Inclui fornecimento de servidor Dell com serviço de monitoramento remoto."
              value={form.needs_local_hardware}
              onChange={(v) => updateField('needs_local_hardware', v)}
            />
            <ToggleQuestion
              label="Precisa de repositório de armazenamento em nuvem (Zerobox)?"
              value={form.needs_cloud_storage}
              onChange={(v) => updateField('needs_cloud_storage', v)}
            />
            <ToggleQuestion
              label="Precisa de backup para Office 365?"
              value={form.needs_o365_backup}
              onChange={(v) => updateField('needs_o365_backup', v)}
            />
            {form.needs_managed_services && (
              <ToggleQuestion
                label="O ambiente terá backup duplo?"
                hint="Considerando a operação do backup pela Gruppen."
                value={form.has_dual_backup}
                onChange={(v) => updateField('has_dual_backup', v)}
              />
            )}
          </div>
        </div>

        {/* Quantities */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quantidades e Configurações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Quantidade de VMs (Windows e Linux)</label>
              <input type="number" min="0" value={form.vm_count}
                onChange={(e) => updateField('vm_count', parseInt(e.target.value) || 0)}
                className="input-field" />
            </div>
            <div>
              <label className="label">Servidores Físicos (Agent)</label>
              <input type="number" min="0" value={form.physical_server_count}
                onChange={(e) => updateField('physical_server_count', parseInt(e.target.value) || 0)}
                className="input-field" />
            </div>
            <div>
              <label className="label">Nível de Pontos Veeam</label>
              <select value={form.veeam_points_level}
                onChange={(e) => updateField('veeam_points_level', e.target.value)}
                className="input-field">
                {pointsLevels.map((level: string) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {form.needs_veeam_licensing && (
              <div>
                <label className="label">Edição do Software Veeam</label>
                <select value={form.veeam_edition}
                  onChange={(e) => updateField('veeam_edition', e.target.value)}
                  className="input-field">
                  {editions.map((ed: string) => (
                    <option key={ed} value={ed}>{ed.replace('Veeam Backup & Replication ', '')}</option>
                  ))}
                </select>
              </div>
            )}

            {form.needs_cloud_storage && (
              <div>
                <label className="label">Armazenamento em Nuvem (TB)</label>
                <input type="number" min="0" step="0.1" value={form.cloud_storage_tb}
                  onChange={(e) => updateField('cloud_storage_tb', parseFloat(e.target.value) || 0)}
                  className="input-field" />
              </div>
            )}

            {form.needs_o365_backup && (
              <div>
                <label className="label">Quantidade de Mailboxes Office 365</label>
                <input type="number" min="0" value={form.mailbox_count}
                  onChange={(e) => updateField('mailbox_count', parseInt(e.target.value) || 0)}
                  className="input-field" />
              </div>
            )}

            {form.needs_local_hardware && (
              <>
                <div>
                  <label className="label">Armazenamento Local (TB)</label>
                  <input type="number" min="0" value={form.local_storage_tb}
                    onChange={(e) => updateField('local_storage_tb', parseFloat(e.target.value) || 0)}
                    className="input-field" />
                </div>
                <div>
                  <label className="label">Valor Aquisição Servidor (R$)</label>
                  <input type="number" min="0" step="0.01" value={form.server_acquisition_cost}
                    onChange={(e) => updateField('server_acquisition_cost', parseFloat(e.target.value) || 0)}
                    className="input-field" />
                </div>
              </>
            )}

            <div>
              <label className="label">Cotação do Dólar (R$)</label>
              <input type="number" min="0" step="0.01" value={form.dollar_rate}
                onChange={(e) => updateField('dollar_rate', parseFloat(e.target.value) || 0)}
                className="input-field" />
            </div>
            <div>
              <label className="label">Carga Tributária (%)</label>
              <input type="number" min="0" max="1" step="0.01" value={form.tax_rate}
                onChange={(e) => updateField('tax_rate', parseFloat(e.target.value) || 0)}
                className="input-field" />
              <p className="text-xs text-gray-400 mt-1">Ex: 0.18 = 18%</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Calcular e Salvar'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function ToggleQuestion({ label, hint, value, onChange }: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            value ? 'bg-green-100 text-green-800 ring-1 ring-green-300' : 'bg-gray-100 text-gray-500'
          }`}
        >
          SIM
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            !value ? 'bg-red-100 text-red-800 ring-1 ring-red-300' : 'bg-gray-100 text-gray-500'
          }`}
        >
          NÃO
        </button>
      </div>
    </div>
  );
}
