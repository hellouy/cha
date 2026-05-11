export interface WhoisData {
  // 域名基本信息
  domainName?: string;
  domainId?: string;
  creationDate?: string;
  creationDateRaw?: string;
  updatedDate?: string;
  updatedDateRaw?: string;
  expirationDate?: string;
  expirationDateRaw?: string;
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
    whoisServer?: string;
  };
  
  // 注册人信息
  registrant?: {
    id?: string;
    name?: string;
    organization?: string;
    email?: string;
    phone?: string;
    fax?: string;
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
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
    /^No Data Found$/im,
    /^Domain Status: available$/im,
    /^This domain is available/im,
    /^% Object does not exist/m,
    /query_status:\s*220\s+Available/i,
    /^Status:\s*free$/im,
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
    /reserved\s+domain/i,
    /is reserved/i,
  ],
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
    'Nome de Domínio', 'Nombre de Dominio', 'Domainnaam',
    'Domainname', 'Domain-Name', 'nome de domínio'
  ],
  domainId: [
    'Domain ID', 'Registry Domain ID', 'Domain Handle',
    'Handle', 'ROID', 'Registry ID', 'Domain ROID',
    'Registry ROID', 'Domain Registry ID'
  ],
  creationDate: [
    'Creation Date', 'Date de création', 'Created Date', 'Created On', 
    'Registration Date', 'Created', 'Registered on', 'Registration Time',
    'created', 'Fecha de creación', 'Data de Criação', '注册日期',
    'Domain Registration Date', 'Registered Date', 'Domain Create Date',
    'Record created on', 'Domain created', 'record created',
    'Registered', 'Registration', 'Created at', 'Création',
    'Creation date', 'Domain created on', 'Registered On',
    'First registration date', 'created-date', 'createdate',
    'Create Date', 'Domain Name Commencement Date', 'Activation',
    'Registered Time', 'reg-date', 'Registration Date Time',
    'Domain created on', 'Registered Date', 'Date registered',
    'reg_created', 'created on', 'Registrarion Date'
  ],
  updatedDate: [
    'Updated Date', 'Dernière modification', 'Last Modified', 'Last Updated On',
    'Last Updated', 'Modified', 'Last Update', 'Updated On', 'changed',
    'Última modificación', 'Última Atualização', '更新日期',
    'Domain Last Updated Date', 'Record last updated on', 'record last updated',
    'Updated at', 'Modification', 'Last Modified Date', 'Update Date',
    'Last update', 'last-update', 'last-updated', 'Last Changed',
    'Modification Date', 'Changed Date', 'Modified Date', 'Modified on',
    'Domain last updated', 'last updated on', 'record modified',
    'Last modification date', 'Updated', 'Update'
  ],
  expirationDate: [
    'Expiration Date', "Date d'expiration", 'Registry Expiry Date', 'Expiry Date',
    'Expiry', 'Expires On', 'Expires', 'Paid-Till', 'Valid Until',
    'Fecha de expiración', 'Data de Expiração', '到期日期', 'Renewal Date',
    'Registrar Registration Expiration Date', 'free-date', 'Domain Expiration Date',
    'Expiration', 'Expires at', 'Expiry date', 'Expire Date',
    'Expiration date', 'exp-date', 'expire-date', 'Domain expires',
    'Registration Expiration Date', 'Domain Expiry Date', 'Expires date',
    'expire', 'Validity', 'Valid until', 'Expire on', 'Due Date',
    'Registry Expiration Date', 'Domain expires on', 'expiredate'
  ],
  registrarName: [
    'Registrar', 'Registrar Name', 'Sponsoring Registrar', 
    'Registrar Organization', 'Provider', '注册商', 'Registrador',
    'Registrar Company Name', 'Current Registrar', 'Registrar Organization Name',
    'Registrar-Name', 'Registrar info', 'Billing Contact', 'Provider Name',
    'Registrar Company', 'reg_name', 'Accredited Registrar'
  ],
  registrarUrl: [
    'Registrar URL', 'Registrar Website', 'Registrar Web', 
    'Registrar Homepage', 'Registrar URL (registration services)',
    'Referral URL', 'Registrar web', 'Registrar-URL'
  ],
  registrarEmail: [
    'Registrar Abuse Contact Email', 'Registrar Email', 
    'Abuse Contact Email', 'Registrar Contact Email',
    'Registrar abuse contact email', 'abuse-mailbox'
  ],
  registrarPhone: [
    'Registrar Abuse Contact Phone', 'Registrar Phone',
    'Abuse Contact Phone', 'Registrar Contact Phone',
    'Registrar abuse contact phone', 'abuse-phone'
  ],
  registrarId: [
    'Registrar IANA ID', 'Registrar ID', 'Sponsoring Registrar IANA ID',
    'IANA ID', 'Registrar-ID'
  ],
  registrarWhoisServer: [
    'Registrar WHOIS Server', 'WHOIS Server', 'Whois Server',
    'whois-server', 'Registrar Whois'
  ],
  registrantName: [
    'Registrant Name', 'Nom', 'Name', 'Owner Name', 'Holder Name',
    'Contact Name', 'Registrant', '注册人', 'Owner', 'Holder',
    'Registrant Contact Name', 'Domain Owner', 'Registrant-Name',
    'owner-name', 'holder-name', 'Domain Holder'
  ],
  registrantOrg: [
    'Registrant Organization', 'Organisation', 'Organization', 
    'Registrant Org', 'Owner Organization', 'Holder Organization',
    '注册人组织', 'Org', 'Organization Name', 'Registrant Organisation',
    'Registrant-Organization', 'org-name', 'Registrant Company'
  ],
  registrantEmail: [
    'Registrant Email', 'Email', 'Owner Email', 'Holder Email',
    'Contact Email', 'E-mail', '邮箱', 'Registrant E-mail',
    'Registrant Contact Email', 'owner-email', 'e-mail'
  ],
  registrantPhone: [
    'Registrant Phone', 'Phone', 'Téléphone', 'Owner Phone', 
    'Holder Phone', 'Tel', 'Telephone', '电话', 'Registrant Tel',
    'Registrant Contact Phone', 'phone-number', 'owner-phone'
  ],
  registrantFax: [
    'Registrant Fax', 'Fax', 'Owner Fax', 'Holder Fax', 
    'Registrant Fax Number', 'fax-no'
  ],
  registrantAddress: [
    'Registrant Street', 'Adresse', 'Address', 'Street', 
    'Registrant Address', 'Owner Address', '地址',
    'Registrant Street Address', 'address1', 'Street1'
  ],
  registrantCity: [
    'Registrant City', 'Ville', 'City', 'Owner City', '城市',
    'Registrant Address City', 'city'
  ],
  registrantState: [
    'Registrant State/Province', 'State', 'Province', 
    'Registrant State', '省份', 'State/Province',
    'Registrant Province', 'state-province'
  ],
  registrantPostalCode: [
    'Registrant Postal Code', 'Postal Code', 'ZIP', 'Postcode',
    'ZIP Code', '邮编', 'Registrant Postalcode', 'postal-code'
  ],
  registrantCountry: [
    'Registrant Country', 'Pays', 'Country', 'Owner Country', 
    'Country Code', '国家', 'Registrant Country/Economy',
    'country-code', 'Registrant Address Country'
  ],
  registrantType: ['Type', 'Registrant Type', 'Owner Type', 'Entity Type'],
  registrantId: ['Registrant ID', 'ID Contact', 'Holder ID', 'Owner ID', 'Contact ID'],
  
  // 管理联系人
  adminName: ['Admin Name', 'Administrative Contact Name', 'Admin Contact', 'Admin-Name'],
  adminOrg: ['Admin Organization', 'Administrative Contact Organization', 'Admin-Organization'],
  adminEmail: ['Admin Email', 'Administrative Contact Email', 'Admin-Email'],
  adminPhone: ['Admin Phone', 'Administrative Contact Phone', 'Admin-Phone'],
  adminId: ['Admin ID', 'Administrative Contact ID', 'Admin-ID'],
  
  // 技术联系人
  techName: ['Tech Name', 'Technical Contact Name', 'Tech Contact', 'Tech-Name'],
  techOrg: ['Tech Organization', 'Technical Contact Organization', 'Tech-Organization'],
  techEmail: ['Tech Email', 'Technical Contact Email', 'Tech-Email'],
  techPhone: ['Tech Phone', 'Technical Contact Phone', 'Tech-Phone'],
  techId: ['Tech ID', 'Technical Contact ID', 'Tech-ID'],
  
  status: [
    'Domain Status', 'Statut', 'Status', 'State', 'Domain State',
    '状态', 'Registration Status', 'Domain status', 'status',
    'EPP Status', 'flags', 'Domain-Status'
  ],
  nameServer: [
    'Name Server', 'Serveur DNS', 'nserver', 'NS', 'Nameserver',
    'Name Servers', 'DNS', 'DNS Servers', 'Hostname', 'Server Name',
    'name server', 'nameservers', 'DNS Server', 'NS Record',
    'Nameservers', 'Name-Server', 'nServer', 'host name',
    'dns1', 'dns2', 'dns3', 'dns4', 'dns5', 'ns1', 'ns2', 'ns3', 'ns4',
    'Primary Nameserver', 'Secondary Nameserver', 'name_server'
  ],
  dnssec: [
    'DNSSEC', 'DS Record', 'DNSSEC Status', 'Signed', 'DNSSEC DS Data',
    'dnssec', 'DNSSEC signed', 'DS', 'Delegation Signed'
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
      // 无冒号格式（字段名后直接跟值，用多个空格分隔）
      new RegExp(`^\\s*${escapeRegex(fieldName)}[\\s.]+(.+?)\\s*$`, 'im'),
      // 括号格式
      new RegExp(`\\(${escapeRegex(fieldName)}\\)\\s*:\\s*(.+?)\\s*$`, 'im'),
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
      new RegExp(`^\\s*${escapeRegex(fieldName)}[\\s.]+(.+?)\\s*$`, 'gim'),
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
  
  // 尝试额外的 DNS 服务器提取方式
  if (fieldNames.some(f => f.toLowerCase().includes('server') || f.toLowerCase().includes('ns'))) {
    // 匹配常见的 DNS 服务器格式
    const dnsPatterns = [
      /(?:^|\s)(ns\d*\.[a-z0-9][a-z0-9.-]+\.[a-z]{2,})/gim,
      /(?:^|\s)(dns\d*\.[a-z0-9][a-z0-9.-]+\.[a-z]{2,})/gim,
      /(?:Name Server|Nameserver|nserver|NS)[\s:.]+([a-z0-9][a-z0-9.-]+\.[a-z]{2,})/gim,
    ];
    
    for (const pattern of dnsPatterns) {
      let match;
      while ((match = pattern.exec(raw)) !== null) {
        const value = match[1].trim().toLowerCase();
        if (value && !results.some(r => r.toLowerCase() === value) && value.includes('.')) {
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
    'Redacted for Privacy', 'DATA REDACTED', 'Not Applicable',
    'Not shown', 'Hidden', 'Protected', 'Withheld', 
    'Registry Registrant ID', 'See RegistryTech ID'
  ];
  
  if (invalidValues.some(inv => cleaned.toLowerCase() === inv.toLowerCase())) {
    return undefined;
  }
  
  // 移除隐私保护文本
  if (cleaned.toLowerCase().includes('redacted') && cleaned.length < 50) {
    return undefined;
  }
  if (cleaned.toLowerCase().includes('privacy') && cleaned.length < 30) {
    return undefined;
  }
  if (cleaned.toLowerCase().includes('protected') && cleaned.length < 30) {
    return undefined;
  }
  
  // 移除括号中的额外说明
  cleaned = cleaned.replace(/\s*\([^)]*redacted[^)]*\)/gi, '');
  
  return cleaned || undefined;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 解析各种日期格式
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  
  try {
    let cleaned = dateStr.trim();
    
    // ISO 格式 (2025-05-19T...)
    if (cleaned.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) return d;
    }
    
    // DD-Mon-YYYY 格式 (19-May-2025)
    if (/^\d{1,2}-[A-Za-z]{3}-\d{4}/.test(cleaned)) {
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) return d;
    }
    
    // YYYY-MM-DD 格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      const d = new Date(cleaned + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    
    // DD/MM/YYYY 格式
    if (/^\d{2}\/\d{2}\/\d{4}/.test(cleaned)) {
      const [day, month, year] = cleaned.split('/');
      const d = new Date(`${year}-${month}-${day}T00:00:00`);
      if (!isNaN(d.getTime())) return d;
    }
    
    // YYYY/MM/DD 格式
    if (/^\d{4}\/\d{2}\/\d{2}/.test(cleaned)) {
      const [year, month, day] = cleaned.split('/');
      const d = new Date(`${year}-${month}-${day}T00:00:00`);
      if (!isNaN(d.getTime())) return d;
    }
    
    // DD.MM.YYYY 格式
    if (/^\d{2}\.\d{2}\.\d{4}/.test(cleaned)) {
      const [day, month, year] = cleaned.split('.');
      const d = new Date(`${year}-${month}-${day}T00:00:00`);
      if (!isNaN(d.getTime())) return d;
    }
    
    // YYYYMMDD 格式
    if (/^\d{8}$/.test(cleaned)) {
      const year = cleaned.slice(0, 4);
      const month = cleaned.slice(4, 6);
      const day = cleaned.slice(6, 8);
      const d = new Date(`${year}-${month}-${day}T00:00:00`);
      if (!isNaN(d.getTime())) return d;
    }
    
    // Mon DD YYYY 格式 (May 19 2025)
    if (/^[A-Za-z]{3}\s+\d{1,2}\s+\d{4}/.test(cleaned)) {
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) return d;
    }
    
    // DD Mon YYYY 格式 (19 May 2025)
    if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/.test(cleaned)) {
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) return d;
    }
    
    // 尝试直接解析
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
    
    return null;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  
  const date = parseDate(dateStr);
  if (date) {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateStr;
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
      return { availability: 'registered' };
    }
  }
  
  // 检查是否有明显的已注册标志（更全面的检测）
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
    /domain\s+status:\s*ok/i,
    /^domain:/im,
    /^nserver:/im,
    /Registry\s+Domain\s+ID/i,
    /Registrar\s+IANA\s+ID/i,
    /Domain\s+Create\s+Date/i,
    /Updated\s+Date:/i,
    /Sponsoring\s+Registrar/i,
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
  
  // 检查是否禁止注册
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

