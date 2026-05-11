'use client'

import { useState } from 'react'
import { WhoisData, getStatusInfo, getAvailabilityInfo } from '@/lib/whois-parser'
import { 
  Globe, 
  Calendar, 
  Server, 
  Building2, 
  User, 
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  HelpCircle,
  Shield,
  Mail,
  Phone,
  MapPin,
  Info
} from 'lucide-react'

interface WhoisResultProps {
  data: WhoisData
  domain: string
}

interface InfoCardProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  className?: string
}

function InfoCard({ icon, title, children, className = '' }: InfoCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-blue-600">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  value?: string | null
  icon?: React.ReactNode
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
      <span className="text-gray-500 text-sm flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-gray-900 text-sm font-medium break-all">{value}</span>
    </div>
  )
}

interface StatusBadgeProps {
  status: string
}

function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color } = getStatusInfo(status)
  
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
      {label}
    </span>
  )
}

interface AvailabilityCardProps {
  availability: WhoisData['availability']
  message?: string
}

function AvailabilityCard({ availability, message }: AvailabilityCardProps) {
  const info = getAvailabilityInfo(availability)
  
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
  }
  
  const iconColorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
  }
  
  const icons = {
    check: <CheckCircle className={`w-8 h-8 ${iconColorClasses[info.color]}`} />,
    x: <XCircle className={`w-8 h-8 ${iconColorClasses[info.color]}`} />,
    alert: <AlertTriangle className={`w-8 h-8 ${iconColorClasses[info.color]}`} />,
    ban: <Ban className={`w-8 h-8 ${iconColorClasses[info.color]}`} />,
    help: <HelpCircle className={`w-8 h-8 ${iconColorClasses[info.color]}`} />,
  }
  
  return (
    <div className={`rounded-xl border-2 p-6 ${colorClasses[info.color]}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {icons[info.icon]}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">{info.title}</h2>
          <p className="text-sm opacity-80">{message || info.description}</p>
        </div>
      </div>
    </div>
  )
}

interface ContactCardProps {
  icon: React.ReactNode
  title: string
  contact: {
    id?: string
    name?: string
    organization?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    type?: string
  }
}

function ContactCard({ icon, title, contact }: ContactCardProps) {
  const hasData = Object.values(contact).some(v => v)
  if (!hasData) return null
  
  // 构建完整地址
  const addressParts = [
    contact.address,
    contact.city,
    contact.state,
    contact.postalCode,
    contact.country
  ].filter(Boolean)
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : undefined
  
  return (
    <InfoCard icon={icon} title={title}>
      <InfoRow label="ID" value={contact.id} />
      <InfoRow label="姓名" value={contact.name} icon={<User className="w-3.5 h-3.5" />} />
      <InfoRow label="类型" value={contact.type} />
      <InfoRow label="组织" value={contact.organization} icon={<Building2 className="w-3.5 h-3.5" />} />
      <InfoRow label="邮箱" value={contact.email} icon={<Mail className="w-3.5 h-3.5" />} />
      <InfoRow label="电话" value={contact.phone} icon={<Phone className="w-3.5 h-3.5" />} />
      <InfoRow label="地址" value={fullAddress} icon={<MapPin className="w-3.5 h-3.5" />} />
    </InfoCard>
  )
}

export default function WhoisResult({ data, domain }: WhoisResultProps) {
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.rawData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // 检查是否有解析到的结构化数据
  const hasStructuredData = data.domainName || data.creationDate || data.registrar || 
    data.registrant || (data.nameServers && data.nameServers.length > 0) ||
    (data.status && data.status.length > 0) || data.adminContact || data.techContact
  
  // 检查是否需要显示非已注册状态的卡片
  const showAvailabilityCard = data.availability !== 'registered'
  
  return (
    <div className="space-y-6">
      {/* 域名标题 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{domain}</h1>
            <p className="text-blue-100 text-sm mt-1">WHOIS 查询结果</p>
          </div>
        </div>
        
        {data.status && data.status.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {data.status.map((s, i) => (
              <StatusBadge key={i} status={s} />
            ))}
          </div>
        )}
      </div>
      
      {/* 域名可用性状态卡片 */}
      {showAvailabilityCard && (
        <AvailabilityCard 
          availability={data.availability} 
          message={data.availabilityMessage}
        />
      )}
      
      {/* 结构化数据 */}
      {hasStructuredData && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* 域名信息 */}
          {(data.domainId || data.creationDate || data.updatedDate || data.expirationDate || data.dnssec) && (
            <InfoCard icon={<Calendar className="w-5 h-5" />} title="域名信息">
              <InfoRow label="域名 ID" value={data.domainId} />
              <InfoRow label="注册日期" value={data.creationDate} />
              <InfoRow label="更新日期" value={data.updatedDate} />
              <InfoRow label="到期日期" value={data.expirationDate} />
              <InfoRow label="DNSSEC" value={data.dnssec} icon={<Shield className="w-3.5 h-3.5" />} />
            </InfoCard>
          )}
          
          {/* 注册商信息 */}
          {data.registrar && (
            <InfoCard icon={<Building2 className="w-5 h-5" />} title="注册商">
              <InfoRow label="ID" value={data.registrar.id} />
              <InfoRow label="名称" value={data.registrar.name} />
              <InfoRow label="网站" value={data.registrar.url} />
              <InfoRow label="邮箱" value={data.registrar.email} icon={<Mail className="w-3.5 h-3.5" />} />
              <InfoRow label="电话" value={data.registrar.phone} icon={<Phone className="w-3.5 h-3.5" />} />
            </InfoCard>
          )}
          
          {/* 注册人信息 */}
          {data.registrant && (
            <ContactCard 
              icon={<User className="w-5 h-5" />} 
              title="注册人" 
              contact={data.registrant} 
            />
          )}
          
          {/* 管理联系人 */}
          {data.adminContact && (
            <ContactCard 
              icon={<User className="w-5 h-5" />} 
              title="管理联系人" 
              contact={data.adminContact} 
            />
          )}
          
          {/* 技术联系人 */}
          {data.techContact && (
            <ContactCard 
              icon={<User className="w-5 h-5" />} 
              title="技术联系人" 
              contact={data.techContact} 
            />
          )}
          
          {/* 账单联系人 */}
          {data.billingContact && (
            <InfoCard icon={<User className="w-5 h-5" />} title="账单联系人">
              <InfoRow label="ID" value={data.billingContact.id} />
              <InfoRow label="姓名" value={data.billingContact.name} />
              <InfoRow label="类型" value={data.billingContact.type} />
              <InfoRow label="地址" value={data.billingContact.address} />
            </InfoCard>
          )}
          
          {/* DNS 服务器 */}
          {data.nameServers && data.nameServers.length > 0 && (
            <InfoCard icon={<Server className="w-5 h-5" />} title="DNS 服务器">
              <div className="space-y-2">
                {data.nameServers.map((ns, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    <span className="text-gray-900 text-sm font-mono break-all">{ns}</span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
          
          {/* 额外字段 */}
          {data.additionalFields && Object.keys(data.additionalFields).length > 0 && (
            <InfoCard 
              icon={<Info className="w-5 h-5" />} 
              title="其他信息"
              className="md:col-span-2"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(data.additionalFields).map(([key, value]) => (
                  <InfoRow key={key} label={key} value={value} />
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      )}
      
      {/* 无结构化数据时的提示 */}
      {!hasStructuredData && !showAvailabilityCard && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">无法解析结构化数据</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            此域名的 WHOIS 数据格式特殊，无法自动解析。请查看下方原始数据获取完整信息。
          </p>
        </div>
      )}
      
      {/* 原始数据 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">原始 WHOIS 数据</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {data.rawData.split('\n').length} 行
            </span>
          </div>
          {showRaw ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {showRaw && (
          <div className="border-t border-gray-200">
            <div className="flex justify-end p-2 bg-gray-50 border-b border-gray-200">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs text-gray-700 overflow-x-auto bg-gray-50 max-h-96 overflow-y-auto font-mono whitespace-pre-wrap">
              {data.rawData}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
