import { useState } from "react"

const MAXVALUE = 100_000;
export const useComponentForceRerender = () => {
  const [state, setState] = useState(0);
  const rerender = () => setState(previousValue => ++previousValue % MAXVALUE);
  (rerender as any).state = state;
  return rerender;
}