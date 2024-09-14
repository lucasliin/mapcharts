import React, { useState } from "react";
import MapChart from "../packages/MapChart";
import { useKeyPress } from "ahooks";

const App: React.FC = () => {
  const [boolean1, setBoolean1] = useState(false);
  const [boolean2, setBoolean2] = useState(false);
  const [boolean3, setBoolean3] = useState(false);
  const [boolean4, setBoolean4] = useState(false);
  const [boolean5, setBoolean5] = useState(false);
  const [default1, setDefault1] = useState<number[]>([]);
  const [default2, setDefault2] = useState<[number, number][]>([]);
  const [default3, setDefault3] = useState<number>(6);
  const [inputValue1, setInputValue1] = useState(
    "4736,2260,3251,4937,2669,2952,2645,2646,2743,2742,2741,2835,2836"
  );
  const [inputValue2, setInputValue2] = useState(
    "[238.33333206176758, 235.91665649414062]/[199.33333206176758, 73.91665649414062]/[379.3333320617676, 462.9166564941406]/[529.3333320617676, 193.91665649414062]/[559.3333320617676, 221.91665649414062]/[605.3333320617676, 243.91665649414062]/[983.3333320617676, 265.9166564941406]/[964.3333320617676, 493.9166564941406]/[593.3333320617676, 208.91665649414062]"
  );
  const [inputValue3, setInputValue3] = useState("2");

  return (
    <div className="content-center h-screen p-10">
      <div className="flex items-center justify-center gap-4 my-5">
        <button onClick={() => setBoolean1((prev) => !prev)}>{`${
          boolean1 ? "关闭" : "开启"
        }日志`}</button>
        <button onClick={() => setBoolean2((prev) => !prev)}>{`${
          boolean2 ? "关闭" : "开启"
        }点击事件`}</button>
        <button onClick={() => setBoolean3((prev) => !prev)}>{`${
          boolean3 ? "关闭" : "开启"
        }标点`}</button>
        <button onClick={() => setBoolean4((prev) => !prev)}>{`${
          boolean4 ? "关闭" : "开启"
        }Zoom`}</button>
        <button onClick={() => setBoolean5((prev) => !prev)}>{`${
          boolean5 ? "关闭" : "开启"
        }画布移动`}</button>
        <div>
          <input
            value={inputValue1}
            placeholder="添加id"
            onChange={(ev) => setInputValue1(ev.target.value)}
            id="input"
          />
          <button
            onClick={() => {
              setDefault1(
                inputValue1
                  .split(",")
                  .map((v) => (/^-?\d+$/.test(v) ? Number(v) : ""))
                  .filter((v) => v !== "")
              );
            }}
          >
            设置高亮
          </button>
        </div>
        <div>
          <input
            value={inputValue1}
            placeholder="添加id"
            onChange={(ev) => setInputValue1(ev.target.value)}
            id="input"
          />
          <button
            onClick={() => {
              setDefault1(
                inputValue2
                  .split(",")
                  .map((v) => (/^-?\d+$/.test(v) ? Number(v) : ""))
                  .filter((v) => v !== "")
              );
            }}
          >
            设置标点
          </button>
        </div>
        <select
          value={inputValue3}
          onChange={(ev) => {
            setInputValue3(ev.target.value);
          }}
        >
          <option value="1">圆形</option>
          <option value="2">正方形</option>
          <option value="3">三角形</option>
          <option value="4">菱形</option>
          <option value="5">五边形</option>
          <option value="6">六边形</option>
        </select>
      </div>
      <div className="border border-black border-solid">
        <MapChart
          logPosition={boolean1}
          enableAction={boolean2}
          enablePin={boolean3}
          enableZoom={boolean4}
          enablePan={boolean5}
          nodeShape={inputValue3}
          defaultAction={default1}
        />
      </div>
    </div>
  );
};

export default App;
