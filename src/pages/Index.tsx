import { Link } from 'react-router-dom';
import { Calendar, Gift, ShieldCheck, Check, ArrowRight, Lock, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight">Nexol</span>
            <span className="text-xl font-bold tracking-tight text-[#00D98B]">Pay</span>
          </Link>
          <ul className="hidden md:flex items-center gap-9 text-sm text-white/60">
            <li><a href="#features" className="hover:text-white transition">Features</a></li>
            <li><a href="#how" className="hover:text-white transition">How it works</a></li>
            <li><a href="#security" className="hover:text-white transition">Security</a></li>
          </ul>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline text-sm text-white/70 hover:text-white transition">Sign in</Link>
            <Link
              to="/signup"
              className="bg-[#00D98B] text-[#0A0A0A] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#00C77E] transition"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00D98B]/10 rounded-full blur-[120px] -z-0" />
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28 text-center relative">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-[#00D98B] bg-[#00D98B]/10 border border-[#00D98B]/20 px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D98B] animate-pulse" />
            Stellar testnet — live & verifiable
          </span>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            Crypto payments<br />
            <span className="text-[#00D98B]">that just work.</span>
          </h1>
          <p className="mt-7 text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            Schedule recurring USDC payouts, redeem gift cards for instant USDT, and lock freelance work in on-chain escrow. Built on Stellar.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/signup"
              className="bg-[#00D98B] text-[#0A0A0A] font-semibold px-7 py-3.5 rounded-full hover:bg-[#00C77E] transition inline-flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="text-white/80 font-medium px-7 py-3.5 rounded-full border border-white/10 hover:bg-white/5 transition"
            >
              Explore features
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-16 flex items-center justify-center gap-8 text-xs text-white/40 font-mono uppercase tracking-widest flex-wrap">
            <span>Stellar</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>USDC</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Soroban</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Paystack</span>
          </div>
        </div>
      </section>

      {/* FEATURES — 3 only */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[#00D98B] uppercase tracking-widest mb-3">What we build</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Three powerful tools.<br />One dashboard.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Calendar,
                title: 'Income Scheduler',
                desc: 'Lock USDC and stream weekly payouts to your wallet. Set it once — Stellar releases on schedule.',
                accent: 'For freelancers managing irregular income',
              },
              {
                icon: Gift,
                title: 'Gift Card to USDT',
                desc: 'Redeem gift cards from 50+ brands and receive USDT instantly in your wallet.',
                accent: '500+ supported brands',
              },
              {
                icon: ShieldCheck,
                title: 'Freelancer Escrow',
                desc: 'Lock client funds in Stellar escrow, deliver milestone work, get paid on approval. 72h auto-release.',
                accent: 'Trustless & on-chain',
              },
            ].map(({ icon: Icon, title, desc, accent }) => (
              <div
                key={title}
                className="group bg-[#131B24] p-7 rounded-2xl border border-white/5 hover:border-[#00D98B]/30 transition relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00D98B]/0 group-hover:bg-[#00D98B]/10 rounded-full blur-2xl transition" />
                <div className="w-12 h-12 rounded-xl bg-[#00D98B]/10 border border-[#00D98B]/20 flex items-center justify-center mb-6 relative">
                  <Icon className="w-5 h-5 text-[#00D98B]" />
                </div>
                <h3 className="font-bold text-lg mb-2 relative">{title}</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-5 relative">{desc}</p>
                <p className="text-xs font-mono uppercase tracking-wider text-[#00D98B]/70 relative">{accent}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Freelancer Escrow spotlight */}
      <section id="how" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold text-[#00D98B] uppercase tracking-widest mb-3">Freelancer Escrow</p>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
              Get paid for the work you actually shipped.
            </h2>
            <p className="mt-5 text-white/60 leading-relaxed text-lg">
              Create a contract in 60 seconds. Send your client a link. Funds get locked in Stellar escrow. You release one milestone at a time.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Client funds escrow on Stellar testnet — verifiable on-chain',
                'Milestone-based releases with deliverable proof',
                '72-hour auto-release if client goes silent',
                'Zero platform fee on the contract itself',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/80">
                  <span className="w-5 h-5 rounded-full bg-[#00D98B]/15 border border-[#00D98B]/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3 text-[#00D98B]" />
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="mt-9 inline-flex items-center gap-2 text-[#00D98B] font-semibold text-sm hover:gap-3 transition-all"
            >
              Create your first contract <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mock contract card */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#00D98B]/10 rounded-3xl blur-3xl" />
            <div className="relative bg-[#131B24] border border-white/10 rounded-3xl p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Contract NXC-9417</p>
                  <p className="font-bold mt-1">Brand Identity for Acme Co.</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#00D98B]/15 text-[#00D98B] border border-[#00D98B]/25">
                  Active
                </span>
              </div>
              <div className="bg-[#0A0A0A]/60 rounded-xl p-4 mb-5 border border-white/5">
                <p className="text-xs text-white/40 mb-1">In escrow</p>
                <p className="font-mono text-2xl font-bold text-[#00D98B]">$4,500.00</p>
                <p className="text-[10px] text-white/40 mt-1 font-mono">GAXX...K7Q2 · Stellar</p>
              </div>
              <div className="space-y-3">
                {[
                  { n: 1, t: 'Discovery & Mood Boards', amt: '$1,000', s: 'paid' },
                  { n: 2, t: 'Logo Concepts', amt: '$1,500', s: 'pending' },
                  { n: 3, t: 'Final Brand Kit', amt: '$2,000', s: 'locked' },
                ].map((m) => (
                  <div key={m.n} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${m.s === 'paid' ? 'bg-[#00D98B]' : m.s === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-white/20'}`} />
                      <div>
                        <p className="text-sm font-medium">{m.n}. {m.t}</p>
                        <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
                          {m.s === 'paid' ? 'Released' : m.s === 'pending' ? 'Awaiting approval' : 'Locked'}
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-sm">{m.amt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-[#00D98B] uppercase tracking-widest mb-3">Security</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Built on Stellar. Verifiable on-chain.</h2>
          <p className="mt-5 text-white/60 max-w-2xl mx-auto leading-relaxed">
            Every escrow account is funded via Stellar friendbot on testnet. Every release is a real Horizon transaction you can inspect in any Stellar explorer.
          </p>
          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Lock, title: 'Non-custodial escrow', desc: 'Funds locked at the protocol level, not held by us.' },
              { icon: Zap, title: 'Sub-5s settlement', desc: 'Stellar finalizes transfers in seconds, not days.' },
              { icon: ShieldCheck, title: 'Auditable receipts', desc: 'Every milestone release links to a Stellar tx hash.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#131B24] border border-white/5 rounded-2xl p-6 text-left">
                <Icon className="w-5 h-5 text-[#00D98B] mb-4" />
                <p className="font-bold mb-1.5">{title}</p>
                <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#131B24] to-[#0A0A0A] border border-[#00D98B]/20 rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#00D98B]/15 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Ready to get paid <span className="text-[#00D98B]">on-chain?</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-lg mx-auto">
              Free to start. No credit card. Live on Stellar testnet today.
            </p>
            <Link
              to="/signup"
              className="mt-9 inline-flex items-center gap-2 bg-[#00D98B] text-[#0A0A0A] font-semibold px-8 py-4 rounded-full hover:bg-[#00C77E] transition"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold">Nexol</span>
            <span className="text-lg font-bold text-[#00D98B]">Pay</span>
          </div>
          <p className="text-xs text-white/40">© 2025 NexolPay. Built on Stellar.</p>
          <div className="flex gap-5 text-xs text-white/40">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="mailto:hello@nexolpay.com" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
