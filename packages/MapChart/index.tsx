import React, { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { worldData } from "./worldData";
import { drawPolygon, flagMap, INCREASE } from "./util";
import "./index.css";

const CANVAS_OFFSET = 5;
const SHAPE_SIZE = 5;
const MAX_ZOOM = 5;
const MIN_ZOOM = 1;
const ZOOM_RATIO = 0.05;

interface Pin {
  x: number;
  y: number;
  icon?: string;
  title?: string;
  country: string;
}

interface MapChartData {
  pins: Pin[];
  highlights: number[];
}

export interface MapChartProps {
  editable?: boolean;
  nodeShape?: string;
  baseColor?: string;
  enablePan?: boolean;
  enableZoom?: boolean;
  mapData?: MapChartData;
  highLightColor?: string;
  pinSVG?: React.ReactNode;
  onPinClick?: (pin: Pin) => void;
  onZoomChange?: (zoom: number) => void;
  defaultSelect?: string;
}

const MapChart: React.FC<MapChartProps> = (props) => {
  const {
    mapData,
    highLightColor = "#F59506",
    baseColor = "#4C4640",
    editable = true,
    nodeShape = "2",
    enableZoom,
    enablePan,
    pinSVG,
    onPinClick,
    onZoomChange,
    defaultSelect,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const translateRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(0);
  const clickThreshold = 5;
  const timeThreshold = 200;

  const [pointers, setPointers] = useState<React.PointerEvent[]>([]);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  const [data, setData] = useState(worldData);
  const [pinPosition, setPinPosition] = useImmer<Pin[]>([]);

  const [activePin, setActivePin] = useImmer<
    null | (Pin & { position: "left" | "right" })
  >(null);

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
      ctx.fillStyle = isHighLight ? highLightColor : baseColor;
      ctx.fillRect(
        x,
        y,
        SHAPE_SIZE * INCREASE * scale,
        SHAPE_SIZE * INCREASE * scale
      );
      return;
    } else if (nodeShape === "3" || nodeShape === "5") {
      drawPolygon(ctx, parseInt(nodeShape), x, y, -Math.PI / 2);
    } else if (nodeShape === "4") {
      drawPolygon(ctx, 4, x, y);
    } else if (nodeShape === "6") {
      drawPolygon(ctx, 6, x, y, 10);
    }
    ctx.fillStyle = isHighLight ? highLightColor : baseColor;
    ctx.fill();
  };

  const limitTranslate = (prevOffset: { x: number; y: number }) => {
    if (!canvasRef.current) return prevOffset;
    const maxTranslateX =
      canvasRef.current.width * scaleRef.current - canvasRef.current.width;
    const maxTranslateY =
      canvasRef.current.height * scaleRef.current - canvasRef.current.height;

    return {
      x: Math.min(0, Math.max(prevOffset.x, -maxTranslateX)),
      y: Math.min(0, Math.max(prevOffset.y, -maxTranslateY)),
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const tran = limitTranslate(translate);
    ctx.translate(tran.x, tran.y);

    data.forEach(({ x, y, isHighLight }) => {
      drawShape(
        ctx,
        (x + CANVAS_OFFSET) * INCREASE * scale,
        (y + CANVAS_OFFSET) * INCREASE * scale,
        isHighLight
      );
    });
    ctx.scale(scale, scale);
    ctx.restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, translate, data, nodeShape]);

  useEffect(() => {
    setData(
      worldData.map((item, index) => ({
        ...item,
        isHighLight: (mapData?.highlights ?? []).includes(index),
      }))
    );
    setPinPosition(mapData?.pins ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  function updateScale(plus?: boolean) {
    scaleRef.current = Math.max(
      MIN_ZOOM,
      Math.min(
        (plus
          ? scaleRef.current * 1000 - ZOOM_RATIO * 1000
          : scaleRef.current * 1000 + ZOOM_RATIO * 1000) / 1000,
        MAX_ZOOM
      )
    );

    if (scaleRef.current === 1) {
      canvasRef.current?.style.removeProperty("touch-action");
    } else {
      canvasRef.current?.style.setProperty("touch-action", "none");
    }
    setScale(scaleRef.current);
  }

  useEffect(() => {
    function onWheel(this: HTMLCanvasElement, ev: WheelEvent) {
      if (!editable && !enableZoom) return;
      ev.preventDefault();
      updateScale(ev.deltaY > 0);
      if (!canvasRef.current) return;
      const maxTranslateX =
        canvasRef.current.width * scaleRef.current - canvasRef.current.width;
      const maxTranslateY =
        canvasRef.current.height * scaleRef.current - canvasRef.current.height;

      if (
        translateRef.current.x < -maxTranslateX ||
        translateRef.current.y < -maxTranslateY
      ) {
        translateRef.current = limitTranslate({
          x: translateRef.current.x,
          y: translateRef.current.y,
        });
        setTranslate(translateRef.current);
      }
    }
    const canvasDom = canvasRef.current;
    if (!canvasDom) return;
    canvasDom.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvasDom.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, editable, enableZoom]);

  useEffect(() => {
    if (!onZoomChange) return;
    onZoomChange(scale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  useEffect(() => {
    setTimeout(() => {
      if (!defaultSelect) return;
      const pin = mapData?.pins.find(
        (v) => v.country.toLowerCase() === defaultSelect.toLowerCase()
      );
      if (!pin) return;
      setActivePin({ ...pin, position: pin.x > 70 ? "left" : "right" });
    }, 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSelect]);

  const handleMouseDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editable && !enablePan) return;
    if (scale === 1) return;
    setPointers((prev) => [...prev, ev]);
    setStartPos({ x: ev.clientX, y: ev.clientY });
    setStartTime(new Date().getTime());
    setIsDragging(false);
  };

  const getDistance = (
    pointer1: React.PointerEvent,
    pointer2: React.PointerEvent
  ) => {
    const dx = pointer2.clientX - pointer1.clientX;
    const dy = pointer2.clientY - pointer1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!startTime) return;
    setPointers((prevPointers) =>
      prevPointers.map((p) => (p.pointerId === ev.pointerId ? ev : p))
    );

    setStartPos({ x: ev.clientX, y: ev.clientY });

    if (pointers.length === 2) {
      const [pointer1, pointer2] = pointers;

      const currentDistance = getDistance(pointer1, pointer2);
      if (isNaN(currentDistance)) return;
      if (initialDistance !== null && !isNaN(initialDistance)) {
        const distanceDiff = currentDistance - initialDistance;
        if (Math.abs(distanceDiff) >= 30) {
          updateScale(distanceDiff > 0);
          setInitialDistance(currentDistance);
        }
      } else {
        setInitialDistance(currentDistance);
      }
    } else {
      if (!canvasRef.current) return;
      const distance = Math.sqrt(
        Math.pow(ev.clientX - startPos.x, 2) +
          Math.pow(ev.clientY - startPos.y, 2)
      );

      if (distance > clickThreshold) {
        setIsDragging(true);
      }

      const dx = ev.clientX - startPos.x;
      const dy = ev.clientY - startPos.y;

      //TODO: 移动端 & PC 端区分处理
      translateRef.current = limitTranslate({
        x: translateRef.current.x + dx * (window.innerWidth <= 600 ? 10 : 1),
        y: translateRef.current.y + dy * (window.innerWidth <= 600 ? 10 : 1),
      });
      setTranslate(translateRef.current);

      setStartPos({ x: ev.clientX, y: ev.clientY });
    }
  };

  const handleMouseUp = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    setPointers([]);
    setInitialDistance(null);
    setIsDragging(false);
    setStartTime(0);

    const endTime = new Date().getTime();
    const timeElapsed = endTime - startTime;
    //* 如果移动距离小于阈值,并且时间小于阈值,认定为点击
    if (!isDragging && timeElapsed < timeThreshold && pointers.length < 2) {
      if (!editable) return;
      console.log("click");
      handleCanvasClick(ev.clientX, ev.clientY, ev.altKey);
    }
  };

  const handleCanvasClick = (x: number, y: number, altKey: boolean) => {
    if (isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = x - canvasRect.left;
    const mouseY = y - canvasRect.top;

    const offsetX =
      ((mouseX / canvasRect.width - translate.x / canvas.width) * 1004) / scale;
    const offsetY =
      ((mouseY / canvasRect.height - translate.y / canvas.height) * 540) /
      scale;

    //- alt + click
    if (altKey) {
      console.log(
        `pin position: ${(offsetX / 1004) * 100}, ${(offsetY / 540) * 100}`
      );
      setPinPosition((draft) => {
        draft.push({
          x: (offsetX / 1004) * 100,
          y: (offsetY / 540) * 100,
          country: "country" + pinPosition.length,
        });
      });
    } else {
      //- only click
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
          console.log(
            `rect active! id = ${index} , position = [${rect.x}, ${rect.y}]`
          );
          return { ...rect, isHighLight: !rect.isHighLight };
        } else return rect;
      });
      setData(newRectangles);
    }
  };

  return (
    <div className="mapchartroot">
      <canvas
        ref={canvasRef}
        width={1004 * INCREASE}
        height={540 * INCREASE}
        className="mapchartcanvas"
        onMouseLeave={handleMouseUp}
        onPointerUp={handleMouseUp}
        onPointerMove={handleMouseMove}
        onPointerDown={handleMouseDown}
      />
      {editable ? (
        <>
          <div className="mapcharttips">{scale}</div>
          <div className="mapcharttips2">{JSON.stringify(translate)}</div>
        </>
      ) : null}
      {activePin && activePin.country !== "1" ? (
        <div
          className={
            activePin.position == "left"
              ? "mapchartpopover1"
              : "mapchartpopover2"
          }
          style={{
            left: `calc(${activePin.x * scale}% + ${
              (translate.x / 4016) * 100
            }%)`,
            top: `calc(${activePin.y * scale}% + ${
              (translate.y / 2160) * 100
            }%)`,
            whiteSpace: "nowrap",
          }}
        >
          <div className="mapchartpopovericon">
            {flagMap[activePin.country]}
          </div>
          {activePin.title || activePin.country}
        </div>
      ) : null}
      {pinPosition?.map((pin, i) => (
        <div
          id={pin.country}
          key={`${pin.x}-${pin.y}`}
          className="mapchartpin"
          style={{
            left: `calc(${pin.x * scale}% + ${(translate.x / 4016) * 100}%)`,
            top: `calc(${pin.y * scale}% + ${(translate.y / 2160) * 100}%)`,
            zIndex: activePin?.country === pin.country ? 999 : 99,
            color:
              activePin?.country === pin.country ? highLightColor : baseColor,
          }}
          onDoubleClick={() => {
            if (!editable) return;
            setPinPosition((draft) => {
              draft.splice(i, 1);
            });
            setActivePin(null);
          }}
          onClick={(ev) => {
            ev.stopPropagation();
            if (pin.country === activePin?.country) return;

            setActivePin({
              ...pin,
              position:
                pin.x * scale + (translate.x / 4016) * 100 > 75
                  ? "left"
                  : "right",
            });
            if (onPinClick) onPinClick(pin);
          }}
        >
          {pinSVG ?? (
            <svg
              version="1.1"
              viewBox="0 0 30 44"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentcolor"
                d="m29.29,14.89q0,7.87 -14.3,28.94q-14.29,-21.07 -14.29,-28.94c0,-7.88 6.4,-14.26 14.29,-14.26c7.9,0 14.3,6.38 14.3,14.26z"
              />
              <ellipse
                rx="7.06"
                ry="7.06"
                cx="14.82"
                cy="14.75"
                fill="#FFF8F4"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

export default MapChart;
