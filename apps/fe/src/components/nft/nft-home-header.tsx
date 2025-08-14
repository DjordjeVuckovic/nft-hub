import { Link } from 'react-router-dom'

interface NFTGalleryHeaderProps {
  title: string
  showViewAll?: boolean
}

export function NFTHomeHeader({ title, showViewAll = true }: NFTGalleryHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-card-foreground">{title}</h2>
      {showViewAll && (
        <Link 
          to="/gallery"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          View All →
        </Link>
      )}
    </div>
  )
}