import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {useAuth} from '../lib/auth.jsx'
import {useFavorites} from '../lib/favorites.js'
import {supabase} from '../lib/supabase.js'
export default function Account(){
 const favorites=useFavorites()
 const {user,loading,login,logout,isEditor}=useAuth()
 const [mode,setMode]=useState('login'),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[registration,setRegistration]=useState(false),[profileReady,setProfileReady]=useState(false)
 useEffect(()=>{let active=true;supabase.from('mqe_settings').select('registration_open').eq('id',true).single().then(({data})=>{if(active)setRegistration(data?.registration_open===true)});return()=>{active=false}},[])
 useEffect(()=>{let active=true;setName('');setProfileReady(false);setError('');setMessage('');if(!user)return
 supabase.from('mqe_profiles').select('display_name').eq('user_id',user.id).maybeSingle().then(({data,error})=>{if(active){if(error)setError('No pudimos cargar tu perfil. Recargá la página para reintentar.');else{setName(data?.display_name||user.user_metadata?.display_name||'');setProfileReady(true)}}}).catch(()=>{if(active)setError('No pudimos cargar tu perfil.')});return()=>{active=false}},[user?.id])
 async function submit(e){e.preventDefault();setBusy(true);setError('');setMessage('')
 try{if(user){const {error}=await supabase.from('mqe_profiles').upsert({user_id:user.id,display_name:name.trim()});if(error)throw error;setMessage('Nombre guardado.')}
 else if(mode==='register'&&registration){const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim()}}});if(error)throw error;setPassword('');if(!data.session)setMessage('Revisá tu correo para confirmar la cuenta.');else setMessage('Tu cuenta está lista.')}
 else {await login(email,password);setPassword('')}
 }catch{setError(user?'No pudimos guardar el nombre. Reintentá.':mode==='register'?'No pudimos crear la cuenta. Probá de nuevo más tarde.':'No pudimos iniciar sesión. Revisá el correo y la contraseña.')}finally{setBusy(false)}}
 async function signOut(){setBusy(true);setError('');try{await logout()}catch{setError('No pudimos cerrar la sesión. Reintentá.')}finally{setBusy(false)}}
 if(loading)return <div className="account-page" role="status">Cargando tu cuenta…</div>
 return <section className="account-page"><span className="eyebrow">MÁS QUE ESCALADA · COMUNIDAD</span><h1>{user?'Tu cuenta.':mode==='register'?'Creá tu cuenta.':'Volvé a tu próxima aventura.'}</h1><p>{user?'Tus favoritas te acompañan cuando iniciás sesión en otro dispositivo.':'La guía es abierta. Con tu cuenta podés guardar tus vías favoritas.'}</p>
 <div className="account-card">{user&&<p>Sesión iniciada con <strong>{user.email}</strong></p>}
 <form onSubmit={submit}>{(user||mode==='register')&&<label>Nombre<input autoComplete="given-name" value={name} onChange={e=>setName(e.target.value)} maxLength={80} required disabled={busy||(!!user&&!profileReady)}/></label>}
 {!user&&<><label>Correo electrónico<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required disabled={busy}/></label><label>Contraseña<input type="password" autoComplete={mode==='register'?'new-password':'current-password'} minLength={mode==='register'?10:undefined} value={password} onChange={e=>setPassword(e.target.value)} required disabled={busy}/></label>{mode==='register'&&<p className="account-hint">Usá al menos 10 caracteres. Guardaremos tu nombre, correo y favoritas para gestionar tu cuenta. No enviaremos novedades sin tu autorización.</p>}</>}
 {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
 <button className="action-button" disabled={busy||(!!user&&!profileReady)}>{busy?'Un momento…':user?'Guardar nombre':mode==='register'?'Crear cuenta':'Iniciar sesión'}</button></form>
 {user?<div className="account-actions"><Link to="/guardadas">Ver mis favoritas →</Link>{favorites.localCount>0&&<button disabled={favorites.loading||!!favorites.error} onClick={favorites.importLocal}>Copiar favoritas de este navegador a mi cuenta ({favorites.localCount})</button>}{favorites.error&&<p role="alert">{favorites.error} <button onClick={favorites.retry}>Reintentar</button></p>}{isEditor&&<Link to="/admin/gestionar">Administrar contenido →</Link>}<button disabled={busy} onClick={signOut}>Cerrar sesión</button></div>:<div className="account-actions">{registration?<button onClick={()=>{setMode(mode==='login'?'register':'login');setError('');setMessage('')}}>{mode==='login'?'Crear una cuenta':'Ya tengo cuenta'}</button>:<p>El registro de nuevas cuentas estará disponible próximamente. Mientras tanto, podés guardar vías en este navegador.</p>}<p>¿Necesitás ayuda con tu cuenta? <a href="mailto:masqueescalada@gmail.com">Escribinos</a>.</p></div>}</div><Link to="/rutas">Seguir explorando sin registrarte →</Link></section>
}
