'use client';

import { useTypewriter } from '@/hooks/useTypewriter';
import { useSiteContext } from '@/contexts/SiteContext';

export default function HomePage() {
  const { admiraltyLetter, welcomeContent, loading } = useSiteContext();

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
      <div className="min-h-screen flex items-center justify-center relative" style={{
        backgroundImage: 'url(https://i.imgur.com/zsk0kH3.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
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

            {/* Apply Now Button */}
            <div className="mb-12">
              <a
                href="/apply"
                className="hero-apply-button-enhanced inline-block px-8 py-4 text-xl md:text-2xl font-bold transition-all duration-300"
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
                Set sail with us in your <span id="typewriter-ship" className="static-red-gradient font-bold"></span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content section with naval theme */}
      <section className="py-16 relative bg-sandstone-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
              Welcome Aboard, <span className="static-red-gradient">Captain</span>
            </h2>
          </div>
        </div>
      </section>

      {/* Tommy Templeman's Welcome Letter */}
      <section className="py-8 relative bg-sandstone-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="letter-container bg-sail-white border-4 border-navy-dark p-8 md:p-12 shadow-2xl transform rotate-1 relative">
            {/* Wax Seal */}
            <div className="wax-seal"></div>

            <div className="text-center mb-8">
              <h3 className="letter-title-gradient text-2xl md:text-3xl font-bold" style={{fontFamily: 'Cinzel, serif'}}>
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
                      <span className="letter-first-letter">{firstLetter}</span>
                      {restOfParagraph.replace(/\{\{siteName\}\}/g, 'UWS')}
                    </p>
                  );
                }
                return (
                  <p key={index} className="text-lg leading-relaxed">
                    {paragraph.replace(/\{\{siteName\}\}/g, 'UWS')}
                  </p>
                );
              })}

              <div className="text-right mt-12">
                <p className="text-xl italic mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  With deepest respect and fair winds,
                </p>
                <div className="signature-line">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/George_III_Signature.svg/251px-George_III_Signature.svg.png?20100201022028"
                    alt="Signature"
                    className="w-48 h-12 mx-auto object-contain"
                  />
                  <p className="text-lg font-bold mt-2" style={{fontFamily: 'Cinzel, serif'}}>
                    {admiraltyLetter.author}
                  </p>
                  {admiraltyLetter.role && (
                    <p className="author-role-gradient text-sm">
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
      <section className="py-24 relative bg-sandstone-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
              Why Sail with <span className="static-red-gradient">UWS</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="neo-brutal-box p-6 text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Brotherhood of the Sea
              </h3>
              <p className="text-navy-dark leading-relaxed">
                Join a community of dedicated Privateers working throughout the Caribbean
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Strategic RvR
              </h3>
              <p className="text-navy-dark leading-relaxed">
                We engage in daily RvR focused on the best combat experience in an Age of Sail game
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <div className="text-4xl mb-4">🏴‍☠️</div>
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Daily Ganking and PvP
              </h3>
              <p className="text-navy-dark leading-relaxed">
                We take every fight that comes along and engage in piracy on the high seas in the name of King George III
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                At-Cost Resources
              </h3>
              <p className="text-navy-dark leading-relaxed">
                We offer resources and crafting materials through dedicated suppliers at or slightly above cost
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <div className="text-4xl mb-4">🚢</div>
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Active Shipyard
              </h3>
              <p className="text-navy-dark leading-relaxed">
                Our Shipyards turn out fresh hulls daily at low costs
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <div className="text-4xl mb-4">🔨</div>
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Active Crafters
              </h3>
              <p className="text-navy-dark leading-relaxed">
                Our crafters keep the fleet supplied and ready to fight at a moments notice
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* UWS Command Section */}
      <section className="py-24 relative bg-sandstone-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
              <span className="static-red-gradient">UWS</span> Command
            </h2>
            <p className="text-xl text-navy-dark/80 max-w-3xl mx-auto italic" style={{fontFamily: 'Crimson Text, serif'}}>
              You may fire when ready Gridley.
            </p>
          </div>

          {/* Raxius - Admiral of the Fleet - Centered at top */}
          <div className="flex justify-center mb-8">
            <div className="officer-card-red-border bg-sandstone-light relative max-w-md">
              {/* American Flag */}
              <div className="absolute top-2 right-2 text-xl">🇺🇸</div>
              <div className="flex p-3">
                <div className="w-16 h-16 border-2 border-brass mr-3 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src="https://cdn.discordapp.com/avatars/335787284857356289/d428da46c5c0d149965ff150d680a338.png?size=1024"
                    alt="Raxius Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                    Raxius
                  </h4>
                  <p className="text-sm text-navy-dark font-medium">
                    Admiral of the Fleet
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Other Admirals - Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {/* BLOODSHED */}
            <div className="officer-card-red-border bg-sandstone-light relative">
              <div className="absolute top-1 right-1 text-lg">🇺🇸</div>
              <div className="flex p-2">
                <div className="w-12 h-12 border-2 border-brass mr-2 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src="https://cdn.discordapp.com/avatars/293764570932183040/6f8a7331eb4f2d5ce481772ae74000db.png?size=1024"
                    alt="BLOODSHED Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                    BLOODSHED
                  </h4>
                  <p className="text-xs text-navy-dark font-medium">
                    Admiral
                  </p>
                </div>
              </div>
            </div>

            {/* Masaven */}
            <div className="officer-card-red-border bg-sandstone-light relative">
              <div className="absolute top-1 right-1 text-lg">🇺🇸</div>
              <div className="flex p-2">
                <div className="w-12 h-12 border-2 border-brass mr-2 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src="https://cdn.discordapp.com/avatars/161496754636849153/14bba520ff56dc676c890487081142bb.png?size=1024"
                    alt="Masaven Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                    Masaven
                  </h4>
                  <p className="text-xs text-navy-dark font-medium">
                    Admiral
                  </p>
                </div>
              </div>
            </div>

            {/* Psycho */}
            <div className="officer-card-red-border bg-sandstone-light relative">
              <div className="absolute top-1 right-1 text-lg">🇺🇸</div>
              <div className="flex p-2">
                <div className="w-12 h-12 border-2 border-brass mr-2 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src="https://cdn.discordapp.com/avatars/277711923049660426/eca756c7fa96bbcb3c816c7447808277.png?size=1024"
                    alt="Psycho Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                    Psycho
                  </h4>
                  <p className="text-xs text-navy-dark font-medium">
                    Admiral
                  </p>
                </div>
              </div>
            </div>

            {/* Slippery - This will be centered in the second row */}
            <div className="md:col-start-2 lg:col-start-2 officer-card-red-border bg-sandstone-light relative">
              <div className="absolute top-1 right-1 text-lg">🇺🇸</div>
              <div className="flex p-2">
                <div className="w-12 h-12 border-2 border-brass mr-2 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src="https://cdn.discordapp.com/avatars/616705218545057819/a87c13dbac00cbeeafd93f6010171f1a.png?size=1024"
                    alt="Slippery Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                    Slippery
                  </h4>
                  <p className="text-xs text-navy-dark font-medium">
                    Admiral
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
