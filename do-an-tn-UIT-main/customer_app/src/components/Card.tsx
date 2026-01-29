import { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  title?: string
}

export const Card = ({ children, className = '', title, ...props }: CardProps) => {
  return (
    <div className={`card ${className}`} {...props}>
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>}
      {children}
    </div>
  )
}
