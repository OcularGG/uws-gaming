'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useAuth';
import { signIn } from 'next-auth/react';

const NATIONS = [
  'Great Britain',
  'USA',
  'France',
  'The Pirates',
  'Russia',
  'Sweden'
];

const TIMEZONES = [
  // North America
  'HST (UTC-10) - Hawaii',
  'AKST (UTC-9) - Alaska',
  'PST (UTC-8) - Pacific',
  'MST (UTC-7) - Mountain',
  'CST (UTC-6) - Central',
  'EST (UTC-5) - Eastern',
  'AST (UTC-4) - Atlantic',
  'NST (UTC-3:30) - Newfoundland',

  // Europe
  'GMT (UTC+0) - Greenwich Mean Time',
  'CET (UTC+1) - Central European Time',
  'EET (UTC+2) - Eastern European Time',
  'MSK (UTC+3) - Moscow Time',

  // Asia
  'GST (UTC+4) - Gulf Standard Time',
  'IST (UTC+5:30) - India Standard Time',
  'CST (UTC+8) - China Standard Time',
  'JST (UTC+9) - Japan Standard Time',
  'AEST (UTC+10) - Australian Eastern Time'
];

const RANKS = [
  { name: 'Midshipman', crew: 120 },
  { name: 'Ensign', crew: 200 },
  { name: 'Second Lieutenant', crew: 270 },
  { name: 'First Lieutenant', crew: 370 },
  { name: 'Lieutenant Commander', crew: 420 },
  { name: 'Master and Commander', crew: 570 },
  { name: 'Post Captain', crew: 720 },
  { name: 'Flag Captain', crew: 870 },
  { name: 'Commodore', crew: 1020 },
  { name: 'Rear Admiral', crew: 1200 },
  { name: 'Vice-Admiral', crew: 1700 },
  { name: 'Admiral', crew: 2500 }
];

const PORT_BATTLE_ROLES = [
  'Commander',
  'Line of Battle',
  'Screener'
];

const PORT_BATTLE_AVAILABILITY = [
  'Weekdays',
  'Weekends',
  'Everyday'
];

