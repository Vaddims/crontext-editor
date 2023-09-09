import { useState } from "react"

export const useComponentForceRerender = () => {
  const [state, setState] = useState(false);
  const rerender = () => setState(previousValue => !previousValue);
  (rerender as any).state = state;
  return rerender;
}