import React, { useState } from "react";
import {contactPageStyles} from "../assets/dummyStyles";

const CLINIC_WHATSAPP_NUMBER = "8509796196"; // User will replace this with real number
const CLINIC_ADDRESS = "Rajarhat,New-Town,Kolkata-700002";
const CLINIC_PHONE = "+91 8509796196";
const CLINIC_EMAIL = "[chayanbez03@gmail.com]";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    service: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.service) newErrors.service = "Service is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWhatsAppSend = (e) => {
    e.preventDefault();
    if (validate()) {
      const text = `*New Contact Form Submission*%0A%0A*Name:* ${formData.fullName}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A*Department:* ${formData.department}%0A*Service:* ${formData.service}%0A*Message:* ${formData.message}`;
      const whatsappUrl = `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${text}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className={contactPageStyles.pageContainer}>
      <style>{contactPageStyles.animationKeyframes}</style>
      
      {/* Background accents */}
      <div className={contactPageStyles.bgAccent1}></div>
      <div className={contactPageStyles.bgAccent2}></div>

      {/* Header Section */}
      <div className="text-center mb-10 relative z-10">
        <h1 className={contactPageStyles.formTitle}>
          Contact Us
        </h1>
        <p className={contactPageStyles.formSubtitle}>
          Our team is here to support your healthcare journey.
        </p>
      </div>

      <div className={`${contactPageStyles.gridContainer} relative z-10`}>
        {/* Left Side: Contact Form */}
        <div className={contactPageStyles.formContainer}>
          <h3 className={`${contactPageStyles.formTitle} !text-2xl mb-6`}>
            Send us a Message
          </h3>
          <form className={contactPageStyles.formSpace}>
            <div className={contactPageStyles.formGrid}>
              {/* Full Name */}
              <div>
                <label className={contactPageStyles.label}>Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`${contactPageStyles.input} ${errors.fullName ? "border-rose-400" : ""}`}
                />
                {errors.fullName && <p className={contactPageStyles.error}>{errors.fullName}</p>}
              </div>
              
              {/* Email */}
              <div>
                <label className={contactPageStyles.label}>Email Address <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`${contactPageStyles.input} ${errors.email ? "border-rose-400" : ""}`}
                />
                {errors.email && <p className={contactPageStyles.error}>{errors.email}</p>}
              </div>
            </div>

            <div className={contactPageStyles.formGrid}>
              {/* Phone */}
              <div>
                <label className={contactPageStyles.label}>Phone Number <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={`${contactPageStyles.input} ${errors.phone ? "border-rose-400" : ""}`}
                />
                {errors.phone && <p className={contactPageStyles.error}>{errors.phone}</p>}
              </div>

              {/* Department */}
              <div>
                <label className={contactPageStyles.label}>Department <span className="text-rose-500">*</span></label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`${contactPageStyles.input} ${errors.department ? "border-rose-400" : ""}`}
                >
                  <option value="">Select Department</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
                {errors.department && <p className={contactPageStyles.error}>{errors.department}</p>}
              </div>
            </div>

            {/* Service */}
            <div>
              <label className={contactPageStyles.label}>Service <span className="text-rose-500">*</span></label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className={`${contactPageStyles.input} ${errors.service ? "border-rose-400" : ""}`}
              >
                <option value="">Select Service</option>
                <option value="General Consultation">General Consultation</option>
                <option value="Specialist Appointment">Specialist Appointment</option>
                <option value="Routine Checkup">Routine Checkup</option>
                <option value="Follow-up">Follow-up</option>
              </select>
              {errors.service && <p className={contactPageStyles.error}>{errors.service}</p>}
            </div>

            {/* Message */}
            <div>
              <label className={contactPageStyles.label}>Your Message <span className="text-rose-500">*</span></label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="How can we help you?"
                className={`${contactPageStyles.textarea} ${errors.message ? "border-rose-400" : ""}`}
              ></textarea>
              {errors.message && <p className={contactPageStyles.error}>{errors.message}</p>}
            </div>

            {/* Send Button */}
            <div className={contactPageStyles.buttonContainer}>
              <button
                onClick={handleWhatsAppSend}
                className={contactPageStyles.button}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Send via WhatsApp
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Info & Map Placeholder */}
        <div className={contactPageStyles.infoContainer}>
          
          {/* Clinic Info Box */}
          <div className={contactPageStyles.infoCard}>
            <h3 className={`${contactPageStyles.infoTitle} flex items-center gap-3 text-emerald-800`}>
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Visit Our Clinic
            </h3>
            
            <div className="space-y-4">
              <div className={contactPageStyles.infoItem}>
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`${contactPageStyles.infoText} text-gray-700 font-medium`}>{CLINIC_ADDRESS}</p>
                </div>
              </div>

              <div className={contactPageStyles.infoItem}>
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className={`${contactPageStyles.infoText} text-gray-700 font-medium`}>{CLINIC_PHONE}</p>
                </div>
              </div>

              <div className={contactPageStyles.infoItem}>
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`${contactPageStyles.infoText} text-gray-700 font-medium`}>{CLINIC_EMAIL}</p>
                </div>
              </div>
            </div>

            {/* Added from contactPageStyles.hoursContainer */}
            <div className={`${contactPageStyles.hoursContainer} mt-6`}>
              <h4 className={`${contactPageStyles.hoursTitle} text-emerald-800`}>Opening Hours</h4>
              <p className={contactPageStyles.hoursText}>Mon - Fri: 8:00 AM - 8:00 PM</p>
              <p className={contactPageStyles.hoursText}>Sat: 9:00 AM - 5:00 PM</p>
              <p className={contactPageStyles.hoursText}>Sun: Emergency Only</p>
            </div>
          </div>

          {/* Map from the user */}
          <div className="w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.460792853461!2d80.98709187529213!3d26.870382662861033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be2ae3cea2421%3A0x6c0de12e8a77818f!2sGomti%20Nagar%2C%20Lucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1731769000000!5m2!1sen!2sin"
              className={contactPageStyles.map}
              title="Gomti Nagar Map"
              loading="lazy"
              allowFullScreen
            ></iframe>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ContactPage;