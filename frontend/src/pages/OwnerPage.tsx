import { useState, useEffect } from 'react'
import {
  Container, Title, Table, Button, Group,
  TextInput, Textarea, NumberInput, Modal, Stack, Card, Loader, Alert,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { api, type EventType, type Booking } from '../api'

function OwnerPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState({ et: false, bookings: false })
  const [error, setError] = useState<string | null>(null)

  const [opened, { open, close }] = useDisclosure(false)
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false)
  const [form, setForm] = useState({ title: '', description: '', durationMinutes: 30 })
  const [editForm, setEditForm] = useState<EventType | null>(null)

  useEffect(() => { loadEventTypes(); loadBookings() }, [])

  async function loadEventTypes() {
    setLoading(p => ({ ...p, et: true })); setError(null)
    try { setEventTypes(await api.ownerListEventTypes()) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(p => ({ ...p, et: false })) }
  }

  async function loadBookings() {
    setLoading(p => ({ ...p, bookings: true })); setError(null)
    try { setBookings(await api.ownerListBookings()) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(p => ({ ...p, bookings: false })) }
  }

  async function createEventType() {
    setError(null)
    try {
      await api.ownerCreateEventType(form)
      setForm({ title: '', description: '', durationMinutes: 30 }); close(); loadEventTypes()
    } catch (e: any) { setError(e.message) }
  }

  async function updateEventType() {
    if (!editForm) return; setError(null)
    try {
      await api.ownerUpdateEventType(editForm.id, editForm)
      closeEdit(); loadEventTypes()
    } catch (e: any) { setError(e.message) }
  }

  async function deleteEventType(id: string) {
    setError(null)
    try { await api.ownerDeleteEventType(id); loadEventTypes() }
    catch (e: any) { setError(e.message) }
  }

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Owner Area</Title>

      {error && <Alert color="red" mb="md">{error}</Alert>}

      <Card withBorder mb="md">
        <Group justify="space-between" mb="sm">
          <Title order={4}>Event Types</Title>
          <Group>
            <Button size="xs" onClick={loadEventTypes} loading={loading.et}>Refresh</Button>
            <Button size="xs" onClick={open}>+ Create</Button>
          </Group>
        </Group>
        {loading.et ? <Loader /> : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th w={180}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {eventTypes.map(et => (
                <Table.Tr key={et.id}>
                  <Table.Td>{et.title}</Table.Td>
                  <Table.Td>{et.description}</Table.Td>
                  <Table.Td>{et.durationMinutes} min</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="light" onClick={() => { setEditForm(et); openEdit() }}>Edit</Button>
                      <Button size="xs" color="red" variant="light" onClick={() => deleteEventType(et.id)}>Delete</Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Card withBorder>
        <Group justify="space-between" mb="sm">
          <Title order={4}>Bookings</Title>
          <Button size="xs" onClick={loadBookings} loading={loading.bookings}>Refresh</Button>
        </Group>
        {loading.bookings ? <Loader /> : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Guest</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Event</Table.Th>
                <Table.Th>Start</Table.Th>
                <Table.Th>Created</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bookings.map(b => (
                <Table.Tr key={b.id}>
                  <Table.Td>{b.guestName}</Table.Td>
                  <Table.Td>{b.guestEmail}</Table.Td>
                  <Table.Td>{b.eventTypeId}</Table.Td>
                  <Table.Td>{b.startTime}</Table.Td>
                  <Table.Td>{b.createdAt}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Modal opened={opened} onClose={close} title="Create Event Type">
        <Stack>
          <TextInput label="Title" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Textarea label="Description" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <NumberInput label="Duration (min)" value={form.durationMinutes}
            onChange={v => setForm(p => ({ ...p, durationMinutes: Number(v) }))} />
          <Button onClick={createEventType}>Create</Button>
        </Stack>
      </Modal>

      <Modal opened={editOpened} onClose={closeEdit} title="Edit Event Type">
        {editForm && (
          <Stack>
            <TextInput label="Title" value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
            <Textarea label="Description" value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            <NumberInput label="Duration (min)" value={editForm.durationMinutes}
              onChange={v => setEditForm({ ...editForm, durationMinutes: Number(v) })} />
            <Button onClick={updateEventType}>Save</Button>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}

export default OwnerPage
