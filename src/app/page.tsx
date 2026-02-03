'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import LandingFlashcardDemo from '@/components/LandingFlashcardDemo';
import HeroAppDemo from '@/components/landing/HeroAppDemo';

// Icons as components for cleaner code
const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  
  // Force scroll to top on page load - runs after DOM is ready
  useEffect(() => {
    // Use setTimeout to ensure this runs after all other effects
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      // Also reset scroll restoration
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Hero text fades on scroll, but the demo stays visible
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.9], [1, 0.98]);
  const heroY = useTransform(scrollYProgress, [0, 0.9], [0, 30]);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI-Powered Notes',
      description: 'Transform lectures into structured, intelligent summaries. Our AI understands context, extracts key concepts, and organises your knowledge automatically.',
      image: '/images/NoteEditor.png',
      color: 'from-[#1e40af] to-[#3b82f6]',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: 'Intelligent Flashcards',
      description: 'Auto-generated flashcards with spaced repetition. Learn 2x faster with scientifically-proven memory techniques that adapt to your learning pace.',
      isInteractiveDemo: true,
      color: 'from-[#2563eb] to-[#60a5fa]',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Research & Citations',
      description: 'Get accurate academic sources and perfectly formatted citations. APA, MLA, Harvard, Chicago — all generated instantly from your notes.',
      color: 'from-[#1d4ed8] to-[#3b82f6]',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload your content',
      description: 'Drop in lecture notes, PDFs, recordings, or any study material.',
    },
    {
      number: '02',
      title: 'AI transforms it',
      description: 'Our models structure, summarise, and create study materials instantly.',
    },
    {
      number: '03',
      title: 'Study smarter',
      description: 'Use personalised flashcards and summaries to learn more effectively.',
    },
  ];

  const testimonials = [
    {
      quote: "LuminNote has completely transformed how I study. The AI summaries save me hours of work every week.",
      author: 'Emma S.',
      role: 'Medical Student, Oxford',
      avatar: 'ES',
    },
    {
      quote: "The reference feature is incredible. I can trust that my research is accurate and properly cited.",
      author: 'James D.',
      role: 'Engineering Student, Cambridge',
      avatar: 'JD',
    },
    {
      quote: "I've tried many note-taking apps, but LuminNote is in a league of its own. It actually understands my content.",
      author: 'Anna S.',
      role: 'Psychology Student, UCL',
      avatar: 'AS',
    },
  ];

  const pricingFeatures = [
    'Unlimited AI-powered notes',
    'Smart flashcard generation',
    'Research & citation tools',
    'Priority support',
    'Advanced study analytics',
    'Export to any format',
  ];

  return (
    <div className="w-full overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="fixed top-0 w-full z-50"
      >
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto glass rounded-2xl">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Image
                    src="/images/LN.png"
                    alt="LuminNote Logo"
                    width={36}
                    height={36}
                    className="rounded-xl"
                  />
                  <span className="text-xl font-semibold tracking-tight">LuminNote</span>
                </motion.div>
                
                <div className="hidden md:flex items-center space-x-1">
                  {['Features', 'How It Works', 'Pricing'].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-4 py-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--border)] transition-all duration-200 text-sm font-medium"
                    >
                      {item}
                    </a>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href="https://app.luminnote.com/login"
                    className="hidden sm:block px-4 py-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors text-sm font-medium"
                  >
                    Sign In
                  </a>
                  <motion.a
                    href="https://app.luminnote.com/signup"
                    className="btn-primary text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Get Started</span>
                    <ArrowRightIcon />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center overflow-hidden">
        <div className="hero-glow" />
        
        <motion.div 
          className="max-w-7xl mx-auto w-full"
          style={{ scale: heroScale, y: heroY }}
        >
          {/* Hero text content - fades on scroll */}
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            style={{ opacity: heroTextOpacity }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 badge mb-8"
            >
              <SparkleIcon />
              <span>AI-powered learning, reimagined</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              The smartest way to{' '}
              <motion.span 
                className="gradient-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                take notes.
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Transform your lectures into intelligent summaries, flashcards, and research — all powered by AI. 
              Study less, learn more.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.a
                href="https://app.luminnote.com/signup"
                className="btn-primary text-base px-8 py-4"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Start for free</span>
                <ArrowRightIcon />
              </motion.a>
              <motion.a
                href="#how-it-works"
                className="btn-secondary text-base px-8 py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                See how it works
              </motion.a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-[var(--foreground-muted)]"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Start learning today</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative max-w-5xl mx-auto">
              <HeroAppDemo />
            </div>
            {/* Floating liquid glass elements */}
            <motion.div
              className="absolute -left-8 top-1/4 w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_rgba(59,130,246,0.15)]"
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -right-8 top-1/3 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400/10 to-blue-500/5 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_rgba(59,130,246,0.1)]"
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.div
              className="absolute right-20 bottom-20 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/15 to-transparent backdrop-blur-xl border border-white/5"
              animate={{ y: [0, 10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <span className="text-sm font-medium text-[var(--accent-primary)] tracking-wide uppercase mb-4 block">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Everything you need to
              <span className="gradient-text"> learn smarter</span>
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Powerful AI tools designed specifically for students. No fluff, just the features that actually make a difference.
            </p>
          </AnimatedSection>

          <div className="space-y-8">
            {features.map((feature, index) => (
              <AnimatedSection 
                key={feature.title}
                delay={index * 0.1}
                direction={index % 2 === 0 ? 'left' : 'right'}
              >
                <motion.div
                  className="glass-card p-8 lg:p-12"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                    <div className="lg:w-1/2 space-y-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 text-white`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed">
                        {feature.description}
                      </p>
                      <motion.a
                        href="https://app.luminnote.com/signup"
                        className="inline-flex items-center gap-2 text-[var(--accent-primary)] font-medium hover:gap-3 transition-all"
                        whileHover={{ x: 5 }}
                      >
                        Try it now <ArrowRightIcon />
                      </motion.a>
                    </div>
                    <div className="lg:w-1/2">
                      {feature.isInteractiveDemo ? (
                        <div className="relative rounded-xl overflow-hidden" style={{ minHeight: '400px' }}>
                          <LandingFlashcardDemo />
                        </div>
                      ) : feature.image ? (
                        <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
                          <Image
                            src={feature.image}
                            alt={feature.title}
                            width={600}
                            height={400}
                            className="w-full"
                            style={{ height: 'auto' }}
                          />
                        </div>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 h-80">
                          <div className="space-y-6 h-full flex flex-col justify-center">
                            {[1, 2, 3].map((step) => (
                              <motion.div
                                key={step}
                                className="flex items-start gap-4"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: step * 0.15 }}
                              >
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                  {step}
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">
                                    {step === 1 ? 'Analyse Your Notes' : step === 2 ? 'Find Reliable Sources' : 'Generate Citations'}
                                  </h4>
                                  <p className="text-sm text-[var(--foreground-muted)]">
                                    {step === 1 
                                      ? 'AI scans and identifies key concepts and research areas.'
                                      : step === 2 
                                      ? 'Searches academic databases for relevant papers.'
                                      : 'Creates properly formatted citations in any style.'}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <span className="text-sm font-medium text-[var(--accent-primary)] tracking-wide uppercase mb-4 block">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Three steps to
              <span className="gradient-text"> better grades</span>
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Get started in minutes. No complex setup, no learning curve.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
            
            {steps.map((step, index) => (
              <AnimatedSection key={step.number} delay={index * 0.15}>
                <motion.div
                  className="relative text-center"
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center mx-auto mb-8 text-white text-2xl font-bold relative"
                    whileHover={{ rotate: 5, scale: 1.05 }}
                  >
                    {step.number}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] blur-xl opacity-40" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-[var(--foreground-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════════════════════════════════════════════════════
          SOCIAL PROOF SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <span className="text-sm font-medium text-[var(--accent-primary)] tracking-wide uppercase mb-4 block">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Loved by students at
              <span className="gradient-text"> top universities</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={testimonial.author} delay={index * 0.1}>
                <motion.div
                  className="glass-card p-8 h-full flex flex-col"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed flex-grow mb-8">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════════════════════════════════════════════════════
          PRICING SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <span className="text-sm font-medium text-[var(--accent-primary)] tracking-wide uppercase mb-4 block">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Simple, transparent
              <span className="gradient-text"> pricing</span>
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              One plan, everything included. No hidden fees, no surprises.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="max-w-lg mx-auto">
              <motion.div
                className="glass-card p-10 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Popular badge */}
                <div className="absolute top-6 right-6">
                  <span className="badge text-xs">Most Popular</span>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <p className="text-[var(--foreground-muted)]">Everything you need to ace your studies</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">£7.49</span>
                    <span className="text-[var(--foreground-muted)]">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {pricingFeatures.map((feature, index) => (
                    <motion.li
                      key={feature}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CheckIcon />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.a
                  href="https://app.luminnote.com/signup"
                  className="btn-primary w-full justify-center text-lg py-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Get started today</span>
                  <ArrowRightIcon />
                </motion.a>

                {/* Free trial message removed */}
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-secondary)]/5" />
        
        <div className="max-w-4xl mx-auto relative">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Ready to transform how you study?
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto">
              Join students who are already studying smarter with LuminNote. 
              Start free today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.a
                href="https://app.luminnote.com/signup"
                className="btn-primary text-lg px-10 py-5"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Start for free</span>
                <ArrowRightIcon />
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
