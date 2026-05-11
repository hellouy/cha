'use client'

import { useState, useMemo } from 'react'
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
  Clock,
  ExternalLink,
  Download
} from 'lucide-react'

interface WhoisResultProps {
  data: WhoisData
  domain: string
}

// 计算相对时间
function getRelativeTime(dateStr: string): string {
  try {
    // 尝试解析中文日期格式 "2025年5月19日"
    const chineseMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    let date: Date
    
    if (chineseMatch) {
      date = new Date(parseInt(chineseMatch[1]), parseInt(chineseMatch[2]) - 1, parseInt(chineseMatch[3]))
    } else {
      date = new Date(dateStr)
    }
    
    if (isNaN(date.getTime())) return ''
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24))
    const isPast = diffMs > 0
    
    if (diffDays < 1) return '今天'
    if (diffDays < 30) return isPast ? `${diffDays} 天前` : `剩余 ${diffDays} 天`
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return isPast ? `${months} 个月前` : `剩余 ${months} 个月`
    }
    const years = Math.floor(diffDays / 365)
    return isPast ? `${years} 年前` : `剩余 ${diffDays} 天`
  } catch {
    return ''
  }
}

// 计算域名年龄
function getDomainAge(creationDate: string): string {
  try {
    const chineseMatch = creationDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    let date: Date
    
    if (chineseMatch) {
      date = new Date(parseInt(chineseMatch[1]), parseInt(chineseMatch[2]) - 1, parseInt(chineseMatch[3]))
    } else {
      date = new Date(creationDate)
    }
    
    if (isNaN(date.getTime())) return ''
    
    const now = new Date()
    const years = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365))
    return `${years} 年`
  } catch {
    return ''
  }
}

// 状态码解释
const statusDescriptions: Record<string, string> = {
  'clienttransferprohibited': '注册商已锁定该域名，禁止转移至其他注册商',
  'clientdeleteprohibited': '注册商已锁定该域名，禁止删除',
  'clientupdateprohibited': '注册商已锁定该域名，禁止修改信息',
  'clientrenewprohibited': '注册商已锁定该域名，禁止续费',
  'servertransferprohibited': '注册局已锁定该域名，禁止转移',
  'serverdeleteprohibited': '注册局已锁定该域名，禁止删除',
  'serverupdateprohibited': '注册局已锁定该域名，禁止修改',
  'serverhold': '注册局暂停了该域名的解析',
  'clienthold': '注册商暂停了该域名的解析',
  'pendingdelete': '域名处于待删除状态',
  'pendingtransfer': '域名正在转移中',
  'pendingrenew': '域名正在续费中',
  'active': '域名状态正常',
  'ok': '域名状态正常',
  'autorenewperiod': '域名处于自动续费期',
  'redemptionperiod': '域名处于赎回期',
  'addperiod': '域名处于新增宽限期',
}

function getStatusDescription(status: string): string {
  const lower = status.toLowerCase().replace(/[\s-]/g, '')
  for (const [key, desc] of Object.entries(statusDescriptions)) {
    if (lower.includes(key.toLowerCase())) {
      return desc
    }
  }
  return ''
}

