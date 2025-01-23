import React from "react";
import "./index.css"; // Separate CSS for the footer
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Contact Section */}
        <div className="contact-section">
          <h2>Contact Us</h2>
          <div className="contact-info">
            <div className="contact-item">
              <p>
                <FontAwesomeIcon icon={faEnvelope} /> Email:
                sukanta.bhun@unthinkable.co
              </p>
            </div>
            <div className="contact-item">
              <p>
                <FontAwesomeIcon icon={faPhone} /> Phone: +7979790000
              </p>
            </div>
          </div>
        </div>
        <p>&copy; {new Date().getFullYear()} SocioYT. All rights reserved.</p>
        <ul className="footer-links">
          <li>
            <a href="#privacy">Privacy Policy</a>
          </li>
          <li>
            <a href="#terms">Terms of Service</a>
          </li>
          <li>
            <a href="#contact">Contact Us</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
