import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, errorMessage } from '../api/axiosClient'

export default function Ranking() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const controller = new AbortController()
    api.get(`/events/${id}/ranking`, { params: { page, limit: 20 }, signal: controller.signal })
      .then(({ data }) => setResult(data.data))
      .catch(failure => { if (!controller.signal.aborted) setError(errorMessage(failure)) })
    return () => controller.abort()
  }, [id, page])

  function move(next) { setError(''); setResult(null); setPage(next) }

  return <section className="panel"><Link to="/">Volver a carreras</Link><h1>Clasificación</h1>
    {error ? <p role="alert">{error}</p> : !result && <p role="status">Cargando clasificación…</p>}
    {result?.total === 0 && <p>Todavía no hay resultados.</p>}
    {result?.ranking.length > 0 && <table><thead><tr><th scope="col">Puesto</th><th scope="col">Participante</th><th scope="col">Tiempo (s)</th></tr></thead>
      <tbody>{result.ranking.map((row, index) =>
        <tr key={index}><td>{row.rank}</td><td>{row.participant.name}</td><td>{(row.timeMs / 1000).toLocaleString('es-CO', { minimumFractionDigits: 3 })}</td></tr>)}</tbody>
    </table>}
    {(page > 1 || result?.total > 20) && <div className="actions pagination">
      <button className="ghost" disabled={page === 1} onClick={() => move(page - 1)}>Anterior</button>
      <span>Página {page}</span><button className="ghost" disabled={!result || result.total <= page * 20} onClick={() => move(page + 1)}>Siguiente</button>
    </div>}
  </section>
}
