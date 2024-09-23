import type { SVGProps } from "react";
const SvgEu = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 640 480"
    {...props}
  >
    <defs>
      <g id="eu_svg__d">
        <g id="eu_svg__b">
          <path id="eu_svg__a" d="m0-1-.3 1 .5.1z" />
          <use xlinkHref="#eu_svg__a" transform="scale(-1 1)" />
        </g>
        <g id="eu_svg__c">
          <use xlinkHref="#eu_svg__b" transform="rotate(72)" />
          <use xlinkHref="#eu_svg__b" transform="rotate(144)" />
        </g>
        <use xlinkHref="#eu_svg__c" transform="scale(-1 1)" />
      </g>
    </defs>
    <path fill="#039" d="M0 0h640v480H0z" />
    <g fill="#fc0" transform="translate(320 242.3)scale(23.7037)">
      <use xlinkHref="#eu_svg__d" width="100%" height="100%" y={-6} />
      <use xlinkHref="#eu_svg__d" width="100%" height="100%" y={6} />
      <g id="eu_svg__e">
        <use xlinkHref="#eu_svg__d" width="100%" height="100%" x={-6} />
        <use
          xlinkHref="#eu_svg__d"
          width="100%"
          height="100%"
          transform="rotate(-144 -2.3 -2.1)"
        />
        <use
          xlinkHref="#eu_svg__d"
          width="100%"
          height="100%"
          transform="rotate(144 -2.1 -2.3)"
        />
        <use
          xlinkHref="#eu_svg__d"
          width="100%"
          height="100%"
          transform="rotate(72 -4.7 -2)"
        />
        <use
          xlinkHref="#eu_svg__d"
          width="100%"
          height="100%"
          transform="rotate(72 -5 .5)"
        />
      </g>
      <use
        xlinkHref="#eu_svg__e"
        width="100%"
        height="100%"
        transform="scale(-1 1)"
      />
    </g>
  </svg>
);
export default SvgEu;
