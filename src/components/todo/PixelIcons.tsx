interface PixelIconProps {
  className?: string
}

const baseSvg = (children: React.ReactNode) => (props: PixelIconProps) => (
  <svg
    viewBox="0 0 8 8"
    shapeRendering="crispEdges"
    fill="currentColor"
    className={props.className}
    aria-hidden="true"
  >
    {children}
  </svg>
)

export const PixelClock = baseSvg(
  <>
    <rect x="1" y="0" width="6" height="1" />
    <rect x="0" y="1" width="8" height="6" />
    <rect x="1" y="7" width="6" height="1" />
    <rect x="4" y="2" width="1" height="2" fill="#fff" />
    <rect x="4" y="4" width="2" height="1" fill="#fff" />
  </>
)

export const PixelUser = baseSvg(
  <>
    <rect x="3" y="0" width="2" height="1" />
    <rect x="2" y="1" width="4" height="3" />
    <rect x="1" y="4" width="6" height="1" />
    <rect x="0" y="5" width="8" height="3" />
  </>
)

export const PixelCheck = baseSvg(
  <>
    <rect x="6" y="2" width="1" height="1" />
    <rect x="5" y="3" width="1" height="1" />
    <rect x="4" y="4" width="1" height="1" />
    <rect x="3" y="5" width="1" height="1" />
    <rect x="2" y="6" width="1" height="1" />
    <rect x="1" y="5" width="1" height="1" />
    <rect x="0" y="4" width="1" height="1" />
  </>
)

export const PixelMore = baseSvg(
  <>
    <rect x="1" y="3" width="1" height="2" />
    <rect x="4" y="3" width="1" height="2" />
    <rect x="7" y="3" width="1" height="2" />
  </>
)

export const PixelPlus = baseSvg(
  <>
    <rect x="3" y="0" width="2" height="2" />
    <rect x="3" y="3" width="2" height="2" />
    <rect x="3" y="6" width="2" height="2" />
    <rect x="0" y="3" width="2" height="2" />
    <rect x="6" y="3" width="2" height="2" />
  </>
)

export const PixelCoin = baseSvg(
  <>
    <rect x="2" y="0" width="4" height="1" />
    <rect x="1" y="1" width="6" height="1" />
    <rect x="0" y="2" width="8" height="4" />
    <rect x="1" y="6" width="6" height="1" />
    <rect x="2" y="7" width="4" height="1" />
    <rect x="3" y="3" width="2" height="2" fill="#fff" />
  </>
)
