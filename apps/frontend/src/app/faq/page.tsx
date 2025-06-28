import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - KRAKEN',
  description: 'Frequently Asked Questions about KRAKEN Gaming',
};

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I join KRAKEN?",
      answer: "Visit our application page and fill out the recruitment form. We're always looking for skilled captains to join our fleet!"
    },
    {
      question: "What is Naval Action?",
      answer: "Naval Action is a hardcore sailing simulation game set in the Caribbean during the Age of Sail. Command your ship, engage in epic naval battles, and build your trading empire."
    },
    {
      question: "Do I need to be experienced to join?",
      answer: "Not at all! We welcome captains of all skill levels. Our experienced officers will help train new recruits in naval tactics and ship handling."
    },
    {
      question: "What activities does KRAKEN participate in?",
      answer: "We engage in port battles, fleet operations, trading expeditions, and regular training exercises. We also organize special events and tournaments."
    },
    {
      question: "How active do I need to be?",
      answer: "We understand that real life comes first. While we appreciate active participation, we're flexible with activity requirements. Just let us know if you'll be away for extended periods."
    },
    {
      question: "Can I play solo or do I have to participate in group activities?",
      answer: "While we encourage group activities for the full KRAKEN experience, you're free to sail solo when needed. Many of our members enjoy both group and solo gameplay."
    },
    {
      question: "What time zones do KRAKEN members play in?",
      answer: "We have members across multiple time zones, with strong presence in US and EU times. Most major operations are scheduled to accommodate our international fleet."
    },
    {
      question: "How do I report bugs or issues with the website?",
      answer: "Use our bug report system to submit any issues you encounter. Include as much detail as possible to help us resolve problems quickly."
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-ocean-dark via-ocean-medium to-ocean-light pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-sail-white/80 max-w-2xl mx-auto" style={{fontFamily: 'Crimson Text, serif'}}>
            Find answers to common questions about KRAKEN Gaming and Naval Action
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-sail-white/95 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-navy-dark mb-3" style={{fontFamily: 'Cinzel, serif'}}>
                {faq.question}
              </h3>
              <p className="text-navy-dark/80 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-sail-white/95 rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Still have questions?
            </h3>
            <p className="text-navy-dark/80 mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
              Join our Discord community or submit an application to speak with our officers directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://discord.gg/krakengaming"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Join Discord
              </a>
              <a
                href="/apply"
                className="bg-brass text-navy-dark px-6 py-3 rounded-lg hover:bg-brass-bright transition-colors font-semibold"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
