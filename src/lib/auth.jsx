import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editorId, setEditorId] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const [roleError, setRoleError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true, eventSeen = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      eventSeen = true
      if (active) { setUser(session?.user ?? null); setLoading(false) }
    })
    supabase.auth.getSession().then(({ data, error }) => {
      if (active && !eventSeen) { setUser(error ? null : data.session?.user ?? null); setLoading(false) }
    }).catch(() => { if (active) setLoading(false) })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    let active = true
    setEditorId(null); setRoleError(false); setRoleLoading(true)
    if (!user) { setRoleLoading(false); return }
    supabase.rpc('mqe_is_editor').then(({data,error}) => {
      if (active) { setEditorId(!error && data === true ? user.id : null); setRoleError(!!error); setRoleLoading(false) }
    }).catch(() => { if(active) {setRoleError(true);setRoleLoading(false)} })
    return () => { active = false }
  }, [user?.id, attempt])
  const login = async (email,password) => {
    const {error} = await supabase.auth.signInWithPassword({email:email.trim(),password})
    if(error) throw error
  }
  const logout = async () => { const {error}=await supabase.auth.signOut(); if(error) throw error }
  return <AuthContext.Provider value={{user,loading,isEditor:!!user && editorId===user.id,roleLoading,roleError,retryRole:()=>setAttempt(x=>x+1),login,logout}}>{children}</AuthContext.Provider>
}
export function useAuth() { return useContext(AuthContext) }
