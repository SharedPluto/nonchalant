import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Check } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import MetaTags from '@/components/seo/MetaTags';

export default function AboutPage() {
  const { ref: heroRef, isInView: heroInView } = useInView();
  const { ref: valuesRef, isInView: valuesInView } = useInView();
  const { ref: contactRef, isInView: contactInView } = useInView();

  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <MetaTags
        title="About"
        description="NonChalant is a premium streetwear marketplace built for those who know. Authenticity guaranteed, curated selection, without the effort."
        url="https://nonchalant.co/about"
        type="website"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[60px]">
        {/* About Hero */}
        <section ref={heroRef} className="min-h-[calc(100vh-60px)] bg-[var(--nc-cream)]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 h-full py-16 md:py-24 items-center">
              {/* Text */}
              <div
                className={`transition-all duration-700 ${
                  heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              >
                <p className="text-eyebrow mb-4">About NonChalant</p>
                <h1 className="font-display text-3xl md:text-5xl lg:text-6xl uppercase tracking-[0.02em] leading-[1.1]">
                  Born from the streets.<br />
                  Curated for the few.
                </h1>
                <p className="mt-6 text-base text-[var(--nc-text)]/70 leading-relaxed max-w-[420px]">
                  NonChalant is a premium streetwear marketplace built for those who know. 
                  We connect you with the most sought-after drops, rare collabs, and timeless 
                  pieces — without the noise, without the queues, without the effort.
                </p>
                <Link to="/shop" className="btn-primary inline-block mt-8">
                  SHOP NOW →
                </Link>
              </div>

              {/* Image */}
              <div
                className={`transition-all duration-700 delay-200 ${
                  heroInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="/assets/about-hero.jpg"
                    alt="Streetwear fashion"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Philosophy */}
        <section ref={valuesRef} className="relative bg-[var(--nc-black)] text-[var(--nc-cream)] py-24 md:py-32 overflow-hidden">
          {/* Floating Shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src="/assets/shape-cube.png"
              alt=""
              className="absolute top-[10%] right-[5%] w-[200px] md:w-[300px] opacity-40 animate-float-1"
              style={{ animationDelay: '0s' }}
            />
            <img
              src="/assets/shape-octahedron.png"
              alt=""
              className="absolute top-[40%] left-[3%] w-[120px] md:w-[180px] opacity-30 animate-float-2"
              style={{ animationDelay: '2s' }}
            />
            <img
              src="/assets/shape-sphere.png"
              alt=""
              className="absolute bottom-[15%] right-[20%] w-[160px] md:w-[240px] opacity-35 animate-float-3"
              style={{ animationDelay: '4s' }}
            />
          </div>

          <div className="relative max-w-[1200px] mx-auto px-6 md:px-12">
            <div className="max-w-[600px] space-y-16">
              {[
                {
                  num: '01',
                  title: 'AUTHENTICITY GUARANTEED',
                  desc: "Every item is verified. Every brand is official. No fakes, no fluff — just the real deal from the brands you trust.",
                },
                {
                  num: '02',
                  title: 'CURATED SELECTION',
                  desc: "We don't carry everything. We carry the right things. Our team handpicks each drop, each collab, each restock — so you don't have to dig through the noise.",
                },
                {
                  num: '03',
                  title: 'WITHOUT THE EFFORT',
                  desc: 'No campouts. No raffles. No bot wars. Just browse, click, and cop. We handle the hustle so you stay nonchalant.',
                },
              ].map((value, index) => (
                <div
                  key={value.num}
                  className={`transition-all duration-700 ${
                    valuesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                  style={{ transitionDelay: `${index * 0.2}s` }}
                >
                  <span className="font-display text-5xl md:text-7xl text-[var(--nc-lime)] opacity-30">
                    {value.num}
                  </span>
                  <h3 className="font-display text-xl md:text-2xl uppercase tracking-[0.02em] mt-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-[var(--nc-grey)] leading-relaxed mt-3">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section ref={contactRef} className="bg-[var(--nc-cream)] py-16 md:py-24 border-t border-[var(--nc-border)]">
          <div className="max-w-[800px] mx-auto px-6 md:px-12">
            {/* Header */}
            <div
              className={`text-center mb-12 transition-all duration-600 ${
                contactInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              <p className="text-eyebrow mb-3">Get in Touch</p>
              <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em]">
                Let&apos;s Talk
              </h2>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 transition-all duration-600 delay-200 ${
                contactInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              {/* Contact Info */}
              <div>
                <div className="space-y-3">
                  <a
                    href="mailto:hello@nonchalant.co"
                    className="block text-base hover:text-[var(--nc-purple)] transition-colors"
                  >
                    hello@nonchalant.co
                  </a>
                  <p className="text-base">+1 (555) 123-4567</p>
                  <p className="text-sm text-[var(--nc-grey)]">
                    123 Streetwear Ave<br />
                    New York, NY 10001
                  </p>
                </div>

                {/* Social */}
                <div className="flex items-center gap-4 mt-8">
                  {['Instagram', 'Twitter', 'TikTok'].map((social) => (
                    <span
                      key={social}
                      className="text-xs uppercase tracking-wider text-[var(--nc-text)] hover:text-[var(--nc-purple)] cursor-pointer transition-colors"
                    >
                      {social}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div>
                {submitted ? (
                  <div className="flex items-center gap-3 text-[var(--nc-purple)]">
                    <Check size={20} />
                    <p>Message sent. We&apos;ll be in touch.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-[var(--nc-card-bg)] border border-[var(--nc-border)] px-4 py-3 text-sm text-[var(--nc-text)] placeholder:text-[var(--nc-text-dimmed)] focus:border-[var(--nc-purple)] outline-none transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full bg-[var(--nc-card-bg)] border border-[var(--nc-border)] px-4 py-3 text-sm text-[var(--nc-text)] placeholder:text-[var(--nc-text-dimmed)] focus:border-[var(--nc-purple)] outline-none transition-colors"
                    />
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[var(--nc-card-bg)] border border-[var(--nc-border)] px-4 py-3 text-sm text-[var(--nc-text)] focus:border-[var(--nc-purple)] outline-none transition-colors appearance-none"
                    >
                      <option>General</option>
                      <option>Order Inquiry</option>
                      <option>Returns</option>
                      <option>Collaboration</option>
                    </select>
                    <textarea
                      placeholder="Your message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full bg-[var(--nc-card-bg)] border border-[var(--nc-border)] px-4 py-3 text-sm text-[var(--nc-text)] placeholder:text-[var(--nc-text-dimmed)] focus:border-[var(--nc-purple)] outline-none transition-colors resize-none"
                    />
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                      <Send size={14} />
                      SEND MESSAGE
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
