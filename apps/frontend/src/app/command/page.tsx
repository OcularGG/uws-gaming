export default function CommandPage() {
  return (
    <div className="min-h-screen bg-sandstone-light pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
            Naval <span className="text-brass">Command</span>
          </h1>
          <p className="text-xl text-navy-dark/80 max-w-3xl mx-auto" style={{fontFamily: 'Crimson Text, serif'}}>
            Strategic command center for fleet operations and naval warfare coordination
          </p>
        </div>

        <div className="neo-brutal-box max-w-4xl mx-auto p-8 mb-16 text-center">
          <div className="mb-8">
            <img
              src="https://i.imgur.com/VwfpogC.png"
              alt="Kraken Logo"
              className="w-24 h-24 mx-auto object-contain opacity-60"
            />
          </div>
          <h2 className="text-3xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
            Command Center Under Construction
          </h2>
          <p className="text-lg text-navy-dark leading-relaxed mb-8" style={{fontFamily: 'Crimson Text, serif'}}>
            Our naval strategists are currently charting new waters and developing advanced command systems.
            Return soon to access fleet management, tactical planning, and mission coordination tools.
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-brass/20 border-2 border-brass text-navy-dark rounded" style={{fontFamily: 'Cinzel, serif'}}>
            ⚓ Coming Soon ⚓
          </div>
        </div>
      </div>
    </div>
  );
}
