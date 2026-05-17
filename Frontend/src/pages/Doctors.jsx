import React from "react";
import Navbar from "../components/Navbar";
import DoctorPage from "../components/DoctorPage";
import FooterPage from "../components/FooterPage";

const Doctors = () => {
    return (
        <div>
            <Navbar/>
            <DoctorPage/>
            <FooterPage/>
        </div>
    );
};
export default Doctors;