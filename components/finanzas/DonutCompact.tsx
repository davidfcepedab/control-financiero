"use client"

interface Props {
  fixedPct: number
  variablePct: number
}

export default function DonutCompact({ fixedPct, variablePct }: Props) {
  const fixedAngle = (fixedPct / 100) * 360

  const conic = `conic-gradient(
    from 0deg,
    rgb(225, 29, 72) 0deg ${fixedAngle}deg,
    rgb(59, 130, 246) ${fixedAngle}deg 360deg
  )`

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-center"
        style={{ background: conic }}
      >
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
          <span className="text-xs font-bold text-slate-700">
            {fixedPct}% /<br />
            {variablePct}%
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-slate-600">Fijo</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-slate-600">Variable</span>
        </div>
      </div>
    </div>
  )
}
