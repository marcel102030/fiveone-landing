import Values from "../components/sections/Values/Values";
import Platform from "../components/sections/Platform/Platform";
import AboutHero from "../components/sections/AboutHero/AboutHero";
import Directors from "../components/sections/Directors/Directors";
import Testimonials from "../components/sections/Testimonials/Testimonials";
import TrilhaMinisterial from "../components/sections/TrilhaMinisterial/TrilhaMinisterial";

const About = () => {
  return (
    <>
      <AboutHero />
      <Platform />
      <Values />
      <Directors />
      <Testimonials />
      <TrilhaMinisterial />
    </>
  );
};

export default About;
