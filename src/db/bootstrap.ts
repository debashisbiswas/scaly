import { useEffect, useRef } from "react"

export function useLogDbBootStatus({
  success,
  error,
}: {
  success: boolean
  error: Error | undefined
}) {
  const hasLoggedDbBoot = useRef(false)

  useEffect(() => {
    if (hasLoggedDbBoot.current) {
      return
    }

    if (error) {
      console.error("[db] migrations failed:", error)
      hasLoggedDbBoot.current = true
      return
    }

    if (success) {
      console.log("[db] migrations applied successfully")
      hasLoggedDbBoot.current = true
    }
  }, [success, error])
}
