import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../api/axiosClient'

const dateFormat = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' })

export default function Events() {
  const [events, setEvents] = useState(null)
  const [page, setPage] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    api.get('/events', { params: { status: 'active', page, limit: 10 }, signal: controller.signal })
      .then(({ data }) => setEvents(data.data.events))
      .catch((failure) => { if (!controller.signal.aborted) setError(errorMessage(failure)) })
    return () => controller.abort()
  }, [page, attempt])

  function move(next) {
    setEvents(null)
    setError('')
    if (next === page) setAttempt(value => value + 1)
    else setPage(next)
  }

  return <>
    <section className="hero"><h1>Carreras</h1><p>Consulta fechas, cupos y resultados de los eventos deportivos.</p></section>
    {error ? <p role="alert">{error} <button onClick={() => move(page)}>Reintentar</button></p> : !events && <p role="status">Cargando carreras…</p>}
    {events?.length === 0 && <p>No hay carreras en esta página.</p>}
    <div className="event-grid">{events?.map(event => {
      const date = new Date(event.date)
      const open = date > new Date() && event.registeredCount < event.capacity
      return <article className="panel event" key={event._id}>
        <p className="event-meta">{event.distance} km · {dateFormat.format(date)}</p>
        <h2>{event.name}</h2><p>{event.location}</p>
        <p>{Math.max(0, event.capacity - event.registeredCount)} cupos disponibles</p>
        <div className="actions">
          <Link to={`/clasificacion/${event._id}`}>Ver clasificación</Link>
          {open && <Link className="button" to={`/mi-cuenta?evento=${event._id}`}>Inscribirme</Link>}
        </div>
      </article>
    })}</div>
    <div className="actions pagination">
      <button className="ghost" onClick={() => move(page - 1)} disabled={page === 1}>Anterior</button>
      <span>Página {page}</span>
      <button className="ghost" onClick={() => move(page + 1)} disabled={events?.length !== 10}>Siguiente</button>
    </div>
  </>
}
