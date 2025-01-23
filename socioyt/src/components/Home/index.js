import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import Header from "../Header";
import Footer from "../Footer"; // Import Footer component
import Logo from "../../assets/91627.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faUser } from "@fortawesome/free-solid-svg-icons";

const cards = [
  {
    name: "Channel Analysis",
    link: "channel",
    icon: faVideo,
    description:
      "Provide us with a channel ID and we'll provide you with its engagement rate and statistics.",
  },
  {
    name: "Video Analysis",
    link: "video",
    icon: faUser,
    description:
      "Provide us with a video ID and we'll provide you with its engagement predictions and tips for improvement.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const cardContainerRef = useRef(null);

  const handleGetStartedClick = () => {
    if (cardContainerRef.current) {
      cardContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCardClick = (link) => {
    navigate(`/${link}`);
  };

  return (
    <div className="home">
      <Header />
      <div className="content-container">
        <img src={Logo} alt="central logo" className="logo-styling" />
        <h1>Unlock Insights with Our YouTube Content Analyzer</h1>
        <p>
          Analyze trends, track performance, and optimize your content strategy
          with actionable insights.
        </p>
        <button className="get-started-button" onClick={handleGetStartedClick}>
          Get Started
        </button>
      </div>

      <div className="card-container-1" ref={cardContainerRef}>
        {cards.map((card, index) => (
          <div
            className="card-1"
            key={index}
            onClick={() => handleCardClick(card.link)}
          >
            <div className="card-inner">
              <div className="card-front">
                <FontAwesomeIcon
                  icon={card.icon}
                  style={{ height: "100px", color: "teal" }}
                />
                <div className="card-name">{card.name}</div>
              </div>
              <div className="card-back">
                <h1>{card.name}</h1>
                <p>{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
