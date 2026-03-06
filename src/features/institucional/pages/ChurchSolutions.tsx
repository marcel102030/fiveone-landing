import React from "react";
import TrainingFormats from "../components/TrainingFormats";
import "../components/TrainingFormats.css";

const ChurchSolutions: React.FC = () => {
  return (
    <main className="solo-page" style={{ minHeight: "100vh", background: "#030712" }}>
      <TrainingFormats />
    </main>
  );
};

export default ChurchSolutions;

