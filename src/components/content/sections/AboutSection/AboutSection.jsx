import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { Close } from '@mui/icons-material'
import { useLanguage } from '../../../../context/LanguageContext'
import './AboutSection.css'
import img1 from '../../../../assets/analizis.png'
import img2 from '../../../../assets/firma.png'
import img3 from '../../../../assets/logcat.png'
import img4 from '../../../../assets/comandos.png'
import img5 from '../../../../assets/rec.png'
import img6 from '../../../../assets/gestion_apk.png'

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

  // Función para abrir la imagen en pantalla completa
  const openImageModal = (imageSrc, altText) => {
    setSelectedImage({ src: imageSrc, alt: altText })
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  // Función para cerrar el modal
  const closeImageModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = 'auto'
  }

  // Cerrar modal al hacer click fuera de la imagen
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
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
      gsap.fromTo(modalRef.current,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 0.3,
          ease: "power2.out"
        }
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

    // Animaciones hover para tarjetas - MÁS RÁPIDAS
    cardsRef.current.forEach((card) => {
      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          duration: 0.2,
          ease: "power2.out"
        })
      }
      
      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        })
      }

      card.addEventListener('mouseenter', handleMouseEnter)
      card.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter)
        card.removeEventListener('mouseleave', handleMouseLeave)
      }
    })

    return () => {
      cardsRef.current.forEach((card) => {
        card.removeEventListener('mouseenter', () => {})
        card.removeEventListener('mouseleave', () => {})
      })
    }
  }, [])

  return (
    <>
      <section className="about-section" id="about">
        <h2 className="about-title" ref={titleRef}>{t('aboutTitle')}</h2>
        <p className="about-description" ref={descRef}>
          {t('aboutDescription')}
        </p>
        
        <div className="about-features">
          {/* Característica 1 */}
          <div className="feature-card" ref={addToRefs}>
            <div className="feature-icon">
              <span>🎯</span>
            </div>
            <div className="feature-content">
              <h3>{t('purposeTitle')}</h3>
              <p>{t('purposeDesc')}</p>
            </div>
          </div>

          {/* Característica 2 */}
          <div className="feature-card" ref={addToRefs}>
            <div className="feature-icon">
              <span>🛠️</span>
            </div>
            <div className="feature-content">
              <h3>{t('toolsTitle')}</h3>
              <p>{t('toolsDesc')}</p>
            </div>
          </div>

          {/* Característica 3 */}
          <div className="feature-card" ref={addToRefs}>
            <div className="feature-icon">
              <span>🚀</span>
            </div>
            <div className="feature-content">
              <h3>{t('benefitsTitle')}</h3>
              <p>{t('benefitsDesc')}</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN CON IMÁGENES ALTERNADAS */}
        <div className="image-sections">
          {/* Sección 1 */}
          <div className="image-section left-image" ref={addImageSectionToRefs}>
            <div className="image-container">
              <img 
                src={img1}
                alt={t('analysisTitle')} 
                className="feature-image"
                onClick={() => openImageModal(img1, t('analysisTitle'))}
              />
            </div>
            <div className="text-container">
              <h3>{t('analysisTitle')}</h3>
              <p>{t('analysisDesc')}</p>
              <ul className="feature-list">
                <li>{t('analysis1')}</li>
                <li>{t('analysis2')}</li>
                <li>{t('analysis3')}</li>
                <li>{t('analysis4')}</li>
              </ul>
            </div>
          </div>

          {/* Sección 2 */}
          <div className="image-section right-image" ref={addImageSectionToRefs}>
            <div className="text-container">
              <h3>{t('signingTitle')}</h3>
              <p>{t('signingDesc')}</p>
              <ul className="feature-list">
                <li>{t('signing1')}</li>
                <li>{t('signing2')}</li>
                <li>{t('signing3')}</li>
                <li>{t('signing4')}</li>
              </ul>
            </div>
            <div className="image-container">
              <img 
                src={img2}
                alt={t('signingTitle')} 
                className="feature-image"
                onClick={() => openImageModal(img2, t('signingTitle'))}
              />
            </div>
          </div>

          {/* Sección 3 */}
          <div className="image-section left-image" ref={addImageSectionToRefs}>
            <div className="image-container">
              <img 
                src={img3}
                alt={t('logcatTitle')} 
                className="feature-image"
                onClick={() => openImageModal(img3, t('logcatTitle'))}
              />
            </div>
            <div className="text-container">
              <h3>{t('logcatTitle')}</h3>
              <p>{t('logcatDesc')}</p>
              <ul className="feature-list">
                <li>{t('logcat1')}</li>
                <li>{t('logcat2')}</li>
                <li>{t('logcat3')}</li>
                <li>{t('logcat4')}</li>
              </ul>
            </div>
          </div>

          {/* Sección 4 */}
          <div className="image-section right-image" ref={addImageSectionToRefs}>
            <div className="text-container">
              <h3>{t('adbTitle')}</h3>
              <p>{t('adbDesc')}</p>
              <ul className="feature-list">
                <li>{t('adb1')}</li>
                <li>{t('adb2')}</li>
                <li>{t('adb3')}</li>
                <li>{t('adb4')}</li>
              </ul>
            </div>
            <div className="image-container">
              <img 
                src={img4}
                alt={t('adbTitle')} 
                className="feature-image"
                onClick={() => openImageModal(img4, t('adbTitle'))}
              />
            </div>
          </div>

          {/* Sección 5 */}
          <div className="image-section left-image" ref={addImageSectionToRefs}>
            <div className="image-container">
              <img 
                src={img5}
                alt={t('screenTitle')} 
                className="feature-image"
                onClick={() => openImageModal(img5, t('screenTitle'))}
              />
            </div>
            <div className="text-container">
              <h3>{t('screenTitle')}</h3>
              <p>{t('screenDesc')}</p>
              <ul className="feature-list">
                <li>{t('screen1')}</li>
                <li>{t('screen2')}</li>
                <li>{t('screen3')}</li>
                <li>{t('screen4')}</li>
              </ul>
            </div>
          </div>

          {/* Sección 6 */}
          <div className="image-section right-image" ref={addImageSectionToRefs}>
            <div className="text-container">
              <h3>{t('managementTitle')}</h3>
              <p>{t('managementDesc')}</p>
              <ul className="feature-list">
                <li>{t('management1')}</li>
                <li>{t('management2')}</li>
                <li>{t('management3')}</li>
                <li>{t('management4')}</li>
              </ul>
            </div>
            <div className="image-container">
              <img 
                src={img6}
                alt={t('managementTitle')} 
                className="feature-image"
                onClick={() => openImageModal(img6, t('managementTitle'))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* MODAL PARA VISUALIZACIÓN DE IMÁGENES */}
      {isModalOpen && (
        <div 
          className="image-modal" 
          ref={modalRef}
          onClick={handleBackdropClick}
        >
          <div className="modal-content">
            <button 
              className="modal-close-btn"
              onClick={closeImageModal}
              aria-label="Cerrar modal"
            >
              <Close style={{ fontSize: '24px' }} />
            </button>
            <div className="modal-image-container">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.alt} 
                className="modal-image"
              />
              <div className="image-caption">
                <p>{selectedImage.alt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}