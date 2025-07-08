"use client";

//only for netlify
// import Plans from "./components/Plans";
// import Seats from "./components/Seats";

import dynamic from "next/dynamic";
// import SeatsEditor from "./components/SeatsEditor";
// import SeatMap from "./components/Seats";

const Plans = dynamic(() => import("./components/Plans"), {
  ssr: false,
});

const Seats = dynamic(() => import("./components/Seats"), {
  ssr: false,
});
export default function Home() {
  return (
    <div className="min-h-screen">
      <Plans />
      <Seats />
    </div>
  );
}
