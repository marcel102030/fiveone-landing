import "./Home.css";
import Hero from "../components/sections/Hero/Hero";
import About from "../components/sections/About/About";
import TrilhaMinisterial from "../components/sections/TrilhaMinisterial/TrilhaMinisterial";
import ConhecaMais from "../components/sections/ConhecaMais/ConhecaMais";

const Home = () => {
  const scrollPosition = () => {
    const element = document.getElementById("trilha");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Hero onScrollClick={scrollPosition} />
      <About />
      <TrilhaMinisterial />
      <ConhecaMais />
    </>
  );
};

export default Home;
