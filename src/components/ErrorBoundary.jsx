import { Component } from 'react'
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div style={{padding:40,maxWidth:600,margin:'auto'}} role="alert"><h1>No pudimos abrir esta página</h1><p style={{margin:'20px 0'}}>Recargá para volver a intentarlo. Tus vías guardadas se conservan.</p><button className="action-button" onClick={() => window.location.reload()}>Recargar</button><a href="/" style={{marginLeft:24}}>Volver al inicio</a></div>
    return this.props.children
  }
}
