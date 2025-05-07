'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TransparencyTool from '@/components/transparency-tool'

export default function ToolPage() {
  const router = useRouter()

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail')
    if (!userEmail) {
      router.push('/')
    }
  }, [router])

  return <TransparencyTool />
}

