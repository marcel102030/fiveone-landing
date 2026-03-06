import "./Home.css";
import Hero from "../components/sections/Hero/Hero";
import About from "../components/sections/About/About";
import TrilhaMinisterial from "../components/sections/TrilhaMinisterial/TrilhaMinisterial";
import ConhecaMais from "../components/sections/ConhecaMais/ConhecaMais";
import TrainingFormats from "../components/TrainingFormats";
import "../components/TrainingFormats.css";

const Home = () => {
  const scrollPosition = () => {
    const element = document.getElementById("trilha");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Hero onScrollClick={scrollPosition} />
      <TrainingFormats />
      <About />
      <TrilhaMinisterial />
      <ConhecaMais />
    </>
  );
};

export default Home;
