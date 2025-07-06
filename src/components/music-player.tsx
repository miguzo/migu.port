"use client"

interface MusicPlayerProps {
  src: string
  title: string
  description?: string
  image?: string
}

export function MusicPlayer({ src, title, description }: MusicPlayerProps) {
  return (
    <div className="w-full max-w-sm sm:max-w-md p-4 bg-white rounded-xl shadow space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      <audio controls className="w-full rounded">
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}
