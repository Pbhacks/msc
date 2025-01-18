'use client'

import { PatientManager } from '@/components/patient-manager'
import { useAuth } from '@/providers/auth-provider'

export default function PatientsPage() {
  const { user } = useAuth()

  if (!user || user.role !== 'doctor') {
    return <div className="container mx-auto px-4 py-8">You don't have permission to view this page.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Patient Management</h1>
      <PatientManager />
    </div>
  )
}

