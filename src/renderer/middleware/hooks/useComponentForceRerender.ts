import { useState } from "react"

export const useComponentForceRerender = () => {
  const [, setState] = useState(false);
  return () => setState(previousValue => !previousValue);
}