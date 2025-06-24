export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-sandstone-light pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
            Naval <span className="text-brass">Tools</span>
          </h1>
          <p className="text-xl text-navy-dark/80 max-w-3xl mx-auto" style={{fontFamily: 'Crimson Text, serif'}}>
            Essential utilities and calculators for naval warfare and fleet management
          </p>
        </div>

        <div className="neo-brutal-box max-w-4xl mx-auto p-8 mb-16 text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🔧</div>
          </div>
          <h2 className="text-3xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
            Toolbox Under Development
          </h2>
          <p className="text-lg text-navy-dark leading-relaxed mb-8" style={{fontFamily: 'Crimson Text, serif'}}>
            Our naval engineers are crafting essential tools for captains: ship calculators,
            damage analyzers, trade route planners, and battle formation guides.
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-brass/20 border-2 border-brass text-navy-dark rounded" style={{fontFamily: 'Cinzel, serif'}}>
            🛠️ Forging Tools 🛠️
          </div>
        </div>
      </div>
    </div>
  );
}
