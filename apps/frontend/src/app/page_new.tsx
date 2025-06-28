'use client';

import { useEffect } from 'react';
import { useSiteContext } from '@/contexts/SiteContext';

export default function HomePage() {
  const { settings, featureCards, admiraltyLetter, welcomeContent, loading } = useSiteContext();

  useEffect(() => {
    const ships = [
      'Duke of Kent',
      'L\'Ocean',
      'Santa Ana',
      'Santisima Trinidad',
      'Victory',
      'Christian',
      'Le Bucentaure',
      'San Pedro',
      'St. Pavel',
      'Admiral de Ruyter',
      'Implacable',
      'Redoubtable',
      'Constitution',
      'Wapen von Hamburg',
      'Indefatigable'
    ];

    let currentShipIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    const typewriterElement = document.getElementById('typewriter-ship');

    const typeWriter = () => {
      if (!typewriterElement) return;

      const currentShip = ships[currentShipIndex];

      if (isDeleting) {
        typewriterElement.textContent = currentShip.substring(0, currentCharIndex - 1);
        currentCharIndex--;

        if (currentCharIndex === 0) {
          isDeleting = false;
          currentShipIndex = (currentShipIndex + 1) % ships.length;
          setTimeout(typeWriter, 500);
          return;
        }
      } else {
        typewriterElement.textContent = currentShip.substring(0, currentCharIndex + 1);
        currentCharIndex++;

        if (currentCharIndex === currentShip.length) {
          isDeleting = true;
          setTimeout(typeWriter, 2000);
          return;
        }
      }

      setTimeout(typeWriter, isDeleting ? 50 : 100);
    };

    const timer = setTimeout(typeWriter, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚓</div>
          <div className="text-yellow-400 text-xl">Setting Sail...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/John_Cleveley_the_Elder%2C_The_Royal_George_at_Deptford_Showing_the_Launch_of_The_Cambridge_%281757%29.jpg/1200px-John_Cleveley_the_Elder%2C_The_Royal_George_at_Deptford_Showing_the_Launch_of_The_Cambridge_%281757%29.jpg')`
          }}
        />

        {/* Hero Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/80 via-navy-dark/60 to-navy-dark/90"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full pt-16">
          <div className="text-center text-white px-4">
            <div className="mb-8">
              <img
                src="https://i.imgur.com/VwfpogC.png"
                alt={`${settings.siteName} Logo`}
                className="h-32 w-32 mx-auto mb-6 drop-shadow-2xl"
              />
            </div>

            <h1 className="hero-title-brutal text-5xl md:text-8xl mb-6">
              <span
                className="text-brass-bright"
                style={{ color: '#B8860B' }}
              >
                {settings.siteName}
              </span>
            </h1>

            <div className="hero-subtitle text-xl md:text-3xl mb-12 max-w-3xl mx-auto"
               style={{
                 color: 'var(--sail-white)',
                 textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 10px rgba(184, 134, 11, 0.3)'
               }}>
              <p>
                Set sail with us in your <span id="typewriter-ship" className="text-brass-bright font-bold"></span>
              </p>
              <p className="text-lg md:text-xl mt-4 opacity-90">
                {settings.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-8" style={{ fontFamily: 'Cinzel, serif' }}>
              {welcomeContent.title}
            </h2>
            <div className="text-lg md:text-xl text-slate-300 leading-relaxed">
              {welcomeContent.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admiralty Letter Section */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-yellow-600 rounded-lg p-8 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
                {admiraltyLetter.title}
              </h2>

              <div className="prose prose-lg prose-invert max-w-none">
                {admiraltyLetter.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 text-slate-200 leading-relaxed last:mb-8">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold text-yellow-400">
                  {admiraltyLetter.author}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-yellow-400" style={{ fontFamily: 'Cinzel, serif' }}>
            Why Sail with <span className="text-brass" style={{ color: '#B8860B' }}>{settings.siteName}</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featureCards
              .sort((a, b) => a.order - b.order)
              .map((card) => (
                <div key={card.id} className="bg-slate-800/80 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-6 hover:border-yellow-500/50 transition-all duration-300">
                  <div className="text-4xl mb-4 text-center">{card.icon}</div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-3 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
                    {card.title}
                  </h3>
                  <p className="text-slate-300 text-center leading-relaxed">
                    {card.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Command Structure Section */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-yellow-400" style={{ fontFamily: 'Cinzel, serif' }}>
            {settings.siteName} <span className="text-brass-bright" style={{ color: '#B8860B' }}>Naval Command</span>
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              {settings.commandStructure.map((role, index) => (
                <div key={index} className="bg-gradient-to-r from-slate-700 to-slate-800 border border-yellow-600/30 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Cinzel, serif' }}>
                        {role.role}
                      </h3>
                      <p className="text-slate-300 mt-2">
                        {role.name}
                      </p>
                    </div>
                    <div className="text-4xl opacity-50">
                      ⚓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
