"use client";
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function FoodSuppliesLanding() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    setEmail('');
    alert('Thank you for your interest! We\'ll contact you soon.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <header className="bg-yellow-500 text-white py-6 px-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-yellow-500 font-bold text-xl">FSC</span>
            </div>
            <h1 className="text-2xl font-bold">Food Supplies Community</h1>
          </div>
          <button className="bg-white text-yellow-600 px-6 py-2 rounded-full font-semibold hover:bg-yellow-50 transition duration-300">
            Join Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-yellow-100 inline-block px-4 py-2 rounded-full mb-6">
            <span className="text-yellow-700 font-semibold">Nigeria's First Community-Based Food Network</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Healthy Food, <span className="text-yellow-500">Wealthy You!</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join Nigeria's pioneering community where you save on groceries, earn sustainable income, 
            and ensure food security for your family every month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-600 transition duration-300 shadow-lg">
              Start Your Journey
            </button>
            <button className="border-2 border-yellow-500 text-yellow-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-50 transition duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 bg-white px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Transform Your Life with Food Supplies Community
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-yellow-50 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-yellow-100">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-yellow-500 text-white px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-yellow-600 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">Our Core Values</h2>
              <ul className="space-y-3">
                {coreValues.map((value, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    {value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white text-gray-800 rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-yellow-600">Our Mission</h3>
                <p className="text-lg">
                  To make quality food accessible and affordable for every Nigerian family - while helping 
                  everyday people earn income through referrals and teamwork systems.
                </p>
              </div>
              <div className="bg-white text-gray-800 rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-yellow-600">Our Vision</h3>
                <p className="text-lg">
                  A nation where no home goes hungry and everyone can profit from what they eat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-800 text-white px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Life?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerians who are already saving money, earning income, and ensuring food security for their families.
          </p>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition duration-300"
            >
              Get Started
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Food Supplies Community. Nigeria's First Community-Based Food Network.</p>
          <p className="mt-2 text-yellow-400">Healthy Food, Wealthy You!</p>
        </div>
      </footer>
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
    </div>
  );
}

// Data arrays
const benefits = [
  {
    icon: '💰',
    title: 'Save Up to 40%',
    description: 'Massive discounts on everyday foodstuff and Nigerian staples'
  },
  {
    icon: '📈',
    title: 'Multi-Level Earnings',
    description: 'Participate in our MLM with guaranteed multiple income streams'
  },
  {
    icon: '🏪',
    title: 'Retail Profits',
    description: 'Earn from stocking and reselling our exclusive retail packs'
  },
  {
    icon: '🎯',
    title: 'Territory Monopoly',
    description: 'Get early access to new products and exclusive territories'
  },
  {
    icon: '🎁',
    title: 'Premium Incentives',
    description: 'Win household gadgets, cars, health insurance, trips, and more'
  },
  {
    icon: '🤝',
    title: 'Humanitarian Impact',
    description: 'Create legacy through community services in your name'
  }
];

const coreValues = [
  'Quality Assurance',
  'Integrity First',
  'Community Empowerment',
  'Sustainable Growth',
  'Trust & Reliability'
];