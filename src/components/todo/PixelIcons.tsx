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

export const PixelHome = baseSvg(
  <>
    <rect x="0" y="3" width="1" height="1" />
    <rect x="1" y="2" width="1" height="1" />
    <rect x="2" y="1" width="1" height="1" />
    <rect x="3" y="0" width="2" height="1" />
    <rect x="5" y="1" width="1" height="1" />
    <rect x="6" y="2" width="1" height="1" />
    <rect x="7" y="3" width="1" height="1" />
    <rect x="0" y="4" width="8" height="4" />
    <rect x="3" y="5" width="2" height="3" fill="#fff" />
  </>
)

export const PixelGrid = baseSvg(
  <>
    <rect x="0" y="0" width="3" height="3" />
    <rect x="5" y="0" width="3" height="3" />
    <rect x="0" y="5" width="3" height="3" />
    <rect x="5" y="5" width="3" height="3" />
  </>
)

export const PixelList = baseSvg(
  <>
    <rect x="0" y="0" width="2" height="2" />
    <rect x="0" y="3" width="2" height="2" />
    <rect x="0" y="6" width="2" height="2" />
    <rect x="3" y="0" width="5" height="2" />
    <rect x="3" y="3" width="5" height="2" />
    <rect x="3" y="6" width="5" height="2" />
  </>
)

export const PixelCal = baseSvg(
  <>
    <rect x="1" y="0" width="2" height="2" />
    <rect x="5" y="0" width="2" height="2" />
    <rect x="0" y="2" width="8" height="1" />
    <rect x="0" y="3" width="8" height="5" />
    <rect x="2" y="5" width="1" height="1" fill="#fff" />
    <rect x="4" y="5" width="1" height="1" fill="#fff" />
    <rect x="6" y="5" width="1" height="1" fill="#fff" />
    <rect x="2" y="7" width="1" height="1" fill="#fff" />
    <rect x="4" y="7" width="1" height="1" fill="#fff" />
  </>
)

export const PixelCheck2 = baseSvg(
  <>
    <rect x="0" y="0" width="8" height="8" fill="#fff" />
    <rect x="6" y="2" width="1" height="1" />
    <rect x="5" y="3" width="1" height="1" />
    <rect x="4" y="4" width="1" height="1" />
    <rect x="3" y="5" width="1" height="1" />
    <rect x="2" y="6" width="1" height="1" />
    <rect x="1" y="5" width="1" height="1" />
  </>
)

export const PixelX = baseSvg(
  <>
    <rect x="0" y="0" width="2" height="2" />
    <rect x="6" y="0" width="2" height="2" />
    <rect x="0" y="6" width="2" height="2" />
    <rect x="6" y="6" width="2" height="2" />
    <rect x="2" y="2" width="2" height="2" />
    <rect x="4" y="2" width="2" height="2" />
    <rect x="2" y="4" width="2" height="2" />
    <rect x="4" y="4" width="2" height="2" />
  </>
)

export const PixelTrophy = baseSvg(
  <>
    <rect x="2" y="0" width="4" height="1" />
    <rect x="1" y="1" width="6" height="3" />
    <rect x="0" y="1" width="1" height="2" />
    <rect x="7" y="1" width="1" height="2" />
    <rect x="2" y="4" width="4" height="1" />
    <rect x="3" y="5" width="2" height="1" />
    <rect x="2" y="6" width="4" height="1" />
    <rect x="1" y="7" width="6" height="1" />
    <rect x="3" y="2" width="2" height="1" fill="#fff" />
  </>
)

export const PixelDownload = baseSvg(
  <>
    <rect x="3" y="0" width="2" height="4" />
    <rect x="1" y="3" width="2" height="1" />
    <rect x="5" y="3" width="2" height="1" />
    <rect x="2" y="2" width="1" height="1" />
    <rect x="5" y="2" width="1" height="1" />
    <rect x="0" y="6" width="8" height="1" />
    <rect x="0" y="7" width="8" height="1" />
  </>
)

export const PixelUpload = baseSvg(
  <>
    <rect x="3" y="3" width="2" height="4" />
    <rect x="1" y="4" width="2" height="1" />
    <rect x="5" y="4" width="2" height="1" />
    <rect x="2" y="5" width="1" height="1" />
    <rect x="5" y="5" width="1" height="1" />
    <rect x="2" y="0" width="1" height="1" />
    <rect x="5" y="0" width="1" height="1" />
    <rect x="3" y="0" width="2" height="2" />
    <rect x="0" y="6" width="8" height="1" />
    <rect x="0" y="7" width="8" height="1" />
  </>
)

export const PixelGear = baseSvg(
  <>
    <rect x="3" y="0" width="2" height="2" />
    <rect x="3" y="6" width="2" height="2" />
    <rect x="0" y="3" width="2" height="2" />
    <rect x="6" y="3" width="2" height="2" />
    <rect x="1" y="1" width="2" height="2" />
    <rect x="5" y="1" width="2" height="2" />
    <rect x="1" y="5" width="2" height="2" />
    <rect x="5" y="5" width="2" height="2" />
    <rect x="2" y="2" width="4" height="4" fill="#fff" />
    <rect x="3" y="3" width="2" height="2" />
  </>
)

