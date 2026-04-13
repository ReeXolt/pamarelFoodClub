// import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '../Hero';
import { FaWhatsapp } from 'react-icons/fa';
import { HeroSection } from './HeroSection';
import { CategoriesSection } from './CategoriesSection';
import { FeatureSection } from './FeatureSection';
import { DealsSection } from './DealsSection';
import { TestimonialSection } from './TestimonialSection';
import { BusinessOpportunities } from './BusinessOpportunities';
import WhatsAppBtn from '../reuseables/WhatsAppBtn';
import { ScrollToTop } from '../reuseables/ScrollToTopBtn';
import { CTASection } from './CTASection';

const PamarelLandingPage = () => {
  return (
    <>
      <Head>
        <title>Pamarel - Shop, Earn, Grow</title>
      </Head>


      <div className="min-h-screen ">
        <HeroSection />
        <CategoriesSection />
        <FeatureSection/>
        <DealsSection />
        <TestimonialSection />
        <BusinessOpportunities />
        <CTASection />
      </div>
      <ScrollToTop />
      <WhatsAppBtn />
      
    </>
  );
};

export default PamarelLandingPage;