export function parseWhoisData(raw: string): WhoisData {
  // 检测域名可用性
  const { availability, message: availabilityMessage } = detectAvailability(raw);
  
  // 提取原始日期值
  const creationDateRaw = extractField(raw, fieldMappings.creationDate);
  const updatedDateRaw = extractField(raw, fieldMappings.updatedDate);
  const expirationDateRaw = extractField(raw, fieldMappings.expirationDate);
  
  // 基本字段提取
  const result: WhoisData = {
    domainName: extractField(raw, fieldMappings.domainName),
    domainId: extractField(raw, fieldMappings.domainId),
    creationDate: formatDate(creationDateRaw),
    creationDateRaw,
    updatedDate: formatDate(updatedDateRaw),
    updatedDateRaw,
    expirationDate: formatDate(expirationDateRaw),
    expirationDateRaw,
    status: extractMultipleFields(raw, fieldMappings.status),
    availability,
    availabilityMessage,
    
    registrar: {
      name: extractField(raw, fieldMappings.registrarName),
      url: extractField(raw, fieldMappings.registrarUrl),
      email: extractField(raw, fieldMappings.registrarEmail),
      phone: extractField(raw, fieldMappings.registrarPhone),
      id: extractField(raw, fieldMappings.registrarId),
      whoisServer: extractField(raw, fieldMappings.registrarWhoisServer),
    },
    
    registrant: {
      id: extractField(raw, fieldMappings.registrantId),
      name: extractField(raw, fieldMappings.registrantName),
      organization: extractField(raw, fieldMappings.registrantOrg),
      email: extractField(raw, fieldMappings.registrantEmail),
      phone: extractField(raw, fieldMappings.registrantPhone),
      fax: extractField(raw, fieldMappings.registrantFax),
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
  
  // 清理空的 nameServers 数组
  if (result.nameServers && result.nameServers.length === 0) {
    result.nameServers = undefined;
  }
  
  // 清理空的 status 数组
  if (result.status && result.status.length === 0) {
    result.status = undefined;
  }
  
  return result;
}

// 获取状态的友好显示名称和颜色
export function getStatusInfo(status: string): { label: string; color: 'green' | 'blue' | 'yellow' | 'red' | 'gray'; description: string } {
  const statusLower = status.toLowerCase().replace(/[\s-]/g, '');
  
  // 活跃状态
  if (statusLower.includes('active') || statusLower === 'actif' || statusLower.includes('ok')) {
    return { label: '活跃', color: 'green', description: '域名状态正常' };
  }
  
  // 保护状态（蓝色，表示正面的保护措施）
  if (statusLower.includes('clienttransferprohibited')) {
    return { label: '禁止转移', color: 'blue', description: '注册商已锁定该域名，禁止转移至其他注册商' };
  }
  if (statusLower.includes('clientdeleteprohibited')) {
    return { label: '禁止删除', color: 'blue', description: '注册商已锁定该域名，禁止删除' };
  }
  if (statusLower.includes('clientupdateprohibited')) {
    return { label: '禁止更新', color: 'blue', description: '注册商已锁定该域名，禁止修改信息' };
  }
  if (statusLower.includes('clientrenewprohibited')) {
    return { label: '禁止续费', color: 'yellow', description: '注册商已锁定该域名，禁止续费' };
  }
  if (statusLower.includes('servertransferprohibited')) {
    return { label: '服务器禁止转移', color: 'blue', description: '注册局已锁定该域名，禁止转移' };
  }
  if (statusLower.includes('serverdeleteprohibited')) {
    return { label: '服务器禁止删除', color: 'blue', description: '注册局已锁定该域名，禁止删除' };
  }
  if (statusLower.includes('serverupdateprohibited')) {
    return { label: '服务器禁止更新', color: 'blue', description: '注册局已锁定该域名，禁止修改' };
  }
  
  // 暂停状态
  if (statusLower.includes('serverhold')) {
    return { label: '服务器暂停', color: 'red', description: '注册局暂停了该域名的解析' };
  }
  if (statusLower.includes('clienthold')) {
    return { label: '客户端暂停', color: 'red', description: '注册商暂停了该域名的解析' };
  }
  
  // 待定状态
  if (statusLower.includes('pendingdelete')) {
    return { label: '待删除', color: 'red', description: '域名处于待删除状态' };
  }
  if (statusLower.includes('pendingtransfer')) {
    return { label: '转移中', color: 'yellow', description: '域名正在转移中' };
  }
  if (statusLower.includes('pendingrenew')) {
    return { label: '续费中', color: 'yellow', description: '域名正在续费中' };
  }
  if (statusLower.includes('pendingcreate')) {
    return { label: '创建中', color: 'yellow', description: '域名正在创建中' };
  }
  if (statusLower.includes('pendingupdate')) {
    return { label: '更新中', color: 'yellow', description: '域名信息正在更新中' };
  }
  
  // 宽限期
  if (statusLower.includes('redemptionperiod')) {
    return { label: '赎回期', color: 'red', description: '域名处于赎回期，需要支付赎回费用' };
  }
  if (statusLower.includes('autorenewperiod')) {
    return { label: '自动续费期', color: 'yellow', description: '域名处于自动续费宽限期' };
  }
  if (statusLower.includes('addperiod')) {
    return { label: '新增宽限期', color: 'green', description: '域名处于新注册宽限期' };
  }
  if (statusLower.includes('renewperiod')) {
    return { label: '续费宽限期', color: 'yellow', description: '域名处于续费宽限期' };
  }
  if (statusLower.includes('transferperiod')) {
    return { label: '转移宽限期', color: 'yellow', description: '域名处于转移后宽限期' };
  }
  
  // 默认
  return { label: status, color: 'gray', description: '' };
}

// 获取域名可用性信息
export function getAvailabilityInfo(availability: WhoisData['availability']): {
  title: string;
  description: string;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  icon: 'check' | 'x' | 'alert' | 'ban' | 'help';
} {
  switch (availability) {
    case 'available':
      return {
        title: '可以注册',
        description: '此域名当前可以注册，快去抢注吧！',
        color: 'green',
        icon: 'check'
      };
    case 'registered':
      return {
        title: '已注册',
        description: '此域名已被注册',
        color: 'blue',
        icon: 'x'
      };
    case 'reserved':
      return {
        title: '保留域名',
        description: '此域名已被保留，可能需要特殊申请或无法注册',
        color: 'yellow',
        icon: 'alert'
      };
    case 'prohibited':
      return {
        title: '禁止注册',
        description: '此域名禁止注册',
        color: 'red',
        icon: 'ban'
      };
    default:
      return {
        title: '状态未知',
        description: '无法确定此域名的当前状态',
        color: 'gray',
        icon: 'help'
      };
  }
}

// 计算相对时间
export function getRelativeTime(dateStr: string): { text: string; isPast: boolean; days: number } {
  try {
    // 尝试解析中文日期格式 "2025年5月19日"
    const chineseMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    let date: Date
    
    if (chineseMatch) {
      date = new Date(parseInt(chineseMatch[1]), parseInt(chineseMatch[2]) - 1, parseInt(chineseMatch[3]))
    } else {
      const parsed = parseDate(dateStr)
      if (!parsed) return { text: '', isPast: true, days: 0 }
      date = parsed
    }
    
    if (isNaN(date.getTime())) return { text: '', isPast: true, days: 0 }
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24))
    const isPast = diffMs > 0
    
    if (diffDays < 1) return { text: '今天', isPast, days: diffDays }
    if (diffDays < 30) return { text: isPast ? `${diffDays} 天前` : `剩余 ${diffDays} 天`, isPast, days: diffDays }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return { text: isPast ? `${months} 个月前` : `剩余 ${months} 个月`, isPast, days: diffDays }
    }
    const years = Math.floor(diffDays / 365)
    const remainingDays = diffDays % 365
    if (isPast) {
      return { text: `${years} 年前`, isPast, days: diffDays }
    } else {
      return { text: `剩余 ${diffDays} 天`, isPast, days: diffDays }
    }
  } catch {
    return { text: '', isPast: true, days: 0 }
  }
}

// 计算域名年龄
export function getDomainAge(creationDate: string): string {
  const result = getRelativeTime(creationDate)
  if (!result.text || !result.isPast) return ''
  
  const years = Math.floor(result.days / 365)
  if (years < 1) {
    const months = Math.floor(result.days / 30)
    return months > 0 ? `${months} 个月` : `${result.days} 天`
  }
  return `${years} 年`
}
