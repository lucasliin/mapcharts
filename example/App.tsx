import React from "react";
import MapChart from "../packages/MapChart";

const App: React.FC = () => {
  return (
    <div className="content-center h-screen p-10">
      <div className="">
        <MapChart
          enableZoom
          enablePan
          editable={false}
          highLightColor="#4D8359"
          baseColor="#E3E3DF"
          defaultSelect="US"
          mapData={{
            pins: [
              {
                x: 21.079544615154454,
                y: 37.324003803279055,
                country: "US",
                title: "The United States",
              },
              {
                x: 18.309069297315894,
                y: 19.862386947465776,
                country: "Canada",
              },
              {
                x: 33.011362383188334,
                y: 73.66422686437708,
                country: "Brazil",
              },
              { x: 84.82954240436406, y: 42.60601021384112, country: "Japan" },
              {
                x: 83.46590608801733,
                y: 78.62932236852095,
                country: "Australia",
              },
              { x: 46.02272730228329, y: 31.40815623658361, country: "UK" },
              {
                x: 48.52272548163239,
                y: 35.63375749637386,
                country: "Germany",
              },
              {
                x: 52.727274258274626,
                y: 39.54244784974591,
                country: "Ukraine",
              },
              {
                x: 51.98863618630024,
                y: 32.57019513227865,
                country: "1",
              },
            ],
            highlights: [
              4736, 2260, 3251, 4937, 2669, 2952, 2645, 2646, 2743, 2742, 2741,
              2835, 2836, 1024,
            ],
          }}
        />
      </div>
    </div>
  );
};

export default App;
