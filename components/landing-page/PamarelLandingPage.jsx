// import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '../Hero';
import { FaWhatsapp } from 'react-icons/fa';

const PamarelLandingPage = () => {
  return (
    <>
      <Head>
        <title>Pamarel - Shop, Earn, Grow</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Montserrat:wght@800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </Head>


      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
        {/* Hero Section with Background Image */}
        <Hero />

        {/* Marketplace Section */}
        <section id="marketplace" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-playfair">
                Shop and Save in Our Marketplace
              </h2>
              <div className="w-20 h-1 bg-yellow-400 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-white rounded-xl shadow-xl transform transition-all hover:scale-[1.02] hover:shadow-2xl">
                <div className="relative flex justify-center">
                  <Image
                    src="/food_plan.jpeg"
                    alt="Pamarel Food Market"
                    width={500}
                    height={300}
                    className="rounded-t-xl"
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6 text-left">
                    Discover fresh groceries, organic produce, and gourmet foods at unbeatable prices.
                  </p>
                  <Link
                    href="/market#food"
                    className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>


              <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.02] hover:shadow-2xl">
                <div className="relative">
                  <Image
                    src="/img-4.jpg"
                    alt="Pamarel Gadget Hub"
                    width={1400}
                    height={800}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white font-montserrat">Pamarel Gadget Hub</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    Latest tech gadgets, electronics, and accessories with exclusive member discounts.
                  </p>
                  <Link href="/market#gadget" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all">
                    Explore Gadgets
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Opportunities Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
                  Business Opportunities
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Join the Pamarel network and grow your business with our support and infrastructure.
                </p>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-400">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Become a Stockist or Pickup Centre</h3>
                    <p className="text-gray-600 mb-4">
                      Partner with us to distribute products in your area and earn additional income.
                    </p>
                    <p>
                      <strong>Note: Only available to classic and deluxe Plan members</strong>
                    </p>
                    <Link href="/apply-stockist" className="inline-block px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-all">
                      Apply Here
                    </Link>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Join Pamarel Today</h3>
                    <p className="text-gray-600 mb-4">
                      Start your journey with Pamarel and unlock a world of opportunities.
                    </p>
                    <Link href="/join-member" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all">
                      Sign Up Here
                    </Link>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="relative">
                  <div className="relative w-full h-96 rounded-3xl shadow-2xl overflow-hidden">
                    <Image
                      src="/plo.jpg"
                      alt="Business opportunity"
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-yellow-400 rounded-2xl shadow-xl flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-xl text-center">Start Your Business Journey Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/+2349040498445"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition duration-300 z-50 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="text-3xl" />
      </a>
    </>
  );
};

export default PamarelLandingPage;