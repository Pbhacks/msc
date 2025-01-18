'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'

interface RFIDData {
  label: string
  date: string
  time: string
  cardUid: string
  rfidUid: string
}

interface RFIDContextType {
  lastScannedData: RFIDData | null
  userData: Record<string, string>
  addUser: (rfidUid: string, name: string) => void
  removeUser: (rfidUid: string) => void
  renameUser: (rfidUid: string, newName: string) => void
}

const RFIDContext = createContext<RFIDContextType | undefined>(undefined)

export function RFIDProvider({ children }: { children: React.ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [lastScannedData, setLastScannedData] = useState<RFIDData | null>(null)
  const [userData, setUserData] = useState<Record<string, string>>({})

  useEffect(() => {
    // Load stored user data
    const storedData = localStorage.getItem('userData')
    if (storedData) {
      setUserData(JSON.parse(storedData))
    }

    let socket: WebSocket | null = null
    let reconnectInterval: NodeJS.Timeout | null = null

    const connectWebSocket = () => {
      socket = new WebSocket('ws://localhost:8000')
      
      socket.onopen = () => {
        console.log('Connected to RFID WebSocket')
        toast({
          title: 'Connected to RFID System',
          description: 'Ready to receive card scans',
        })
        if (reconnectInterval) {
          clearInterval(reconnectInterval)
          reconnectInterval = null
        }
      }

      socket.onmessage = (event) => {
        const data: RFIDData = JSON.parse(event.data)
        setLastScannedData(data)
        toast({
          title: 'Card Scanned',
          description: `User: ${userData[data.rfidUid] || 'Unknown'}`,
        })
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to RFID system',
          variant: 'destructive',
        })
      }

      socket.onclose = () => {
        console.log('WebSocket connection closed')
        if (!reconnectInterval) {
          reconnectInterval = setInterval(() => {
            console.log('Attempting to reconnect...')
            connectWebSocket()
          }, 5000) // Try to reconnect every 5 seconds
        }
      }
    }

    connectWebSocket()

    return () => {
      if (socket) {
        socket.close()
      }
      if (reconnectInterval) {
        clearInterval(reconnectInterval)
      }
    }
  }, [])

  const addUser = (rfidUid: string, name: string) => {
    const newUserData = { ...userData, [rfidUid]: name }
    setUserData(newUserData)
    localStorage.setItem('userData', JSON.stringify(newUserData))
  }

  const removeUser = (rfidUid: string) => {
    const newUserData = { ...userData }
    delete newUserData[rfidUid]
    setUserData(newUserData)
    localStorage.setItem('userData', JSON.stringify(newUserData))
  }

  const renameUser = (rfidUid: string, newName: string) => {
    const newUserData = { ...userData, [rfidUid]: newName }
    setUserData(newUserData)
    localStorage.setItem('userData', JSON.stringify(newUserData))
  }

  return (
    <RFIDContext.Provider value={{
      lastScannedData,
      userData,
      addUser,
      removeUser,
      renameUser,
    }}>
      {children}
    </RFIDContext.Provider>
  )
}

export const useRFID = () => {
  const context = useContext(RFIDContext)
  if (context === undefined) {
    throw new Error('useRFID must be used within an RFIDProvider')
  }
  return context
}

