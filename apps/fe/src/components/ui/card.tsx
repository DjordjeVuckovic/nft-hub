import { ReactNode } from 'react'

interface CardProps {
  title: string
  description: string
  children?: ReactNode
  className?: string
}

export default function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={`bg-card border border-border rounded-lg p-6 hover:bg-card/80 transition-colors flex flex-col h-full ${className}`}>
      <h3 className="text-xl font-semibold mb-3 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground mb-4 flex-grow">{description}</p>
      {children && (
        <div className="mt-auto">
          {children}
        </div>
      )}
    </div>
  )
}