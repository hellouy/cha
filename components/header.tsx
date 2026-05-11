'use client'

import { Globe, Search, Loader2 } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import Loader from './loader'

interface HeaderProps {
  onLoadingChange?: (isLoading: boolean) => void
}

export default function Header({ onLoadingChange }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [domain, setDomain] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isFocused, setIsFocused] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // 通知父组件加载状态变化
  useEffect(() => {
    onLoadingChange?.(isPending || isNavigating)
  }, [isPending, isNavigating, onLoadingChange])

  // 当路由变化完成时重置导航状态
  useEffect(() => {
    setIsNavigating(false)
    setIsFocused(false)
  }, [pathname])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return
    
    setIsNavigating(true)
    startTransition(() => {
      router.push(domain.trim())
    })
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const isLoading = isPending || isNavigating
  const shouldHideContent = isFocused || isLoading

  return (
    <div className='p-4'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex justify-center items-center mb-8'>
          <Globe className='w-12 h-12 text-blue-600 mr-2' />
          <h1 className='text-3xl font-bold text-blue-600'>Whois</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex gap-2'
        >
          <div className='relative flex-1'>
            <input
              type='text'
              name='domain'
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onFocus={handleFocus}
              placeholder='example.com'
              disabled={isLoading}
              className='w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity'
            />
            <Globe className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          </div>
          <button
            type='submit'
            disabled={isLoading || !domain.trim()}
            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[56px]'
          >
            {isLoading ? (
              <Loader2 className='w-5 h-5 animate-spin' />
            ) : (
              <Search className='w-5 h-5' />
            )}
          </button>
        </form>

        {isLoading && (
          <div className="flex flex-col items-center justify-center mt-16 space-y-4">
            <Loader size="lg" className="text-blue-600" />
            <p className="text-gray-500 text-sm animate-pulse">正在查询域名信息...</p>
          </div>
        )}

        {/* 隐藏内容的遮罩状态 - 通过 CSS 类传递给父组件 */}
        <input type="hidden" id="header-state" data-hide-content={shouldHideContent ? 'true' : 'false'} />
      </div>
    </div>
  )
}
