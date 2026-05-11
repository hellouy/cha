'use client'

import { useState } from 'react'
import { WhoisData, getStatusInfo } from '@/lib/whois-parser'
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
  Check
} from 'lucide-react'

interface WhoisResultProps {
  data: WhoisData
  domain: string
}

interface InfoCardProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function InfoCard({ icon, title, children }: InfoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
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
}

function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
      <span className="text-gray-500 text-sm">{label}</span>
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

export default function WhoisResult({ data, domain }: WhoisResultProps) {
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.rawData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // 检查是否有解析到的数据
  const hasStructuredData = data.domainName || data.creationDate || data.registrar || 
    data.registrant || (data.nameServers && data.nameServers.length > 0) ||
    (data.status && data.status.length > 0)
  
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
      
      {hasStructuredData ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* 域名信息 */}
          <InfoCard icon={<Calendar className="w-5 h-5" />} title="域名信息">
            <InfoRow label="域名 ID" value={data.domainId} />
            <InfoRow label="注册日期" value={data.creationDate} />
            <InfoRow label="更新日期" value={data.updatedDate} />
            <InfoRow label="到期日期" value={data.expirationDate} />
          </InfoCard>
          
          {/* 注册商信息 */}
          {data.registrar && (
            <InfoCard icon={<Building2 className="w-5 h-5" />} title="注册商">
              <InfoRow label="名称" value={data.registrar.name} />
              <InfoRow label="网站" value={data.registrar.url} />
              <InfoRow label="邮箱" value={data.registrar.email} />
              <InfoRow label="电话" value={data.registrar.phone} />
            </InfoCard>
          )}
          
          {/* 注册人信息 */}
          {data.registrant && (
            <InfoCard icon={<User className="w-5 h-5" />} title="注册人">
              <InfoRow label="ID" value={data.registrant.id} />
              <InfoRow label="姓名" value={data.registrant.name} />
              <InfoRow label="类型" value={data.registrant.type} />
              <InfoRow label="组织" value={data.registrant.organization} />
              <InfoRow label="邮箱" value={data.registrant.email} />
              <InfoRow label="电话" value={data.registrant.phone} />
              <InfoRow label="地址" value={data.registrant.address} />
              <InfoRow label="城市" value={data.registrant.city} />
              <InfoRow label="国家" value={data.registrant.country} />
            </InfoCard>
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
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-900 text-sm font-mono">{ns}</span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      ) : null}
      
      {/* 原始数据 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">原始 WHOIS 数据</span>
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
