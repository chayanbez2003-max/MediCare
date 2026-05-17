import React from 'react'
import Navbar from '../components/Navbar'
import { heroStyles } from '../assets/dummyStyles'
import logoImg from '../assets/logoImg.png'


const Hero = ({role="admin", userName="Doctor"}) => {
  const isDoctor = role==="doctor"

  return (
    <div className={heroStyles.container}>
        <Navbar />
        <section className={heroStyles.container}>
          <div className={heroStyles.mainContainer}>
            <div className={heroStyles.contentBox}>
              <div className={heroStyles.logoContainer}>
                <img src={logoImg} alt="logo" className={heroStyles.logo} />
                
              </div>
              <h1 className={heroStyles.heading}>
                {isDoctor ? `Welcome, Dr. ${userName}` : "WELCOME TO MEDICARE ADMIN PANEL"}
              </h1>
              <p className={heroStyles.description}>
                {isDoctor ? "Manage your appointments and patient records" : "Mange hospital operations, doctoes, staff, patient records and system settings from a centralized control pannel"}
              </p>
              {/*info cards*/}
              <div className={heroStyles.infoCards.container}>
                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                    Secure Access
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Role based login with protected medical data
                  </p>
                </div>
                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                    Real-time management
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Monitor hospital activity and patient flow
                  </p>
                </div>
                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                    Medical Dashboad
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Clean, fast and doctor friendly interface
                  </p>
                </div>
              </div>
              
            </div>
            <div className={heroStyles.decorativeBg}>
              <div className={heroStyles.blurBackground}></div>
              <div className={heroStyles.blurShape}></div>
            </div>
          </div>
        </section>
    </div>
  )
}

export default Hero