/** //- 提高分辨率 放大 4 倍， 4k 分辨率： 3,840 x 2,160； */
export const INCREASE = 4;

/**
 * 绘制多边形
 * ctx： canvas 上下文
 * sider： 多边形的边数
 * x： 多边形的中心点 x 坐标
 * y： 多边形的中心点 y 坐标
 * angleOffset： 多边形的偏移角度
 */
export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  sider: number,
  x: number,
  y: number,
  angleOffset?: number
) => {
  ctx.beginPath();
  for (let i = 0; i < sider; i++) {
    //* 计算每个顶点的角度
    const angle = (i * 2 * Math.PI) / sider + (angleOffset ?? 0);
    //* 计算顶点的 x 坐标
    const xx = x + 3 * INCREASE * Math.cos(angle);
    //* 计算顶点的 y 坐标
    const yy = y + 3 * INCREASE * Math.sin(angle);
    if (i === 0) {
      //* 移动到第一个顶点
      ctx.moveTo(xx, yy);
    } else {
      //* 连接到下一个顶点
      ctx.lineTo(xx, yy);
    }
  }
  ctx.closePath();
};
