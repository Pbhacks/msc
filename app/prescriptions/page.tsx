'use client'

import { useState, useEffect } from 'react'
import { PrescriptionForm } from '@/components/prescription-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { db } from '@/lib/db'
import type { Prescription, Patient } from '@/lib/types'

export default function PrescriptionsPage() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      // Load prescriptions based on user role
      if (user.role === 'doctor') {
        setPrescriptions(db.getPrescriptions().filter(p => p.doctorId === user.id))
      } else if (user.role === 'patient') {
        setPrescriptions(db.getPrescriptions().filter(p => p.patientId === user.id))
      } else {
        setPrescriptions(db.getPrescriptions())
      }
      setPatients(db.getPatients())
    }
  }, [user])

  const handlePrescriptionAdded = () => {
    // Reload prescriptions
    if (user) {
      if (user.role === 'doctor') {
        setPrescriptions(db.getPrescriptions().filter(p => p.doctorId === user.id))
      } else if (user.role === 'patient') {
        setPrescriptions(db.getPrescriptions().filter(p => p.patientId === user.id))
      }
    }
    setIsDialogOpen(false)
  }

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? patient.name : 'Unknown'
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Prescriptions</h1>
        {user.role === 'doctor' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Prescription</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Prescription</DialogTitle>
              </DialogHeader>
              <PrescriptionForm onSuccess={handlePrescriptionAdded} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Medication</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.map((prescription) => (
            <TableRow key={prescription.id}>
              <TableCell>
                {new Date(prescription.dateIssued).toLocaleDateString()}
              </TableCell>
              <TableCell>{getPatientName(prescription.patientId)}</TableCell>
              <TableCell>{prescription.medication}</TableCell>
              <TableCell>{prescription.dosage}</TableCell>
              <TableCell>{prescription.frequency}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                  prescription.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {prescription.status}
                </span>
              </TableCell>
              <TableCell>{prescription.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

