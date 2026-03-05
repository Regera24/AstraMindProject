import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  Crown, 
  Zap,
  Brain,
  Calendar,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { PaymentModal } from '../components/PaymentModal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import axiosInstance from '../lib/axios.js';
import toast from 'react-hot-toast';

export function Subscription() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/subscription/status');
      setSubscriptionStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast.error(t('subscription.errorFetchingStatus'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setShowPaymentModal(true);
  };

  const handleClosePayment = () => {
    setShowPaymentModal(false);
    // Refresh subscription status sau khi đóng modal
    fetchSubscriptionStatus();
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('subscription.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('subscription.subtitle')}
        </p>
      </div>

      {/* Current Status Banner */}
      {subscriptionStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-2 ${
            subscriptionStatus.hasSubscription 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  {subscriptionStatus.hasSubscription ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100">
                          {t('subscription.premiumActive')}
                        </h3>
                        {subscriptionStatus.subscription && (
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-green-700 dark:text-green-300">
                              <span className="font-medium">{t('subscription.plan')}:</span> {subscriptionStatus.subscription.name}
                            </p>
                            {subscriptionStatus.subscription.price && (
                              <p className="text-sm text-green-700 dark:text-green-300">
                                <span className="font-medium">{t('subscription.price')}:</span> {subscriptionStatus.subscription.price.toLocaleString()} VND
                              </p>
                            )}
                            {subscriptionStatus.subscription.timeOfExpiration && (
                              <p className="text-sm text-green-700 dark:text-green-300">
                                <span className="font-medium">{t('subscription.validity')}:</span> {subscriptionStatus.subscription.timeOfExpiration} {t('subscription.days')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                          {t('subscription.freeAccount')}
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {t('subscription.upgradeToUnlock')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {!subscriptionStatus.hasSubscription && (
                  <Button
                    onClick={handleUpgrade}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    {t('subscription.upgradeNow')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pricing Plans */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
      >
        {/* Free Plan */}
        <motion.div variants={itemVariants}>
          <Card className={`h-full transition-all duration-300 border-2 ${
            !subscriptionStatus?.hasSubscription
              ? 'border-primary-500 shadow-lg'
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl">{t('landing.free')}</CardTitle>
                {!subscriptionStatus?.hasSubscription && (
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full">
                    {t('subscription.currentPlan')}
                  </span>
                )}
              </div>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  0
                </span>
                <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">
                  VND
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Premium Plan */}
        <motion.div variants={itemVariants}>
          <Card className={`h-full transition-all duration-300 border-2 relative overflow-hidden ${
            subscriptionStatus?.hasSubscription
              ? 'border-red-500 shadow-xl'
              : 'border-red-300 dark:border-red-700 hover:border-red-500 hover:shadow-xl'
          }`}>
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-1 text-sm font-semibold">
              {t('landing.mostPopular')}
            </div>
            
            <CardHeader className="pt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <CardTitle className="text-2xl">{t('landing.premium')}</CardTitle>
                </div>
                {subscriptionStatus?.hasSubscription && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-full">
                    {t('subscription.currentPlan')}
                  </span>
                )}
              </div>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  29.000
                </span>
                <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">
                  VND{t('landing.perMonth')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
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

              {!subscriptionStatus?.hasSubscription && (
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {t('subscription.upgradeToPremium')}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* AI Features Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <CardTitle>{t('subscription.aiFeatures')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('subscription.naturalLanguage')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('subscription.naturalLanguageDesc')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('subscription.imageRecognition')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('subscription.imageRecognitionDesc')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('subscription.smartSuggestions')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('subscription.smartSuggestionsDesc')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ or Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('subscription.whyUpgrade')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('subscription.securePayment')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('subscription.securePaymentDesc')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('subscription.instantAccess')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('subscription.instantAccessDesc')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePayment}
        username={user?.username || ''}
        amount={29000}
      />
    </div>
  );
}
