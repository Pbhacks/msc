'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/providers/auth-provider'
import { db } from '@/lib/db'
import type { Prescription, Reminder } from '@/lib/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    if (user) {
      // Load data based on user role
      if (user.role === 'doctor') {
        setPrescriptions(db.getPrescriptions().filter(p => p.doctorId === user.id))
      } else if (user.role === 'patient') {
        setPrescriptions(db.getPrescriptions().filter(p => p.patientId === user.id))
      }
      setReminders(db.getReminders().filter(r => r.userId === user.id))
    }
  }, [user])

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome, {user.name}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {prescriptions.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reminders.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescriptions.slice(0, 3).map(prescription => (
                <div key={prescription.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{prescription.medication}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(prescription.dateIssued).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm">
                    {prescription.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

