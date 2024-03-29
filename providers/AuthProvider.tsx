import { useMe } from "@/hooks/useMe"
import { authenticatedStatusAtom } from "@/lib/atom"
import { useAtom } from "jotai"
import { useEffect } from "react"
import { useAccount } from "wagmi"

const AuthProvider = () => {
    const { isConnected } = useAccount()
    const [authenticated, setAuthenticated] = useAtom(authenticatedStatusAtom)
    const {refetch} = useMe()
  
    useEffect(() => {
      if (isConnected && localStorage.getItem('token')) {
        setAuthenticated('authenticated')
        refetch()
      } else {
        setAuthenticated("unauthenticated")
      }
    }, [isConnected])

    return null
}

export default AuthProvider