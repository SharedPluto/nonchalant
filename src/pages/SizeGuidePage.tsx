import { Link } from 'react-router-dom';
import { Ruler, Shirt, Footprints } from 'lucide-react';
import MetaTags from '@/components/seo/MetaTags';

const shoeSizes = [
  { us: '7', uk: '6', eu: '40', cm: '25' },
  { us: '7.5', uk: '6.5', eu: '40.5', cm: '25.5' },
  { us: '8', uk: '7', eu: '41', cm: '26' },
  { us: '8.5', uk: '7.5', eu: '42', cm: '26.5' },
  { us: '9', uk: '8', eu: '42.5', cm: '27' },
  { us: '9.5', uk: '8.5', eu: '43', cm: '27.5' },
  { us: '10', uk: '9', eu: '44', cm: '28' },
  { us: '10.5', uk: '9.5', eu: '44.5', cm: '28.5' },
  { us: '11', uk: '10', eu: '45', cm: '29' },
  { us: '12', uk: '11', eu: '46', cm: '30' },
];

const clothingSizes = [
  { size: 'XS', chest: '34"', waist: '28"', hip: '34"' },
  { size: 'S', chest: '36"', waist: '30"', hip: '36"' },
  { size: 'M', chest: '38"', waist: '32"', hip: '38"' },
  { size: 'L', chest: '40"', waist: '34"', hip: '40"' },
  { size: 'XL', chest: '42"', waist: '36"', hip: '42"' },
  { size: 'XXL', chest: '44"', waist: '38"', hip: '44"' },
];

export default function SizeGuidePage() {
  return (
    <>
      <MetaTags
        title="Size Guide"
        description="Find your perfect fit with our comprehensive size guide for shoes, clothing, and accessories at NonChalant."
        url="https://nonchalant.co/size-guide"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 pb-24">
          {/* Breadcrumb */}
          <nav className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)] mb-8">
            <Link to="/" className="hover:text-[var(--nc-purple)] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--nc-text)]">Size Guide</span>
          </nav>

          <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] mb-4">
            Size Guide
          </h1>
          <p className="text-[var(--nc-grey)] mb-12 max-w-[500px]">
            Find your perfect fit. Use the charts below to convert between international sizing standards.
          </p>

          {/* Shoes */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Footprints size={24} className="text-[var(--nc-purple)]" />
              <h2 className="font-display text-xl uppercase tracking-[0.02em]">Shoes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--nc-border)]">
                    <th className="text-left py-3 px-4 text-[var(--nc-grey)] uppercase tracking-wider text-[11px]">US</th>
                    <th className="text-left py-3 px-4 text-[var(--nc-grey)] uppercase tracking-wider text-[11px]">UK</th>
                    <th className="text-left py-3 px-4 text-[var(--nc-grey)] uppercase tracking-wider text-[11px]">EU</th>
                    <th className="text-left py-3 px-4 text-[var(--nc-grey)] uppercase tracking-wider text-[11px]">CM</th>
                  </tr>
                </thead>
                <tbody>
                  {shoeSizes.map((row, i) => (
                    <tr key={row.us} className={`border-b border-[var(--nc-border)] ${i % 2 === 0 ? 'bg-[var(--nc-offwhite)]/50' : ''}`}>
                      <td className="py-3 px-4 font-medium">{row.us}</td>
                      <td className="py-3 px-4">{row.uk}</td>
                      <td className="py-3 px-4">{row.eu}</td>
                      <td className="py-3 px-4">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--nc-grey)] mt-4">
              * Sneaker sizing varies by brand. Nike and Adidas typically run true to size. 
              For New Balance 550, we recommend going half a size up.
            </p>
          </section>

          {/* Clothing */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Shirt size={24} className="text-[var(--nc-purple)]" />
              <h2 className="font-display text-xl uppercase tracking-[0.02em]">Clothing</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--nc-border)]">
                    <th className="text-left py-3 px-4 text-[var(--nc-grey)] uppercase tracking-wider text-[11px]">Size</th>
                    <th className="text-left py-3 px-4 text-[var(--nc-grey)] uppercase tracking-wider text-[11px]">Chest</th>
                    <th className="text-left py-3 px-4 text-[var(--nc-grey)] uppercase tracking-wider text-[11px]">Waist</th>
                    <th className="text-left py-3 px-4 text-[var(--nc-grey)] uppercase tracking-wider text-[11px]">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {clothingSizes.map((row, i) => (
                    <tr key={row.size} className={`border-b border-[var(--nc-border)] ${i % 2 === 0 ? 'bg-[var(--nc-offwhite)]/50' : ''}`}>
                      <td className="py-3 px-4 font-medium">{row.size}</td>
                      <td className="py-3 px-4">{row.chest}</td>
                      <td className="py-3 px-4">{row.waist}</td>
                      <td className="py-3 px-4">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--nc-grey)] mt-4">
              * Measurements are approximate and vary by brand. 
              Japanese brands (like Y-3) tend to run smaller — size up for an oversized fit.
            </p>
          </section>

          {/* How to Measure */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Ruler size={24} className="text-[var(--nc-purple)]" />
              <h2 className="font-display text-xl uppercase tracking-[0.02em]">How to Measure</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
                { title: 'Waist', desc: 'Measure around your natural waistline — the narrowest part of your torso.' },
                { title: 'Hip', desc: 'Measure around the fullest part of your hips, about 8" below your waist.' },
              ].map((item) => (
                <div key={item.title} className="border border-[var(--nc-border)] p-6">
                  <h3 className="font-medium text-sm uppercase tracking-wider mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--nc-grey)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
