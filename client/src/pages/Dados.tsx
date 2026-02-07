import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

type TabKey = 'products' | 'intervals' | 'management' | 'storageOnprem' | 'storageCloud' | 'margins' | 'roi' | 'multipliers' | 'tax' | 'logo';

interface Tab {
  key: TabKey;
  label: string;
}

const tabs: Tab[] = [
  { key: 'products', label: 'Produtos Veeam' },
  { key: 'intervals', label: 'Intervalos de Pontos' },
  { key: 'management', label: 'Gerenciamento' },
  { key: 'storageOnprem', label: 'Storage On-Premise' },
  { key: 'storageCloud', label: 'Storage Cloud' },
  { key: 'margins', label: 'Margens' },
  { key: 'roi', label: 'ROI Servidor' },
  { key: 'multipliers', label: 'Multiplicadores' },
  { key: 'tax', label: 'Impostos' },
  { key: 'logo', label: 'Logo' },
];

export default function Dados() {
  const [activeTab, setActiveTab] = useState<TabKey>('products');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [logoInfo, setLogoInfo] = useState<{ hasCustomLogo: boolean; filename: string | null }>({ hasCustomLogo: false, filename: null });
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLogoInfo = async () => {
    try {
      const info = await api.getLogoInfo();
      setLogoInfo(info);
      setLogoPreview(null);
    } catch {
      // ignore
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoPreview(URL.createObjectURL(file));
    setLogoUploading(true);
    try {
      await api.uploadLogo(file);
      await loadLogoInfo();
    } catch (err: any) {
      alert(err.message);
      setLogoPreview(null);
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogoDelete = async () => {
    if (!confirm('Tem certeza que deseja remover o logo personalizado?')) return;
    try {
      await api.deleteLogo();
      await loadLogoInfo();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const allData = await api.getAllDados();
      setData(allData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); loadLogoInfo(); }, []);

  const startEdit = (item: any) => {
    setEditing(item.id);
    setFormData({ ...item });
    setAdding(false);
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setFormData({});
  };

  const cancel = () => {
    setEditing(null);
    setAdding(false);
    setFormData({});
  };

  const handleSave = async (saveFn: () => Promise<any>) => {
    setSaving(true);
    try {
      await saveFn();
      await loadData();
      cancel();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deleteFn: () => Promise<any>) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await deleteFn();
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const renderField = (label: string, key: string, type: string = 'text') => (
    <div key={key}>
      <label className="label">{label}</label>
      <input
        type={type}
        value={formData[key] ?? ''}
        onChange={(e) => setFormData({ ...formData, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
        className="input-field"
        step={type === 'number' ? 'any' : undefined}
      />
    </div>
  );

  const renderTable = (
    headers: string[],
    items: any[],
    renderRow: (item: any) => React.ReactNode,
    renderForm: () => React.ReactNode,
    onSave: () => Promise<any>,
    onDelete?: (id: number) => Promise<any>,
    canAdd: boolean = true
  ) => (
    <div>
      {canAdd && (
        <div className="mb-4">
          <button onClick={startAdd} className="btn-primary text-sm">+ Adicionar</button>
        </div>
      )}

      {adding && (
        <div className="card mb-4 border-blue-200 bg-blue-50/30">
          <h3 className="font-medium text-gray-900 mb-3">Novo registro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderForm()}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleSave(onSave)} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={cancel} className="btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((h) => (
                <th key={h} className="text-left py-3 px-3 font-medium text-gray-600">{h}</th>
              ))}
              <th className="text-right py-3 px-3 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: any) =>
              editing === item.id ? (
                <tr key={item.id} className="border-b border-gray-100 bg-yellow-50">
                  <td colSpan={headers.length + 1} className="py-3 px-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {renderForm()}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleSave(onSave)} disabled={saving} className="btn-primary text-sm">
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button onClick={cancel} className="btn-secondary text-sm">Cancelar</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {renderRow(item)}
                  <td className="py-3 px-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        Editar
                      </button>
                      {onDelete && (
                        <button onClick={() => handleDelete(() => onDelete(item.id))} className="text-red-600 hover:text-red-800 text-xs font-medium">
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <p className="text-gray-500">Carregando dados...</p>;

    switch (activeTab) {
      case 'products':
        return renderTable(
          ['Edição', 'Detalhe', 'Tipo', 'Pontos'],
          data.veeamProducts,
          (item) => (
            <>
              <td className="py-3 px-3 font-medium">{item.edition}</td>
              <td className="py-3 px-3 text-gray-600">{item.detail}</td>
              <td className="py-3 px-3">{item.type}</td>
              <td className="py-3 px-3">{item.points}</td>
            </>
          ),
          () => (
            <>
              {renderField('Edição', 'edition')}
              {renderField('Detalhe', 'detail')}
              {renderField('Tipo', 'type')}
              {renderField('Pontos', 'points', 'number')}
            </>
          ),
          () => editing
            ? api.updateVeeamProduct(editing, formData)
            : api.createVeeamProduct(formData),
          (id) => api.deleteVeeamProduct(id)
        );

      case 'intervals':
        return renderTable(
          ['Intervalo', 'Valor por Ponto (USD)'],
          data.pointsIntervals,
          (item) => (
            <>
              <td className="py-3 px-3 font-medium">{item.interval_name}</td>
              <td className="py-3 px-3">{item.value_per_point}</td>
            </>
          ),
          () => (
            <>
              {renderField('Intervalo', 'interval_name')}
              {renderField('Valor por Ponto', 'value_per_point', 'number')}
            </>
          ),
          () => editing
            ? api.updatePointsInterval(editing, formData)
            : api.createPointsInterval(formData),
          (id) => api.deletePointsInterval(id)
        );

      case 'management':
        return renderTable(
          ['Tipo', 'Cobrança', 'Setup (USD)', 'Mensal (USD)'],
          data.managementPricing,
          (item) => (
            <>
              <td className="py-3 px-3 font-medium">{item.type}</td>
              <td className="py-3 px-3">{item.charge_basis}</td>
              <td className="py-3 px-3">{item.setup_cost}</td>
              <td className="py-3 px-3">{item.monthly_cost}</td>
            </>
          ),
          () => (
            <>
              {renderField('Tipo', 'type')}
              {renderField('Cobrança', 'charge_basis')}
              {renderField('Setup (USD)', 'setup_cost', 'number')}
              {renderField('Mensal (USD)', 'monthly_cost', 'number')}
            </>
          ),
          () => editing
            ? api.updateManagementPricing(editing, formData)
            : api.createManagementPricing(formData),
          (id) => api.deleteManagementPricing(id)
        );

      case 'storageOnprem':
        return renderTable(
          ['Capacidade (TB)', 'Custo Mensal (R$)'],
          data.storageOnpremise,
          (item) => (
            <>
              <td className="py-3 px-3 font-medium">{item.tb_amount} TB</td>
              <td className="py-3 px-3">R$ {item.monthly_cost.toFixed(2)}</td>
            </>
          ),
          () => (
            <>
              {renderField('TB', 'tb_amount', 'number')}
              {renderField('Custo Mensal (R$)', 'monthly_cost', 'number')}
            </>
          ),
          () => editing
            ? api.updateStorageOnpremise(editing, formData)
            : api.createStorageOnpremise(formData),
          (id) => api.deleteStorageOnpremise(id)
        );

      case 'storageCloud':
        return renderTable(
          ['Nome', 'Preço Base (R$)', 'Mínimo (TB)', 'Máximo (TB)'],
          data.storageCloud,
          (item) => (
            <>
              <td className="py-3 px-3 font-medium">{item.name}</td>
              <td className="py-3 px-3">R$ {item.base_price.toFixed(2)}</td>
              <td className="py-3 px-3">{item.min_tb}</td>
              <td className="py-3 px-3">{item.max_tb}</td>
            </>
          ),
          () => (
            <>
              {renderField('Nome', 'name')}
              {renderField('Preço Base (R$)', 'base_price', 'number')}
              {renderField('Mínimo (TB)', 'min_tb', 'number')}
              {renderField('Máximo (TB)', 'max_tb', 'number')}
            </>
          ),
          () => editing
            ? api.updateStorageCloud(editing, formData)
            : api.createStorageCloud(formData),
          (id) => api.deleteStorageCloud(id)
        );

      case 'margins':
        return renderTable(
          ['Tipo', 'Agressivo', 'Moderado', 'Conservador'],
          data.margins,
          (item) => (
            <>
              <td className="py-3 px-3 font-medium">
                {item.type === 'sem_gerencia' ? 'Sem Gerência' : 'Com Gerência'}
              </td>
              <td className="py-3 px-3">{(item.aggressive * 100).toFixed(0)}%</td>
              <td className="py-3 px-3">{(item.moderate * 100).toFixed(0)}%</td>
              <td className="py-3 px-3">{(item.conservative * 100).toFixed(0)}%</td>
            </>
          ),
          () => (
            <>
              {renderField('Tipo', 'type')}
              {renderField('Agressivo', 'aggressive', 'number')}
              {renderField('Moderado', 'moderate', 'number')}
              {renderField('Conservador', 'conservative', 'number')}
            </>
          ),
          () => api.updateMargin(editing, formData),
          undefined,
          false
        );

      case 'roi':
        return renderTable(
          ['Risco', 'Agressivo (meses)', 'Moderado (meses)', 'Conservador (meses)'],
          data.serverRoi,
          (item) => (
            <>
              <td className="py-3 px-3 font-medium">{item.risk_level}</td>
              <td className="py-3 px-3">{item.aggressive_months}</td>
              <td className="py-3 px-3">{item.moderate_months}</td>
              <td className="py-3 px-3">{item.conservative_months}</td>
            </>
          ),
          () => (
            <>
              {renderField('Risco', 'risk_level')}
              {renderField('Agressivo (meses)', 'aggressive_months', 'number')}
              {renderField('Moderado (meses)', 'moderate_months', 'number')}
              {renderField('Conservador (meses)', 'conservative_months', 'number')}
            </>
          ),
          () => api.updateServerRoi(editing, formData),
          undefined,
          false
        );

      case 'multipliers':
        return renderTable(
          ['Risco', 'Agressivo', 'Moderado', 'Conservador'],
          data.managementMultipliers,
          (item) => (
            <>
              <td className="py-3 px-3 font-medium">{item.risk_level}</td>
              <td className="py-3 px-3">{item.aggressive}</td>
              <td className="py-3 px-3">{item.moderate}</td>
              <td className="py-3 px-3">{item.conservative}</td>
            </>
          ),
          () => (
            <>
              {renderField('Risco', 'risk_level')}
              {renderField('Agressivo', 'aggressive', 'number')}
              {renderField('Moderado', 'moderate', 'number')}
              {renderField('Conservador', 'conservative', 'number')}
            </>
          ),
          () => api.updateManagementMultiplier(editing, formData),
          undefined,
          false
        );

      case 'tax':
        return renderTable(
          ['Nome', 'Taxa'],
          data.taxConfig,
          (item) => (
            <>
              <td className="py-3 px-3 font-medium">{item.name}</td>
              <td className="py-3 px-3">{(item.rate * 100).toFixed(0)}%</td>
            </>
          ),
          () => (
            <>
              {renderField('Nome', 'name')}
              {renderField('Taxa (decimal)', 'rate', 'number')}
            </>
          ),
          () => api.updateTaxConfig(editing, formData),
          undefined,
          false
        );

      case 'logo': {
        const currentLogoSrc = logoPreview
          || (logoInfo.hasCustomLogo && logoInfo.filename
            ? api.getLogoUrl(logoInfo.filename) + '?t=' + Date.now()
            : `${import.meta.env.BASE_URL}logo.png`);

        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Logo atual</h3>
              <p className="text-sm text-gray-500 mb-4">
                Este logo é exibido na tela de login e na barra de navegação.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center">
                <img
                  src={currentLogoSrc}
                  alt="Logo atual"
                  className="max-h-24 max-w-xs object-contain"
                />
              </div>
              {logoInfo.hasCustomLogo && (
                <p className="text-xs text-green-600 mt-2">Logo personalizado ativo</p>
              )}
              {!logoInfo.hasCustomLogo && (
                <p className="text-xs text-gray-400 mt-2">Usando logo padrão</p>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">Enviar novo logo</h3>
              <p className="text-sm text-gray-500 mb-3">
                Formatos aceitos: PNG, JPG, SVG, WebP. Tamanho máximo: 2MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoUploading}
                  className="btn-primary text-sm"
                >
                  {logoUploading ? 'Enviando...' : 'Selecionar arquivo'}
                </button>
                {logoInfo.hasCustomLogo && (
                  <button
                    onClick={handleLogoDelete}
                    className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Remover logo personalizado
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cadastros</h1>
        <p className="text-gray-500 mt-1">Dados de referência para cálculo de precificação (Dados Veeam)</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); cancel(); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {renderContent()}
      </div>
    </div>
  );
}
