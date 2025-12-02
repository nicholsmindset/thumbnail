
import React, { useState } from 'react';
import { Check, ArrowRight, Zap, TrendingUp, Sparkles, X, ChevronDown, ChevronUp, Clock, Youtube, Video, Eye, ShieldCheck, BarChart2, MousePointer2 } from 'lucide-react';
import { CREDIT_COSTS } from '../types';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // Mock array for background grid
  const viralThumbnails = Array(12).fill(0);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50 font-inter selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <Youtube size={20} className="text-white" fill="currentColor"/>
                </div>
                <span className="font-bold text-lg tracking-tight">ThumbGen AI</span>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={onStart} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Login
                </button>
                <button 
                    onClick={onStart}
                    className="px-4 py-2 bg-white text-slate-900 text-sm font-bold rounded-full hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                >
                    Start Free Trial
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* Background Viral Grid Overlay */}
        <div className="absolute inset-0 z-0 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-10 pointer-events-none p-4 rotate-3 scale-110">
             {viralThumbnails.map((_, i) => (
                 <div key={i} className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative">
                    {/* Placeholder gradient simulation of a thumbnail */}
                    <div className={`w-full h-full bg-gradient-to-br ${
                        i % 3 === 0 ? 'from-red-500 to-orange-600' : 
                        i % 3 === 1 ? 'from-blue-500 to-indigo-600' : 
                        'from-green-500 to-teal-600'
                    }`}></div>
                    <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] px-1 rounded">10:24</div>
                 </div>
             ))}
        </div>
        
        {/* Dark overlay to ensure text readability over the grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950 z-0 pointer-events-none"></div>

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur">
                <Sparkles size={12} /> Based on $100M Offers Framework
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-2xl">
                Transform Any Viral Thumbnail Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">YOUR Thumbnail</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                Same Style. YOUR Face. Higher CTR. <br className="hidden md:block"/>
                <span className="text-slate-400">Create $500 thumbnails in 60 seconds. No designer needed.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <button 
                    onClick={onStart}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold rounded-xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all flex items-center gap-2 group"
                >
                    Start Free Trial <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-slate-400 font-medium">No Credit Card Required • 10 Free Credits</p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-slate-400 font-medium opacity-80">
                <span className="flex items-center gap-2"><Check size={16} className="text-green-500"/> 60-Second Generation</span>
                <span className="flex items-center gap-2"><Check size={16} className="text-green-500"/> $0.19/thumbnail</span>
                <span className="flex items-center gap-2"><Check size={16} className="text-green-500"/> 14-Day Guarantee</span>
            </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">The Thumbnail Problem Most Creators Ignore</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <p className="text-lg text-slate-300">
                        You've probably noticed something frustrating. Creators with half your talent are getting twice your views.
                    </p>
                    <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg">
                        <p className="font-bold text-red-200">The brutal truth about YouTube:</p>
                        <ul className="mt-2 space-y-2 text-red-200/80 text-sm">
                            <li>• 90% of viewers click based on the thumbnail alone.</li>
                            <li>• You have less than 2 seconds to grab attention.</li>
                            <li>• A "meh" thumbnail costs you 10X the views.</li>
                        </ul>
                    </div>
                    <p className="text-slate-400">
                        Hiring a pro designer costs $50-$200 per thumbnail. Learning Photoshop takes months. Meanwhile, the top 1% use a proven formula.
                    </p>
                    <p className="text-xl font-bold text-white">
                        What if you could steal their formula... in 60 seconds?
                    </p>
                </div>
                <div className="relative">
                    {/* Visual representation of problem */}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl rotate-2">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                            <span className="text-sm font-bold text-red-400">Traditional Way</span>
                            <span className="text-xs text-slate-500">Expensive & Slow</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm"><span>Designer Cost</span> <span className="text-slate-300">$150.00</span></div>
                            <div className="flex justify-between text-sm"><span>Turnaround</span> <span className="text-slate-300">3 Days</span></div>
                            <div className="flex justify-between text-sm"><span>Revisions</span> <span className="text-slate-300">Limited</span></div>
                            <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800"><span>Total</span> <span className="text-white">$600/mo</span></div>
                        </div>
                    </div>
                    <div className="absolute -bottom-6 -left-6 bg-indigo-600 p-6 rounded-2xl shadow-2xl -rotate-2 w-full">
                         <div className="flex items-center justify-between mb-4 border-b border-indigo-500 pb-4">
                            <span className="text-sm font-bold text-white">ThumbGen AI</span>
                            <span className="text-xs text-indigo-200">Fast & Affordable</span>
                        </div>
                        <div className="space-y-3 text-indigo-100">
                            <div className="flex justify-between text-sm"><span>Cost</span> <span className="font-bold text-white">$0.19</span></div>
                            <div className="flex justify-between text-sm"><span>Time</span> <span className="font-bold text-white">60 Seconds</span></div>
                            <div className="flex justify-between text-sm"><span>CTR Audit</span> <span className="font-bold text-white">Included</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm">How It Works</span>
                <h2 className="text-4xl font-bold mt-2">Clone Viral Styles. Feature Yourself.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "1. Find Inspiration", desc: "See a thumbnail from MrBeast or MKBHD that's crushing it? Save it.", icon: <Sparkles className="text-yellow-400"/> },
                    { title: "2. Upload Your Face", desc: "Just a clear photo of yourself. No fancy setup needed. The AI handles the rest.", icon: <Clock className="text-indigo-400"/> },
                    { title: "3. AI Magic", desc: "Our AI replicates the lighting, composition, and emotion with YOUR face in 60 seconds.", icon: <Zap className="text-purple-400"/> }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-colors">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                        <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* NEW FEATURE: AI CTR AUDIT */}
      <section className="py-24 px-6 bg-indigo-950/20 border-y border-indigo-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                    <TrendingUp size={12} /> New Feature
                </div>
                <h2 className="text-4xl font-bold mb-6">Know Your Viral Score <br/> <span className="text-indigo-400">Before You Publish</span></h2>
                <p className="text-lg text-slate-300 mb-8">
                    Stop guessing. ThumbGen AI tells you exactly how clickable your thumbnail is — and how to make it better using data from millions of high-performing videos.
                </p>
                
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Viral Score (0-100)</h4>
                            <p className="text-slate-400 text-sm">Predicted probability of high CTR based on proven patterns.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Weakness Detection</h4>
                            <p className="text-slate-400 text-sm">Identify exactly what's hurting your views (e.g., "Text too small").</p>
                        </div>
                    </div>
                     <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            <MousePointer2 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Actionable Fixes</h4>
                            <p className="text-slate-400 text-sm">Get specific instructions like "Increase contrast by 10%".</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mockup of Audit */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-6 relative">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Analysis Result</h3>
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">Score: 84/100</div>
                 </div>
                 
                 <div className="space-y-4">
                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Strengths</h4>
                        <div className="flex items-center gap-2 text-sm text-green-300"><Check size={14}/> Strong eye contact</div>
                        <div className="flex items-center gap-2 text-sm text-green-300"><Check size={14}/> High contrast text</div>
                     </div>
                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Improvements</h4>
                        <div className="flex items-center gap-2 text-sm text-orange-300"><Zap size={14}/> Brighten background exposure</div>
                        <div className="flex items-center gap-2 text-sm text-orange-300"><Zap size={14}/> Increase saturation of subject</div>
                     </div>
                 </div>

                 <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                    <p className="text-sm text-slate-500">"It's like having a YouTube algorithm expert on call 24/7."</p>
                 </div>
            </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Simple Pricing. Insane Value.</h2>
                <p className="text-slate-400">Lock in early adopter pricing forever.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
                
                {/* Free */}
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-slate-300 mb-2">Free Trial</h3>
                    <div className="text-4xl font-black text-white mb-6">$0</div>
                    <ul className="space-y-3 mb-8 text-sm text-slate-400">
                        <li className="flex gap-2"><Check size={16} className="text-slate-500"/> 10 Credits (1 Free Thumbnail)</li>
                        <li className="flex gap-2"><Check size={16} className="text-slate-500"/> Standard Quality</li>
                        <li className="flex gap-2"><Check size={16} className="text-slate-500"/> Test the Magic</li>
                    </ul>
                    <button onClick={onStart} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">
                        Try For Free
                    </button>
                </div>

                {/* Creator - Highlight */}
                <div className="bg-slate-900 p-8 rounded-2xl border-2 border-indigo-500 relative transform md:-translate-y-4 shadow-2xl shadow-indigo-500/20">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                        Best Value
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Creator Plan</h3>
                    <div className="text-4xl font-black text-white mb-1">$19<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                    <p className="text-xs text-indigo-300 mb-6 font-medium">Approx $0.19 per thumbnail</p>
                    
                    <ul className="space-y-3 mb-8 text-sm text-slate-300">
                        <li className="flex gap-2"><Check size={16} className="text-green-400"/> 1,000 Credits / mo</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-400"/> ~100 Thumbnails</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-400"/> AI CTR Audit Access</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-400"/> Commercial License</li>
                        <li className="flex gap-2"><Check size={16} className="text-green-400"/> Video Beta Access</li>
                    </ul>
                    <button onClick={onStart} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg">
                        Start Creating
                    </button>
                </div>

                {/* Agency */}
                 <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-purple-300 mb-2">Agency Plan</h3>
                    <div className="text-4xl font-black text-white mb-6">$49<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                    <ul className="space-y-3 mb-8 text-sm text-slate-400">
                        <li className="flex gap-2"><Check size={16} className="text-purple-500"/> 5,000 Credits / mo</li>
                        <li className="flex gap-2"><Check size={16} className="text-purple-500"/> ~500 Thumbnails</li>
                        <li className="flex gap-2"><Check size={16} className="text-purple-500"/> Highest Speed Priority</li>
                        <li className="flex gap-2"><Check size={16} className="text-purple-500"/> Bulk Export</li>
                    </ul>
                    <button onClick={onStart} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">
                        Scale Agency
                    </button>
                </div>
            </div>
            
             <div className="mt-12 text-center">
                 <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest font-bold">Credit Usage</p>
                 <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
                     <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">Thumbnail: {CREDIT_COSTS.THUMBNAIL_STANDARD} Credits</span>
                     <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">Ultra Quality: {CREDIT_COSTS.THUMBNAIL_ULTRA} Credits</span>
                     <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">CTR Audit: {CREDIT_COSTS.AUDIT} Credits</span>
                     <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">Video: {CREDIT_COSTS.VIDEO} Credits</span>
                 </div>
             </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800">
          <div className="max-w-3xl mx-auto text-center px-6">
              <ShieldCheck size={48} className="text-indigo-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">The "Click-Worthy" Guarantee</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Try ThumbGen AI for 14 days. If you don't believe your thumbnails look significantly more professional and click-worthy than what you were creating before, we'll refund every penny. No questions asked.
              </p>
              <p className="text-sm font-bold text-white">The only way you can lose is by not trying.</p>
          </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {[
                    { q: "Will the AI make me look weird or distorted?", a: "Our AI is specifically trained to preserve facial features — your eye shape, nose, jawline, and overall likeness. We prioritize identity preservation above all else." },
                    { q: "What if I'm not photogenic?", a: "That's actually where AI shines. Upload a decent, well-lit photo of yourself, and the AI will match the professional lighting and angles from the inspiration thumbnail." },
                    { q: "Is this legal? Can I use others' thumbnails?", a: "Yes! You're using them as style references, like a mood board. The AI creates an entirely new image featuring YOUR face." },
                    { q: "Can I use these for monetized videos?", a: "Absolutely. Both Creator and Agency plans include a commercial license." }
                ].map((item, i) => (
                    <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <button 
                            onClick={() => toggleFaq(i)}
                            className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-200 hover:text-white transition-colors"
                        >
                            {item.q}
                            {faqOpen === i ? <ChevronUp size={20} className="text-indigo-400"/> : <ChevronDown size={20} className="text-slate-500"/>}
                        </button>
                        {faqOpen === i && (
                            <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed">
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10">
              <h2 className="text-5xl font-extrabold mb-6 tracking-tight">Your Next Viral Thumbnail is <br/><span className="text-indigo-400">60 Seconds Away</span></h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                  Every day you post with a "good enough" thumbnail is a day you're leaving views on the table. Stop guessing. Start winning.
              </p>
              <button 
                onClick={onStart}
                className="px-10 py-5 bg-white text-slate-950 text-xl font-bold rounded-xl hover:bg-indigo-50 hover:scale-105 transition-all shadow-2xl shadow-white/20"
              >
                  Start Your Free Trial
              </button>
              <p className="mt-6 text-sm text-slate-500">No credit card required • Cancel anytime</p>
          </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950 text-slate-400 text-sm">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                 <Youtube size={20} className="text-slate-600" />
                 <span className="font-bold text-slate-200">ThumbGen AI</span>
              </div>
              <div className="flex gap-6">
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
              <div>
                  © 2024 ThumbGen AI. All rights reserved.
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
