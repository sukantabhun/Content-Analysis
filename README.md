# SocioYT - YouTube Content Analyzer

## Overview

**SocioYT** is a full-stack application that enables YouTube content analysis and optimization using AI-driven insights. The backend, built with FastAPI, interacts with the YouTube API to fetch channel and video statistics, while the frontend, built with React, allows users to interact with the application.

The backend provides endpoints to fetch channel details, video analysis, engagement rates, and AI-generated suggestions for optimizing YouTube content (titles, descriptions, tags). Sentiment analysis of the video's description and tags is also performed to provide additional insights.

## Technologies

### Backend:
- **FastAPI**: Web framework for creating the API.
- **Google API Client**: To interact with the YouTube Data API.
- **Transformers (Hugging Face)**: For sentiment analysis.
- **OpenAI GPT**: For generating AI suggestions related to YouTube content optimization.
- **Pandas**: For handling and analyzing data.
- **Torch**: Used for processing data in the sentiment analysis model.

### Frontend:
- **React.js**: JavaScript library for building the user interface.
- **React Router**: For routing and navigation between different pages of the app.



## Setup Instructions

### 1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
2. Backend Setup (FastAPI):
Install dependencies: Create a virtual environment and install the required Python packages from requirements.txt:

bash
Copy
Edit
cd server
pip install -r requirements.txt
Run the FastAPI server: To run the FastAPI application with uvicorn, use the following command:

bash
Copy
Edit
uvicorn main:app --reload
This will start the backend server locally on http://127.0.0.1:8000.

API Endpoints:
GET /: Test endpoint to check if the server is running.
GET /channel/{channel_id}: Fetch and analyze a YouTube channel’s details (including engagement rate and top videos).
GET /video/{video_id}: Fetch and analyze a specific video’s details (including sentiment analysis and AI-generated suggestions).
3. Frontend Setup (React):
Navigate to the frontend directory:

bash
Copy
Edit
cd socioyt
Install frontend dependencies: Use npm to install the necessary packages:

bash
Copy
Edit
npm install
Run the React development server: After installing the dependencies, you can start the React frontend using:

bash
Copy
Edit
npm start
This will run the frontend application locally on http://localhost:3000.

4. Configuration:
Backend API Keys:

You will need a valid YouTube API Key for the backend to access YouTube data. Replace the API_KEY variable in the backend with your own API key.
For OpenAI integration, replace the OpenAI API key in the backend (OpenAI(api_key='YOUR_API_KEY')).
Frontend Configuration: For the frontend, you may want to configure API endpoints in a .env file or directly in your frontend code where API requests are made.

5. Running the Application:
Backend: Clone the repository and navigate to the backend directory:

bash
Copy
Edit
git clone <repository-url>
cd server
pip install -r requirements.txt
uvicorn main:app --reload
The backend will be available at http://127.0.0.1:8000.

Frontend: Navigate to the frontend directory:

bash
Copy
Edit
cd socioyt
npm install
npm run start
The frontend will be available at http://localhost:3000.

Project Structure
php
Copy
Edit
.
├── server
│   ├── main.py                  # FastAPI server file
│   ├── requirements.txt         # Python dependencies for the backend
│   └── ...                      # Other backend-related files
├── socioyt
│   ├── src
│   │   ├── App.js               # Main React application component
│   │   ├── components
│   │   └── ...                  # Other React components
│   ├── public
│   └── package.json             # Frontend dependencies and configuration
└── README.md                    # Project documentation







### Note : Please update the api keys with their respective value (currently hardcoded)









