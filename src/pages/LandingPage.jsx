import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Sparkles, Video, Zap, TrendingUp, Play, ArrowRight, Menu, X, Star, Award, Brain } from 'lucide-react';
import interviewImg from '../assets/interview.png';

export default function IntervuAILanding() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Framer Motion scroll animation setup
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-100px' });
  const featuresControls = useAnimation();
  const ctaControls = useAnimation();

  useEffect(() => {
    if (featuresInView) {
      featuresControls.start('visible');
    }
    if (ctaInView) {
      ctaControls.start('visible');
    }
  }, [featuresInView, ctaInView, featuresControls, ctaControls]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Framer Motion variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' },
    }),
  };

  const ctaVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, type: 'spring', stiffness: 80 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 8px 24px rgba(0, 136, 255, 0.3)' },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-blue-50 overflow-hidden">
      {/* Floating orbs - Hidden on mobile */}
      <div 
        className="fixed w-56 h-56 bg-blue-200/20 rounded-full blur-xl pointer-events-none transition-all duration-700 ease-out hidden sm:block"
        style={{
          top: mousePos.y - 112,
          left: mousePos.x - 112,
        }}
      />
      <div className="fixed top-8 right-8 w-40 h-40 bg-cyan-200/20 rounded-full blur-xl animate-pulse hidden sm:block" />
      <div className="fixed bottom-8 left-8 w-48 h-48 bg-blue-100/20 rounded-full blur-xl animate-pulse delay-1000 hidden sm:block" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto backdrop-blur-md bg-blue-100/20 border border-blue-200/50 rounded-xl shadow-md px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-cyan-400 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-br from-blue-400 to-cyan-500 w-9 h-9 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight text-gray-800">IntervuAI</div>
                <div className="text-xs text-gray-500 -mt-0.5">powered by Veda</div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-5">
              <a href="#" className="text-gray-600 hover:text-blue-500 font-medium text-sm transition">Features</a>
              <a href="#" className="text-gray-600 hover:text-blue-500 font-medium text-sm transition">How it works</a>
              <motion.button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign in
              </motion.button>
            </div>

            <button className="md:hidden text-gray-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {isMenuOpen && (
            <div className="mt-3 flex flex-col gap-2 md:hidden">
              <a href="#" className="text-gray-600 hover:text-blue-500 font-medium text-sm">Features</a>
              <a href="#" className="text-gray-600 hover:text-blue-500 font-medium text-sm">How it works</a>
              <motion.button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign in
              </motion.button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 md:pt-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100/30 backdrop-blur-md border border-blue-200/50 rounded-full shadow-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-gray-700">Veda's roasting 1000+ candidates daily</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-gray-800">
                Stop bombing
                <span className="block bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  interviews
                </span>
              </h1>

              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-md">
                Meet Veda - your AI interviewer who’s tougher than your dream job’s HR. Practice endlessly, get sharp feedback, and nail your interviews. <span className="font-semibold text-gray-800">No sweat, just swagger.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  className="group relative px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base shadow-md"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Try for free
                  </span>
                </motion.button>

                <motion.button
                  className="group px-6 py-3 bg-blue-100/30 backdrop-blur-md border border-blue-200/50 text-gray-800 rounded-lg font-semibold text-base shadow-sm"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </div>
                </motion.button>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-cyan-400 border-2 border-white shadow-sm" />
                  ))}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-gray-800">2,847 students</div>
                  <div className="text-gray-600">crushed interviews this week</div>
                </div>
              </div>
            </div>

            <div className="relative h-[350px] md:h-[450px] flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[350px] md:max-w-[400px]">
                  <img
                    src={interviewImg}
                    alt="Veda AI Interview Coach"
                    className="w-full h-auto drop-shadow-lg animate-float"
                  />
                </div>

                <div className="absolute top-6 -left-6 w-20 h-20 bg-blue-100/20 backdrop-blur-md rounded-lg shadow-sm border border-blue-200/50 p-2 transform -rotate-6 hover:rotate-0 transition-transform animate-float hidden md:block">
                  <Brain className="w-5 h-5 text-blue-500 mb-1" />
                  <div className="text-xs font-semibold text-gray-800">AI Powered</div>
                </div>

                <div className="absolute top-28 -right-6 w-20 h-20 bg-blue-100/20 backdrop-blur-md rounded-lg shadow-sm border border-blue-200/50 p-2 transform rotate-6 hover:rotate-0 transition-transform animate-float hidden md:block" style={{ animationDelay: '0.5s' }}>
                  <Award className="w-5 h-5 text-cyan-500 mb-1" />
                  <div className="text-xs font-semibold text-gray-800">Analytics</div>
                </div>

                <div className="absolute bottom-12 -left-10 w-24 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg shadow-md p-2 transform -rotate-6 hover:rotate-0 transition-transform animate-float" style={{ animationDelay: '1s' }}>
                  <div className="text-white">
                    <div className="text-lg font-bold">98%</div>
                    <div className="text-xs font-medium opacity-90">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Framer Motion Scroll Animations */}
      <section className="py-16 px-4" ref={featuresRef}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-10 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresControls}
            variants={cardVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Why Veda is
              <span className="block bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                your secret weapon
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Video className="w-10 h-10 text-blue-500 mb-3" />,
                title: 'Live Video Interviews',
                description: 'Real-time practice with Veda. Camera on, mic live, mimicking the real interview vibe.',
              },
              {
                icon: <Zap className="w-10 h-10 text-cyan-500 mb-3" />,
                title: 'Instant Feedback',
                description: 'Get pinpoint feedback right after your session to fix mistakes on the spot.',
              },
              {
                icon: <TrendingUp className="w-10 h-10 text-blue-500 mb-3" />,
                title: 'Track Growth',
                description: 'Visualize your progress with analytics to see how you’re leveling up.',
              },
              {
                icon: <Brain className="w-10 h-10 text-cyan-500 mb-3" />,
                title: 'For Everyone',
                description: (
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-200/30 rounded-full text-blue-600 text-xs font-semibold">Students</span>
                    <span className="px-3 py-1 bg-cyan-200/30 rounded-full text-cyan-600 text-xs font-semibold">Job Seekers</span>
                    <span className="px-3 py-1 bg-blue-200/30 rounded-full text-blue-600 text-xs font-semibold">Coaching Centers</span>
                  </div>
                ),
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md hover:shadow-lg border border-blue-200/50 transition-all duration-300"
                variants={cardVariants}
                initial="hidden"
                animate={featuresControls}
                custom={index}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {feature.icon}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <div className="text-sm text-gray-600">{feature.description}</div>
                <motion.button
                  className="mt-4 text-blue-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  Learn More <ArrowRight className="inline w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Framer Motion Scroll Animation */}
      <section className="py-16 px-4 relative overflow-hidden" ref={ctaRef}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-cyan-200 opacity-50">
          <div className="wave-bg"></div>
        </div>
        <motion.div
          className="max-w-4xl mx-auto relative z-10"
          variants={ctaVariants}
          initial="hidden"
          animate={ctaControls}
        >
          <div className="bg-blue-100/20 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-blue-200/50 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              Ready to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                ace your interviews?
              </span>
            </h2>
            <p className="text-base text-gray-600 max-w-md mx-auto">
              Join thousands who’ve turned prep into power with Veda’s AI-driven practice.
            </p>
            <motion.button
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold text-base shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              animate={{ scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity } }}
            >
              <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-30 transition-opacity rounded-lg"></span>
              <span className="relative">Get Started Free <ArrowRight className="inline w-4 h-4 ml-1" /></span>
            </motion.button>
            <p className="text-xs text-gray-500">No card needed. Just pure prep.</p>
          </div>
        </motion.div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .wave-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255,255,255,0.2)" d="M0,128L48,138.7C96,149,192,171,288,181.3C384,192,480,192,576,170.7C672,149,768,107,864,101.3C960,96,1056,128,1152,149.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,0,320Z"></path></svg>') repeat-x bottom;
          animation: wave 20s linear infinite;
        }
      `}</style>
    </div>
  );
}