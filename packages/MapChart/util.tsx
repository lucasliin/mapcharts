import {
  Au,
  Br,
  Ca,
  De,
  Es,
  Eu,
  Fr,
  Gb,
  Id,
  It,
  Jp,
  Ke,
  Kr,
  Mx,
  Ng,
  Ph,
  Ua,
  Us,
  Za,
} from "./Icons";

export const INCREASE = 4;

export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  sider: number,
  x: number,
  y: number,
  angleOffset?: number
) => {
  ctx.beginPath();
  for (let i = 0; i < sider; i++) {
    const angle = (i * 2 * Math.PI) / sider + (angleOffset ?? 0);
    const xx = x + 3 * INCREASE * Math.cos(angle);
    const yy = y + 3 * INCREASE * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(xx, yy);
    } else {
      ctx.lineTo(xx, yy);
    }
  }
  ctx.closePath();
};

export const flagMap: Record<string, React.ReactNode> = {
  US: <Us />,
  Canada: <Ca />,
  Europe: <Eu />,
  Ukraine: <Ua />,
  UK: <Gb />,
  Australia: <Au />,
  Japan: <Jp />,
  France: <Fr />,
  Spain: <Es />,
  Germany: <De />,
  Italy: <It />,
  Korea: <Kr />,
  Philippines: <Ph />,
  Indonesia: <Id />,
  Nigeria: <Ng />,
  SouthAfrica: <Za />,
  Kenya: <Ke />,
  Brazil: <Br />,
  Mexico: <Mx />,
};
