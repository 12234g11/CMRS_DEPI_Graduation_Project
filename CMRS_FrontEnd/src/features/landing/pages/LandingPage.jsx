// import '../landing.css';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import VisionSection from '../components/VisionSection';
import ServicesSection from '../components/ServicesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <VisionSection />
        <ServicesSection />
        <HowItWorksSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

export default LandingPage;