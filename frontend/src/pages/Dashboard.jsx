import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, errorMessage } from '../api/axiosClient'
import { useAuth } from '../store/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  return <Registration key={user.id} user={user} />
}

function Registration({ user }) {
  const [params] = useSearchParams()
  const initialEvent = params.get('evento') || ''
  const [eventId, setEventId] = useState(initialEvent)
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const storageKey = `racetrack.registrations.${user.id}`
  const [registrations, setRegistrations] = useState(() =>
    JSON.parse(sessionStorage.getItem(storageKey) || '{}'))
  const registration = registrations[eventId]

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    Promise.all([
      api.get('/events?status=active&limit=100', { signal }),
      api.get('/categories?status=active&limit=100', { signal }),
      initialEvent && api.get(`/events/${encodeURIComponent(initialEvent)}`, { signal }),
    ]).then(([catalog, group, selected]) => {
      const items = catalog.data.data.events
      if (selected && !items.some(event => event._id === selected.data.data._id)) items.push(selected.data.data)
      setEvents(items)
      setCategories(group.data.data)
    }).catch(failure => {
      if (!signal.aborted) setError(errorMessage(failure))
    }).finally(() => { if (!signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [initialEvent])

  function remember(next) {
    const updated = { ...registrations }
    if (next) updated[eventId] = next
    else delete updated[eventId]
    sessionStorage.setItem(storageKey, JSON.stringify(updated))
    setRegistrations(updated)
  }

  async function changeRegistration(event) {
    event.preventDefault()
    const cancel = event.nativeEvent.submitter?.value === 'cancel'
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    setError('')
    setMessage('')
    setBusy(true)
    try {
      if (cancel) {
        await api.delete(`/registrations/${registration}`)
        remember(null)
        setMessage('Inscripción cancelada.')
      } else {
        const { data } = await api.post('/registrations', fields)
        remember(data.data.id)
        setMessage('Inscripción confirmada.')
      }
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  const choices = events.filter(event => registrations[event._id] ||
    (event.status === 'active' && new Date(event.date) > new Date() && event.registeredCount < event.capacity))

  return <section className="panel form-panel">
    <h1>Mi cuenta</h1><p id="account-name">{user.name}</p><h2>Inscripción</h2>
    {loading && <p role="status">Cargando carreras y categorías…</p>}
    <form onSubmit={changeRegistration}>
      <label>Carrera<select id="event" name="eventId" value={eventId} onChange={(event) => setEventId(event.target.value)} disabled={busy} required>
        <option value="">Selecciona una carrera</option>
        {choices.map(event => <option key={event._id} value={event._id}>{event.name}</option>)}
      </select></label>
      <label>Categoría<select id="category" name="categoryId" required defaultValue="">
        <option value="">Selecciona una categoría</option>
        {categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}
      </select></label>
      <div className="actions"><button id="join" disabled={busy || loading || !choices.some(event => event._id === eventId) || !categories.length}>Inscribirme</button>
        {registration && <button id="cancel" className="ghost" value="cancel" formNoValidate disabled={busy}>Cancelar inscripción</button>}
      </div>
    </form>
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
  </section>
}
