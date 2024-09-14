import React, { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { worldData } from "./worldData";

const INCREASE = 4; //- 提高分辨率 放大 4 倍， 4k 分辨率： 3,840 x 2,160；
const CANVAS_OFFSET = 5; //- 画布偏移量
const SHAPE_SIZE = 5; //- 图形尺寸，在正方形时是宽高，其他图形为半径（中心点到顶点的距离）

export interface MapChartProps {
  enableZoom?: boolean;
  enablePan?: boolean;
  enablePin?: boolean;
  enableAction?: boolean;
  defaultPin?: [number, number][];
  defaultAction?: number[];
  logPosition?: boolean;
  nodeShape?: string;
}

const MapChart: React.FC<MapChartProps> = (props) => {
  const {
    enableZoom = false,
    enablePan = false,
    enablePin,
    enableAction,
    defaultPin,
    nodeShape = "2",
    defaultAction,
    logPosition,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  //- 控制鼠标滑轮放大
  const [scale, setScale] = useState(1);
  //- 控制拖拽偏移量
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  //- 判断是否处于拖拽状态
  const [dragging, setDragging] = useState(false);
  //- 记录鼠标位置
  const [start, setStart] = useState({ x: 0, y: 0 });

  //- 地图位置信息
  const [data, setData] = useState(worldData);
  //- 标记位置信息
  const [pinPosition, setPinPosition] = useImmer<[number, number][]>([]);

  const drawShape2 = (
    ctx: CanvasRenderingContext2D,
    sider: number,
    x: number,
    y: number,
    angleOffset?: number
  ) => {
    ctx.beginPath();
    for (let i = 0; i < sider; i++) {
      const angle = (i * 2 * Math.PI) / sider + (angleOffset ?? 0); // 计算每个顶点的角度
      const xx = x + 3 * INCREASE * Math.cos(angle); // 计算顶点的 x 坐标
      const yy = y + 3 * INCREASE * Math.sin(angle); // 计算顶点的 y 坐标
      if (i === 0) {
        ctx.moveTo(xx, yy); // 移动到第一个顶点
      } else {
        ctx.lineTo(xx, yy); // 连接到下一个顶点
      }
    }
    ctx.closePath(); // 闭合路径

    return;
  };

  const drawShape = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isHighLight?: boolean
  ) => {
    if (nodeShape === "1") {
      ctx.beginPath();
      ctx.arc(x, y, 3 * INCREASE, 0, Math.PI * 2);
      ctx.closePath();
    } else if (nodeShape === "2") {
      ctx.fillStyle = isHighLight ? "#F59506" : "#4C4640";
      ctx.fillRect(x, y, SHAPE_SIZE * INCREASE, SHAPE_SIZE * INCREASE);
      return;
    } else if (nodeShape === "3" || nodeShape === "5") {
      drawShape2(ctx, parseInt(nodeShape), x, y, -Math.PI / 2);
    } else if (nodeShape === "4") {
      drawShape2(ctx, 4, x, y);
    } else if (nodeShape === "6") {
      drawShape2(ctx, 6, x, y, 10);
    }
    ctx.fillStyle = isHighLight ? "#F59506" : "#4C4640";
    ctx.fill();
  };

  //* 画布修改
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 保存当前状态
    ctx.save();

    // 应用缩放和平移
    ctx.scale(scale, scale);
    ctx.translate(Math.min(0, offset.x), Math.min(0, offset.y));

    data.forEach(({ x, y, isHighLight }) => {
      drawShape(
        ctx,
        (Math.floor(x) + CANVAS_OFFSET) * INCREASE,
        (Math.floor(y) + CANVAS_OFFSET) * INCREASE,
        isHighLight
      );
    });

    // 恢复到原始状态
    ctx.restore();
  }, [scale, offset, data, nodeShape]);

  useEffect(() => {
    if (!defaultAction || defaultAction.length == 0) return;
    setData(
      worldData.map((item, index) => ({
        ...item,
        isHighLight: defaultAction.includes(index),
      }))
    );
  }, [defaultAction]);

  useEffect(() => {
    canvasRef.current?.addEventListener(
      "wheel",
      (ev) => {
        // if (!enableZoom) return;
        ev.preventDefault();

        const scaleAmount = 0.1;
        const newScale =
          ev.deltaY > 0 ? scale - scaleAmount : scale + scaleAmount;
        // console.log(newScale);
        setScale(Math.max(0.1, Math.min(newScale, 5)));
      },
      {
        passive: false,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!enablePan) return;
    setDragging(true);
    setStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!enablePan) return;
    if (dragging) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;

      setOffset((prevOffset) => ({
        x: prevOffset.x + dx / scale,
        y: prevOffset.y + dy / scale,
      }));

      setStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    if (!enablePan) return;
    setDragging(false);
  };

  //* 点击高亮元素，alt + 点击 添加 pin
  const handleCanvasClick = (event: React.MouseEvent) => {
    if (dragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;

    const offsetX = ((mouseX / canvasRect.width) * 4016) / INCREASE / scale;
    const offsetY = ((mouseY / canvasRect.height) * 2160) / INCREASE / scale;

    if (logPosition) {
      console.log(`mouse position is: [${mouseX}, ${mouseY}]`);
    }

    if (event.altKey) {
      if (!enablePin) return;
      setPinPosition((draft) => {
        draft.push([mouseX, mouseY]);
      });
    } else {
      if (!enableAction) return;
      const newRectangles = data.map((rect, index) => {
        let positionX = [rect.x, rect.x + SHAPE_SIZE];
        let positionY = [rect.y, rect.y + SHAPE_SIZE];

        if (nodeShape !== "2") {
          positionX = [rect.x - SHAPE_SIZE / 2, rect.x + SHAPE_SIZE / 2];
          positionY = [rect.y - SHAPE_SIZE / 2, rect.y + SHAPE_SIZE / 2];
        }
        const targetNode =
          offsetX >= positionX[0] + CANVAS_OFFSET &&
          offsetX <= positionX[1] + CANVAS_OFFSET &&
          offsetY >= positionY[0] + CANVAS_OFFSET &&
          offsetY <= positionY[1] + CANVAS_OFFSET;
        if (targetNode) {
          if (logPosition) {
            console.log(
              `rect active! id = ${index} , position = [${rect.x}, ${rect.y}]`
            );
          }
          return { ...rect, isHighLight: !rect.isHighLight };
        } else return rect;
      });
      setData(newRectangles);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {pinPosition?.map(([x, y], i) => (
        <div
          key={`${x}-${y}`}
          style={{ left: x, top: y }}
          onClick={(ev) => {
            ev.stopPropagation();
            setPinPosition((draft) => {
              draft.splice(i, 1);
            });
          }}
          className="absolute -translate-x-1/2 -translate-y-full hover:scale-110"
        >
          <svg
            width="30"
            height="44"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#F59506"
              d="m29.29,14.89q0,7.87 -14.3,28.94q-14.29,-21.07 -14.29,-28.94c0,-7.88 6.4,-14.26 14.29,-14.26c7.9,0 14.3,6.38 14.3,14.26z"
            />
            <ellipse rx="7.06" ry="7.06" cx="14.82" cy="14.75" fill="#FFF8F4" />
          </svg>
        </div>
      ))}
      <canvas
        width={1004 * INCREASE}
        height={540 * INCREASE}
        ref={canvasRef}
        className="w-full h-full"
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};

export default MapChart;
