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
  Info,
  ExternalLink,
  Clock
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
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="text-blue-600">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5 space-y-3">
        {children}
      </div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  value?: string | null
  icon?: React.ReactNode
  isLink?: boolean
}

function InfoRow({ label, value, icon, isLink }: InfoRowProps) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-gray-500 text-sm flex items-center gap-1.5 sm:w-24 flex-shrink-0">
        {icon}
        {label}
      </span>
      {isLink && value.startsWith('http') ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 text-sm font-medium break-all hover:underline flex items-center gap-1"
        >
          {value}
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      ) : (
        <span className="text-gray-900 text-sm font-medium break-all flex-1">{value}</span>
      )}
    </div>
  )
}

interface StatusBadgeProps {
  status: string
}

function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color } = getStatusInfo(status)
  
  const colorClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${colorClasses[color]}`}>
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
    green: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
    yellow: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200',
    red: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200',
    gray: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200',
  }
  
  const iconColorClasses = {
    green: 'text-emerald-600',
    blue: 'text-blue-600',
    yellow: 'text-amber-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
  }
  
  const textColorClasses = {
    green: 'text-emerald-900',
    blue: 'text-blue-900',
    yellow: 'text-amber-900',
    red: 'text-red-900',
    gray: 'text-gray-900',
  }
  
  const subTextColorClasses = {
    green: 'text-emerald-700',
    blue: 'text-blue-700',
    yellow: 'text-amber-700',
    red: 'text-red-700',
    gray: 'text-gray-700',
  }
  
  const icons = {
    check: <CheckCircle className={`w-10 h-10 ${iconColorClasses[info.color]}`} />,
    x: <XCircle className={`w-10 h-10 ${iconColorClasses[info.color]}`} />,
    alert: <AlertTriangle className={`w-10 h-10 ${iconColorClasses[info.color]}`} />,
    ban: <Ban className={`w-10 h-10 ${iconColorClasses[info.color]}`} />,
    help: <HelpCircle className={`w-10 h-10 ${iconColorClasses[info.color]}`} />,
  }
  
  return (
    <div className={`rounded-2xl border-2 p-6 ${colorClasses[info.color]}`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 p-2 bg-white/60 rounded-xl">
          {icons[info.icon]}
        </div>
        <div>
          <h2 className={`text-xl font-bold ${textColorClasses[info.color]}`}>{info.title}</h2>
          <p className={`text-sm mt-1 ${subTextColorClasses[info.color]}`}>{message || info.description}</p>
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
    (data.status && data.status.length > 0) || data.adminContact || data.techContact ||
    data.expirationDate || data.updatedDate || data.domainId
  
  // 检查是否需要显示非已注册状态的卡片
  const showAvailabilityCard = data.availability !== 'registered'
  
  return (
    <div className="space-y-5">
      {/* 域名标题卡片 */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Globe className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{domain}</h1>
            <p className="text-blue-100 text-sm mt-0.5">WHOIS 查询结果</p>
          </div>
        </div>
        
        {data.status && data.status.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/10">
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
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 域名信息 - 如果有日期信息就显示 */}
          {(data.domainId || data.creationDate || data.updatedDate || data.expirationDate || data.dnssec) && (
            <InfoCard icon={<Calendar className="w-5 h-5" />} title="域名信息">
              <InfoRow label="域名 ID" value={data.domainId} />
              <InfoRow label="注册日期" value={data.creationDate} icon={<Clock className="w-3.5 h-3.5" />} />
              <InfoRow label="更新日期" value={data.updatedDate} icon={<Clock className="w-3.5 h-3.5" />} />
              <InfoRow label="到期日期" value={data.expirationDate} icon={<Clock className="w-3.5 h-3.5" />} />
              <InfoRow label="DNSSEC" value={data.dnssec} icon={<Shield className="w-3.5 h-3.5" />} />
            </InfoCard>
          )}
          
          {/* 注册商信息 */}
          {data.registrar && (
            <InfoCard icon={<Building2 className="w-5 h-5" />} title="注册商">
              <InfoRow label="ID" value={data.registrar.id} />
              <InfoRow label="名称" value={data.registrar.name} icon={<Building2 className="w-3.5 h-3.5" />} />
              <InfoRow label="网站" value={data.registrar.url} isLink />
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
              <div className="space-y-2.5">
                {data.nameServers.map((ns, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-blue-600">{i + 1}</span>
                    </div>
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
              className="lg:col-span-2"
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
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">无法解析结构化数据</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            此域名的 WHOIS 数据格式特殊，无法自动解析。请查看下方原始数据获取完整信息。
          </p>
        </div>
      )}
      
      {/* 原始数据 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-900 block">原始 WHOIS 数据</span>
              <span className="text-xs text-gray-500">
                {data.rawData.split('\n').length} 行
              </span>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showRaw ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {showRaw ? (
              <ChevronUp className={`w-5 h-5 ${showRaw ? 'text-blue-600' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>
        
        {showRaw && (
          <div className="border-t border-gray-100">
            <div className="flex justify-end p-3 bg-gray-50 border-b border-gray-100">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs text-gray-700 overflow-x-auto bg-gray-50 max-h-96 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed">
              {data.rawData}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
