import Header from '@/components/header'
import WhoisResult from '@/components/whois-result'
import { whois } from '@/lib/whois'
import { parseWhoisData } from '@/lib/whois-parser'
import { unstable_cache } from 'next/cache'

export default async function Page({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params

  const rawData = await unstable_cache(async () => whois(domain), [domain], {
    revalidate: 3600,
  })()

  const parsedData = parseWhoisData(rawData)

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto p-4 pb-8">
        <WhoisResult data={parsedData} domain={domain} />
      </main>
    </>
  )
}
