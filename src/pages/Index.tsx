import { Link } from 'react-router-dom';
import { Calendar, Gift, ShieldCheck, Lock, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#00D98B] text-[#0A0A0A] font-bold flex items-center justify-center text-sm">N</span>
            <span className="text-xl font-bold tracking-tight">NexolPay</span>
          </Link>
          <ul className="hidden md:flex items-center gap-9 text-sm text-white/60">
            <li><a href="#features" className="hover:text-white transition">Platform</a></li>
            <li><a href="#how" className="hover:text-white transition">Solutions</a></li>
            <li><a href="#partners" className="hover:text-white transition">Developers</a></li>
            <li><a href="#cta" className="hover:text-white transition">Pricing</a></li>
          </ul>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline text-sm text-white/70 hover:text-white transition">Sign In</Link>
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
            Built for Africa's creator economy
          </span>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            Your work is global.<br />
            <span className="text-[#00D98B]">Your money should be too.</span>
          </h1>
          <p className="mt-7 text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            You design for clients in London, write for brands in New York, and build products for startups in Dubai. But when it comes to getting paid, saving what you earn, and protecting your work — the system was never built for you. NexolPay is.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/signup"
              className="bg-[#00D98B] text-[#0A0A0A] font-semibold px-7 py-3.5 rounded-full hover:bg-[#00C77E] transition inline-flex items-center gap-2"
            >
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how"
              className="text-white/80 font-medium px-7 py-3.5 rounded-full border border-white/10 hover:bg-white/5 transition"
            >
              See How It Works
            </a>
          </div>

          {/* Trust micro-stats */}
          <div className="mt-14 flex items-center justify-center gap-6 text-xs text-white/50 flex-wrap">
            <span><span className="text-white font-semibold">2,000+</span> freelancers</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span><span className="text-white font-semibold">Zero</span> platform fees on contracts</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span><span className="text-white font-semibold">Instant</span> USDT conversion</span>
          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENT BAND */}
      <section className="border-y border-white/5 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-2xl md:text-4xl font-bold leading-tight tracking-tight text-white/90">
            African freelancers earn globally.<br />
            Getting paid, saving it, and spending it locally? <span className="text-[#00D98B]">That part was broken. Until now.</span>
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-[#00D98B] uppercase tracking-widest mb-3">The Platform</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Everything your money needs.<br />Finally in one place.
            </h2>
            <p className="mt-5 text-white/60 leading-relaxed">
              From landing a client to locking in savings — NexolPay handles the parts that used to keep you up at night.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: 'Stop working on faith.\nStart working on contract.',
                story: "You've been there. You deliver the work, send the invoice, and then wait. And wait. The client goes quiet. The money never comes. NexolPay Escrow changes the deal — the client locks payment before you lift a single finger. You see the funds are secured. Then you get to work. When you hit a milestone and the client approves, the money releases. If they ghost you for 72 hours? It releases anyway. No chasing. No awkward follow-ups. No more working on promises.",
                benefit: 'Get paid for the work you actually delivered.',
                cta: 'Protect your next project',
              },
              {
                icon: Gift,
                title: 'That Amazon gift card in your inbox\nis worth real money. Claim it.',
                story: "A client in the US paid you with an Amazon gift card. Your international platform sent an Apple reward. You have gift cards sitting in your email worth hundreds of dollars — and no easy way to turn them into cash you can actually use. NexolPay converts gift cards from 500+ global brands into USDT, deposited straight into your wallet. No middlemen taking a 40% cut. No WhatsApp trader you found in a group chat. Just your money, in your account, fast.",
                benefit: 'Turn stuck value into spendable USDT in minutes.',
                cta: 'Convert your gift cards',
              },
              {
                icon: Calendar,
                title: 'You earned it in one day.\nYou don\'t have to spend it in one week.',
                story: "Freelance income is feast or famine. One month you land three projects and feel rich. Two weeks later you're rationing data and eating jollof for the fifth day. The problem isn't how much you earn — it's that it all arrives at once and disappears before you can think. The NexolPay Income Scheduler splits your earnings into weekly allowances, paid directly to your wallet like a salary. Deposit what you earned. Tell NexolPay how long to spread it. Watch $250 land every Monday — even when no new work comes in. Financial discipline, without the discipline.",
                benefit: 'Pay yourself weekly. Every week. Even in the slow months.',
                cta: 'Set up your income flow',
              },
              {
                icon: Lock,
                title: 'Your savings should be working\nas hard as you are.',
                story: "You've been keeping your earnings in a wallet, watching them sit. Or worse — keeping them in a bank account that pays you back almost nothing while inflation quietly eats it. NexolPay Vault lets you lock a portion of your income for 3, 6, or 12 months and earn up to 12.5% APY while it sits. The longer you lock, the more you earn. You can't touch it early — which is kind of the point. When it unlocks, your principal comes back with yield attached. Your money grew while you were busy living.",
                benefit: 'Lock it. Leave it. Come back to more.',
                cta: 'Open your vault',
              },
            ].map(({ icon: Icon, title, story, benefit, cta }) => (
              <div
                key={title}
                className="group bg-[#131B24] p-8 rounded-2xl border border-[#00D98B]/15 hover:border-[#00D98B]/40 transition relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00D98B]/0 group-hover:bg-[#00D98B]/10 rounded-full blur-2xl transition" />
                <div className="w-12 h-12 rounded-xl bg-[#00D98B]/10 border border-[#00D98B]/20 flex items-center justify-center mb-6 relative">
                  <Icon className="w-5 h-5 text-[#00D98B]" />
                </div>
                <h3 className="font-bold text-xl md:text-2xl mb-4 relative whitespace-pre-line leading-tight tracking-tight">{title}</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-5 relative">{story}</p>
                <p className="text-sm text-white font-medium mb-5 relative">{benefit}</p>
                <Link to="/signup" className="inline-flex items-center gap-2 text-[#00D98B] font-semibold text-sm hover:gap-3 transition-all relative">
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Set up in minutes.<br />Run on autopilot after that.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Create your account', desc: 'Sign up free. No credit card. KYC takes 2 minutes.' },
              { n: '02', title: 'Connect your money', desc: 'Deposit USDC, convert a gift card, or send a client a contract link.' },
              { n: '03', title: 'Let NexolPay handle the rest', desc: 'Schedule income. Lock savings. Get paid on approval. You focus on the work — we handle the money.' },
            ].map((step) => (
              <div key={step.n} className="bg-[#131B24] border border-white/5 rounded-2xl p-7">
                <p className="text-[#00D98B] font-mono text-sm mb-4">{step.n}</p>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Built with feedback from real freelancers in Lagos, Accra, and Nairobi.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { q: 'I used to dread sending invoices. Now I just send the contract link. Client funds it, I deliver, I get paid. That\'s it.', a: 'UI Designer, Lagos' },
              { q: 'I had three Amazon gift cards sitting in my email for months. Converted all of them to USDT in under 5 minutes.', a: 'Content writer, Abuja' },
              { q: 'The weekly payout feature saved me. I landed a big project in January and I\'m still receiving from it in March.', a: 'Brand strategist, Accra' },
            ].map((t) => (
              <div key={t.a} className="bg-[#131B24] border border-white/5 rounded-2xl p-7">
                <p className="text-white/80 leading-relaxed mb-5">"{t.q}"</p>
                <p className="text-xs text-[#00D98B] font-medium uppercase tracking-wider">— {t.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS / ECOSYSTEM */}
      <section id="partners" className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-8">
            Powered by trusted infrastructure
          </p>
          <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap opacity-50 grayscale">
            {['Stellar', 'USDC', 'Base', 'Paystack', 'Supabase'].map((name) => (
              <span key={name} className="text-lg md:text-xl font-bold text-white/60 tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="cta" className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#131B24] to-[#0A0A0A] border border-[#00D98B]/20 rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#00D98B]/15 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              You've been working hard.<br />
              <span className="text-[#00D98B]">It's time your money worked too.</span>
            </h2>
            <p className="mt-5 text-white/60 max-w-xl mx-auto leading-relaxed">
              Join thousands of African freelancers and creators who are done leaving money on the table. Your first contract, your first conversion, your first weekly payout — it all starts here.
            </p>
            <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/signup"
                className="bg-[#00D98B] text-[#0A0A0A] font-semibold px-8 py-4 rounded-full hover:bg-[#00C77E] transition inline-flex items-center gap-2"
              >
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:hello@nexolpay.com"
                className="text-white/80 font-medium px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition"
              >
                Talk to us
              </a>
            </div>
            <p className="mt-6 text-xs text-white/40">
              Free to start. No credit card required. Live in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-14 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-[#00D98B] text-[#0A0A0A] font-bold flex items-center justify-center text-sm">N</span>
              <span className="text-lg font-bold">NexolPay</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Built for African freelancers earning globally.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Product</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#features" className="hover:text-white transition">Platform</a></li>
              <li><a href="#how" className="hover:text-white transition">Solutions</a></li>
              <li><a href="#cta" className="hover:text-white transition">Pricing</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Company</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
              <li><a href="mailto:hello@nexolpay.com" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Stay in touch</p>
            <p className="text-sm text-white/60 mb-3">Updates from the team, no spam.</p>
            <a href="mailto:hello@nexolpay.com" className="text-sm text-[#00D98B] hover:underline">hello@nexolpay.com</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2025 NexolPay. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
