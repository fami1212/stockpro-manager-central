
import { useState, useEffect, createContext, useContext } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  userRole: string | null
  isAdmin: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        // Get user role
        setTimeout(async () => {
          try {
            const { data: roleData } = await supabase
              .rpc('get_user_role', { _user_id: session.user.id });
            
            setUserRole(roleData);
            setIsAdmin(roleData === 'admin');
            
            // Update last login
            await supabase
              .from('profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id);
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        }, 0);
      } else {
        setUserRole(null);
        setIsAdmin(false);
      }

      if (event === 'SIGNED_IN') {
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue dans StockPro Manager'
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData?: any) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      
      toast({
        title: 'Compte créé avec succès',
        description: 'Vérifiez votre email pour confirmer votre compte'
      })
    } catch (error) {
      toast({
        title: 'Erreur lors de la création du compte',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: 'Déconnexion réussie',
        description: 'À bientôt sur StockPro Manager'
      })
    } catch (error) {
      toast({
        title: 'Erreur lors de la déconnexion',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      
      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre email pour réinitialiser votre mot de passe'
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive'
      })
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