export const PixelWarn = baseSvg(
  <>
    <rect x="3" y="0" width="2" height="1" />
    <rect x="2" y="1" width="4" height="1" />
    <rect x="1" y="2" width="6" height="3" />
    <rect x="0" y="5" width="8" height="2" />
    <rect x="3" y="7" width="2" height="1" />
    <rect x="3" y="3" width="2" height="2" fill="#fff" />
  </>
)

export const PixelSpark = baseSvg(
  <>
    <rect x="3" y="0" width="2" height="2" />
    <rect x="2" y="2" width="1" height="1" />
    <rect x="5" y="2" width="1" height="1" />
    <rect x="1" y="3" width="6" height="2" />
    <rect x="2" y="5" width="1" height="1" />
    <rect x="5" y="5" width="1" height="1" />
    <rect x="3" y="6" width="2" height="2" />
  </>
)

export const PixelEye = baseSvg(
  <>
    <rect x="0" y="2" width="2" height="4" />
    <rect x="2" y="3" width="1" height="2" />
    <rect x="6" y="2" width="2" height="4" />
    <rect x="5" y="3" width="1" height="2" />
    <rect x="3" y="3" width="2" height="2" fill="#fff" />
    <rect x="3" y="4" width="2" height="1" />
  </>
)

export const PixelEyeOff = baseSvg(
  <>
    <rect x="0" y="2" width="2" height="4" />
    <rect x="2" y="3" width="1" height="2" />
    <rect x="6" y="2" width="2" height="4" />
    <rect x="5" y="3" width="1" height="2" />
    <rect x="3" y="3" width="2" height="2" fill="#fff" />
    <rect x="0" y="0" width="2" height="1" />
    <rect x="2" y="1" width="2" height="1" />
    <rect x="4" y="2" width="2" height="1" />
    <rect x="6" y="3" width="2" height="1" />
    <rect x="6" y="6" width="2" height="1" />
    <rect x="4" y="5" width="2" height="1" />
  </>
)

export const PixelXClose = PixelX

export const PixelFlame = baseSvg(
  <>
    <rect x="3" y="0" width="2" height="1" />
    <rect x="2" y="1" width="4" height="1" />
    <rect x="1" y="2" width="2" height="2" />
    <rect x="5" y="2" width="2" height="2" />
    <rect x="2" y="2" width="4" height="2" fill="#fff" />
    <rect x="2" y="4" width="4" height="2" />
    <rect x="1" y="4" width="1" height="2" />
    <rect x="6" y="4" width="1" height="2" />
    <rect x="2" y="6" width="4" height="1" />
    <rect x="3" y="7" width="2" height="1" />
    <rect x="3" y="5" width="2" height="1" fill="#fff" />
  </>
)

export const PixelTarget = baseSvg(
  <>
    <rect x="0" y="2" width="8" height="4" />
    <rect x="2" y="0" width="4" height="2" />
    <rect x="2" y="6" width="4" height="2" />
    <rect x="2" y="2" width="4" height="4" fill="#fff" />
    <rect x="3" y="3" width="2" height="2" />
  </>
)

export const PixelTrending = baseSvg(
  <>
    <rect x="0" y="6" width="2" height="2" />
    <rect x="2" y="4" width="2" height="2" />
    <rect x="4" y="2" width="2" height="2" />
    <rect x="6" y="0" width="2" height="2" />
    <rect x="0" y="6" width="8" height="1" fill="#fff" />
    <rect x="0" y="6" width="2" height="2" />
    <rect x="2" y="4" width="2" height="2" />
    <rect x="4" y="2" width="2" height="2" />
    <rect x="6" y="0" width="2" height="2" />
  </>
)

export const PixelChevron = baseSvg(
  <>
    <rect x="5" y="2" width="1" height="1" />
    <rect x="6" y="3" width="1" height="1" />
    <rect x="5" y="4" width="1" height="1" />
    <rect x="4" y="5" width="1" height="1" />
  </>
)

export const PixelChevronLeft = baseSvg(
  <>
    <rect x="2" y="2" width="1" height="1" />
    <rect x="1" y="3" width="1" height="1" />
    <rect x="2" y="4" width="1" height="1" />
    <rect x="3" y="5" width="1" height="1" />
  </>
)

export const PixelArrowLeft = baseSvg(
  <>
    <rect x="0" y="3" width="2" height="2" />
    <rect x="2" y="2" width="1" height="1" />
    <rect x="2" y="5" width="1" height="1" />
    <rect x="3" y="1" width="1" height="1" />
    <rect x="3" y="6" width="1" height="1" />
    <rect x="3" y="3" width="5" height="2" />
  </>
)

export const PixelStar = baseSvg(
  <>
    <rect x="3" y="0" width="2" height="1" />
    <rect x="2" y="1" width="1" height="1" />
    <rect x="5" y="1" width="1" height="1" />
    <rect x="1" y="2" width="6" height="1" />
    <rect x="0" y="3" width="8" height="1" />
    <rect x="1" y="4" width="6" height="1" />
    <rect x="2" y="5" width="1" height="1" />
    <rect x="5" y="5" width="1" height="1" />
    <rect x="2" y="6" width="1" height="1" />
    <rect x="5" y="6" width="1" height="1" />
    <rect x="1" y="7" width="1" height="1" />
    <rect x="6" y="7" width="1" height="1" />
  </>
)
