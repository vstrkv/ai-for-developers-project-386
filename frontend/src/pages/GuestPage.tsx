import { useState, useEffect } from 'react'
import {
  Container, Title, Table, Button, Group, Text,
  TextInput, Modal, Stack, Card, Loader, Alert,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { api, type EventType, type Slot, type Booking } from '../api'

function GuestPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [selectedEt, setSelectedEt] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState({ et: false, slots: false, book: false })
  const [error, setError] = useState<string | null>(null)

  const [opened, { open, close }] = useDisclosure(false)
  const [form, setForm] = useState({ eventTypeId: '', guestName: '', guestEmail: '', startTime: '' })

  useEffect(() => { loadEventTypes() }, [])

  async function loadEventTypes() {
    setLoading(p => ({ ...p, et: true })); setError(null)
    try { setEventTypes(await api.guestListEventTypes()) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(p => ({ ...p, et: false })) }
  }

  async function loadSlots(eventTypeId: string) {
    setSelectedEt(eventTypeId); setLoading(p => ({ ...p, slots: true })); setError(null)
    try { setSlots(await api.guestListSlots(eventTypeId)) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(p => ({ ...p, slots: false })) }
  }

  async function createBooking() {
    setLoading(p => ({ ...p, book: true })); setError(null)
    try {
      const b = await api.guestCreateBooking(form)
      setBookings(p => [...p, b]); close()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(p => ({ ...p, book: false })) }
  }

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Guest Area</Title>

      {error && <Alert color="red" mb="md">{error}</Alert>}

      <Card withBorder mb="md">
        <Group justify="space-between" mb="sm">
          <Title order={4}>Event Types</Title>
          <Button size="xs" onClick={loadEventTypes} loading={loading.et}>Refresh</Button>
        </Group>
        {loading.et ? <Loader /> : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th w={100}>Slots</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {eventTypes.map(et => (
                <Table.Tr key={et.id}>
                  <Table.Td>{et.title}</Table.Td>
                  <Table.Td>{et.description}</Table.Td>
                  <Table.Td>{et.durationMinutes} min</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="light" onClick={() => loadSlots(et.id)}>
                      View
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {selectedEt && (
        <Card withBorder mb="md">
          <Title order={4} mb="sm">Available Slots</Title>
          {loading.slots ? <Loader /> : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Start</Table.Th>
                  <Table.Th>End</Table.Th>
                  <Table.Th w={80}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {slots.map((s, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{s.startTime}</Table.Td>
                    <Table.Td>{s.endTime}</Table.Td>
                    <Table.Td>
                      <Button size="xs" variant="light" onClick={() => {
                        setForm({ eventTypeId: s.eventTypeId, guestName: '', guestEmail: '', startTime: s.startTime })
                        open()
                      }}>Book</Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      )}

      <Card withBorder>
        <Title order={4} mb="sm">My Bookings</Title>
        {bookings.length === 0 ? (
          <Text c="dimmed" size="sm">No bookings yet</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Event</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Start</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bookings.map(b => (
                <Table.Tr key={b.id}>
                  <Table.Td>{b.eventTypeId}</Table.Td>
                  <Table.Td>{b.guestName}</Table.Td>
                  <Table.Td>{b.guestEmail}</Table.Td>
                  <Table.Td>{b.startTime}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Modal opened={opened} onClose={close} title="New Booking">
        <Stack>
          <TextInput label="Name" value={form.guestName}
            onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))} />
          <TextInput label="Email" value={form.guestEmail}
            onChange={e => setForm(p => ({ ...p, guestEmail: e.target.value }))} />
          <TextInput label="Start Time" value={form.startTime}
            onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
          <Button onClick={createBooking} loading={loading.book}>Confirm</Button>
        </Stack>
      </Modal>
    </Container>
  )
}

export default GuestPage
