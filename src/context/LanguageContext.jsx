import React, { createContext, useState, useContext, useEffect } from "react";

export const releaseNotes = {
  es: [
    {
      version: "v1.2.4",
      changes: [
        "Mejoras en Logcat",
        "Optimización de conexión ADB",
        "Mejoras en análisis de APK",
        "Mejora general de rendimiento",
        "La consola CMD ya no se muestra al ejecutar herramientas",
      ],
    },
  ],

  en: [
    {
      version: "v1.2.4",
      changes: [
        "Logcat improvements",
        "ADB connection optimization",
        "APK analysis improvements",
        "Overall performance improvement",
        "CMD console no longer appears when running tools",
      ],
    },
  ],

  pt: [
    {
      version: "v1.2.4",
      changes: [
        "Melhorias no Logcat",
        "Otimização da conexão ADB",
        "Melhorias na análise de APK",
        "Melhoria geral de desempenho",
        "O console CMD não aparece mais ao executar ferramentas",
      ],
    },
  ],
};

const translations = {
  es: {
    // Header
    features: "Características",
    download: "Descargar",
    github: "GitHub",
    language: "Idioma",
    theme: "Tema",

    "topbar.home": "Inicio",
    "topbar.features": "Características",
    "topbar.download": "Descargar",
    "topbar.github": "GitHub",
    "topbar.logoText": "ISV Toolkit",
    "topbar.language": "Idioma",
    "topbar.theme": "Tema",

    // Hero Section
    heroTitle: "ISV Toolkit",
    heroDescription:
      "Herramientas especializadas para desarrolladores Android y QA. Optimiza tu flujo de diferentes actividades de análisis en una sola plataforma.",
    feature1: "Sencillo",
    feature1Desc: "No necesitas escribir comandos y mover archivos manualmente",
    feature2: "Información",
    feature2Desc: "Toda la información de un APK con solo inspeccionarla",
    feature3: "Integrado",
    feature3Desc: "Múltiples herramientas integradas en una sola plataforma",
    feature4: "Firma JKS",
    feature4Desc: "Puedes generar o firmar APKs con claves JKS",

    // About Section
    aboutTitle: "¿Qué es ISV Toolkit?",
    aboutDescription:
      "Una plataforma integral para desarrolladores ISV con herramientas especializadas en pruebas, optimización y desarrollo de software.",
    purposeTitle: "Propósito Principal",
    purposeDesc:
      "Simplificar el desarrollo y testing de aplicaciones ISV con herramientas especializadas.",
    toolsTitle: "Herramientas Integradas",
    toolsDesc:
      "Suite completa para testing, optimización de rendimiento y análisis de código.",
    benefitsTitle: "Beneficios Clave",
    benefitsDesc:
      "Reducción de tiempo de desarrollo y mejores prácticas implementadas.",

    // Image Sections
    analysisTitle: "Análisis Completo de APKs",
    analysisDesc:
      "Inspecciona cualquier archivo APK y obtén información detallada sobre permisos, actividades, servicios, proveedores y más. Todo en una interfaz intuitiva sin necesidad de comandos complejos.",
    analysis1: "Extracción de metadatos del APK",
    analysis2: "Información de esquema de firma y Hash",
    analysis3: "Tamaño y formato del APK",
    analysis4: "Permisos sensibles y norma de seguridad",

    signingTitle: "Firma y Verificación de APKs",
    signingDesc:
      "Firma tus aplicaciones con claves JKS personalizadas o verifica la firma de APKs existentes. Genera nuevas claves y mantén un control completo sobre el proceso de firma.",
    signing1: "Firma de APKs con claves JKS",
    signing2: "Generación de nuevas claves de firma",
    signing3: "Verificación de firmas existentes",
    signing4: "Alineación y optimización de APKs",

    logcatTitle: "Logcat Experiences",
    logcatDesc:
      "Accede a los registros de logcat de forma intuitiva y eficiente. Visualiza, filtra y exporta los registros de manera sencilla.",
    logcat1: "Visualización de registros de logcat",
    logcat2: "Filtrado de registros por niveles de log",
    logcat3: "Exportación de registros a archivos",
    logcat4: "Guarda y exportar el registro",

    adbTitle: "Comandos Avanzados ADB",
    adbDesc:
      "Ejecuta comandos ADB complejos a través de una interfaz gráfica intuitiva. Automatiza tareas repetitivas y accede a funciones avanzadas sin necesidad de memorizar comandos.",
    adb1: "Interfaz gráfica para comandos ADB",
    adb2: "Scripts predefinidos para tareas comunes",
    adb3: "Ejecución de comandos personalizados",
    adb4: "Historial de comandos ejecutados",

    screenTitle: "Grabación y Captura de Pantalla",
    screenDesc:
      "Graba la pantalla de tus dispositivos Android y captura imágenes en alta calidad. Perfecto para crear tutoriales, documentar bugs o compartir demostraciones.",
    screen1: "Grabación de pantalla en alta calidad",
    screen2: "Capturas de pantalla instantáneas",
    screen3: "Configuración de resolución y fps",
    screen4: "Formatos de exportación múltiples",

    managementTitle: "Gestión de APKs",
    managementDesc:
      "Gestiona tus aplicaciones de manera eficiente: instala, desinstala, actualiza y realiza copias de seguridad de APKs. Organiza tu colección de aplicaciones con herramientas de categorización.",
    management1: "Instalación masiva de APKs",
    management2: "Copia de seguridad de aplicaciones",
    management3: "Comparación de versiones",
    management4: "Eliminación segura de aplicaciones",

    // Download Section
    downloadTitle: "Descarga ISV Toolkit",
    downloadSubtitle:
      "Disponible para todas las plataformas principales. Elige tu sistema operativo:",
    windows: "Windows",
    version: "Versión:",
    file: "Archivo:",
    size: "Tamaño:",
    requirements: "Requisitos:",
    downloadButton: "Descargar para",
    requirementsTitle: "📦 Requisitos del Sistema",
    dependenciesTitle: "⚙️ Dependencias Necesarias",
    os: "Sistema Operativo",
    osDesc: "Windows 7/8/10/11 (64-bit)",
    ram: "Memoria RAM",
    ramDesc: "Mínimo 2GB, recomendado 4GB",
    disk: "Espacio en Disco",
    diskDesc: "500MB mínimo, 1GB recomendado",
    internet: "Conexión a Internet",
    internetDesc: "Para descargar dependencias y actualizaciones",
    platformTools: "Platform Tools",
    platformToolsDesc: "ADB y Fastboot esenciales",
    buildTools: "Build Tools",
    buildToolsDesc: "AAPT, APKSigner, etc.",
    jdk: "JDK 11",
    jdkDesc: "Para JarSigner",
    free: "Totalmente Gratis",
    freeDesc: "ISV Toolkit es 100% gratuito",
  },

  en: {
    // Header
    features: "Features",
    download: "Download",
    github: "GitHub",
    language: "Language",
    theme: "Theme",

    "topbar.home": "Home",
    "topbar.features": "Features",
    "topbar.download": "Download",
    "topbar.github": "GitHub",
    "topbar.logoText": "ISV Toolkit",
    "topbar.language": "Language",
    "topbar.theme": "Theme",

    // Hero Section
    heroTitle: "ISV Toolkit",
    heroDescription:
      "Specialized tools for Android developers and QA. Optimize your workflow of different analysis activities in a single platform.",
    feature1: "Simple",
    feature1Desc: "No need to write commands and move files manually",
    feature2: "Information",
    feature2Desc: "All information of an APK by just inspecting it",
    feature3: "Integrated",
    feature3Desc: "Multiple tools integrated into a single platform",
    feature4: "JKS Signing",
    feature4Desc: "You can generate or sign APKs with JKS keys",

    // About Section
    aboutTitle: "What is ISV Toolkit?",
    aboutDescription:
      "A comprehensive platform for ISV developers with specialized tools for testing, optimization and software development.",
    purposeTitle: "Main Purpose",
    purposeDesc:
      "Simplify development and testing of ISV applications with specialized tools.",
    toolsTitle: "Integrated Tools",
    toolsDesc:
      "Complete suite for testing, performance optimization and code analysis.",
    benefitsTitle: "Key Benefits",
    benefitsDesc: "Reduced development time and implemented best practices.",

    // Image Sections
    analysisTitle: "Complete APK Analysis",
    analysisDesc:
      "Inspect any APK file and get detailed information about permissions, activities, services, providers and more. All in an intuitive interface without complex commands.",
    analysis1: "Extraction of APK metadata",
    analysis2: "Signature scheme and Hash information",
    analysis3: "APK size and format",
    analysis4: "Sensitive permissions and security standards",

    signingTitle: "APK Signing and Verification",
    signingDesc:
      "Sign your applications with custom JKS keys or verify signatures of existing APKs. Generate new keys and maintain full control over the signing process.",
    signing1: "APK signing with JKS keys",
    signing2: "Generation of new signing keys",
    signing3: "Verification of existing signatures",
    signing4: "APK alignment and optimization",

    logcatTitle: "Logcat Experiences",
    logcatDesc:
      "Access logcat records intuitively and efficiently. View, filter and export logs easily.",
    logcat1: "Logcat records visualization",
    logcat2: "Log filtering by log levels",
    logcat3: "Export of records to files",
    logcat4: "Save and export the record",

    adbTitle: "Advanced ADB Commands",
    adbDesc:
      "Execute complex ADB commands through an intuitive graphical interface. Automate repetitive tasks and access advanced functions without memorizing commands.",
    adb1: "Graphical interface for ADB commands",
    adb2: "Predefined scripts for common tasks",
    adb3: "Execution of custom commands",
    adb4: "History of executed commands",

    screenTitle: "Screen Recording and Capture",
    screenDesc:
      "Record your Android device screen and capture images in high quality. Perfect for creating tutorials, documenting bugs or sharing demos.",
    screen1: "High quality screen recording",
    screen2: "Instant screenshots",
    screen3: "Resolution and fps configuration",
    screen4: "Multiple export formats",

    managementTitle: "APK Management",
    managementDesc:
      "Manage your applications efficiently: install, uninstall, update and backup APKs. Organize your application collection with categorization tools.",
    management1: "Bulk APK installation",
    management2: "Application backup",
    management3: "Version comparison",
    management4: "Secure application removal",

    // Download Section
    downloadTitle: "Download ISV Toolkit",
    downloadSubtitle:
      "Available for all major platforms. Choose your operating system:",
    windows: "Windows",
    version: "Version:",
    file: "File:",
    size: "Size:",
    requirements: "Requirements:",
    downloadButton: "Download for",
    requirementsTitle: "📦 System Requirements",
    dependenciesTitle: "⚙️ Required Dependencies",
    os: "Operating System",
    osDesc: "Windows 7/8/10/11 (64-bit)",
    ram: "RAM Memory",
    ramDesc: "Minimum 4GB, recommended 8GB",
    disk: "Disk Space",
    diskDesc: "500MB minimum, 1GB recommended",
    internet: "Internet Connection",
    internetDesc: "For downloading dependencies and updates",
    platformTools: "Platform Tools",
    platformToolsDesc: "Essential ADB and Fastboot",
    buildTools: "Build Tools",
    buildToolsDesc: "AAPT, APKSigner, etc.",
    jdk: "JDK 11",
    jdkDesc: "For JarSigner",
    free: "Completely Free",
    freeDesc: "ISV Toolkit is 100% free",
  },

  pt: {
    // Header
    features: "Características",
    download: "Baixar",
    github: "GitHub",
    language: "Idioma",
    theme: "Tema",

    "topbar.home": "Início",
    "topbar.features": "Características",
    "topbar.download": "Baixar",
    "topbar.github": "GitHub",
    "topbar.logoText": "ISV Toolkit",
    "topbar.language": "Idioma",
    "topbar.theme": "Tema",
    // Hero Section
    heroTitle: "ISV Toolkit",
    heroDescription:
      "Ferramentas especializadas para desenvolvedores Android e QA. Otimize seu fluxo de diferentes atividades de análise em uma única plataforma.",
    feature1: "Simples",
    feature1Desc: "Não precisa escrever comandos e mover arquivos manualmente",
    feature2: "Informação",
    feature2Desc: "Toda a informação de um APK apenas inspecionando",
    feature3: "Integrado",
    feature3Desc: "Múltiplas ferramentas integradas em uma única plataforma",
    feature4: "Assinatura JKS",
    feature4Desc: "Você pode gerar ou assinar APKs com chaves JKS",

    // About Section
    aboutTitle: "O que é ISV Toolkit?",
    aboutDescription:
      "Uma plataforma abrangente para desenvolvedores ISV com ferramentas especializadas para testes, otimização e desenvolvimento de software.",
    purposeTitle: "Propósito Principal",
    purposeDesc:
      "Simplificar o desenvolvimento e teste de aplicações ISV com ferramentas especializadas.",
    toolsTitle: "Ferramentas Integradas",
    toolsDesc:
      "Suite completa para testes, otimização de desempenho e análise de código.",
    benefitsTitle: "Benefícios Principais",
    benefitsDesc:
      "Tempo de desenvolvimento reduzido e melhores práticas implementadas.",

    // Image Sections
    analysisTitle: "Análise Completa de APKs",
    analysisDesc:
      "Inspecione qualquer arquivo APK e obtenha informações detalhadas sobre permissões, atividades, serviços, provedores e mais. Tudo em uma interface intuitiva sem comandos complexos.",
    analysis1: "Extração de metadados do APK",
    analysis2: "Informações de esquema de assinatura e Hash",
    analysis3: "Tamanho e formato do APK",
    analysis4: "Permissões sensíveis e norma de segurança",

    signingTitle: "Assinatura e Verificação de APKs",
    signingDesc:
      "Assine suas aplicações com chaves JKS personalizadas ou verifique assinaturas de APKs existentes. Gere novas chaves e mantenha controle total sobre o processo de assinatura.",
    signing1: "Assinatura de APKs com chaves JKS",
    signing2: "Geração de novas chaves de assinatura",
    signing3: "Verificação de assinaturas existentes",
    signing4: "Alinhamento e otimização de APKs",

    logcatTitle: "Experiências Logcat",
    logcatDesc:
      "Acesse registros do logcat de forma intuitiva e eficiente. Visualize, filtre e exporte registros facilmente.",
    logcat1: "Visualização de registros do logcat",
    logcat2: "Filtragem de registros por níveis de log",
    logcat3: "Exportação de registros para arquivos",
    logcat4: "Salvar e exportar o registro",

    adbTitle: "Comandos ADB Avançados",
    adbDesc:
      "Execute comandos ADB complexos através de uma interface gráfica intuitiva. Automatize tarefas repetitivas e acesse funções avançadas sem memorizar comandos.",
    adb1: "Interface gráfica para comandos ADB",
    adb2: "Scripts predefinidos para tarefas comuns",
    adb3: "Execução de comandos personalizados",
    adb4: "Histórico de comandos executados",

    screenTitle: "Gravação e Captura de Tela",
    screenDesc:
      "Grave a tela do seu dispositivo Android e capture imagens em alta qualidade. Perfeito para criar tutoriais, documentar bugs ou compartilhar demonstrações.",
    screen1: "Gravação de tela em alta qualidade",
    screen2: "Capturas de tela instantâneas",
    screen3: "Configuração de resolução e fps",
    screen4: "Múltiplos formatos de exportação",

    managementTitle: "Gestão de APKs",
    managementDesc:
      "Gerencie suas aplicações de forma eficiente: instale, desinstale, atualize e faça backup de APKs. Organize sua coleção de aplicativos com ferramentas de categorização.",
    management1: "Instalação em massa de APKs",
    management2: "Backup de aplicações",
    management3: "Comparação de versões",
    management4: "Remoção segura de aplicações",

    // Download Section
    downloadTitle: "Baixar ISV Toolkit",
    downloadSubtitle:
      "Disponível para todas as principais plataformas. Escolha seu sistema operacional:",
    windows: "Windows",
    version: "Versão:",
    file: "Arquivo:",
    size: "Tamanho:",
    requirements: "Requisitos:",
    downloadButton: "Baixar para",
    requirementsTitle: "📦 Requisitos do Sistema",
    dependenciesTitle: "⚙️ Dependências Necessárias",
    os: "Sistema Operacional",
    osDesc: "Windows 7/8/10/11 (64-bit)",
    ram: "Memória RAM",
    ramDesc: "Mínimo 4GB, recomendado 8GB",
    disk: "Espaço em Disco",
    diskDesc: "500MB mínimo, 1GB recomendado",
    internet: "Conexão com Internet",
    internetDesc: "Para baixar dependências e atualizações",
    platformTools: "Platform Tools",
    platformToolsDesc: "ADB e Fastboot essenciais",
    buildTools: "Build Tools",
    buildToolsDesc: "AAPT, APKSigner, etc.",
    jdk: "JDK 11",
    jdkDesc: "Para JarSigner",
    free: "Totalmente Gratuito",
    freeDesc: "ISV Toolkit é 100% gratuito",
  },
};

// Crear el contexto
const LanguageContext = createContext();

// Proveedor del contexto
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("es");

  // Cargar idioma guardado
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    } else {
      // Detectar idioma del navegador
      const browserLang = navigator.language.slice(0, 2);
      if (translations[browserLang]) {
        setLanguage(browserLang);
      }
    }
  }, []);

  // Guardar idioma cuando cambia
  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  // Función para cambiar idioma
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  // Función para obtener traducción
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
