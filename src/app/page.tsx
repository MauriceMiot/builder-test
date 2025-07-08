"use client";

import Plans from "./components/Plans";
import Seats from "./components/Seats";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Plans />
      <Seats />
    </div>
  );
}
