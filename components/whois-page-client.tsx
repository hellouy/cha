'use client'

import { useState, useEffect } from 'react'
import Header from './header'
import WhoisResult from './whois-result'
import type { WhoisParsedData } from '@/lib/whois-parser'

interface WhoisPageClientProps {
  data: WhoisParsedData
  domain: string
}

export default function WhoisPageClient({ data, domain }: WhoisPageClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(true)

  // 当加载状态变化时，隐藏或显示结果
  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading)
    if (loading) {
      setShowResult(false)
    }
  }

  // 当数据变化时（新页面加载完成），显示结果
  useEffect(() => {
    setShowResult(true)
    setIsLoading(false)
  }, [data, domain])

  return (
    <>
      <Header onLoadingChange={handleLoadingChange} />
      <main className="max-w-3xl mx-auto p-4 pb-8">
        {showResult && !isLoading && (
          <WhoisResult data={data} domain={domain} />
        )}
      </main>
    </>
  )
}
