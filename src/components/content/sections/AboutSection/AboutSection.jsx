import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { Close } from '@mui/icons-material'
import { useLanguage } from '../../../../context/LanguageContext'
import './AboutSection.css'
import img1 from '../../../../assets/analizis.png'
import img2 from '../../../../assets/firma.png'
import img3 from '../../../../assets/logcat.png'
import img4 from '../../../../assets/comandos.png'
import img6 from '../../../../assets/settings.png'

export default function AboutSection() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const imageSectionsRef = useRef([])
  const modalRef = useRef(null)
  const { t } = useLanguage()
  
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el)
    }
  }

  const addImageSectionToRefs = (el) => {
    if (el && !imageSectionsRef.current.includes(el)) {
      imageSectionsRef.current.push(el)
    }
  }

  // Obtener lista de imágenes para navegación
  const galleryImages = [
    { src: img1, title: t('analysisTitle') },
    { src: img2, title: t('signingTitle') },
    { src: img3, title: t('logcatTitle') },
    { src: img4, title: t('adbTitle') },
    { src: img6, title: t('managementTitle') }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  // Función para abrir la imagen en pantalla completa
  const openImageModal = (imageSrc, altText) => {
    const index = galleryImages.findIndex(img => img.src === imageSrc)
    setCurrentIndex(index !== -1 ? index : 0)
    setSelectedImage({ src: imageSrc, alt: altText })
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  // Función para cerrar el modal
  const closeImageModal = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsModalOpen(false)
        document.body.style.overflow = 'auto'
      }
    })
    tl.to(modalRef.current, { opacity: 0, duration: 0.3 })
  }

  const navigateGallery = (direction) => {
    let newIndex = currentIndex + direction
    if (newIndex < 0) newIndex = galleryImages.length - 1
    if (newIndex >= galleryImages.length) newIndex = 0
    
    setCurrentIndex(newIndex)
    setSelectedImage({ 
      src: galleryImages[newIndex].src, 
      alt: galleryImages[newIndex].title 
    })
  }

  // Cerrar modal al hacer click fuera de la imagen
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('image-modal')) {
      closeImageModal()
    }
  }

  // Cerrar modal con Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeImageModal()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isModalOpen])

  // Animaciones del modal
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      const content = modalRef.current.querySelector('.modal-content')
      
      gsap.fromTo(modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      )
      
      gsap.fromTo(content,
        { scale: 0.85, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)", delay: 0.1 }
      )
    }
  }, [isModalOpen])

  useEffect(() => {
    // Configurar Intersection Observer para animaciones al scroll
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target
          
          // Animación rápida usando GSAP
          gsap.to(section, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out"
          })
          
          observer.unobserve(section)
        }
      })
    }, observerOptions)

    // Observar todas las secciones de imágenes
    imageSectionsRef.current.forEach(section => {
      if (section) observer.observe(section)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    // Animación del título - MÁS RÁPIDA
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", duration: 0.5 }
    })

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0 }
    )

    // Animación de la descripción - MÁS RÁPIDA
    tl.fromTo(descRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0 },
      "-=0.3"
    )

    // Animación de las tarjetas - MÁS RÁPIDA
    cardsRef.current.forEach((card, index) => {
      tl.fromTo(card,
        { opacity: 0, scale: 0.9, y: 30 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.3,
          delay: index * 0.08
        },
        "-=0.2"
      )
    })
  }, [])

  return (
    <>
      <section className="about-section-v2" id="about">
        <div className="about-header">
          <h2 className="about-title-v2" ref={titleRef}>{t('aboutTitle')}</h2>
          <p className="about-description-v2" ref={descRef}>
            {t('aboutDescription')}
          </p>
        </div>
        
        <div className="about-features-v2">
          {/* Característica 1 */}
          <div className="feature-card-v3" ref={addToRefs}>
            <div className="feature-icon-v3">🎯</div>
            <div className="feature-content-v3">
              <h3>{t('purposeTitle')}</h3>
              <p>{t('purposeDesc')}</p>
            </div>
          </div>

          {/* Característica 2 */}
          <div className="feature-card-v3" ref={addToRefs}>
            <div className="feature-icon-v3">🛠️</div>
            <div className="feature-content-v3">
              <h3>{t('toolsTitle')}</h3>
              <p>{t('toolsDesc')}</p>
            </div>
          </div>

          {/* Característica 3 */}
          <div className="feature-card-v3" ref={addToRefs}>
            <div className="feature-icon-v3">🚀</div>
            <div className="feature-content-v3">
              <h3>{t('benefitsTitle')}</h3>
              <p>{t('benefitsDesc')}</p>
            </div>
          </div>
        </div>

        {/* MODERN ALTERNATING IMAGE SECTIONS */}
        <div className="image-sections-v2">
          {/* Section 1 */}
          <div className="image-section-v2 left-image" ref={addImageSectionToRefs}>
            <div className="image-container-v2">
              <div className="image-glow-bg"></div>
              <img 
                src={img1}
                alt={t('analysisTitle')} 
                className="feature-image-v2"
                onClick={() => openImageModal(img1, t('analysisTitle'))}
              />
            </div>
            <div className="text-container-v2">
              <span className="section-number">01</span>
              <h3>{t('analysisTitle')}</h3>
              <p>{t('analysisDesc')}</p>
              <ul className="feature-list-v2">
                <li>{t('analysis1')}</li>
                <li>{t('analysis2')}</li>
                <li>{t('analysis3')}</li>
                <li>{t('analysis4')}</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="image-section-v2 right-image" ref={addImageSectionToRefs}>
            <div className="text-container-v2">
              <span className="section-number">02</span>
              <h3>{t('signingTitle')}</h3>
              <p>{t('signingDesc')}</p>
              <ul className="feature-list-v2">
                <li>{t('signing1')}</li>
                <li>{t('signing2')}</li>
                <li>{t('signing3')}</li>
                <li>{t('signing4')}</li>
              </ul>
            </div>
            <div className="image-container-v2">
              <div className="image-glow-bg"></div>
              <img 
                src={img2}
                alt={t('signingTitle')} 
                className="feature-image-v2"
                onClick={() => openImageModal(img2, t('signingTitle'))}
              />
            </div>
          </div>

          {/* Section 3 */}
          <div className="image-section-v2 left-image" ref={addImageSectionToRefs}>
            <div className="image-container-v2">
              <div className="image-glow-bg"></div>
              <img 
                src={img3}
                alt={t('logcatTitle')} 
                className="feature-image-v2"
                onClick={() => openImageModal(img3, t('logcatTitle'))}
              />
            </div>
            <div className="text-container-v2">
              <span className="section-number">03</span>
              <h3>{t('logcatTitle')}</h3>
              <p>{t('logcatDesc')}</p>
              <ul className="feature-list-v2">
                <li>{t('logcat1')}</li>
                <li>{t('logcat2')}</li>
                <li>{t('logcat3')}</li>
                <li>{t('logcat4')}</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="image-section-v2 right-image" ref={addImageSectionToRefs}>
            <div className="text-container-v2">
              <span className="section-number">04</span>
              <h3>{t('adbTitle')}</h3>
              <p>{t('adbDesc')}</p>
              <ul className="feature-list-v2">
                <li>{t('adb1')}</li>
                <li>{t('adb2')}</li>
                <li>{t('adb3')}</li>
                <li>{t('adb4')}</li>
              </ul>
            </div>
            <div className="image-container-v2">
              <div className="image-glow-bg"></div>
              <img 
                src={img4}
                alt={t('adbTitle')} 
                className="feature-image-v2"
                onClick={() => openImageModal(img4, t('adbTitle'))}
              />
            </div>
          </div>

          

          {/* Section 5 */}
          <div className="image-section-v2 left-image" ref={addImageSectionToRefs}>
            <div className="image-container-v2">
              <div className="image-glow-bg"></div>
              <img 
                src={img6}
                alt={t('managementTitle')} 
                className="feature-image-v2"
                onClick={() => openImageModal(img6, t('managementTitle'))}
              />
            </div>
            <div className="text-container-v2">
              <span className="section-number">05</span>
              <h3>{t('managementTitle')}</h3>
              <p>{t('managementDesc')}</p>
              <ul className="feature-list-v2">
                <li>{t('management1')}</li>
                <li>{t('management2')}</li>
                <li>{t('management3')}</li>
                <li>{t('management4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL PARA VISUALIZACIÓN DE IMÁGENES PREMIUN */}
      {isModalOpen && (
        <div 
          className="image-modal" 
          ref={modalRef}
          onClick={handleBackdropClick}
        >
          <button 
            className="modal-close-btn-v2"
            onClick={closeImageModal}
            aria-label="Cerrar modal"
          >
            <Close />
          </button>

          <div className="modal-navigation">
            <button className="nav-btn prev" onClick={() => navigateGallery(-1)}>‹</button>
            <button className="nav-btn next" onClick={() => navigateGallery(1)}>›</button>
          </div>

          <div className="modal-content">
            <div className="modal-image-wrapper">
              <div className="modal-glass-border"></div>
              <img 
                src={selectedImage.src} 
                alt={selectedImage.alt} 
                className="modal-image-v2"
              />
              <div className="modal-info-v2">
                <span className="modal-index">{currentIndex + 1} / {galleryImages.length}</span>
                <h4 className="modal-title-v2">{selectedImage.alt}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}