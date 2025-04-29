import * as React from "react";
import type { SVGProps } from "react";
const MoreOutlined = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx={5} cy={12} r={1.5} fill="#000" />
    <circle cx={12} cy={12} r={1.5} fill="#000" />
    <circle cx={19} cy={12} r={1.5} fill="#000" />
  </svg>
);
export default MoreOutlined;
