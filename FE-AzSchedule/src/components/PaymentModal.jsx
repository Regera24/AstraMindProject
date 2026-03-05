import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  CreditCard,
  Clock,
  Info
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx';
import toast from 'react-hot-toast';

export function PaymentModal({ isOpen, onClose, username, amount = 29000 }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  // Tạo description động với username
  const description = `SEVQR thanh toan premium astramind ${username}`;
  const encodedDescription = encodeURIComponent(description);
  
  // Thông tin ngân hàng
  const bankInfo = {
    accountNumber: '105884203527',
    bank: 'VietinBank',
    accountName: 'AstraMind',
    amount: amount,
    description: description
  };

  // URL QR code từ Sepay
  const qrCodeUrl = `https://qr.sepay.vn/img?acc=${bankInfo.accountNumber}&template=compact&bank=${bankInfo.bank}&amount=${bankInfo.amount}&des=${encodedDescription}`;

  useEffect(() => {
    if (isOpen) {
      setQrLoaded(false);
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(bankInfo.description);
    setCopied(true);
    toast.success(t('payment.descriptionCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    toast.success(t('payment.accountNumberCopied'));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="border-2 border-red-200 dark:border-red-800">
            <CardHeader className="relative bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t('payment.title')}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('payment.subtitle')}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Alert Info */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">{t('payment.importantNote')}</p>
                  <p>{t('payment.importantNoteDesc')}</p>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="text-center">
                <div className="items-center justify-center space-x-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('payment.scanQR')}
                  </h3>
                </div>
                
                <div className="relative inline-block">
                  {!qrLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    </div>
                  )}
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Payment"
                    className="w-64 h-64 mx-auto border-4 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                    onLoad={() => setQrLoaded(true)}
                    onError={() => {
                      setQrLoaded(true);
                      toast.error(t('payment.qrLoadError'));
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  {t('payment.scanWithBankingApp')}
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                    {t('payment.orTransferManually')}
                  </span>
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {t('payment.bankInformation')}
                </h4>
                
                <div className="grid gap-3">
                  {/* Bank Name */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('payment.bank')}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {bankInfo.bank}
                    </span>
                  </div>

                  {/* Account Number */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('payment.accountNumber')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 dark:text-white font-mono">
                        {bankInfo.accountNumber}
                      </span>
                      <button
                        onClick={handleCopyAccountNumber}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Account Name */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('payment.accountName')}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {bankInfo.accountName}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                    <span className="text-sm font-medium text-red-900 dark:text-red-100">
                      {t('payment.amount')}
                    </span>
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">
                      {bankInfo.amount.toLocaleString()} VND
                    </span>
                  </div>

                  {/* Description */}
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                        {t('payment.transferDescription')}
                      </span>
                      <button
                        onClick={handleCopyDescription}
                        className="flex items-center space-x-1 px-3 py-1 bg-yellow-200 dark:bg-yellow-800 hover:bg-yellow-300 dark:hover:bg-yellow-700 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              {t('payment.copied')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="text-xs font-medium">{t('payment.copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-sm text-yellow-900 dark:text-yellow-100 break-all">
                      {bankInfo.description}
                    </p>
                    <div className="flex items-start space-x-2 mt-2 text-xs text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>{t('payment.descriptionWarning')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Time */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-1">{t('payment.processingTime')}</p>
                  <p>{t('payment.processingTimeDesc')}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  {t('payment.close')}
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                >
                  {t('payment.completedPayment')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
