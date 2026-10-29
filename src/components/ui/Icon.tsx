import type { SVGProps } from 'react'

const PATHS = {
  bag: ['M6 7h12l1 13H5L6 7z', 'M9 7a3 3 0 0 1 6 0'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z', 'M20 20l-4-4'],
  x: ['M6 6l12 12', 'M18 6L6 18'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  copy: ['M9 9h11v11H9z', 'M5 15V4h10'],
  truck: ['M3 6h11v10H3z', 'M14 10h4l3 3v3h-7', 'M7 18.5a1.5 1.5 0 1 0 0-.01', 'M17 18.5a1.5 1.5 0 1 0 0-.01'],
  store: ['M4 9l1.5-5h13L20 9', 'M4 9v11h16V9', 'M9 20v-6h6v6', 'M4 9a2.67 2.67 0 0 0 5.33 0 2.67 2.67 0 0 0 5.34 0A2.67 2.67 0 0 0 20 9'],
  card: ['M3 6h18v12H3z', 'M3 10h18'],
  bolt: ['M13 2L4 14h7l-1 8 9-12h-7l1-8z'],
  star: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z'],
  whatsapp: [
    'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z',
    'M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2L9 8.5z',
  ],
  instagram: ['M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M17.5 6.5v.01'],
  mail: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'],
  pin: ['M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z', 'M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 2'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z', 'M9 12l2 2 4-4'],
  chat: ['M4 5h16v11H9l-5 4V5z'],
  box: ['M3 7l9-4 9 4v10l-9 4-9-4V7z', 'M3 7l9 4 9-4', 'M12 11v10'],
  logout: ['M10 4H5v16h5', 'M15 8l4 4-4 4', 'M19 12H9'],
  grid: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
  tag: ['M3 12V3h9l9 9-9 9-9-9z', 'M7.5 7.5v.01'],
  users: ['M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5', 'M16 4.5a3.2 3.2 0 0 1 0 6', 'M18 14.8c1.8.6 3 2.4 3.4 5.2'],
  tools: ['M14.5 6.5a4 4 0 0 0 5 5L10 21l-3-3 9.5-9.5', 'M7 18l-3 3', 'M14.5 6.5l3-3 3 3-3 3'],
  edit: ['M4 20h4L19 9l-4-4L4 16v4z', 'M13 7l4 4'],
  download: ['M12 4v11', 'M7 11l5 5 5-5', 'M5 20h14'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'],
  eyeoff: ['M3 3l18 18', 'M10.6 6.1A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.8', 'M6.5 7.5C3.8 9.3 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.5 4.5-1.2'],
  image: ['M3 5h18v14H3z', 'M3 16l5-5 4 4 3-3 6 6', 'M8.5 9.5v.01'],
  trend: ['M3 17l6-6 4 4 8-9', 'M15 6h6v6'],
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2.5v2', 'M12 19.5v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2.5 12h2', 'M19.5 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  share: ['M12 15V3.5', 'M7.5 8L12 3.5 16.5 8', 'M5 12.5V20h14v-7.5'],
  moon: ['M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z'],
  alert: ['M12 4l9.5 16h-19L12 4z', 'M12 10v4', 'M12 17.5v.01'],
  receipt: ['M6 3h12v18l-3-2-3 2-3-2-3 2V3z', 'M9 8h6', 'M9 12h6'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v6H4V6h6'],
  refresh: ['M20 11a8 8 0 0 0-14.5-4.5L4 8', 'M4 4v4h4', 'M4 13a8 8 0 0 0 14.5 4.5L20 16', 'M20 20v-4h-4'],
} as const

export type IconName = keyof typeof PATHS

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
  filled?: boolean
}

export function Icon({ name, size = 20, filled = false, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
