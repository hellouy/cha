export interface WhoisData {
  // 域名基本信息
  domainName?: string;
  domainId?: string;
  creationDate?: string;
  updatedDate?: string;
  expirationDate?: string;
  status?: string[];
  
  // 注册商信息
  registrar?: {
    name?: string;
    url?: string;
    email?: string;
    phone?: string;
  };
  
  // 注册人信息
  registrant?: {
    id?: string;
    name?: string;
    organization?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    type?: string;
  };
  
  // 账单联系人
  billingContact?: {
    id?: string;
    name?: string;
    type?: string;
    address?: string;
  };
  
  // DNS 服务器
  nameServers?: string[];
  
  // 原始数据
  rawData: string;
}

// 字段映射表，支持多语言和不同格式
const fieldMappings: Record<string, string[]> = {
  domainName: ['Domain Name', 'Nom de domaine', 'domain'],
  domainId: ['Domain ID', 'Registry Domain ID'],
  creationDate: ['Creation Date', 'Date de création', 'Created Date', 'Created On', 'Registration Date'],
  updatedDate: ['Updated Date', 'Dernière modification', 'Last Modified', 'Last Updated On'],
  expirationDate: ['Expiration Date', "Date d'expiration", 'Registry Expiry Date', 'Expiry Date'],
  registrarName: ['Registrar', 'Registrar Name', 'Sponsoring Registrar'],
  registrarUrl: ['Registrar URL', 'Registrar Website'],
  registrarEmail: ['Registrar Abuse Contact Email', 'Registrar Email'],
  registrarPhone: ['Registrar Abuse Contact Phone', 'Registrar Phone'],
  registrantName: ['Registrant Name', 'Nom', 'Name'],
  registrantOrg: ['Registrant Organization', 'Organisation'],
  registrantEmail: ['Registrant Email', 'Email'],
  registrantPhone: ['Registrant Phone', 'Phone', 'Téléphone'],
  registrantAddress: ['Registrant Street', 'Adresse', 'Address'],
  registrantCity: ['Registrant City', 'Ville', 'City'],
  registrantCountry: ['Registrant Country', 'Pays', 'Country'],
  registrantType: ['Type'],
  registrantId: ['Registrant ID', 'ID Contact'],
  status: ['Domain Status', 'Statut', 'Status'],
  nameServer: ['Name Server', 'Serveur DNS', 'nserver'],
};

function extractField(raw: string, fieldNames: string[]): string | undefined {
  for (const fieldName of fieldNames) {
    // 尝试多种格式匹配
    const patterns = [
      new RegExp(`^${escapeRegex(fieldName)}:\\s*(.+)$`, 'im'),
      new RegExp(`^${escapeRegex(fieldName)}\\s+(.+)$`, 'im'),
    ];
    
    for (const pattern of patterns) {
      const match = raw.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        // 过滤掉空值和特殊字符
        if (value && value !== '-' && value !== 'N/A') {
          return value;
        }
      }
    }
  }
  return undefined;
}

function extractMultipleFields(raw: string, fieldNames: string[]): string[] {
  const results: string[] = [];
  
  for (const fieldName of fieldNames) {
    const pattern = new RegExp(`^${escapeRegex(fieldName)}:?\\s*(.+)$`, 'gim');
    let match;
    while ((match = pattern.exec(raw)) !== null) {
      const value = match[1].trim();
      if (value && value !== '-' && value !== 'N/A' && !results.includes(value)) {
        results.push(value);
      }
    }
  }
  
  return results;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  
  // 尝试解析日期并格式化
  try {
    // 处理 ISO 格式 (2025-05-19T...)
    if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function extractSection(raw: string, sectionName: string): string | undefined {
  // 提取特定部分（如 [BILLING_C]）
  const pattern = new RegExp(`\\[${escapeRegex(sectionName)}\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
  const match = raw.match(pattern);
  return match ? match[1] : undefined;
}

export function parseWhoisData(raw: string): WhoisData {
  // 基本字段提取
  const result: WhoisData = {
    domainName: extractField(raw, fieldMappings.domainName),
    domainId: extractField(raw, fieldMappings.domainId),
    creationDate: formatDate(extractField(raw, fieldMappings.creationDate)),
    updatedDate: formatDate(extractField(raw, fieldMappings.updatedDate)),
    expirationDate: formatDate(extractField(raw, fieldMappings.expirationDate)),
    status: extractMultipleFields(raw, fieldMappings.status),
    
    registrar: {
      name: extractField(raw, fieldMappings.registrarName),
      url: extractField(raw, fieldMappings.registrarUrl),
      email: extractField(raw, fieldMappings.registrarEmail),
      phone: extractField(raw, fieldMappings.registrarPhone),
    },
    
    registrant: {
      id: extractField(raw, fieldMappings.registrantId),
      name: extractField(raw, fieldMappings.registrantName),
      organization: extractField(raw, fieldMappings.registrantOrg),
      email: extractField(raw, fieldMappings.registrantEmail),
      phone: extractField(raw, fieldMappings.registrantPhone),
      address: extractField(raw, fieldMappings.registrantAddress),
      city: extractField(raw, fieldMappings.registrantCity),
      country: extractField(raw, fieldMappings.registrantCountry),
      type: extractField(raw, fieldMappings.registrantType),
    },
    
    nameServers: extractMultipleFields(raw, fieldMappings.nameServer),
    rawData: raw,
  };
  
  // 提取账单联系人信息
  const billingSection = extractSection(raw, 'BILLING_C');
  if (billingSection) {
    result.billingContact = {
      id: extractField(billingSection, ['ID Contact']),
      name: extractField(billingSection, ['Nom', 'Name']),
      type: extractField(billingSection, ['Type']),
      address: extractField(billingSection, ['Adresse', 'Address']),
    };
  }
  
  // 清理空对象
  if (result.registrar && Object.values(result.registrar).every(v => !v)) {
    result.registrar = undefined;
  }
  if (result.registrant && Object.values(result.registrant).every(v => !v)) {
    result.registrant = undefined;
  }
  if (result.billingContact && Object.values(result.billingContact).every(v => !v)) {
    result.billingContact = undefined;
  }
  
  return result;
}

// 获取状态的友好显示名称和颜色
export function getStatusInfo(status: string): { label: string; color: 'green' | 'yellow' | 'red' | 'gray' } {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('active') || statusLower === 'actif' || statusLower.includes('ok')) {
    return { label: '活跃', color: 'green' };
  }
  if (statusLower.includes('pending')) {
    return { label: '待处理', color: 'yellow' };
  }
  if (statusLower.includes('expired') || statusLower.includes('redemption')) {
    return { label: '已过期', color: 'red' };
  }
  if (statusLower.includes('clienttransferprohibited') || statusLower.includes('servertransferprohibited')) {
    return { label: '禁止转移', color: 'yellow' };
  }
  if (statusLower.includes('clientdeleteprohibited') || statusLower.includes('serverdeleteprohibited')) {
    return { label: '禁止删除', color: 'yellow' };
  }
  if (statusLower.includes('clientupdateprohibited') || statusLower.includes('serverupdateprohibited')) {
    return { label: '禁止更新', color: 'yellow' };
  }
  
  return { label: status, color: 'gray' };
}
