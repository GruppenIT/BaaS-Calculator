import db from '../db/database';

export interface ScenarioInput {
  needs_veeam_licensing: boolean;
  needs_managed_services: boolean;
  needs_local_hardware: boolean;
  needs_cloud_storage: boolean;
  needs_o365_backup: boolean;
  vm_count: number;
  physical_server_count: number;
  veeam_points_level: string;
  veeam_edition: string;
  local_storage_tb: number;
  cloud_storage_tb: number;
  mailbox_count: number;
  server_acquisition_cost: number;
  has_dual_backup: boolean;
  dollar_rate: number;
  tax_rate: number;
}

export interface ScenarioLineItem {
  description: string;
  aggressive: number;
  moderate: number;
  conservative: number;
}

export interface ScenarioResults {
  risk_level: string;
  margins: { aggressive: number; moderate: number; conservative: number };
  line_items: {
    veeam_licensing: ScenarioLineItem;
    o365_licensing: ScenarioLineItem;
    cloud_connect: ScenarioLineItem;
    server_acquisition: { aggressive: number; moderate: number; conservative: number };
    server_roi_months: { aggressive: string; moderate: string; conservative: string };
    server_monthly: ScenarioLineItem;
    cloud_storage: ScenarioLineItem;
    management_monthly: ScenarioLineItem;
    management_setup: ScenarioLineItem;
  };
  totals: {
    subtotal: { aggressive: number; moderate: number; conservative: number };
    tax: { aggressive: number; moderate: number; conservative: number };
    total_monthly: { aggressive: number; moderate: number; conservative: number };
  };
  description_text: string;
}

function getPointsValue(level: string): number {
  const row = db.prepare('SELECT value_per_point FROM points_intervals WHERE interval_name = ?').get(level) as any;
  return row ? row.value_per_point : 0.69; // default to 10k
}

function getProductPoints(edition: string, type: string): number {
  const row = db.prepare('SELECT points FROM veeam_products WHERE edition = ? AND type = ?').get(edition, type) as any;
  return row ? row.points : 0;
}

function getMargins(type: string): { aggressive: number; moderate: number; conservative: number } {
  const row = db.prepare('SELECT aggressive, moderate, conservative FROM margins WHERE type = ?').get(type) as any;
  return row || { aggressive: 0.15, moderate: 0.25, conservative: 0.30 };
}

function getServerRoi(riskLevel: string): { aggressive: number; moderate: number; conservative: number } {
  const row = db.prepare('SELECT aggressive_months, moderate_months, conservative_months FROM server_roi WHERE risk_level = ?').get(riskLevel) as any;
  return row
    ? { aggressive: row.aggressive_months, moderate: row.moderate_months, conservative: row.conservative_months }
    : { aggressive: 16, moderate: 15, conservative: 14 };
}

function getManagementMultipliers(riskLevel: string): { aggressive: number; moderate: number; conservative: number } {
  const row = db.prepare('SELECT aggressive, moderate, conservative FROM management_multipliers WHERE risk_level = ?').get(riskLevel) as any;
  return row || { aggressive: 1.2, moderate: 1.4, conservative: 1.6 };
}

function getManagementPricing(): { vm: { setup: number; monthly: number }; o365: { setup: number; monthly: number } } {
  const rows = db.prepare('SELECT type, setup_cost, monthly_cost FROM management_pricing').all() as any[];
  const vm = rows.find((r: any) => r.type === 'VMs e Servers') || { setup_cost: 6, monthly_cost: 3 };
  const o365 = rows.find((r: any) => r.type === 'Office365 Users') || { setup_cost: 199, monthly_cost: 99 };
  return {
    vm: { setup: vm.setup_cost, monthly: vm.monthly_cost },
    o365: { setup: o365.setup_cost, monthly: o365.monthly_cost },
  };
}

function getCloudStoragePrice(): number {
  const row = db.prepare('SELECT base_price FROM storage_cloud LIMIT 1').get() as any;
  return row ? row.base_price : 199;
}

