import React from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useLanguage } from '../context/LanguageContext';

export default function OnboardingTour({ run, onFinish }) {
  const { language, t } = useLanguage();

  const [isMobileLayout, setIsMobileLayout] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const steps = isMobileLayout
    ? [
        {
          target: '#tour-welcome',
          content: t('tour.welcome'),
          disableBeacon: true,
          placement: 'bottom',
        },
        {
          target: '#tour-country-selector',
          content: t('tour.countrySelector'),
          placement: 'bottom',
        },
        {
          target: '#tour-auth-btn',
          content: t('tour.authBtn'),
          placement: 'bottom',
        },
        {
          target: '#mobile-commands-anchor .tour-command-selector',
          content: t('tour.commandSelector'),
          placement: 'bottom',
        },
        {
          target: '#mobile-commands-anchor .tour-triads',
          content: t('tour.triads'),
          placement: 'bottom',
        },
        {
          target: '#mobile-commands-anchor .tour-params',
          content: t('tour.params'),
          placement: 'top',
        },
        {
          target: window.innerWidth >= 640 ? '#tour-send-btn' : '#tour-mobile-send-btn',
          content: t('tour.sendBtn'),
          placement: 'bottom',
        },
        {
          target: '#tour-request-response',
          content: t('tour.requestResponse'),
          placement: 'top',
        },
        {
          target: '#tour-history',
          content: t('tour.history'),
          placement: 'top',
        }
      ]
    : [
        {
          target: '#tour-welcome',
          content: t('tour.welcome'),
          disableBeacon: true,
          placement: 'bottom',
        },
        {
          target: '#tour-country-selector',
          content: t('tour.countrySelector'),
          placement: 'bottom',
        },
        {
          target: '#tour-auth-btn',
          content: t('tour.authBtn'),
          placement: 'bottom',
        },
        {
          target: '#tour-request-response',
          content: t('tour.requestResponse'),
          placement: 'top',
        },
        {
          target: '#tour-send-btn',
          content: t('tour.sendBtn'),
          placement: 'bottom',
        },
        {
          target: '#desktop-commands-anchor .tour-command-selector',
          content: t('tour.commandSelector'),
          placement: 'bottom',
        },
        {
          target: '#desktop-commands-anchor .tour-triads',
          content: t('tour.triads'),
          placement: 'bottom',
        },
        {
          target: '#desktop-commands-anchor .tour-params',
          content: t('tour.params'),
          placement: 'top',
        },
        {
          target: '#tour-history',
          content: t('tour.history'),
          placement: 'top',
        }
      ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      if (onFinish) {
        onFinish();
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#4f46e5',
          zIndex: 10000,
        },
      }}
      locale={{
        back: language === 'en' ? 'Back' : language === 'pt' ? 'Voltar' : 'Atrás',
        close: language === 'en' ? 'Close' : language === 'pt' ? 'Fechar' : 'Cerrar',
        last: language === 'en' ? 'Finish' : language === 'pt' ? 'Concluir' : 'Finalizar',
        next: language === 'en' ? 'Next' : language === 'pt' ? 'Próximo' : 'Siguiente',
        skip: language === 'en' ? 'Skip' : language === 'pt' ? 'Pular' : 'Saltar',
      }}
    />
  );
}
