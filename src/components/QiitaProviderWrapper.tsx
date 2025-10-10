"use client"

import { QiitaProvider } from '../contexts/QiitaContext'
import { ReactNode } from 'react'

interface QiitaProviderWrapperProps {
  children: ReactNode
}

export default function QiitaProviderWrapper({ children }: QiitaProviderWrapperProps) {
  return (
    <QiitaProvider>
      {children}
    </QiitaProvider>
  )
}