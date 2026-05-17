import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/FooterPage";
import ContactPage from "../components/ContactPage";

const Contact = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Navbar />
            <div className="flex-grow">
                <ContactPage />
            </div>
            <Footer />
        </div>
    );
};

export default Contact;