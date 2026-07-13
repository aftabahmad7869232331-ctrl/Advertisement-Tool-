import useCounter from "../../hooks/useCounter";
import useIntersection from "../../hooks/useIntersection";

type CountUpProps = { end: number; duration?: number; decimals?: number; suffix?: string; prefix?: string; className?: string };

export default function CountUp({ end, duration = 1400, decimals = 0, suffix = "", prefix = "", className = "" }: CountUpProps) {
  const { ref, isIntersecting } = useIntersection<HTMLSpanElement>({ threshold: 0.35 });
  const value = useCounter(end, duration, isIntersecting);
  return <span ref={ref} className={className}>{prefix}{value.toFixed(decimals)}{suffix}</span>;
}
