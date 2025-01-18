'use client'

import { useState } from 'react'
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
import { useRFID } from '@/providers/rfid-provider'
import { useToast } from '@/components/ui/use-toast'

export function RFIDManager() {
  const { userData, addUser, removeUser, renameUser, lastScannedData } = useRFID()
  const { toast } = useToast()
  const [newUserData, setNewUserData] = useState({ rfidUid: '', name: '' })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddUser = () => {
    if (!newUserData.rfidUid || !newUserData.name) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    addUser(newUserData.rfidUid, newUserData.name)
    setNewUserData({ rfidUid: '', name: '' })
    setIsDialogOpen(false)
    
    toast({
      title: 'Success',
      description: 'User has been added',
    })
  }

  const handleRemoveUser = (rfidUid: string) => {
    removeUser(rfidUid)
    toast({
      title: 'Success',
      description: 'User has been removed',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">RFID Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="RFID UID"
                value={newUserData.rfidUid}
                onChange={(e) => setNewUserData({ ...newUserData, rfidUid: e.target.value })}
              />
              <Input
                placeholder="User Name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              />
              <Button onClick={handleAddUser}>Add User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lastScannedData && (
        <div className="bg-primary/10 p-4 rounded-lg">
          <h3 className="font-medium">Last Scanned Card</h3>
          <p>UID: {lastScannedData.rfidUid}</p>
          <p>Time: {lastScannedData.time}</p>
          <p>User: {userData[lastScannedData.rfidUid] || 'Unknown'}</p>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RFID UID</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(userData).map(([rfidUid, name]) => (
            <TableRow key={rfidUid}>
              <TableCell>{rfidUid}</TableCell>
              <TableCell>{name}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveUser(rfidUid)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