export function calculateScenario(input: ScenarioInput): ScenarioResults {
  // 1. Determine risk level
  // From formula: =IF($L$11="SIM",IF($L$21="NÃO","Alto","Médio"),"Baixo")
  let risk_level: string;
  if (input.needs_managed_services) {
    risk_level = input.has_dual_backup ? 'Médio' : 'Alto';
  } else {
    risk_level = 'Baixo';
  }

  // 2. Get margins based on whether managed services are included
  // From formula: =IF($L11="SIM",Dados!B31,Dados!B27)
  const marginType = input.needs_managed_services ? 'com_gerencia' : 'sem_gerencia';
  const margins = getMargins(marginType);

  // 3. Get reference data
  const pointsValue = getPointsValue(input.veeam_points_level);
  const mgmtPricing = getManagementPricing();
  const cloudBasePrice = getCloudStoragePrice();
  const roiMonths = getServerRoi(risk_level);
  const mgmtMultipliers = getManagementMultipliers(risk_level);

  // 4. Calculate Veeam B&R Licensing
  // Formula: IF($L$10="SIM", (($F$15*VLOOKUP($E$18,VM_range,4)*VLOOKUP($K$16,points_range,2)*$H$22)
  //          + ($L$15*VLOOKUP($E$18,Server_range,4)*VLOOKUP($K$16,points_range,2)*$H$22)) * (1+margin), 0)
  let veeamLicensing = { aggressive: 0, moderate: 0, conservative: 0 };
  if (input.needs_veeam_licensing) {
    const vmPoints = getProductPoints(input.veeam_edition, 'VM');
    const serverPoints = getProductPoints(input.veeam_edition, 'Server');

    const baseCost =
      (input.vm_count * vmPoints * pointsValue * input.dollar_rate) +
      (input.physical_server_count * serverPoints * pointsValue * input.dollar_rate);

    veeamLicensing = {
      aggressive: baseCost * (1 + margins.aggressive),
      moderate: baseCost * (1 + margins.moderate),
      conservative: baseCost * (1 + margins.conservative),
    };
  }

  // 5. Calculate O365 Licensing
  // Formula: IF($L$14="SIM",$L$19*Dados!$I$14*VLOOKUP($K$16,...)*$H$22*(1+margin),0)
  let o365Licensing = { aggressive: 0, moderate: 0, conservative: 0 };
  if (input.needs_o365_backup) {
    const o365Points = getProductPoints('Veeam Backup for Microsoft Office 365', 'User');
    const baseCost = input.mailbox_count * o365Points * pointsValue * input.dollar_rate;

    o365Licensing = {
      aggressive: baseCost * (1 + margins.aggressive),
      moderate: baseCost * (1 + margins.moderate),
      conservative: baseCost * (1 + margins.conservative),
    };
  }

  // 6. Calculate Cloud Connect
  // Formula: IF(L10="SIM",0, IF($L13="SIM",($F15*Dados!$I18)*VLOOKUP(...)*$H22*(1+margin),0))
  // Cloud Connect is only charged when the client does NOT have Veeam licensing
  let cloudConnect = { aggressive: 0, moderate: 0, conservative: 0 };
  if (!input.needs_veeam_licensing && input.needs_cloud_storage) {
    const ccPoints = getProductPoints('Veeam Cloud Connect', 'VM');
    const baseCost = input.vm_count * ccPoints * pointsValue * input.dollar_rate;

    cloudConnect = {
      aggressive: baseCost * (1 + margins.aggressive),
      moderate: baseCost * (1 + margins.moderate),
      conservative: baseCost * (1 + margins.conservative),
    };
  }

  // 7. Server Acquisition and Monthly Cost
  let serverAcquisition = { aggressive: 0, moderate: 0, conservative: 0 };
  let serverMonthly = { aggressive: 0, moderate: 0, conservative: 0 };
  let serverRoiMonthsStr = { aggressive: '', moderate: '', conservative: '' };

  if (input.needs_local_hardware) {
    serverAcquisition = {
      aggressive: input.server_acquisition_cost,
      moderate: input.server_acquisition_cost,
      conservative: input.server_acquisition_cost,
    };

    serverRoiMonthsStr = {
      aggressive: `${roiMonths.aggressive} meses`,
      moderate: `${roiMonths.moderate} meses`,
      conservative: `${roiMonths.conservative} meses`,
    };

    serverMonthly = {
      aggressive: input.server_acquisition_cost / roiMonths.aggressive,
      moderate: input.server_acquisition_cost / roiMonths.moderate,
      conservative: input.server_acquisition_cost / roiMonths.conservative,
    };
  }

  // 8. Cloud Storage
  // Formula: IF($L13="SIM",$G19*Dados!$B20,0) * factor
  // Factors: Agressivo=0.8, Moderado=0.9, Conservador=1.0
  let cloudStorage = { aggressive: 0, moderate: 0, conservative: 0 };
  if (input.needs_cloud_storage) {
    const baseStorageCost = input.cloud_storage_tb * cloudBasePrice;
    cloudStorage = {
      aggressive: baseStorageCost * 0.8,
      moderate: baseStorageCost * 0.9,
      conservative: baseStorageCost * 1.0,
    };
  }

  // 9. Management (Monthly)
  // Formula: IF($L$11="SIM",
  //   ((($F$15+$L$15)*Dados!$D$9)+IF($L$14="SIM",Dados!$D$10,0))*$H$22 * multiplier, 0)
  let managementMonthly = { aggressive: 0, moderate: 0, conservative: 0 };
  if (input.needs_managed_services) {
    const baseMgmtCost =
      ((input.vm_count + input.physical_server_count) * mgmtPricing.vm.monthly +
        (input.needs_o365_backup ? mgmtPricing.o365.monthly : 0)) * input.dollar_rate;

    managementMonthly = {
      aggressive: baseMgmtCost * mgmtMultipliers.aggressive,
      moderate: baseMgmtCost * mgmtMultipliers.moderate,
      conservative: baseMgmtCost * mgmtMultipliers.conservative,
    };
  }

  // 10. Management (Setup - one-time)
  // Formula uses setup_cost instead of monthly_cost
  let managementSetup = { aggressive: 0, moderate: 0, conservative: 0 };
  if (input.needs_managed_services) {
    const baseSetupCost =
      ((input.vm_count + input.physical_server_count) * mgmtPricing.vm.setup +
        (input.needs_o365_backup ? mgmtPricing.o365.setup : 0)) * input.dollar_rate;

    managementSetup = {
      aggressive: baseSetupCost * mgmtMultipliers.aggressive,
      moderate: baseSetupCost * mgmtMultipliers.moderate,
      conservative: baseSetupCost * mgmtMultipliers.conservative,
    };
  }

  // 11. Totals
  // Formula: =(SUM(veeam+o365+cloudConnect)+serverMonthly+cloudStorage+managementMonthly)/(1-taxRate)
  const taxRate = input.tax_rate;

  const subtotal = {
    aggressive: veeamLicensing.aggressive + o365Licensing.aggressive + cloudConnect.aggressive +
      serverMonthly.aggressive + cloudStorage.aggressive + managementMonthly.aggressive,
    moderate: veeamLicensing.moderate + o365Licensing.moderate + cloudConnect.moderate +
      serverMonthly.moderate + cloudStorage.moderate + managementMonthly.moderate,
    conservative: veeamLicensing.conservative + o365Licensing.conservative + cloudConnect.conservative +
      serverMonthly.conservative + cloudStorage.conservative + managementMonthly.conservative,
  };

  const totalMonthly = {
    aggressive: subtotal.aggressive / (1 - taxRate),
    moderate: subtotal.moderate / (1 - taxRate),
    conservative: subtotal.conservative / (1 - taxRate),
  };

  const tax = {
    aggressive: totalMonthly.aggressive * taxRate,
    moderate: totalMonthly.moderate * taxRate,
    conservative: totalMonthly.conservative * taxRate,
  };

  // 12. Build description text
  const editionShortName = input.veeam_edition
    .replace('Veeam Backup & Replication ', '')
    .replace('ENT Plus', 'Enterprise Plus')
    .replace('ENT', 'Enterprise')
    .replace('STAN', 'Standard');

  let description = 'Solução de backup como serviço (BaaS) utilizando tecnologia Veeam conforme escopo dimensionado abaixo:\n\nItens incluídos:\n';

  if (input.needs_veeam_licensing) {
    description += `\n- Software Veeam Backup and Replication ${editionShortName} para proteção de ${input.vm_count} servidores virtuais`;
    if (input.physical_server_count > 0) {
      description += ` e ${input.physical_server_count} servidores físicos com Veeam Agent`;
    }
    description += '.';
  }

  if (input.needs_o365_backup) {
    description += `\n- Software Veeam Backup for Microsoft Office 365 para ${input.mailbox_count} caixas postais.`;
  }

  if (input.needs_cloud_storage) {
    description += `\n- Repositório para armazenamento em nuvem com capacidade de ${input.cloud_storage_tb}TB.`;
  }

  if (input.needs_local_hardware) {
    description += `\n- Locação de servidor Dell EMC para repositório local com capacidade de ${input.local_storage_tb}TB.`;
  }

  if (input.needs_managed_services) {
    description += `\n\n- Serviços Continuados de operação e monitoramento das rotinas de backup, para até ${input.vm_count + input.physical_server_count} servidores`;
    if (input.needs_o365_backup) {
      description += ', incluindo ambiente Veeam Backup for Office 365.';
    } else {
      description += '.';
    }
  }

  description += '\n\n* Serviço de setup inicial incluído.';

  // Items NOT included
  const notIncluded: string[] = [];
  if (!input.needs_veeam_licensing) notIncluded.push('Licenciamento Veeam Backup and Replication.');
  if (!input.needs_o365_backup) notIncluded.push('Licenciamento Veeam Backup for Microsoft Office 365.');
  if (!input.needs_cloud_storage) notIncluded.push('Repositório para armazenamento em nuvem.');
  if (!input.needs_local_hardware) notIncluded.push('Locação de servidor para repositório local.');
  if (!input.needs_managed_services) notIncluded.push('Serviços Continuados de operação e monitoramento das rotinas de backup.');

  if (notIncluded.length > 0) {
    description += '\n\nItens não incluídos:\n';
    for (const item of notIncluded) {
      description += `\n- ${item}`;
    }
  }

  return {
    risk_level,
    margins,
    line_items: {
      veeam_licensing: {
        description: input.needs_veeam_licensing
          ? `${input.veeam_edition} para ${input.vm_count} VMs${input.physical_server_count > 0 ? ` e ${input.physical_server_count} servidores físicos` : ''}`
          : 'Não incluído',
        ...veeamLicensing,
      },
      o365_licensing: {
        description: input.needs_o365_backup
          ? `Veeam Backup for Microsoft Office 365 para ${input.mailbox_count} mailboxes`
          : 'Não incluído',
        ...o365Licensing,
      },
      cloud_connect: {
        description: !input.needs_veeam_licensing && input.needs_cloud_storage
          ? `Veeam Cloud Connect para ${input.vm_count} VMs`
          : 'Não aplicável',
        ...cloudConnect,
      },
      server_acquisition: serverAcquisition,
      server_roi_months: serverRoiMonthsStr,
      server_monthly: {
        description: input.needs_local_hardware ? `Custo mensal do servidor` : 'Não incluído',
        ...serverMonthly,
      },
      cloud_storage: {
        description: input.needs_cloud_storage
          ? `Armazenamento em nuvem (Zerobox): ${input.cloud_storage_tb} TB`
          : 'Não incluído',
        ...cloudStorage,
      },
      management_monthly: {
        description: input.needs_managed_services ? 'Serviços Gerenciados (mensal)' : 'Não incluído',
        ...managementMonthly,
      },
      management_setup: {
        description: input.needs_managed_services ? 'Serviços Gerenciados (setup, cobrança única)' : 'Não incluído',
        ...managementSetup,
      },
    },
    totals: {
      subtotal,
      tax,
      total_monthly: totalMonthly,
    },
    description_text: description,
  };
}
