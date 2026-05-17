import React from 'react'
import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
import Certification from '../components/Certification'
import HomeDoctors from '../components/HomeDoctors'
import Testimonial from '../components/Testimonial'
import FooterPage from '../components/FooterPage'

const Home = () => {
  return (
    <div>
      <Navbar/>
      <Banner/>
      <Certification/>
      <HomeDoctors/>
      <Testimonial/>
      <FooterPage/>
    </div>
  )
}

export default Home
