import { type ReactNode } from 'react'
import Card from './card'

interface StepCardProps {
  title: string
  description: string
  children?: ReactNode
  className?: string
  number: string
  isCompleted?: boolean
}

export default function StepCard({ title, description, children, className = '', number, isCompleted = false }: StepCardProps) {
  return (
    <div className="relative">
      <Card title={title} description={description} className={`relative overflow-hidden ${className}`}>
        {children}
      </Card>
      <div className="absolute top-[-10px] right-0 pointer-events-none">
        <div className="relative">
          <span className={`text-7xl font-mono font-black select-none leading-none block ${
            isCompleted ? 'text-green-500/20' : 'text-primary/10'
          }`}>
            {number}
          </span>
          <div className="absolute inset-0">
            <span className={`text-7xl font-mono font-black bg-clip-text text-transparent leading-none block ${
              isCompleted 
                ? 'bg-gradient-to-br from-green-400/60 via-emerald-500/50 to-green-600/40' 
                : 'bg-gradient-to-br from-primary/40 via-blue-500/30 to-purple-500/20'
            }`}>
              {number}
            </span>
          </div>
          <div className="absolute inset-0">
            <span className={`text-7xl font-mono font-black bg-clip-text text-transparent leading-none block ${
              isCompleted
                ? 'bg-gradient-to-tl from-emerald-400/30 to-green-300/25'
                : 'bg-gradient-to-tl from-cyan-400/20 to-emerald-400/15'
            }`}>
              {number}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}