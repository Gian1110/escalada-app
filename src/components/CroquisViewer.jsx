import { useRef, useState } from 'react'

export default function CroquisViewer({ src, alt }) {
  const dialog = useRef(null)
  const [zoom, setZoom] = useState(1)
  if (!src) return <p style={{padding:24}}>Todavía no hay un croquis para esta vía.</p>
  return <>
    <button className="croquis-preview" onClick={() => { setZoom(1); dialog.current.showModal() }} aria-label={`Ampliar croquis de ${alt}`}><img src={src} alt={`Croquis de ${alt}`} loading="lazy"/><span>⊕ Ampliar croquis</span></button>
    <dialog ref={dialog} className="croquis-dialog" aria-label={`Croquis de ${alt}`}>
      <div className="croquis-toolbar"><strong>{alt}</strong><button aria-label="Alejar" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - .5))}>−</button><span>{Math.round(zoom * 100)}%</span><button aria-label="Acercar" disabled={zoom >= 4} onClick={() => setZoom(z => Math.min(4, z + .5))}>+</button><a href={src} target="_blank" rel="noopener noreferrer">Original ↗</a><button autoFocus aria-label="Cerrar croquis" onClick={() => dialog.current.close()}>×</button></div>
      <div className="croquis-scroll"><img src={src} alt={`Croquis ampliado de ${alt}`} style={{width:`${zoom * 100}%`,maxWidth:'none'}}/></div>
    </dialog>
  </>
}
