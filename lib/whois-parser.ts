export interface WhoisData {
  // 域名基本信息
  domainName?: string;
  domainId?: string;
  creationDate?: string;
  updatedDate?: string;
  expirationDate?: string;
  status?: string[];
  
  // 域名可用性状态
  availability: 'registered' | 'available' | 'reserved' | 'prohibited' | 'unknown';
  availabilityMessage?: string;
  
  // 注册商信息
  registrar?: {
    name?: string;
    url?: string;
    email?: string;
    phone?: string;
    id?: string;
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
    state?: string;
    postalCode?: string;
    country?: string;
    type?: string;
  };
  
  // 管理联系人
  adminContact?: {
    id?: string;
    name?: string;
    organization?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  
  // 技术联系人
  techContact?: {
    id?: string;
    name?: string;
    organization?: string;
    email?: string;
    phone?: string;
    address?: string;
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
  
  // DNSSEC
  dnssec?: string;
  
  // 额外提取的字段（动态）
  additionalFields?: Record<string, string>;
  
  // 原始数据
  rawData: string;
}

// 域名可用性检测模式
const availabilityPatterns = {
  available: [
    /no match/i,
    /not found/i,
    /no data found/i,
    /no entries found/i,
    /domain not found/i,
    /no object found/i,
    /status:\s*free/i,
    /status:\s*available/i,
    /domain status:\s*available/i,
    /is available/i,
    /没有找到/i,
    /未注册/i,
    /可注册/i,
    /^% No match$/m,
    /^%% No match for/m,
    /This domain name has not been registered/i,
    /The queried object does not exist/i,
    /Object does not exist/i,
    /Domain Status: No Object Found/i,
    /^No match for domain/im,
    /^NOT FOUND$/im,
    /Status:\s*AVAILABLE/i,
  ],
  reserved: [
    /^reserved$/i,
    /status:\s*reserved/i,
    /domain reserved/i,
    /保留/i,
    /This domain is reserved/i,
    /premium domain/i,
    /Reserved Domain Name/i,
    /status:\s*serverHold/i,
  ],
  // 仅匹配真正禁止注册的情况，不包括域名保护状态
  prohibited: [
    /^prohibited$/i,
    /^forbidden$/i,
    /^blocked$/i,
    /^banned$/i,
    /not allowed to register/i,
    /禁止注册/i,
    /cannot be registered/i,
    /registration not allowed/i,
    /This domain cannot be registered/i,
    /Domain is not available for registration/i,
    /invalid domain name/i,
    /illegal domain/i,
  ],
};

// 域名保护状态标识（这些是已注册域名的保护措施，不是禁止注册）
const protectionStatuses = [
  /client.*prohibited/i,
  /server.*prohibited/i,
  /clienttransferprohibited/i,
  /clientdeleteprohibited/i,
  /clientupdateprohibited/i,
  /clientrenewprohibited/i,
  /servertransferprohibited/i,
  /serverdeleteprohibited/i,
  /serverupdateprohibited/i,
  /serverrenewprohibited/i,
];

// 字段映射表，支持多语言和不同格式
const fieldMappings: Record<string, string[]> = {
  domainName: [
    'Domain Name', 'Nom de domaine', 'domain', 'Domain', 
    'domain name', 'ドメイン名', '域名', 'Dominio',
    'Nome de Domínio', 'Nombre de Dominio', 'Domainnaam'
  ],
  domainId: [
    'Domain ID', 'Registry Domain ID', 'Domain Handle',
    'Handle', 'ROID', 'Registry ID'
  ],
  creationDate: [
    'Creation Date', 'Date de création', 'Created Date', 'Created On', 
    'Registration Date', 'Created', 'Registered on', 'Registration Time',
    'created', 'Fecha de creación', 'Data de Criação', '注册日期',
    'Domain Registration Date', 'Registered Date', 'Domain Create Date',
    'Record created on', 'Domain created', 'record created',
    'Registered', 'Registration', 'Created at', 'Création'
  ],
  updatedDate: [
    'Updated Date', 'Dernière modification', 'Last Modified', 'Last Updated On',
    'Last Updated', 'Modified', 'Last Update', 'Updated On', 'changed',
    'Última modificación', 'Última Atualização', '更新日期',
    'Domain Last Updated Date', 'Record last updated on', 'record last updated',
    'Updated at', 'Modification'
  ],
  expirationDate: [
    'Expiration Date', "Date d'expiration", 'Registry Expiry Date', 'Expiry Date',
    'Expiry', 'Expires On', 'Expires', 'Paid-Till', 'Valid Until',
    'Fecha de expiración', 'Data de Expiração', '到期日期', 'Renewal Date',
    'Registrar Registration Expiration Date', 'free-date', 'Domain Expiration Date',
    'Expiration', 'Expires at'
  ],
  registrarName: [
    'Registrar', 'Registrar Name', 'Sponsoring Registrar', 
    'Registrar Organization', 'Provider', '注册商', 'Registrador',
    'Registrar Company Name', 'Current Registrar'
  ],
  registrarUrl: [
    'Registrar URL', 'Registrar Website', 'Registrar Web', 
    'Registrar Homepage'
  ],
  registrarEmail: [
    'Registrar Abuse Contact Email', 'Registrar Email', 
    'Abuse Contact Email', 'Registrar Contact Email'
  ],
  registrarPhone: [
    'Registrar Abuse Contact Phone', 'Registrar Phone',
    'Abuse Contact Phone', 'Registrar Contact Phone'
  ],
  registrarId: [
    'Registrar IANA ID', 'Registrar ID', 'Sponsoring Registrar IANA ID'
  ],
  registrantName: [
    'Registrant Name', 'Nom', 'Name', 'Owner Name', 'Holder Name',
    'Contact Name', 'Registrant', '注册人', 'Owner', 'Holder'
  ],
  registrantOrg: [
    'Registrant Organization', 'Organisation', 'Organization', 
    'Registrant Org', 'Owner Organization', 'Holder Organization',
    '注册人组织', 'Org', 'Organization Name'
  ],
  registrantEmail: [
    'Registrant Email', 'Email', 'Owner Email', 'Holder Email',
    'Contact Email', 'E-mail', '邮箱'
  ],
  registrantPhone: [
    'Registrant Phone', 'Phone', 'Téléphone', 'Owner Phone', 
    'Holder Phone', 'Tel', 'Telephone', '电话', 'Fax'
  ],
  registrantAddress: [
    'Registrant Street', 'Adresse', 'Address', 'Street', 
    'Registrant Address', 'Owner Address', '地址'
  ],
  registrantCity: [
    'Registrant City', 'Ville', 'City', 'Owner City', '城市'
  ],
  registrantState: [
    'Registrant State/Province', 'State', 'Province', 
    'Registrant State', '省份'
  ],
  registrantPostalCode: [
    'Registrant Postal Code', 'Postal Code', 'ZIP', 'Postcode',
    'ZIP Code', '邮编'
  ],
  registrantCountry: [
    'Registrant Country', 'Pays', 'Country', 'Owner Country', 
    'Country Code', '国家'
  ],
  registrantType: ['Type', 'Registrant Type', 'Owner Type'],
  registrantId: ['Registrant ID', 'ID Contact', 'Holder ID', 'Owner ID'],
  
  // 管理联系人
  adminName: ['Admin Name', 'Administrative Contact Name', 'Admin Contact'],
  adminOrg: ['Admin Organization', 'Administrative Contact Organization'],
  adminEmail: ['Admin Email', 'Administrative Contact Email'],
  adminPhone: ['Admin Phone', 'Administrative Contact Phone'],
  adminId: ['Admin ID', 'Administrative Contact ID'],
  
  // 技术联系人
  techName: ['Tech Name', 'Technical Contact Name', 'Tech Contact'],
  techOrg: ['Tech Organization', 'Technical Contact Organization'],
  techEmail: ['Tech Email', 'Technical Contact Email'],
  techPhone: ['Tech Phone', 'Technical Contact Phone'],
  techId: ['Tech ID', 'Technical Contact ID'],
  
  status: [
    'Domain Status', 'Statut', 'Status', 'State', 'Domain State',
    '状态', 'Registration Status'
  ],
  nameServer: [
    'Name Server', 'Serveur DNS', 'nserver', 'NS', 'Nameserver',
    'Name Servers', 'DNS', 'DNS Servers', 'Hostname', 'Server Name'
  ],
  dnssec: [
    'DNSSEC', 'DS Record', 'DNSSEC Status', 'Signed'
  ],
};

function extractField(raw: string, fieldNames: string[]): string | undefined {
  for (const fieldName of fieldNames) {
    // 尝试多种格式匹配
    const patterns = [
      // 标准格式: "Field Name: value"
      new RegExp(`^\\s*${escapeRegex(fieldName)}\\s*:\\s*(.+?)\\s*$`, 'im'),
      // 带多个空格的格式: "Field Name    value"
      new RegExp(`^\\s*${escapeRegex(fieldName)}\\s{2,}(.+?)\\s*$`, 'im'),
      // 方括号格式: "[Field Name] value"
      new RegExp(`^\\s*\\[${escapeRegex(fieldName)}\\]\\s*(.+?)\\s*$`, 'im'),
      // 等号格式: "field_name=value"
      new RegExp(`^\\s*${escapeRegex(fieldName.toLowerCase().replace(/\s+/g, '_'))}\\s*=\\s*(.+?)\\s*$`, 'im'),
      // 点号格式: "field.name: value"
      new RegExp(`^\\s*${escapeRegex(fieldName.toLowerCase().replace(/\s+/g, '.'))}\\s*:\\s*(.+?)\\s*$`, 'im'),
      // 下划线格式：field_name: value
      new RegExp(`^\\s*${escapeRegex(fieldName.toLowerCase().replace(/\s+/g, '_'))}\\s*:\\s*(.+?)\\s*$`, 'im'),
      // 连字符格式：field-name: value
      new RegExp(`^\\s*${escapeRegex(fieldName.toLowerCase().replace(/\s+/g, '-'))}\\s*:\\s*(.+?)\\s*$`, 'im'),
      // Tab分隔格式
      new RegExp(`^\\s*${escapeRegex(fieldName)}\\s*\\t+(.+?)\\s*$`, 'im'),
    ];
    
    for (const pattern of patterns) {
      const match = raw.match(pattern);
      if (match && match[1]) {
        const value = cleanValue(match[1]);
        if (value) {
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
    const patterns = [
      new RegExp(`^\\s*${escapeRegex(fieldName)}\\s*:?\\s*(.+?)\\s*$`, 'gim'),
      new RegExp(`^\\s*${escapeRegex(fieldName)}\\s{2,}(.+?)\\s*$`, 'gim'),
      new RegExp(`^\\s*${escapeRegex(fieldName)}\\s*\\t+(.+?)\\s*$`, 'gim'),
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(raw)) !== null) {
        const value = cleanValue(match[1]);
        if (value && !results.some(r => r.toLowerCase() === value.toLowerCase())) {
          results.push(value);
        }
      }
    }
  }
  
  return results;
}

function cleanValue(value: string): string | undefined {
  if (!value) return undefined;
  
  let cleaned = value.trim();
  
  // 移除 URL 后缀（如 "clientTransferProhibited https://..."）
  cleaned = cleaned.replace(/\s+https?:\/\/\S+/g, '');
  
  // 移除常见的无效值
  const invalidValues = [
    '-', '--', 'N/A', 'n/a', 'NA', 'na', 'null', 'NULL', 
    'none', 'NONE', 'Not Available', 'Not Disclosed', 
    'REDACTED FOR PRIVACY', 'REDACTED', 'Data Protected',
    'Please query the RDDS service', 'Contact Privacy Inc.',
    '***', '......', 'not disclosed', 'private', 'PRIVATE',
    'Redacted for Privacy', 'DATA REDACTED'
  ];
  
  if (invalidValues.some(inv => cleaned.toLowerCase() === inv.toLowerCase())) {
    return undefined;
  }
  
  // 移除隐私保护文本
  if (cleaned.toLowerCase().includes('redacted') && cleaned.length < 50) {
    return undefined;
  }
  if (cleaned.toLowerCase().includes('privacy') && cleaned.length < 50) {
    return undefined;
  }
  
  // 移除括号中的额外说明
  cleaned = cleaned.replace(/\s*\([^)]*redacted[^)]*\)/gi, '');
  
  return cleaned || undefined;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  
  try {
    // 移除时间部分的特殊字符
    let cleaned = dateStr.trim();
    
    // 处理多种日期格式
    let date: Date | null = null;
    
    // ISO 格式 (2025-05-19T...)
    if (cleaned.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
      date = new Date(cleaned);
    }
    // DD-Mon-YYYY 格式 (19-May-2025)
    else if (/^\d{2}-[A-Za-z]{3}-\d{4}/.test(cleaned)) {
      date = new Date(cleaned);
    }
    // YYYY-MM-DD 格式
    else if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
      date = new Date(cleaned);
    }
    // DD/MM/YYYY 格式
    else if (/^\d{2}\/\d{2}\/\d{4}/.test(cleaned)) {
      const [day, month, year] = cleaned.split('/');
      date = new Date(`${year}-${month}-${day}`);
    }
    // YYYY/MM/DD 格式
    else if (/^\d{4}\/\d{2}\/\d{2}/.test(cleaned)) {
      const [year, month, day] = cleaned.split('/');
      date = new Date(`${year}-${month}-${day}`);
    }
    // DD.MM.YYYY 格式
    else if (/^\d{2}\.\d{2}\.\d{4}/.test(cleaned)) {
      const [day, month, year] = cleaned.split('.');
      date = new Date(`${year}-${month}-${day}`);
    }
    // YYYYMMDD 格式
    else if (/^\d{8}$/.test(cleaned)) {
      const year = cleaned.slice(0, 4);
      const month = cleaned.slice(4, 6);
      const day = cleaned.slice(6, 8);
      date = new Date(`${year}-${month}-${day}`);
    }
    
    if (date && !isNaN(date.getTime())) {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return cleaned;
  } catch {
    return dateStr;
  }
}

function extractSection(raw: string, sectionNames: string[]): string | undefined {
  for (const sectionName of sectionNames) {
    // 尝试多种部分标记格式
    const patterns = [
      new RegExp(`\\[${escapeRegex(sectionName)}\\]([\\s\\S]*?)(?=\\[|$)`, 'i'),
      new RegExp(`>>>\\s*${escapeRegex(sectionName)}\\s*<<<([\\s\\S]*?)(?=>>>|$)`, 'i'),
      new RegExp(`---\\s*${escapeRegex(sectionName)}\\s*---([\\s\\S]*?)(?=---|$)`, 'i'),
      new RegExp(`${escapeRegex(sectionName)}:\\s*\\n([\\s\\S]*?)(?=\\n\\n|$)`, 'i'),
    ];
    
    for (const pattern of patterns) {
      const match = raw.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  return undefined;
}

function detectAvailability(raw: string): { 
  availability: WhoisData['availability']; 
  message?: string;
} {
  // 先检查是否有域名保护状态（这意味着域名已注册）
  for (const pattern of protectionStatuses) {
    if (pattern.test(raw)) {
      // 有保护状态表示域名已注册，不是禁止注册
      return { availability: 'registered' };
    }
  }
  
  // 检查是否有明显的已注册标志
  const registeredIndicators = [
    /domain\s*name\s*:/i,
    /registr(ar|ant)\s*:/i,
    /creat(ion|ed)\s*(date)?:/i,
    /expir(y|ation)\s*(date)?:/i,
    /name\s*server\s*:/i,
    /record\s+created/i,
    /registration\s+date/i,
    /status:\s*(active|ok)/i,
    /statut:\s*actif/i,
  ];
  
  for (const pattern of registeredIndicators) {
    if (pattern.test(raw)) {
      return { availability: 'registered' };
    }
  }
  
  // 检查是否可注册
  for (const pattern of availabilityPatterns.available) {
    if (pattern.test(raw)) {
      return { 
        availability: 'available',
        message: '此域名当前可以注册'
      };
    }
  }
  
  // 检查是否保留
  for (const pattern of availabilityPatterns.reserved) {
    if (pattern.test(raw)) {
      return { 
        availability: 'reserved',
        message: '此域名已被保留，可能需要特殊申请'
      };
    }
  }
  
  // 检查是否禁止注册（排除已经判断为已注册的情况）
  for (const pattern of availabilityPatterns.prohibited) {
    if (pattern.test(raw)) {
      return { 
        availability: 'prohibited',
        message: '此域名禁止注册'
      };
    }
  }
  
  // 如果原始数据很短且没有有用信息，可能是未知状态
  if (raw.trim().length < 100) {
    return { 
      availability: 'unknown',
      message: '无法确定域名状态'
    };
  }
  
  return { availability: 'registered' };
}

function extractAdditionalFields(raw: string, existingKeys: Set<string>): Record<string, string> {
  const additional: Record<string, string> = {};
  
  // 匹配所有 "Key: Value" 格式的行
  const lines = raw.split('\n');
  
  for (const line of lines) {
    // 跳过注释行和分隔线
    if (/^[%#>]/.test(line.trim()) || /^[=\-]{3,}$/.test(line.trim())) {
      continue;
    }
    
    // 跳过空行
    if (!line.trim()) continue;
    
    // 跳过包含 URL 的提示行
    if (/^(For further|Tovabbi|see:|ld\.:)/i.test(line.trim())) {
      continue;
    }
    
    // 尝试提取键值对
    const match = line.match(/^\s*([A-Za-z][A-Za-z0-9\s\-_.\/]*?)\s*:\s*(.+?)\s*$/);
    if (match) {
      const key = match[1].trim();
      const value = cleanValue(match[2]);
      
      // 跳过已提取的字段和无效值
      if (value && !existingKeys.has(key.toLowerCase())) {
        // 转换为友好的显示名称
        const displayKey = key
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/[_\-\.]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (displayKey.length > 2 && displayKey.length < 50) {
          additional[displayKey] = value;
        }
      }
    }
  }
  
  return additional;
}

export function parseWhoisData(raw: string): WhoisData {
  // 检测域名可用性
  const { availability, message: availabilityMessage } = detectAvailability(raw);
  
  // 基本字段提取
  const result: WhoisData = {
    domainName: extractField(raw, fieldMappings.domainName),
    domainId: extractField(raw, fieldMappings.domainId),
    creationDate: formatDate(extractField(raw, fieldMappings.creationDate)),
    updatedDate: formatDate(extractField(raw, fieldMappings.updatedDate)),
    expirationDate: formatDate(extractField(raw, fieldMappings.expirationDate)),
    status: extractMultipleFields(raw, fieldMappings.status),
    availability,
    availabilityMessage,
    
    registrar: {
      name: extractField(raw, fieldMappings.registrarName),
      url: extractField(raw, fieldMappings.registrarUrl),
      email: extractField(raw, fieldMappings.registrarEmail),
      phone: extractField(raw, fieldMappings.registrarPhone),
      id: extractField(raw, fieldMappings.registrarId),
    },
    
    registrant: {
      id: extractField(raw, fieldMappings.registrantId),
      name: extractField(raw, fieldMappings.registrantName),
      organization: extractField(raw, fieldMappings.registrantOrg),
      email: extractField(raw, fieldMappings.registrantEmail),
      phone: extractField(raw, fieldMappings.registrantPhone),
      address: extractField(raw, fieldMappings.registrantAddress),
      city: extractField(raw, fieldMappings.registrantCity),
      state: extractField(raw, fieldMappings.registrantState),
      postalCode: extractField(raw, fieldMappings.registrantPostalCode),
      country: extractField(raw, fieldMappings.registrantCountry),
      type: extractField(raw, fieldMappings.registrantType),
    },
    
    adminContact: {
      id: extractField(raw, fieldMappings.adminId),
      name: extractField(raw, fieldMappings.adminName),
      organization: extractField(raw, fieldMappings.adminOrg),
      email: extractField(raw, fieldMappings.adminEmail),
      phone: extractField(raw, fieldMappings.adminPhone),
    },
    
    techContact: {
      id: extractField(raw, fieldMappings.techId),
      name: extractField(raw, fieldMappings.techName),
      organization: extractField(raw, fieldMappings.techOrg),
      email: extractField(raw, fieldMappings.techEmail),
      phone: extractField(raw, fieldMappings.techPhone),
    },
    
    nameServers: extractMultipleFields(raw, fieldMappings.nameServer),
    dnssec: extractField(raw, fieldMappings.dnssec),
    rawData: raw,
  };
  
  // 提取账单联系人信息
  const billingSection = extractSection(raw, ['BILLING_C', 'Billing Contact', 'BILLING']);
  if (billingSection) {
    result.billingContact = {
      id: extractField(billingSection, ['ID Contact', 'Contact ID', 'ID']),
      name: extractField(billingSection, ['Nom', 'Name', 'Contact Name']),
      type: extractField(billingSection, ['Type', 'Contact Type']),
      address: extractField(billingSection, ['Adresse', 'Address', 'Street']),
    };
  }
  
  // 清理空对象
  if (result.registrar && Object.values(result.registrar).every(v => !v)) {
    result.registrar = undefined;
  }
  if (result.registrant && Object.values(result.registrant).every(v => !v)) {
    result.registrant = undefined;
  }
  if (result.adminContact && Object.values(result.adminContact).every(v => !v)) {
    result.adminContact = undefined;
  }
  if (result.techContact && Object.values(result.techContact).every(v => !v)) {
    result.techContact = undefined;
  }
  if (result.billingContact && Object.values(result.billingContact).every(v => !v)) {
    result.billingContact = undefined;
  }
  
  // 提取额外的未匹配字段
  const usedKeys = new Set([
    ...Object.values(fieldMappings).flat().map(k => k.toLowerCase())
  ]);
  result.additionalFields = extractAdditionalFields(raw, usedKeys);
  
  // 如果额外字段为空，删除
  if (Object.keys(result.additionalFields).length === 0) {
    result.additionalFields = undefined;
  }
  
  return result;
}

// 获取状态的友好显示名称和颜色
export function getStatusInfo(status: string): { label: string; color: 'green' | 'yellow' | 'red' | 'gray' } {
  const statusLower = status.toLowerCase();
  
  // 活跃状态
  if (statusLower.includes('active') || statusLower === 'actif' || statusLower.includes('ok')) {
    return { label: '活跃', color: 'green' };
  }
  
  // 待处理状态
  if (statusLower.includes('pending')) {
    if (statusLower.includes('delete')) return { label: '待删除', color: 'red' };
    if (statusLower.includes('transfer')) return { label: '转移中', color: 'yellow' };
    if (statusLower.includes('create')) return { label: '创建中', color: 'yellow' };
    if (statusLower.includes('renew')) return { label: '续费中', color: 'yellow' };
    if (statusLower.includes('update')) return { label: '更新中', color: 'yellow' };
    return { label: '待处理', color: 'yellow' };
  }
  
  // 过期/赎回状态
  if (statusLower.includes('expired') || statusLower.includes('redemption')) {
    return { label: '已过期', color: 'red' };
  }
  
  // 域名保护状态（这些是积极的保护措施）
  if (statusLower.includes('clienttransferprohibited') || statusLower.includes('servertransferprohibited')) {
    return { label: '禁止转移', color: 'green' };
  }
  if (statusLower.includes('clientdeleteprohibited') || statusLower.includes('serverdeleteprohibited')) {
    return { label: '禁止删除', color: 'green' };
  }
  if (statusLower.includes('clientupdateprohibited') || statusLower.includes('serverupdateprohibited')) {
    return { label: '禁止更新', color: 'green' };
  }
  if (statusLower.includes('clienthold') || statusLower.includes('serverhold')) {
    return { label: '暂停解析', color: 'red' };
  }
  if (statusLower.includes('clientrenewprohibited') || statusLower.includes('serverrenewprohibited')) {
    return { label: '禁止续费', color: 'red' };
  }
  
  // 其他状态
  if (statusLower.includes('autorenew')) {
    return { label: '自动续费', color: 'green' };
  }
  if (statusLower.includes('lock')) {
    return { label: '已锁定', color: 'green' };
  }
  if (statusLower.includes('connect')) {
    return { label: '已连接', color: 'green' };
  }
  
  return { label: status, color: 'gray' };
}

// 获取域名可用性的显示信息
export function getAvailabilityInfo(availability: WhoisData['availability']): {
  title: string;
  description: string;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  icon: 'check' | 'x' | 'alert' | 'ban' | 'help';
} {
  switch (availability) {
    case 'available':
      return {
        title: '域名可注册',
        description: '此域名当前未被注册，您可以立即注册',
        color: 'green',
        icon: 'check',
      };
    case 'reserved':
      return {
        title: '域名已保留',
        description: '此域名已被保留，可能需要特殊渠道或满足特定条件才能注册',
        color: 'yellow',
        icon: 'alert',
      };
    case 'prohibited':
      return {
        title: '域名禁止注册',
        description: '此域名由于政策或技术原因禁止注册',
        color: 'red',
        icon: 'ban',
      };
    case 'registered':
      return {
        title: '域名已注册',
        description: '此域名已被注册',
        color: 'blue',
        icon: 'x',
      };
    case 'unknown':
    default:
      return {
        title: '状态未知',
        description: '无法确定此域名的注册状态',
        color: 'gray',
        icon: 'help',
      };
  }
}
