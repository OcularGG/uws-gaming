import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found | UWS',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen relative">
      {/* Battle of Trafalgar Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/8/88/The_Battle_of_Trafalgar_by_William_Clarkson_Stanfield.jpg)'
        }}
      />

      {/* Naval Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/90 via-navy-dark/70 to-navy-dark/90"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="text-center max-w-4xl mx-auto">          <div className="neo-brutal-box bg-sandstone-light p-8 md:p-12 mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
              Lost at <span className="text-brass">Sea</span>
            </h2>
            <p className="text-lg md:text-xl text-navy-dark mb-8 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>              Ahoy, Captain! It seems you&apos;ve sailed into uncharted waters.
              The page you seek has been lost to Davy Jones&apos; locker.
            </p>

            <div className="flex justify-center">
              <Link
                href="/"
                className="nav-button inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-brass text-navy-dark hover:bg-brass-bright transition-all duration-200 transform hover:scale-105"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Return to Port
              </Link>
            </div>
          </div>

          <div className="text-sail-white/70 text-sm" style={{fontFamily: 'Crimson Text, serif'}}>
            <p>Chart a new course • Error Code: 404</p>
          </div>
        </div>
      </div>
    </div>
  );
}
