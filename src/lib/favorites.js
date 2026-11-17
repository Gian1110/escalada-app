import { createContext, createElement, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './auth.jsx'
import { supabase } from './supabase.js'
const key='mqe-favorites'
const Context=createContext(null)
function localIds() {
  try { const a=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(a)?[...new Set(a.filter(x=>typeof x==='string'))]:[] } catch { return [] }
}
export function FavoritesProvider({children}) {
  const {user,loading:authLoading}=useAuth()
  const [ids,setIds]=useState(localIds)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [pending,setPending]=useState([])
  const [attempt,setAttempt]=useState(0)
  const identity=useRef(user?.id); identity.current=user?.id
  const locks=useRef(new Set())
  useEffect(()=>{
    let active=true
    setError(''); setPending([]); locks.current.clear()
    if(!user){setIds(localIds());setLoading(false);return}
    setIds([]);setLoading(true)
    supabase.from('mqe_favorites').select('via_id').eq('user_id',user.id).then(({data,error})=>{
      if(active){if(error)setError('No pudimos cargar tus favoritas. Reintentá antes de guardar cambios.');else setIds(data.map(x=>x.via_id));setLoading(false)}
    }).catch(()=>{if(active){setError('No pudimos cargar tus favoritas.');setLoading(false)}})
    return ()=>{active=false}
  },[user?.id,attempt])
  useEffect(()=>{ const changed=e=>{if(!identity.current && (!e.key||e.key===key))setIds(localIds())};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed)},[])
  async function toggle(id){
    id=String(id)
    if(authLoading||loading||error||locks.current.has(id))return
    if(!user){setIds(current=>{const next=current.includes(id)?current.filter(x=>x!==id):[...current,id];try{localStorage.setItem(key,JSON.stringify(next))}catch{setError('El navegador no permite guardar tu lista.')}return next});return}
    const uid=user.id, wasSaved=ids.includes(id)
    locks.current.add(id);setPending(x=>[...x,id])
    try{
      const {error}=wasSaved?await supabase.from('mqe_favorites').delete().eq('user_id',uid).eq('via_id',id):await supabase.from('mqe_favorites').upsert({user_id:uid,via_id:id},{onConflict:'user_id,via_id',ignoreDuplicates:true})
      if(error)throw error
      if(identity.current===uid)setIds(current=>wasSaved?current.filter(x=>x!==id):[...new Set([...current,id])])
    }catch{if(identity.current===uid)setError('No se guardó el cambio. Revisá tu conexión y reintentá.')}
    finally{if(identity.current===uid){locks.current.delete(id);setPending(x=>x.filter(v=>v!==id))}}
  }
  async function importLocal(){
    if(!user||loading||error)return
    const uid=user.id
    const local=localIds().filter(id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    if(!local.length)return
    setLoading(true)
    try{
      const {data,error:readError}=await supabase.from('vias').select('id').in('id',local)
      if(readError)throw readError
      if(data.length){const {error}=await supabase.from('mqe_favorites').upsert(data.map(v=>({user_id:uid,via_id:v.id})),{onConflict:'user_id,via_id',ignoreDuplicates:true});if(error)throw error}
      if(identity.current===uid)setIds(current=>[...new Set([...current,...data.map(v=>v.id)])])
    }catch{if(identity.current===uid)setError('No pudimos copiar las favoritas. Tu lista del navegador sigue intacta.')}
    finally{if(identity.current===uid)setLoading(false)}
  }
  return createElement(Context.Provider,{value:{ids,toggle,loading:loading||authLoading,error,pending,retry:()=>setAttempt(x=>x+1),signedIn:!!user,importLocal,localCount:localIds().length}},children)
}
export function useFavorites(){return useContext(Context)}