export default function WhoisResult({ data, domain }: WhoisResultProps) {
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.rawData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([data.rawData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `whois-${domain}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const domainAge = useMemo(() => {
    if (data.creationDate) return getDomainAge(data.creationDate)
    return ''
  }, [data.creationDate])
  
  // 检查是否有解析到的结构化数据
  const hasStructuredData = data.domainName || data.creationDate || data.registrar || 
    data.registrant || (data.nameServers && data.nameServers.length > 0) ||
    (data.status && data.status.length > 0) || data.adminContact || data.techContact ||
    data.expirationDate || data.updatedDate || data.domainId
  
  // 检查是否需要显示非已注册状态的卡片
  const showAvailabilityCard = data.availability !== 'registered'
  const availabilityInfo = getAvailabilityInfo(data.availability)
  
  return (
    <div className="space-y-4">
      {/* 域名头部卡片 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* 标签 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                DOMAIN
              </span>
            </div>
            
            {/* 域名 */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              {domain.toUpperCase()}
            </h1>
            
            {/* 状态和年龄 */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {data.availability === 'registered' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  正常
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${
                  availabilityInfo.color === 'green' ? 'bg-emerald-500 text-white' :
                  availabilityInfo.color === 'yellow' ? 'bg-amber-500 text-white' :
                  availabilityInfo.color === 'red' ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {availabilityInfo.title}
                </span>
              )}
              
              {domainAge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  {domainAge}
                </span>
              )}
            </div>
          </div>
          
          {/* 地球图标 */}
          <div className="hidden sm:block w-24 h-24 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-400">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
              <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M 50 5 Q 30 50 50 95" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M 50 5 Q 70 50 50 95" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* 域名可用性状态卡片 */}
      {showAvailabilityCard && (
        <div className={`rounded-2xl p-5 ${
          availabilityInfo.color === 'green' ? 'bg-emerald-50 border border-emerald-200' :
          availabilityInfo.color === 'yellow' ? 'bg-amber-50 border border-amber-200' :
          availabilityInfo.color === 'red' ? 'bg-red-50 border border-red-200' :
          'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              availabilityInfo.color === 'green' ? 'bg-emerald-100' :
              availabilityInfo.color === 'yellow' ? 'bg-amber-100' :
              availabilityInfo.color === 'red' ? 'bg-red-100' :
              'bg-gray-100'
            }`}>
              {availabilityInfo.icon === 'check' && <CheckCircle className={`w-6 h-6 ${availabilityInfo.color === 'green' ? 'text-emerald-600' : 'text-gray-600'}`} />}
              {availabilityInfo.icon === 'x' && <XCircle className="w-6 h-6 text-blue-600" />}
              {availabilityInfo.icon === 'alert' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
              {availabilityInfo.icon === 'ban' && <Ban className="w-6 h-6 text-red-600" />}
              {availabilityInfo.icon === 'help' && <HelpCircle className="w-6 h-6 text-gray-600" />}
            </div>
            <div>
              <h3 className={`font-semibold ${
                availabilityInfo.color === 'green' ? 'text-emerald-900' :
                availabilityInfo.color === 'yellow' ? 'text-amber-900' :
                availabilityInfo.color === 'red' ? 'text-red-900' :
                'text-gray-900'
              }`}>{availabilityInfo.title}</h3>
              <p className={`text-sm ${
                availabilityInfo.color === 'green' ? 'text-emerald-700' :
                availabilityInfo.color === 'yellow' ? 'text-amber-700' :
                availabilityInfo.color === 'red' ? 'text-red-700' :
                'text-gray-600'
              }`}>{data.availabilityMessage || availabilityInfo.description}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 日期信息 */}
      {(data.creationDate || data.expirationDate || data.updatedDate) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.creationDate && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">创建日期</p>
                <p className="text-xl font-semibold text-gray-900">{data.creationDate}</p>
                <p className="text-sm text-gray-400">{getRelativeTime(data.creationDate)}</p>
              </div>
            )}
            {data.expirationDate && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">过期日期</p>
                <p className="text-xl font-semibold text-gray-900">{data.expirationDate}</p>
                <p className={`text-sm ${getRelativeTime(data.expirationDate).includes('剩余') ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                  {getRelativeTime(data.expirationDate)}
                </p>
              </div>
            )}
            {data.updatedDate && (
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm text-gray-500">更新日期</p>
                <p className="text-xl font-semibold text-gray-900">{data.updatedDate}</p>
                <p className="text-sm text-gray-400">{getRelativeTime(data.updatedDate)}</p>
              </div>
            )}
          </div>
          
          {/* 联系信息快捷显示 */}
          {(data.registrant?.email || data.registrant?.phone || data.registrar?.email || data.registrar?.phone) && (
            <>
              <div className="h-px bg-gray-100 my-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(data.registrant?.email || data.registrar?.email) && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">联系邮箱</p>
                    <a 
                      href={`mailto:${data.registrant?.email || data.registrar?.email}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {data.registrant?.email || data.registrar?.email}
                    </a>
                  </div>
                )}
                {(data.registrant?.phone || data.registrar?.phone) && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">联系电话</p>
                    <a 
                      href={`tel:${data.registrant?.phone || data.registrar?.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {data.registrant?.phone || data.registrar?.phone}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* 状态信息 */}
      {data.status && data.status.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">状态</h3>
          </div>
          <div className="space-y-3">
            {data.status.map((s, i) => {
              const desc = getStatusDescription(s)
              const info = getStatusInfo(s)
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      info.color === 'green' ? 'bg-emerald-500' :
                      info.color === 'yellow' ? 'bg-amber-500' :
                      info.color === 'red' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}></span>
                    <span className="font-medium text-gray-900">{s}</span>
                  </div>
                  {desc && <p className="text-sm text-gray-500 pl-4">{desc}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* DNS 服务器 */}
      {data.nameServers && data.nameServers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">域名服务器</h3>
          </div>
          <div className="space-y-2">
            {data.nameServers.map((ns, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                <span className="font-mono text-sm text-gray-900">{ns.toUpperCase()}</span>
              </div>
            ))}
          </div>
          {data.dnssec && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">DNS 安全扩展</span>
              <span className="text-sm font-medium text-gray-900">{data.dnssec}</span>
            </div>
          )}
        </div>
      )}
      
      {/* 注册商信息 */}
      {data.registrar && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">注册商</h3>
            {data.registrar.id && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                IANA: {data.registrar.id}
              </span>
            )}
          </div>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{data.registrar.name}</p>
              {data.registrar.url && (
                <a 
                  href={data.registrar.url.startsWith('http') ? data.registrar.url : `http://${data.registrar.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {data.registrar.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          
          {(data.domainId || data.registrar.email || data.registrar.phone) && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              {data.domainId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">注册局域名 ID</span>
                  <span className="text-sm font-mono text-gray-900">{data.domainId}</span>
                </div>
              )}
              {data.registrar.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">滥用举报邮箱</span>
                  <a href={`mailto:${data.registrar.email}`} className="text-sm text-blue-600 hover:underline">
                    {data.registrar.email}
                  </a>
                </div>
              )}
              {data.registrar.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">滥用举报电话</span>
                  <a href={`tel:${data.registrar.phone}`} className="text-sm text-blue-600 hover:underline">
                    {data.registrar.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* 注册人信息 */}
      {data.registrant && Object.values(data.registrant).some(v => v) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">注册人信息</h3>
          </div>
          <div className="space-y-3">
            {data.registrant.name && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">姓名</span>
                <span className="text-sm font-medium text-gray-900">{data.registrant.name}</span>
              </div>
            )}
            {data.registrant.organization && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">组织</span>
                <span className="text-sm font-medium text-gray-900">{data.registrant.organization}</span>
              </div>
            )}
            {data.registrant.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">邮箱</span>
                <a href={`mailto:${data.registrant.email}`} className="text-sm text-blue-600 hover:underline">
                  {data.registrant.email}
                </a>
              </div>
            )}
            {data.registrant.phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">电话</span>
                <a href={`tel:${data.registrant.phone}`} className="text-sm text-blue-600 hover:underline">
                  {data.registrant.phone}
                </a>
              </div>
            )}
            {data.registrant.country && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">国家</span>
                <span className="text-sm font-medium text-gray-900">{data.registrant.country}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 额外字段 */}
      {data.additionalFields && Object.keys(data.additionalFields).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">其他信息</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(data.additionalFields).map(([key, value]) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <span className="text-sm text-gray-500 flex-shrink-0">{key}</span>
                <span className="text-sm text-gray-900 text-right break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 无结构化数据时的提示 */}
      {!hasStructuredData && !showAvailabilityCard && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center">
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
            <span className="font-semibold text-gray-900">Whois</span>
          </div>
          <div className="flex items-center gap-2">
            {showRaw && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload() }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>保存</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy() }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
              </>
            )}
            {showRaw ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>
        
        {showRaw && (
          <div className="border-t border-gray-100">
            <pre className="p-5 text-xs text-gray-700 overflow-x-auto bg-gray-50 max-h-96 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed">
              {data.rawData}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
