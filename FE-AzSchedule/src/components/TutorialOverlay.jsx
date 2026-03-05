import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useTutorial } from '../contexts/TutorialContext.jsx';
import { cn } from '../utils/cn.js';

export function TutorialOverlay() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    isTutorialActive, 
    currentStep, 
    nextStep, 
    prevStep, 
    skipTutorial,
    completeTutorial 
  } = useTutorial();

  const [highlightRect, setHighlightRect] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  // Define tutorial steps
  const steps = [
    {
      target: '[data-tutorial="dashboard"]',
      title: t('tutorial.welcome'),
      description: t('tutorial.welcomeDesc'),
      page: '/dashboard',
      position: 'right'
    },
    {
      target: '[data-tutorial="tasks-menu"]',
      title: t('tutorial.tasksMenu'),
      description: t('tutorial.tasksMenuDesc'),
      page: '/dashboard',
      position: 'right'
    },
    {
      target: '[data-tutorial="add-task"]',
      title: t('tutorial.addTask'),
      description: t('tutorial.addTaskDesc'),
      page: '/tasks',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="categories-menu"]',
      title: t('tutorial.categories'),
      description: t('tutorial.categoriesDesc'),
      page: '/tasks',
      position: 'right'
    },
    {
      target: '[data-tutorial="analytics-menu"]',
      title: t('tutorial.analytics'),
      description: t('tutorial.analyticsDesc'),
      page: '/tasks',
      position: 'right'
    },
    {
      target: '[data-tutorial="ai-task-button"]',
      title: t('tutorial.aiTaskCreation'),
      description: t('tutorial.aiTaskCreationDesc'),
      page: '/tasks',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="ai-insights"]',
      title: t('tutorial.aiInsights'),
      description: t('tutorial.aiInsightsDesc'),
      page: '/analytics',
      position: 'top'
    },
    {
      target: '[data-tutorial="schedule-suggestions"]',
      title: t('tutorial.scheduleSuggestions'),
      description: t('tutorial.scheduleSuggestionsDesc'),
      page: '/analytics',
      position: 'top'
    },
    {
      target: '[data-tutorial="notifications"]',
      title: t('tutorial.notifications'),
      description: t('tutorial.notificationsDesc'),
      page: '/dashboard',
      position: 'bottom'
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Navigate to correct page if needed
  useEffect(() => {
    if (isTutorialActive && currentStepData && location.pathname !== currentStepData.page) {
      navigate(currentStepData.page);
    }
  }, [currentStep, isTutorialActive, currentStepData, location.pathname, navigate]);

  // Update highlight position
  useEffect(() => {
    if (!isTutorialActive || !currentStepData) return;

    const updatePosition = () => {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });

        // Calculate tooltip position
        const tooltipEl = tooltipRef.current;
        if (tooltipEl) {
          const tooltipRect = tooltipEl.getBoundingClientRect();
          let top = rect.top;
          let left = rect.left;

          switch (currentStepData.position) {
            case 'right':
              top = rect.top + rect.height / 2 - tooltipRect.height / 2;
              left = rect.right + 20;
              break;
            case 'left':
              top = rect.top + rect.height / 2 - tooltipRect.height / 2;
              left = rect.left - tooltipRect.width - 20;
              break;
            case 'bottom':
              top = rect.bottom + 20;
              left = rect.left + rect.width / 2 - tooltipRect.width / 2;
              break;
            case 'top':
              top = rect.top - tooltipRect.height - 20;
              left = rect.left + rect.width / 2 - tooltipRect.width / 2;
              break;
            default:
              break;
          }

          // Keep tooltip in viewport
          if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 20;
          }
          if (left < 20) {
            left = 20;
          }
          if (top + tooltipRect.height > window.innerHeight) {
            top = window.innerHeight - tooltipRect.height - 20;
          }
          if (top < 20) {
            top = 20;
          }

          setTooltipPosition({ top, left });
        }
      }
    };

    // Initial update
    setTimeout(updatePosition, 100);

    // Update on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isTutorialActive, currentStep, currentStepData]);

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial();
    } else {
      nextStep();
    }
  };

  if (!isTutorialActive) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Dark overlay with cutout */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 8}
                  y={highlightRect.top - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#tutorial-mask)"
          />
        </svg>

        {/* Highlight border */}
        {highlightRect && (
          <div
            className="absolute border-4 border-primary-500 rounded-xl animate-pulse pointer-events-none"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] pointer-events-auto animate-scale-in"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {currentStepData?.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('tutorial.step')} {currentStep + 1} {t('tutorial.of')} {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={skipTutorial}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {currentStepData?.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={skipTutorial}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              {t('tutorial.skip')}
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('tutorial.back')}
                </button>
              )}
              <button
                onClick={handleNext}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isLastStep
                    ? 'bg-secondary-500 hover:bg-secondary-600 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                )}
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('tutorial.finish')}
                  </>
                ) : (
                  <>
                    {t('tutorial.next')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'w-6 bg-primary-500'
                    : index < currentStep
                    ? 'w-1.5 bg-secondary-500'
                    : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
