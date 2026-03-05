import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Brain, 
  Target, 
  Zap, 
  Shield,
  Clock,
  Users,
  ArrowRight,
  Globe,
  Facebook,
  Mail,
  Menu,
  X,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { FeedbackForm } from '../components/FeedbackForm.jsx';
import logo from '../assets/images/logo.png';

export function Landing() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: t('landing.smartTaskManagement'),
      description: t('landing.smartTaskDesc'),
      color: 'blue'
    },
    {
      icon: Brain,
      title: t('landing.aiPoweredInsights'),
      description: t('landing.aiInsightsDesc'),
      color: 'purple'
    },
    {
      icon: TrendingUp,
      title: t('landing.analyticsDashboard'),
      description: t('landing.analyticsDesc'),
      color: 'green'
    },
    {
      icon: Target,
      title: t('landing.focusMode'),
      description: t('landing.focusModeDesc'),
      color: 'orange'
    },
    {
      icon: Sparkles,
      title: t('landing.aiTaskCreation'),
      description: t('landing.aiTaskDesc'),
      color: 'pink'
    },
    {
      icon: Shield,
      title: t('landing.securePrivate'),
      description: t('landing.secureDesc'),
      color: 'red'
    }
  ];

  const stats = [
    { value: '10K+', label: t('landing.activeUsers') },
    { value: '500K+', label: t('landing.tasksCompleted') },
    { value: '99.9%', label: t('landing.uptime') },
    { value: '4.9/5', label: t('landing.userRating') }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const colorClasses = {
    blue: 'bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700',
    purple: 'bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700',
    green: 'bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700',
    orange: 'bg-gradient-to-br from-amber-500 to-yellow-600 dark:from-amber-600 dark:to-yellow-700',
    pink: 'bg-gradient-to-br from-pink-400 to-rose-500 dark:from-pink-500 dark:to-rose-600',
    red: 'bg-gradient-to-br from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-orange-50/20 to-yellow-50/30 dark:from-gray-900 dark:to-gray-800">
      {/* Feedback Form */}
      <FeedbackForm />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-red-100/50 dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logo} 
                alt="AstraMind Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">AstraMind</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                {t('landing.features')}
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                {t('landing.howItWorks')}
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                {t('landing.pricing')}
              </a>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                {t('landing.signIn')}
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white">
                  {t('landing.getStarted')}
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 space-y-2"
            >
              <a href="#features" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors">
                {t('landing.features')}
              </a>
              <a href="#how-it-works" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors">
                {t('landing.howItWorks')}
              </a>
              <a href="#pricing" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors">
                {t('landing.pricing')}
              </a>
              <Link to="/login" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors">
                {t('landing.signIn')}
              </Link>
              <Link to="/register" className="block px-4 py-2">
                <Button className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white">
                  {t('landing.getStarted')}
                </Button>
              </Link>
            </motion.div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-orange-500/5 to-yellow-500/10 dark:from-red-900/20 dark:to-yellow-900/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-100 to-orange-100 dark:bg-gradient-to-r dark:from-red-900/30 dark:to-orange-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>{t('landing.aiPoweredTaskManagement')}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              {t('landing.organizeYourLife')}
              <span className="block bg-gradient-to-r from-red-600 via-orange-500 to-yellow-600 bg-clip-text text-transparent pb-4">
                {t('landing.boostProductivity')}
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
              {t('landing.description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/register">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-6 text-lg group shadow-lg hover:shadow-xl transition-all"
                >
                  {t('landing.getStartedFree')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-lg"
                >
                  {t('landing.signIn')}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center"
                >
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements - Tết warm colors */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-300 dark:bg-red-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 dark:bg-orange-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 dark:bg-yellow-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('landing.everythingYouNeed')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('landing.powerfulFeatures')}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-red-200 dark:hover:border-red-800/50 hover:shadow-red-100 dark:hover:shadow-red-900/20">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${colorClasses[feature.color]} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('landing.howItWorks')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('landing.getStartedSteps')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: t('landing.step1'),
                description: t('landing.step1Desc'),
                icon: Users
              },
              {
                step: '02',
                title: t('landing.step2'),
                description: t('landing.step2Desc'),
                icon: Zap
              },
              {
                step: '03',
                title: t('landing.step3'),
                description: t('landing.step3Desc'),
                icon: Clock
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white text-2xl font-bold mb-4 shadow-lg">
                    {step.step}
                  </div>
                  <div className="mb-4">
                    <step.icon className="h-12 w-12 mx-auto text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-red-300 via-orange-300 to-yellow-300 dark:from-red-700 dark:to-yellow-700" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('landing.pricingTitle')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('landing.pricingSubtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('landing.free')}
                    </h3>
                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        0
                      </span>
                      <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">
                        VND
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t('landing.freeFeature1')}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t('landing.freeFeature2')}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t('landing.freeFeature3')}
                      </span>
                    </li>
                  </ul>

                  <Link to="/register" className="block">
                    <Button 
                      variant="outline"
                      className="w-full py-6 text-lg border-2"
                    >
                      {t('landing.getStarted')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-red-500 dark:border-red-600 relative overflow-hidden">
                {/* Popular Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-1 text-sm font-semibold">
                  {t('landing.mostPopular')}
                </div>
                
                <CardContent className="p-8 pt-12">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('landing.premium')}
                    </h3>
                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        29.000
                      </span>
                      <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">
                        VND{t('landing.perMonth')}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {t('landing.premiumFeature1')}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {t('landing.premiumFeature2')}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {t('landing.premiumFeature3')}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {t('landing.premiumFeature4')}
                      </span>
                    </li>
                  </ul>

                  <Link to="/register" className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      {t('landing.choosePlan')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-red-700" />
        <div className="absolute inset-0 bg-grid-white/10" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('landing.readyToBoost')}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('landing.joinThousands')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button 
                  size="lg"
                  className="bg-white text-red-600 hover:bg-yellow-50 px-8 py-6 text-lg group shadow-xl"
                >
                  {t('landing.startFreeToday')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg backdrop-blur-sm"
                >
                  {t('landing.signIn')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <img 
                  src={logo} 
                  alt="AstraMind Logo" 
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold">AstraMind</span>
              </Link>
              <p className="text-gray-400 mb-4">
                {t('landing.intelligentPlatform')}
              </p>
              <div className="mb-4">
                <a 
                  href="mailto:astramindexe@gmail.com" 
                  className="inline-flex items-center text-gray-400 hover:text-white transition-colors group"
                >
                  <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">astramindexe@gmail.com</span>
                </a>
              </div>
              <div className="flex space-x-4">
                <a href="https://www.tiktok.com/@astramindexe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="TikTok">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/people/AstraMind/61587120382598/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://astramind.io.vn" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Website">
                  <Globe className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('landing.product')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">{t('landing.features')}</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">{t('landing.pricing')}</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">{t('landing.security')}</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">{t('landing.roadmap')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('landing.company')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.about')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.blog')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.careers')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.contact')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 AstraMind. {t('landing.allRightsReserved')}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{t('landing.privacyPolicy')}</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{t('landing.termsOfService')}</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{t('landing.cookiePolicy')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
