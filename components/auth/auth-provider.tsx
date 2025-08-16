// "use client"

// import { createContext, useContext, useEffect, useState } from 'react'
// import { User } from '@supabase/supabase-js'
// import { supabase } from '@/lib/supabase'
// import { getProfile } from '@/lib/auth'
// import { Database } from '@/lib/supabase'

// type Profile = Database['public']['Tables']['profiles']['Row']

// interface AuthContextType {
//   user: User | null
//   profile: Profile | null
//   loading: boolean
//   signOut: () => Promise<void>
//   refreshProfile: () => Promise<void>
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [profile, setProfile] = useState<Profile | null>(null)
//   const [loading, setLoading] = useState(true)

//   const refreshProfile = async () => {
//     if (user) {
//       try {
//         const userProfile = await getProfile(user.id)
//         setProfile(userProfile)
//       } catch (error) {
//         console.error('Error refreshing profile:', error)
//         setProfile(null)
//       }
//     }
//   }

//   useEffect(() => {
//     let mounted = true

//     // Get initial session
//     const getInitialSession = async () => {
//       try {
//         const { data: { session }, error } = await supabase.auth.getSession()
        
//         if (error) {
//           console.error('Error getting session:', error)
//           if (mounted) {
//             setUser(null)
//             setProfile(null)
//             setLoading(false)
//           }
//           return
//         }

//         if (mounted) {
//           setUser(session?.user ?? null)
          
//           if (session?.user) {
//             try {
//               const userProfile = await getProfile(session.user.id)
//               if (mounted) {
//                 setProfile(userProfile)
//               }
//             } catch (error) {
//               console.error('Error getting profile:', error)
//               if (mounted) {
//                 setProfile(null)
//               }
//             }
//           }
          
//           setLoading(false)
//         }
//       } catch (error) {
//         console.error('Error in getInitialSession:', error)
//         if (mounted) {
//           setUser(null)
//           setProfile(null)
//           setLoading(false)
//         }
//       }
//     }

//     getInitialSession()

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         if (!mounted) return

//         try {
//           setUser(session?.user ?? null)
          
//           if (session?.user) {
//             const userProfile = await getProfile(session.user.id)
//             if (mounted) {
//               setProfile(userProfile)
//             }
//           } else {
//             if (mounted) {
//               setProfile(null)
//             }
//           }
          
//           if (mounted) {
//             setLoading(false)
//           }
//         } catch (error) {
//           console.error('Error in auth state change:', error)
//           if (mounted) {
//             setProfile(null)
//             setLoading(false)
//           }
//         }
//       }
//     )

//     return () => {
//       mounted = false
//       subscription.unsubscribe()
//     }
//   }, [])

//   const signOut = async () => {
//     try {
//       await supabase.auth.signOut()
//       setUser(null)
//       setProfile(null)
//     } catch (error) {
//       console.error('Error signing out:', error)
//     }
//   }

//   return (
//     <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/auth";
import { Database } from "@/lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const userProfile = await getProfile(user.id);
      setProfile(userProfile);
    } catch (err) {
      console.error("Error refreshing profile:", err);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // ✅ load initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error("Error getting session:", error);
        setUser(null);
        setProfile(null);
      } else {
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const userProfile = await getProfile(session.user.id);
            if (mounted) setProfile(userProfile);
          } catch (err) {
            console.error("Error loading profile:", err);
            if (mounted) setProfile(null);
          }
        }
      }
      setLoading(false);
    });

    // ✅ listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);

        if (session?.user) {
          const userProfile = await getProfile(session.user.id);
          if (mounted) setProfile(userProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
