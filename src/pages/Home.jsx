import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center px-8 transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-noble-green to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/20">V</div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-widest uppercase">Value<span className="text-primary">Hills</span></h1>
        </div>
        <nav className="hidden md:flex gap-8">
          <a href="#about" className="text-noble-gray hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide">Mission</a>
          <a href="#governance" className="text-noble-gray hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide">Governance</a>
          <a href="#community" className="text-noble-gray hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide">Community</a>
        </nav>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2.5 text-white hover:text-primary font-bold transition-colors">Login</Link>
          <Link to="/signup" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-full font-bold transition-all">Join Cooperative</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 min-h-screen flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-noble-green/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-noble-gold/5 rounded-full blur-[120px] -z-10 -translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Authorized Cooperative
            </span>
            <h2 className="text-5xl md:text-7xl font-black leading-[1] font-heading text-white tracking-tighter">
              Community Wealth, <br />
              <span className="text-gradient-lime">Sustainable Future.</span>
            </h2>
            <p className="text-xl text-noble-gray max-w-lg leading-relaxed font-light">
              Join the ValueHills Cooperative. Access credit, accumulate assets, and build financial security through structured, regulated contributions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Link to="/signup" className="btn-neo">Become a Member</Link>
              <a href="#about" className="btn-outline-neo">Our Mission</a>
            </div>

            <div className="flex items-center gap-4 text-xs text-noble-gray pt-4">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Regulated</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Audited</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Secure</span>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="relative z-10 glass-panel p-8 rounded-[2rem] border-white/10 hover:border-primary/50 transition-all duration-500">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-noble-gray text-xs uppercase tracking-wider font-bold">Cooperative Assets</p>
                  <h3 className="text-5xl font-bold text-white mt-2 font-heading tracking-tighter">₦85.2M</h3>
                </div>
                <div className="bg-primary/20 text-primary p-4 rounded-full">
                  <div className="w-6 h-6">🛡️</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-surfaceHighlight/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">1</div>
                    <div>
                      <p className="font-bold text-white text-lg">Platinum Tier</p>
                      <p className="text-xs text-noble-gray uppercase tracking-wider">Membership</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold text-sm">Active</span>
                </div>
                <div className="bg-surfaceHighlight/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xl">BV</div>
                    <div>
                      <p className="font-bold text-white text-lg">Activity Points</p>
                      <p className="text-xs text-noble-gray uppercase tracking-wider">Volume</p>
                    </div>
                  </div>
                  <span className="text-secondary font-bold text-xl">450</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-slate-700 place-items-center grid text-xs text-white/50">{i}</div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground font-bold grid place-items-center">+500</div>
                </div>
                <span className="text-noble-gray text-sm font-medium">Verified Partners</span>
              </div>
            </div>
            {/* Decorative blobs behind card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-noble-green/10 blur-3xl -z-10 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features/Vision */}
      <section id="about" className="py-24 px-8 bg-surface">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-bold font-heading text-white">Ethical Financial Growth</h3>
            <p className="text-noble-gray text-lg leading-relaxed">We operate on strict cooperative principles. Member-owned, member-driven, and fully transparent.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Asset Accumulation"
              desc="Build tangible wealth through our structured 45-week contribution cycles, secured by the cooperative."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
              color="green"
            />
            <FeatureCard
              title="Business Volume"
              desc="Earn activity points (BV) that unlock higher credit limits and cooperative benefits."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
              color="gold"
            />
            <FeatureCard
              title="Transparent Governance"
              desc="Full visibility into cooperative assets versus operational fees. Auditable and secure."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
              color="blue"
            />
          </div>
        </div>
      </section>

      <footer className="bg-background border-t border-white/5 text-noble-gray py-12 text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} ValueHills Cooperative Society. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, desc, icon, color }) => {
  const isGold = color === 'gold';
  const isBlue = color === 'blue';
  return (
    <div className="glass-card p-10 rounded-[2rem] group text-left hover:bg-surfaceHighlight">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-colors ${isGold ? 'bg-primary/10 text-primary' : isBlue ? 'bg-secondary/10 text-secondary' : 'bg-white/10 text-white'}`}>
        {icon}
      </div>
      <h4 className="text-2xl font-bold mb-4 text-white font-heading">{title}</h4>
      <p className="text-noble-gray group-hover:text-white transition-colors leading-relaxed">{desc}</p>
    </div>
  )
}

export default Home;
