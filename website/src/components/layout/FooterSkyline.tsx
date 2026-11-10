// Property line-art: small home → guest house → hotel → resort palms → high-rise.
// Pure SVG, low opacity, decorative only.
export function FooterSkyline({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1200 180" preserveAspectRatio="xMidYMax meet" className={className}
      fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* ground */}
      <path d="M0 176H1200" />
      {/* small home */}
      <path d="M60 176V128L100 98L140 128V176" /><path d="M88 176V148H112V176" /><path d="M70 136L100 112L130 136" />
      {/* guest house */}
      <path d="M190 176V110H300V176" /><path d="M180 112L245 72L310 112" />
      <path d="M205 126h22v18h-22zM263 126h22v18h-22zM234 150h22v26" />
      {/* hotel */}
      <path d="M360 176V62H500V176" /><path d="M360 62h140M392 62V46h76v16" /><path d="M408 38h44" />
      {[78, 100, 122, 144].map((y) => [378, 412, 446, 480].map((x) => <path key={`${x}-${y}`} d={`M${x} ${y}h12v12h-12z`} />))}
      {/* resort with palms */}
      <path d="M560 176V140H720V176" /><path d="M548 142L640 112L732 142" /><path d="M620 176V154H660V176" />
      <path d="M760 176C764 140 770 116 784 94" /><path d="M784 94C770 88 756 92 746 102M784 94C796 84 812 84 822 92M784 94C786 80 796 70 808 66M784 94C772 80 760 76 748 78" />
      <path d="M540 176C536 150 532 132 524 116" /><path d="M524 116C534 108 546 108 554 114M524 116C516 106 504 104 494 108M524 116C524 104 518 96 508 92" />
      <path d="M600 176c20-6 40-6 60 0" />
      {/* high-rise */}
      <path d="M880 176V30H970V176" /><path d="M925 30V10" /><path d="M990 176V70H1060V176" /><path d="M1080 176V110H1140V176" />
      {[44, 64, 84, 104, 124, 144].map((y) => [896, 920, 944].map((x) => <path key={`h${x}-${y}`} d={`M${x} ${y}h10v10h-10z`} />))}
      {[86, 110, 134].map((y) => [1006, 1034].map((x) => <path key={`m${x}-${y}`} d={`M${x} ${y}h10v12h-10z`} />))}
      <path d="M1094 126h12v10h-12zM1116 126h12v10h-12zM1094 148h12v10h-12zM1116 148h12v10h-12z" />
    </svg>
  )
}
