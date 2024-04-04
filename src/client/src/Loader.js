import { useEffect, useRef } from "react"
import { useLoading } from "./hooks/hooks"

export const Loader = () => {
  const interval = useRef(null);
  const [text, setText] = useLoading(interval, '');

  useEffect(() => {
    const i = interval.current;
    setText('...');

    return () => clearInterval(i);
  }, [setText]);

  return (
    <div className="main__loader">
      <h1>{text}</h1>
    </div>
  )
}