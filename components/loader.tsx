'use client'

import { useEffect, useRef } from 'react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Loader({ size = 'md', className = '' }: LoaderProps) {
  const pathRefs = useRef<(SVGPathElement | SVGCircleElement | null)[]>([])

  useEffect(() => {
    pathRefs.current.forEach((path) => {
      if (path) {
        const length = path.getTotalLength()
        path.style.setProperty('--path-length', String(length))
      }
    })
  }, [])

  const sizeClasses = {
    sm: 'w-16 h-8',
    md: 'w-24 h-12',
    lg: 'w-32 h-16',
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
            @keyframes draw {
              0% { stroke-dashoffset: var(--path-length); }
              100% { stroke-dashoffset: 0; }
            }
            .interwoven-path {
              fill: none;
              stroke: currentColor;
              stroke-width: 6;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-dasharray: var(--path-length);
              stroke-dashoffset: var(--path-length);
              animation: draw 1.5s ease-in-out infinite alternate;
            }
            .path-1 { animation-delay: 0s; }
            .path-2 { animation-delay: 0.15s; }
            .path-3 { animation-delay: 0.3s; }
            .path-4 { animation-delay: 0.45s; }
            .path-5 { animation-delay: 0.6s; }
          `}
        </style>
        <path
          ref={(el) => { pathRefs.current[0] = el }}
          className="interwoven-path path-1"
          d="M 140 30 L 155 90 L 170 30 L 185 90 L 200 30"
        />
        <path
          ref={(el) => { pathRefs.current[1] = el }}
          className="interwoven-path path-2"
          d="M 85 30 L 85 90 M 85 30 L 115 30 A 15 15 0 0 1 115 60 L 85 60"
        />
        <path
          ref={(el) => { pathRefs.current[2] = el }}
          className="interwoven-path path-3"
          d="M 20 30 L 60 90"
        />
        <path
          ref={(el) => { pathRefs.current[3] = el }}
          className="interwoven-path path-4"
          d="M 60 30 L 20 90"
        />
        <path
          ref={(el) => { pathRefs.current[4] = el }}
          className="interwoven-path path-5"
          d="M 115 60 L 130 90"
        />
        <circle
          ref={(el) => { pathRefs.current[5] = el }}
          className="interwoven-path path-5"
          cx="72"
          cy="80"
          r="5"
        />
      </svg>
    </div>
  )
}