export default function ApplicationPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(session ? 1 : 0); // Start with registration if not logged in

  // Password strength function
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: 'Weak', color: 'bg-red-500', width: '33%' };
    if (score <= 4) return { strength: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'Strong', color: 'bg-green-500', width: '100%' };
  };
  const [formData, setFormData] = useState({
    // User Registration (new)
    email: '',
    confirmEmail: '',
    captainName: '', // Changed from username to captainName
    password: '',
    confirmPassword: '',

    // Personal Particulars
    preferredNickname: '',
    currentNation: '',
    timeZone: '',

    // Naval Experience
    hoursInNavalAction: '',
    currentRank: '',
    previousCommands: '',
    preferredRole: '',
    isPortBattleCommander: false,
    commanderExperience: '',

    // Crafting Experience
    isCrafter: false,

    // Availability
    weeklyPlayTime: '',
    portBattleAvailability: [] as string[],
    typicalSchedule: '',

    // Declarations
    declarationAccuracy: false,
    declarationHonor: false,
    declarationRules: false,

    // Signature
    signature: '',
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvailabilityChange = (availability: string) => {
    setFormData(prev => ({
      ...prev,
      portBattleAvailability: prev.portBattleAvailability.includes(availability)
        ? prev.portBattleAvailability.filter(a => a !== availability)
        : [...prev.portBattleAvailability, availability]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // User Registration (for new users)
        if (session) return true; // Skip if already logged in
        return !!(
          formData.email &&
          formData.confirmEmail &&
          formData.email === formData.confirmEmail &&
          formData.captainName &&
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 8
        );
      case 1:
        return !!(formData.preferredNickname && formData.currentNation && formData.timeZone);
      case 2:
        return !!(formData.hoursInNavalAction && formData.currentRank && formData.preferredRole);
      case 3:
        return true; // Crafting is optional
      case 4:
        return !!(formData.weeklyPlayTime && formData.portBattleAvailability.length > 0 && formData.typicalSchedule);
      case 5:
        return formData.declarationAccuracy && formData.declarationHonor && formData.declarationRules;
      case 6:
        return !!formData.signature;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked'); // Debug
    console.log('Step 6 validation:', validateStep(6)); // Debug
    console.log('Form data:', formData); // Debug

    if (!validateStep(6)) {
      setSubmitError('Please complete all required fields and sign the application.');
      return;
    }

    setSubmitError(''); // Clear any existing errors

    try {
      let userId = session?.user?.id;

      // If user is not logged in, register them first
      if (!session) {
        console.log('Registering new user...'); // Debug
        const registrationResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.captainName,
            password: formData.password,
          }),
        });

        if (!registrationResponse.ok) {
          const errorData = await registrationResponse.json();
          console.error('Registration failed:', errorData); // Debug
          setSubmitError(errorData.error || 'Failed to register user');
          return;
        }

        const registrationData = await registrationResponse.json();
        userId = registrationData.user.id;
        console.log('User registered with ID:', userId); // Debug
      }

      console.log('Submitting application...'); // Debug
      const applicationData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        userId: userId,
      };

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      console.log('Application response status:', response.status); // Debug

      if (response.ok) {
        console.log('Application submitted successfully'); // Debug
        setSubmitSuccess(true);
        setSubmitError('');
      } else {
        const errorData = await response.json();
        console.error('Application submission failed:', errorData); // Debug
        setSubmitError(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application submission error:', error); // Debug
      setSubmitError('Failed to submit application. Please try again.');
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    const minStep = session ? 1 : 0; // Can't go below step 0 if not logged in
    setCurrentStep(prev => Math.max(prev - 1, minStep));
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (submitSuccess) {
    return (
      <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="neo-brutal-box bg-sail-white p-8 text-center">
            <div className="text-6xl mb-6">⚓</div>
            <h1 className="text-4xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Application Submitted Successfully!
            </h1>
            <p className="text-xl text-navy-dark/80 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
              Your application to join His Majesty's Naval Service has been received and is now under review by the Admiralty.
            </p>
            <div className="bg-sandstone-100 p-6 rounded border-l-4 border-brass mb-6">
              <p className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                Your application has been submitted and assigned to the recruitment review queue.
                You will be contacted via email regarding the status of your application.
                In the meantime, feel free to explore our port facilities and observe ongoing operations.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="neo-brutal-button bg-brass text-white px-8 py-3 font-semibold"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Return to Port
              </a>
              <a
                href="/gallery"
                className="neo-brutal-button bg-cannon-smoke text-sail-white px-8 py-3 font-semibold"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                View Gallery
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // The application form now includes user registration for new users
  // Existing users can login before applying if they prefer
  // No authentication required to start the application process

  // If user is already authenticated, we can proceed directly to the application
  // New users will register as part of the application process

  return (
    <div className="bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-green-800 mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Apply for a Letter of Marque
          </h1>
          <p className="text-sail-white/80 text-xl" style={{fontFamily: 'Crimson Text, serif'}}>
            United We Stand - It's the Pirates Life for Me!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="neo-brutal-box bg-sail-white p-4 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === currentStep ? 'bg-brass text-white' :
                  step < currentStep ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 6 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <span className="text-navy-dark font-semibold" style={{fontFamily: 'Cinzel, serif'}}>
              Step {currentStep + 1} of 7: {
                currentStep === 0 ? 'Account Registration' :
                currentStep === 1 ? 'Personal Particulars' :
                currentStep === 2 ? 'Naval Experience' :
                currentStep === 3 ? 'Crafting Experience' :
                currentStep === 4 ? 'Availability & Commitment' :
                currentStep === 5 ? 'Declarations' : 'Signature'
              }
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="neo-brutal-box bg-sail-white p-8">
          {/* Step 0: User Registration (only if not logged in) */}
          {currentStep === 0 && !session && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Create Your Account
              </h2>
              <p className="text-navy-dark/80 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
                To apply for a{' '}
                <span
                  className="text-brass hover:text-brass-bright font-semibold cursor-help relative group"
                >
                  Letter of Marque
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-sail-white border-4 border-navy-dark text-navy-dark text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-2xl max-w-xs w-max neo-brutal-box" style={{fontFamily: 'Crimson Text, serif'}}>
                    A Letter of Marque and Reprisal was a government license in the Age of Sail that authorized a private person, known as a privateer or corsair, to attack and capture vessels of a foreign state at war with the issuing state.
                  </span>
                </span>
                {' '}from His Majesty's Royal Navy, you'll need to create an account. If you already have an account,{' '}
                <a href="/auth/login" className="text-brass hover:text-brass-bright font-semibold">
                  login here
                </a>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="captain@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Confirm Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.confirmEmail}
                    onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                    className={`w-full p-3 border-2 rounded ${
                      formData.confirmEmail && formData.email !== formData.confirmEmail
                        ? 'border-red-500'
                        : 'border-navy-dark'
                    }`}
                    placeholder="captain@example.com"
                    required
                  />
                  {formData.confirmEmail && formData.email !== formData.confirmEmail && (
                    <p className="text-red-500 text-xs mt-1">Email addresses do not match</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Captain Name (Username) *
                  </label>
                  <input
                    type="text"
                    value={formData.captainName}
                    onChange={(e) => handleInputChange('captainName', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="Captain Jack Sparrow"
                    required
                  />
                  <p className="text-xs text-navy-dark/60 mt-1">This will be your captain name and username</p>
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Password Strength</span>
                        <span className={`font-semibold ${
                          getPasswordStrength(formData.password).strength === 'Strong' ? 'text-green-600' :
                          getPasswordStrength(formData.password).strength === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {getPasswordStrength(formData.password).strength}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getPasswordStrength(formData.password).color}`}
                          style={{width: getPasswordStrength(formData.password).width}}
                        ></div>
                      </div>
                      <p className="text-xs text-navy-dark/60 mt-1">
                        Use 8+ characters with uppercase, lowercase, numbers, and symbols
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full p-3 border-2 rounded ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500'
                        : 'border-navy-dark'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-brass/10 border border-brass/30 rounded">
                <p className="text-sm text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                  <strong>Note:</strong> Your account will be created when you submit your application.
                  This allows you to apply and creates your login credentials simultaneously.
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Personal Particulars
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Captain Name (In-Game) *
                  </label>
                  <input
                    type="text"
                    value={formData.captainName}
                    onChange={(e) => handleInputChange('captainName', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="Your in-game captain name"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Preferred Nickname *
                  </label>
                  <input
                    type="text"
                    value={formData.preferredNickname}
                    onChange={(e) => handleInputChange('preferredNickname', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="How should we address you?"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Current Nation *
                  </label>
                  <select
                    value={formData.currentNation}
                    onChange={(e) => handleInputChange('currentNation', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  >
                    <option value="">Select your nation...</option>
                    {NATIONS.map(nation => (
                      <option key={nation} value={nation}>{nation}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Time Zone *
                  </label>
                  <select
                    value={formData.timeZone}
                    onChange={(e) => handleInputChange('timeZone', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  >
                    <option value="">Select your timezone...</option>
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Naval Experience
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Hours in Naval Action *
                  </label>
                  <input
                    type="number"
                    value={formData.hoursInNavalAction}
                    onChange={(e) => handleInputChange('hoursInNavalAction', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="Enter your total hours in Naval Action"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Current Rank (In-Game) *
                  </label>
                  <select
                    value={formData.currentRank}
                    onChange={(e) => handleInputChange('currentRank', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  >
                    <option value="">Select your current rank...</option>
                    {RANKS.map(rank => (
                      <option key={rank.name} value={rank.name}>
                        {rank.name} ({rank.crew} crew)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Previous Naval Commands
                  </label>
                  <textarea
                    value={formData.previousCommands}
                    onChange={(e) => handleInputChange('previousCommands', e.target.value)}
                    rows={4}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="Describe your previous commands, experience, and notable achievements..."
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Preferred Port Battle Role *
                  </label>
                  <select
                    value={formData.preferredRole}
                    onChange={(e) => handleInputChange('preferredRole', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  >
                    <option value="">Select preferred role...</option>
                    {PORT_BATTLE_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isPortBattleCommander}
                      onChange={(e) => handleInputChange('isPortBattleCommander', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-navy-dark font-semibold" style={{fontFamily: 'Cinzel, serif'}}>
                      Are you a Port Battle Commander?
                    </span>
                  </label>
                  {formData.isPortBattleCommander && (
                    <textarea
                      value={formData.commanderExperience}
                      onChange={(e) => handleInputChange('commanderExperience', e.target.value)}
                      rows={4}
                      className="w-full p-3 border-2 border-navy-dark rounded mt-3"
                      placeholder="Describe your experience as a Port Battle Commander..."
                      style={{fontFamily: 'Crimson Text, serif'}}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Crafting Experience
              </h2>
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isCrafter}
                    onChange={(e) => handleInputChange('isCrafter', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-navy-dark font-semibold" style={{fontFamily: 'Cinzel, serif'}}>
                    Are you a crafter?
                  </span>
                </label>
                <p className="text-navy-dark/70 mt-4" style={{fontFamily: 'Crimson Text, serif'}}>
                  Crafting expertise is valuable for squadron logistics and ship production.
                  This information helps us organize crafting operations and resource management.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Availability and Commitment
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Weekly Play Time (hours) *
                  </label>
                  <input
                    type="number"
                    value={formData.weeklyPlayTime}
                    onChange={(e) => handleInputChange('weeklyPlayTime', e.target.value)}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="How many hours per week do you typically play?"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                    Port Battle Availability *
                  </label>
                  <div className="space-y-2">
                    {PORT_BATTLE_AVAILABILITY.map(availability => (
                      <label key={availability} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.portBattleAvailability.includes(availability)}
                          onChange={() => handleAvailabilityChange(availability)}
                          className="w-5 h-5"
                        />
                        <span className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                          {availability}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Typical Playing Schedule *
                  </label>
                  <textarea
                    value={formData.typicalSchedule}
                    onChange={(e) => handleInputChange('typicalSchedule', e.target.value)}
                    rows={4}
                    className="w-full p-3 border-2 border-navy-dark rounded"
                    placeholder="Describe your typical playing schedule (times, days, etc.)..."
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Declarations
              </h2>
              <div className="space-y-6">
                <div className="bg-sandstone-100 p-6 rounded border-l-4 border-brass">
                  <p className="text-navy-dark text-lg leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                    Please read and agree to the following declarations:
                  </p>
                </div>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.declarationAccuracy}
                    onChange={(e) => handleInputChange('declarationAccuracy', e.target.checked)}
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                    I hereby declare that the information provided in this application is true and accurate to the best of my knowledge.
                    I understand that providing false information may result in the denial of this Letter of Marque or revocation of privateering privileges.
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.declarationHonor}
                    onChange={(e) => handleInputChange('declarationHonor', e.target.checked)}
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                    I pledge to honor the terms of this Letter of Marque and conduct all privateering operations within the bounds of His Majesty's law,
                    to act with honor in my dealings with allies and enemies alike, and to serve the Crown's interests with courage and distinction upon the high seas.
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.declarationRules}
                    onChange={(e) => handleInputChange('declarationRules', e.target.checked)}
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
                    I understand that this Letter of Marque requires adherence to the Articles of Agreement, regular reports of captured prizes,
                    and maintaining the conduct befitting a commissioned privateer in service to His Majesty's Crown.
                  </span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Officer's Signature
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Digital Signature *
                  </label>
                  <p className="text-navy-dark/70 mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
                    Please sign your name in the field below. This serves as your digital signature for this application.
                  </p>
                  <input
                    type="text"
                    value={formData.signature}
                    onChange={(e) => handleInputChange('signature', e.target.value)}
                    className="w-full p-4 border-2 border-navy-dark rounded text-2xl"
                    placeholder="Sign your name here..."
                    style={{fontFamily: 'var(--font-cedarville-cursive), cursive'}}
                  />
                </div>

                <div className="bg-sandstone-100 p-6 rounded">
                  <div className="text-center">
                    <p className="text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      Date of Application
                    </p>
                    <p className="text-xl text-navy-dark" style={{fontFamily: 'var(--font-cedarville-cursive), cursive'}}>
                      {getCurrentDate()}
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {submitError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t-2 border-navy-dark/20">
            {/* Only show Previous button if not on the first step */}
            {currentStep > (session ? 1 : 0) ? (
              <button
                onClick={prevStep}
                className="neo-brutal-button px-6 py-3 font-semibold bg-cannon-smoke text-sail-white"
                style={{fontFamily: 'Cinzel, serif', color: '#f8f9fa !important'}}
              >
                ← Previous
              </button>
            ) : (
              <div></div> // Empty div to maintain flex layout
            )}

            {currentStep < 6 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`neo-brutal-button px-6 py-3 font-semibold ${
                  validateStep(currentStep)
                    ? 'bg-brass text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                style={{fontFamily: 'Cinzel, serif', color: validateStep(currentStep) ? '#ffffff !important' : '#6b7280 !important'}}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(6)}
                className={`neo-brutal-button px-8 py-3 font-semibold ${
                  validateStep(6)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                style={{fontFamily: 'Cinzel, serif', color: validateStep(6) ? '#ffffff !important' : '#6b7280 !important'}}
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
