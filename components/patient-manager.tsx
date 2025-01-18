'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useToast } from '@/components/ui/use-toast'
import { db } from '@/lib/db'
import { Patient } from '@/lib/types'
import { useRFID } from '@/providers/rfid-provider'

export function PatientManager() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const { toast } = useToast()
  const { userData, addUser, removeUser } = useRFID()

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    dateOfBirth: '',
    gender: 'other',
    contactNumber: '',
    email: '',
    address: '',
  })

  useEffect(() => {
    setPatients(db.getPatients())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPatient) {
      // Update existing patient
      db.updatePatient(selectedPatient.id, formData)
      setPatients(db.getPatients())
      toast({ title: 'Patient updated successfully' })
    } else {
      // Add new patient
      const newPatient: Patient = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData as Patient
      }
      db.addPatient(newPatient)
      setPatients(db.getPatients())
      toast({ title: 'Patient added successfully' })
    }
    setIsDialogOpen(false)
    setSelectedPatient(null)
    setFormData({
      name: '',
      dateOfBirth: '',
      gender: 'other',
      contactNumber: '',
      email: '',
      address: '',
    })
  }

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData(patient)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    db.deletePatient(id)
    setPatients(db.getPatients())
    toast({ title: 'Patient deleted successfully' })
  }

  const handleAssignRFID = (patient: Patient) => {
    const rfidUid = prompt('Enter RFID UID:')
    if (rfidUid) {
      db.updatePatient(patient.id, { ...patient, rfidUid })
      addUser(rfidUid, patient.name)
      setPatients(db.getPatients())
      toast({ title: 'RFID assigned successfully' })
    }
  }

  const handleRemoveRFID = (patient: Patient) => {
    if (patient.rfidUid) {
      db.updatePatient(patient.id, { ...patient, rfidUid: undefined })
      removeUser(patient.rfidUid)
      setPatients(db.getPatients())
      toast({ title: 'RFID removed successfully' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedPatient(null)}>Add Patient</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                className="w-full p-2 border rounded"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <Input
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Button type="submit">{selectedPatient ? 'Update' : 'Add'} Patient</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>RFID</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.dateOfBirth}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>{patient.contactNumber}</TableCell>
              <TableCell>{patient.rfidUid || 'Not assigned'}</TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Button size="sm" onClick={() => handleEdit(patient)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(patient.id)}>Delete</Button>
                  {patient.rfidUid ? (
                    <Button size="sm" variant="outline" onClick={() => handleRemoveRFID(patient)}>Remove RFID</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleAssignRFID(patient)}>Assign RFID</Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

