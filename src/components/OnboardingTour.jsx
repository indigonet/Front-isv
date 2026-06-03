import React from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useLanguage } from '../context/LanguageContext';

export default function OnboardingTour({ run, onFinish }) {
  const { language } = useLanguage();

  const getSidebarTarget = (className) => {
    return window.innerWidth >= 1024 
      ? `#desktop-commands-anchor .${className}`
      : `#mobile-commands-anchor .${className}`;
  };

  const steps = [
    {
      target: '#tour-welcome',
      content: '¡Bienvenido al Simulador C2C! Aquí podrás probar y validar comandos sin necesidad de Postman.',
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '#tour-country-selector',
      content: 'Primero, elige el País y el Entorno (DEV, UAT, PROD) en el que quieres operar. Esto ajustará la URL de la API automáticamente.',
      placement: 'bottom',
    },
    {
      target: '#tour-auth-btn',
      content: 'Configura tus credenciales y obtén tu Token. Es esencial para poder autorizar las transacciones.',
      placement: 'bottom',
    },
    {
      target: getSidebarTarget('tour-command-selector'),
      content: 'Despliega este menú para seleccionar el tipo de operación: Venta, Anulación, Batch, etc.',
      placement: 'bottom',
    },
    {
      target: getSidebarTarget('tour-command-card'),
      content: 'Presta especial atención a esta tarjeta: aquí verás qué comando estás configurando y hacia qué ENDPOINT se enviará la petición al POS.',
      placement: 'bottom',
    },
    {
      target: getSidebarTarget('tour-triads'),
      content: 'Para no escribir siempre los mismos datos, puedes guardar tus combinaciones frecuentes de Terminal, Sucursal y Serial Number (Triadas).',
      placement: 'bottom',
    },
    {
      target: getSidebarTarget('tour-params'),
      content: '¡Ojo con estos campos! Aquí definirás exactamente los parámetros dinámicos que vas a enviar en el cuerpo (body) de tu petición al POS (monto, número de ticket, etc).',
      placement: 'top',
    },
    {
      target: '#tour-send-btn',
      content: '¡Una vez configurado todo, presiona aquí para enviar el comando!',
      placement: 'bottom',
    },
    {
      target: '#tour-request-response',
      content: 'Aquí verás el cuerpo de tu petición (JSON) y la respuesta exacta del servidor.',
      placement: 'top',
    },
    {
      target: '#tour-history',
      content: 'Todas tus operaciones recientes quedarán registradas en este historial para que puedas revisarlas detalladamente.',
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
