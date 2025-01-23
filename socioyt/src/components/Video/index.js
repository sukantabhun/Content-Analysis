import React, { useState } from "react";
import "./index.css"; // Import the CSS file for styling
import Header from "../Header"; // Import the new Header component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ClipLoader from "react-spinners/ClipLoader"; // Import the new loader component
import ReactMarkdown from "react-markdown"; // Import markdown renderer
import remarkGfm from "remark-gfm"; // Import remark-gfm for GitHub flavored markdown
import Footer from "../Footer";
import Nothing from "../../assets/Empty.png";

// Function to extract YouTube video ID from URL
const extractVideoId = (url) => {
  const pattern =
    // eslint-disable-next-line
    /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=))([^"&?\/\s]{11})/;
  const match = url.match(pattern);
  return match ? match[1] : null;
};

const Video = () => {
  const [data, setData] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sentimentValue, setSentimentValue] = useState(null); // To store sentiment value
  const [showFullDescription, setShowFullDescription] = useState(false); // State to manage description visibility

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleInputFunction = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission behavior on "Enter"
      let videoId = inputVal;

      // Check if the input is a valid YouTube URL and extract the video ID
      if (
        !videoId ||
        (videoId.length < 11 &&
          !/^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=/.test(videoId)) ||
        (videoId.length === 11 && !/^[a-zA-Z0-9_-]{11}$/.test(videoId))
      ) {
        setError(true);
        setData(""); // Clear response if there's an error
      } else {
        if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
          videoId = extractVideoId(videoId);
        }
        setError(null);
        setLoading(true); // Start loading
        setData(null);
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/video/${videoId}`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          const result = await response.json();
          setData(result); // Update data with the fetched result
          setSentimentValue(result["Sentiment"]); // Set sentiment value
        } catch (err) {
          setError(err.message); // Update error message
        } finally {
          setLoading(false); // Stop loading
        }
      }
    }
  };

  const handleInputChange = (e) => {
    setInputVal(e.target.value); // Update input value on every change
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    let videoId = inputVal;

    // Check if the input is a valid YouTube URL and extract the video ID
    if (
      !videoId ||
      (videoId.length < 11 &&
        !/^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=/.test(videoId)) ||
      (videoId.length === 11 && !/^[a-zA-Z0-9_-]{11}$/.test(videoId))
    ) {
      setError(true);
      setData(""); // Clear response if there's an error
    } else {
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        videoId = extractVideoId(videoId); // Extract video ID if it's a URL
      }
      setError(null);
      setLoading(true); // Start loading
      setData(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/video/${videoId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const result = await response.json();
        setData(result); // Update data with the fetched result
        setSentimentValue(result["Sentiment"]); // Set sentiment value
      } catch (err) {
        setError(err.message); // Update error message
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };

  // Function to return the color based on sentiment value
  const getSentimentColor = (value) => {
    if (value === 1) return "red";
    if (value === 2) return "orange";
    if (value === 3) return "yellow";
    if (value === 4) return "lightgreen";
    if (value === 5) return "green";
    return "transparent"; // Default if no value
  };

  const getSentimentValue = (value) => {
    if (value === 1) return "Negative";
    if (value === 2) return "Weak Negative";
    if (value === 3) return "Neutral";
    if (value === 4) return "Weak Positive";
    if (value === 5) return "Positive";
    return "Nothing"; // Default if no value
  };

  return (
    <div className="home">
      <Header />
      <h1 className="heading-sec">Video Statistics</h1>
      <div className="form-wrapper">
        <form onSubmit={handleFormSubmit} className="form-container">
          <input
            type="text"
            id="videoId"
            placeholder="Enter Video Id or URL"
            className="input-element"
            value={inputVal}
            onChange={handleInputChange} // Update input value on change
            onKeyDown={handleInputFunction} // Handle Enter key
          />
          <button type="submit" className="proceed-button">
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>
        {error && (
          <p className="error">*Please enter a valid video ID or URL</p>
        )}
      </div>

      {/* Show the loader while loading */}
      {loading && (
        <div className="loader-container">
          <ClipLoader
            size={50}
            color="#00BFFF"
            loading={loading}
            aria-label="loading"
          />
        </div>
      )}

      {/* Show "Nothing to Show" when there's no response and loading is false */}
      {!loading && data === "" && (
        <div className="output-container">
          <img src={Nothing} alt="not found anything" />
          <h1>Nothing to Show</h1>
        </div>
      )}

      {/* Show the actual response when data is available */}
      {!loading && data && (
        <div className="output-container">
          <div className="output-details-container">
            <img
              src={data["Thumbnails"]}
              alt="thumbnail"
              style={{ height: "550px" }}
            />
            <h1>{data["Title"]}</h1>
            <div>
              <div className="output-details-container">
                <h1>Description</h1>
                <div className="text-description">
                  {/* Show part of the description initially */}
                  {showFullDescription
                    ? data["Description"]
                    : `${data["Description"].substring(0, 200)}...`}
                  <button onClick={toggleDescription} className="read-more-btn">
                    {showFullDescription ? "Read less" : "Read more"}
                  </button>
                </div>
                <h1>Tags</h1>
                <ul className="unordered-list">
                  {data["Tags"].map((eachItem, index) => {
                    return <li key={index}>{`#${eachItem}`}</li>;
                  })}
                </ul>
              </div>
            </div>
            <div>
              <h2>Sentiment</h2>
              {/* Display sentiment value */}
              {sentimentValue && (
                <div
                  className="sentiment-bar"
                  style={{ backgroundColor: getSentimentColor(sentimentValue) }}
                ></div>
              )}
            </div>
            <div className="sentiment-text">
              <h1>{getSentimentValue(sentimentValue)}</h1>
            </div>
            <div className="suggestions-text">
              <h1>Suggestions for improvement</h1>
              {data["Suggestions"] && (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {data["Suggestions"]}
                </ReactMarkdown>
              )}
              {!data["Suggestions"] && <p>No suggestions available</p>}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Video;
