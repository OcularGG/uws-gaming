'use client';

import { useTypewriter } from '@/hooks/useTypewriter';
import { useSiteContext } from '@/contexts/SiteContext';

export default function HomePage() {
  const { settings, featureCards, admiraltyLetter, welcomeContent, loading } = useSiteContext();

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

  useTypewriter('typewriter-ship', ships, 1000);

  if (loading) {
    return (
      <div className="min-h-screen bg-sandstone-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚓</div>
          <div className="text-navy-dark text-xl" style={{fontFamily: 'Cinzel, serif'}}>Setting Sail...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative">
      {/* Hero Section with Pirate Ship Background */}
      <section className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://wallpapersok.com/images/hd/4k-pirate-ship-painting-k1duez8ka3g6oib5.jpg)'
          }}
        />

        {/* Hero Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/80 via-navy-dark/60 to-navy-dark/90"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full pt-16">
          <div className="text-center px-4 max-w-5xl mx-auto">
            {/* Kraken Gaming Logo */}
            <div className="mb-8 flex justify-center">
              <div className="w-48 h-48 md:w-80 md:h-80 drop-shadow-2xl logo-floating">
                <img
                  src="/uws-logo.png"
                  alt="UWS Logo"
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  onError={(e) => {
                    // Fallback to SVG if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <svg viewBox="0 0 200 200" class="w-full h-full">
                          <rect x="0" y="0" width="200" height="200" fill="#1a1a1a"/>
                          <circle cx="100" cy="80" r="25" fill="white"/>
                          <circle cx="90" cy="75" r="4" fill="black"/>
                          <circle cx="110" cy="75" r="4" fill="black"/>
                          <polygon points="100,85 95,95 105,95" fill="black"/>
                          <rect x="60" y="125" width="80" height="8" fill="white" transform="rotate(45 100 129)"/>
                          <rect x="60" y="125" width="80" height="8" fill="white" transform="rotate(-45 100 129)"/>
                          <circle cx="67" cy="122" r="6" fill="white"/>
                          <circle cx="133" cy="122" r="6" fill="white"/>
                          <circle cx="67" cy="136" r="6" fill="white"/>
                          <circle cx="133" cy="136" r="6" fill="white"/>
                        </svg>
                      `;
                    }
                  }}
                />
              </div>
            </div>

            <h1 className="hero-title-gradient text-5xl md:text-8xl mb-8 font-bold tracking-wider">
              {settings.siteName}
            </h1>

            {/* Apply Now Button */}
            <div className="mb-12">
              <a
                href="/apply"
                className="hero-apply-button inline-block px-8 py-4 text-xl md:text-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(90deg, #201810 0%, #714920 20%, #9c642c 40%, #b2905f 60%, #805224 80%, #201810 100%)',
                  backgroundSize: '300% 100%',
                  animation: 'hero-gradient-flow 8s ease-in-out infinite alternate',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  textDecoration: 'none',
                  fontFamily: 'Cinzel, serif',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                }}
              >
                Apply Now
              </a>
            </div>

            <div className="hero-subtitle text-xl md:text-3xl mb-12 max-w-3xl mx-auto"
               style={{
                 color: 'var(--sail-white)',
                 textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 10px rgba(22, 101, 52, 0.3)'
               }}>
              <p>
                Set sail with us in your <span id="typewriter-ship" className="typewriter-gradient font-bold"></span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content section with naval theme */}
      <section className="py-24 bg-sandstone-light relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-navy-dark mb-12" style={{fontFamily: 'Cinzel, serif'}}>
              {welcomeContent.title.replace('{{siteName}}', settings.siteName).split('Captain').map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && <span className="captain-gradient">Captain</span>}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </section>

      {/* Tommy Templeman's Welcome Letter */}
      <section className="py-16 bg-sandstone-light relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="letter-container bg-sail-white border-4 border-navy-dark p-8 md:p-12 shadow-2xl transform rotate-1">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                {admiraltyLetter.title}
              </h3>
            </div>
            <div className="space-y-6 text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
              {admiraltyLetter.content.split('\n\n').map((paragraph, index) => {
                if (index === 0) {
                  // Special handling for the first paragraph with the drop cap
                  const firstLetter = paragraph.charAt(0);
                  const restOfParagraph = paragraph.slice(1);
                  return (
                    <p key={index} className="text-lg leading-relaxed">
                      <span className="text-2xl font-bold float-left mr-2 leading-none" style={{fontFamily: 'Cinzel, serif'}}>{firstLetter}</span>
                      {restOfParagraph.replace(/\{\{siteName\}\}/g, settings.siteName)}
                    </p>
                  );
                }
                return (
                  <p key={index} className="text-lg leading-relaxed">
                    {paragraph.replace(/\{\{siteName\}\}/g, settings.siteName)}
                  </p>
                );
              })}

              <div className="text-right mt-12">
                <p className="text-xl italic mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  With deepest respect and fair winds,
                </p>
                <div className="signature-line">
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMCAzMEM0MCAyMCA3MCAzNSA5MCAyNUMxMTAgMTUgMTMwIDI1IDE1MCAyMEMxNzAgMTUgMTkwIDI1IDE5MCAyNSIgc3Ryb2tlPSIjMTk0MTY4IiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4="
                    alt="Signature"
                    className="w-48 h-12 mx-auto"
                  />
                  <p className="text-lg font-bold mt-2" style={{fontFamily: 'Cinzel, serif'}}>
                    {admiraltyLetter.author}
                  </p>
                  {admiraltyLetter.role && (
                    <p className="text-sm text-brass">
                      {admiraltyLetter.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Naval Action Benefits Section */}
      <section className="py-24 bg-sandstone-light relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
              Why Sail with <span className="uws-gradient">{settings.siteName}</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards
              .sort((a, b) => a.order - b.order)
              .map((card) => (
                <div key={card.id} className="neo-brutal-box p-6 text-center">
                  <div className="text-4xl mb-4">{card.icon}</div>
                  <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                    {card.title}
                  </h3>
                  <p className="text-navy-dark leading-relaxed">
                    {card.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Kraken Naval Command Section */}
      <section className="py-24 bg-sandstone-light relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
              {settings.siteName} <span className="text-brass-bright">Naval Command</span>
            </h2>
            <p className="text-xl text-navy-dark/80 max-w-3xl mx-auto">
              The highest echelons of naval command, leading our fleet through strategic waters
            </p>
          </div>

          <div className="grid gap-6 max-w-4xl mx-auto">
            {settings.commandStructure.map((role, index) => (
              <div key={index} className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                      {role.name}
                    </h4>
                    <p className="text-sm text-navy-dark font-medium">
                      {role.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
