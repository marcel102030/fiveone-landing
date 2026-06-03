import { useEffect } from "react";
import Hero from "../components/sections/Hero/Hero";
import CourseShowcase from "../components/sections/CourseShowcase/CourseShowcase";
import QuizBanner from "../components/sections/QuizBanner/QuizBanner";
import HowItWorks from "../components/sections/HowItWorks/HowItWorks";
import TrainingFormats from "../components/TrainingFormats";
import FreeContent from "../components/sections/FreeContent/FreeContent";
import FinalCTA from "../components/sections/FinalCTA/FinalCTA";

const Home = () => {
  useEffect(() => {
    document.title = "Five One — Cursos bíblicos e Teste dos 5 Ministérios";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Cursos online sobre a Bíblia com fundamento teológico e linguagem clara. Comece pelo curso Defenda a sua Fé ou descubra gratuitamente seu dom ministerial."
      );
    }
  }, []);

  return (
    <>
      <Hero />
      <CourseShowcase />
      <QuizBanner />
      <HowItWorks />
      <TrainingFormats />
      <FreeContent />
      <FinalCTA />
    </>
  );
};

export default Home;
