from fastapi import FastAPI, HTTPException
import googleapiclient.discovery
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import json
import openai
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Retrieve API keys from environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
openai.api_key=OPENAI_API_KEY

# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def startedAndInitializeServer():
    return 'Server started!!!'

# API key and YouTube API initialization
API_KEY = YOUTUBE_API_KEY
youtube = googleapiclient.discovery.build("youtube", "v3", developerKey=API_KEY)

# Load pre-trained sentiment analysis model
tokenizer = AutoTokenizer.from_pretrained('nlptown/bert-base-multilingual-uncased-sentiment')
model = AutoModelForSequenceClassification.from_pretrained('nlptown/bert-base-multilingual-uncased-sentiment')


# Helper Function: Fetch channel details
def get_channel_states(channel_id):
    request = youtube.channels().list(
        part='snippet,contentDetails,statistics', id=channel_id
    )
    response = request.execute()
    if not response['items']:
        raise HTTPException(status_code=404, detail="Channel not found.")
    response = response['items'][0]
    data = dict(
        ChannelName=response['snippet']['title'],
        Subscribers=int(response['statistics']['subscriberCount']),
        ViewCount=int(response['statistics']['viewCount']),
        VideoCount=int(response['statistics']['videoCount']),
        PlaylistId=response['contentDetails']['relatedPlaylists']['uploads'],
        Pfp=response['snippet']['thumbnails']['high']['url']
    )
    return data


# Helper Function: Fetch video IDs from a playlist
def get_video_ids(playlist_id):
    video_ids = []
    request = youtube.playlistItems().list(
        part='contentDetails', playlistId=playlist_id, maxResults=50
    )
    while request:
        response = request.execute()
        video_ids += [item['contentDetails']['videoId'] for item in response['items']]
        request = youtube.playlistItems().list_next(request, response)
    return video_ids


# Helper Function: Fetch video details
def get_video_details_batch(video_ids):
    all_video_stats = []
    for i in range(0, len(video_ids), 50):
        request = youtube.videos().list(
            part='snippet,statistics', id=','.join(video_ids[i:i + 50])
        )
        response = request.execute()
        
        for video in response.get('items', []):
            stats = video.get('statistics', {})
            video_stats = dict(
                Title=video['snippet']['title'],
                PublishedDate=video['snippet']['publishedAt'],
                Views=int(stats.get('viewCount', 0)),
                Likes=int(stats.get('likeCount', 0)),
                Comments=int(stats.get('commentCount', 0)),
                channelId = video['snippet']['channelId'],
                thumbnails = video['snippet']['thumbnails']['high']['url']
            )
            all_video_stats.append(video_stats)
    return pd.DataFrame(all_video_stats)


# Helper Function: Engagement Rate Calculation
def calculate_engagement_rate(video_details_df, subscribers, video_count):
    total_likes = video_details_df['Likes'].sum()
    total_comments = video_details_df['Comments'].sum()
    return (((total_comments + total_likes) / video_count) / subscribers) * 100

# Fuction for graph data
def calculate_engagement_rate_by_year(df):
    # Convert publish_date to datetime
    df['PublishedDate'] = pd.to_datetime(df['PublishedDate'])
    # Extract the year
    df['year'] = df['PublishedDate'].dt.year
    
    # Calculate engagement rate
    df['engagement_rate'] = ((df['Likes'] + df['Comments']) / df['Views']) * 100
    
    # Group by year and calculate metrics
    result = df.groupby('year').agg(
        total_views=('Views', 'sum'),
        avg_engagement_rate=('engagement_rate', 'mean')
    ).reset_index()
    
    # Convert result to JSON
    result_json = result.to_json(orient='records')
    return result_json
# Helper Function: Fetch channel details based on handle, username, or channel ID
def get_channel_data_by_input(channel_input: str):
    # Check if the input is a YouTube handle (starts with '@')
    if channel_input.startswith('@'):
        return get_channel_states_by_handle(channel_input.lstrip('@'))
    
    # Check if it's a YouTube username
    elif not channel_input.startswith('UC'):  # Assuming it’s not a channel ID
        return get_channel_states_by_username(channel_input)
    
    # Else, it's likely a channel ID
    return get_channel_states_by_id(channel_input)


# Fetch channel details by handle
def get_channel_states_by_handle(handle):
    request = youtube.channels().list(
        part='snippet,contentDetails,statistics', forHandle=handle
    )
    response = request.execute()
    if not response['items']:
        raise HTTPException(status_code=404, detail="Channel not found.")
    response = response['items'][0]
    return format_channel_data(response)


# Fetch channel details by username
def get_channel_states_by_username(username):
    request = youtube.channels().list(
        part='snippet,contentDetails,statistics', forUsername=username
    )
    response = request.execute()
    if not response['items']:
        raise HTTPException(status_code=404, detail="Channel not found.")
    response = response['items'][0]
    return format_channel_data(response)


# Fetch channel details by ID
def get_channel_states_by_id(channel_id):
    request = youtube.channels().list(
        part='snippet,contentDetails,statistics', id=channel_id
    )
    response = request.execute()
    if not response['items']:
        raise HTTPException(status_code=404, detail="Channel not found.")
    response = response['items'][0]
    return format_channel_data(response)


# Helper function to format the data
def format_channel_data(response):
    data = dict(
        ChannelName=response['snippet']['title'],
        Subscribers=int(response['statistics']['subscriberCount']),
        ViewCount=int(response['statistics']['viewCount']),
        VideoCount=int(response['statistics']['videoCount']),
        PlaylistId=response['contentDetails']['relatedPlaylists']['uploads'],
        Pfp=response['snippet']['thumbnails']['high']['url']
    )
    return data


# Predict sentiment using the pre-trained model
def predict_sentiment(text):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        sentiment = torch.argmax(outputs.logits, dim=1).item()
    sentiment_mapping = {0: 1, 1: 1, 2: 3, 3: 4, 4: 5}
    return sentiment_mapping[sentiment]


# API Endpoint: Analyze channel with handle, username, or ID
@app.get("/channel/lookup")
def analyze_channel_by_input(channel_input: str):
    try:
        # Fetch channel data by handle, username, or channel ID
        channel_data = get_channel_data_by_input(channel_input)
        playlist_id = channel_data['PlaylistId']

        # Fetch video data
        video_ids = get_video_ids(playlist_id)
        video_details_df = get_video_details_batch(video_ids)

        # Calculate engagement rate
        eng_rate = calculate_engagement_rate(
            video_details_df,
            subscribers=channel_data['Subscribers'],
            video_count=channel_data['VideoCount']
        )

        video_details_df['PublishedDate'] = pd.to_datetime(video_details_df['PublishedDate']).dt.date
        graph_data = calculate_engagement_rate_by_year(video_details_df)

        # Get top 10 videos
        top_videos = video_details_df.sort_values(by='Views', ascending=False).head(10)
        return {
            "ChannelName": channel_data['ChannelName'],
            "Subscribers": channel_data['Subscribers'],
            "ViewCount": channel_data['ViewCount'],
            "VideoCount": channel_data['VideoCount'],
            "pfp": channel_data['Pfp'],
            "EngagementRate": eng_rate,
            "TopVideos": top_videos.to_dict(orient='records'),
            "GraphData": graph_data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# AI suggestion
def generate_ai_suggestions(title, description, tags):
    prompt = '''You are an expert in YouTube content optimization. Based on the following video information:

        - Title: {title}
        - Description: {description}
        - Tags: {tags}

        Please provide the following, formatted entirely in markdown:

        1. **Predicted Engagement Rate**: Based on the title, description, and tags, predict the engagement rate. 
        - Estimate the percentage of expected viewer interaction.

        2. **Better, More Engaging Title**: Suggest a more engaging and optimized title for better user interaction.

        3. **Improved Description**: Improve and optimize the current description. 
        - Include details about the movie, song, and relevant social media call-to-action. Add placeholders for any links, with the format [Add your own link here].

        4. **Hashtags**: Suggest at least 3 relevant hashtags to increase the engagement.

        Return only these four points, formatted entirely in markdown. Ensure there are no extra backticks or markdown inside the text and replace all URLs with [Add your own link here].
        '''

    try:
        response = openai.ChatCompletions.create(
            model="gpt-4o-mini",  # Use "gpt-4" or another valid model name
            messages=[{"role": "system", "content": prompt}],
            temperature=0.7
        )

        # Parse the response to extract the suggestions
        suggestions = response.choices[0].message.content.strip()
        return suggestions

    except Exception as e:
        return {"error": str(e)}
@app.get("/video/{video_id}")
def analyze_video_endpoint(video_id: str):
    try:
        # Fetch video details from YouTube API
        video = youtube.videos().list(
            part='snippet,statistics', id=video_id
        ).execute()

        if not video['items']:
            raise HTTPException(status_code=404, detail="Video not found.")

        video = video['items'][0]
        title = video['snippet']['title']
        description = video['snippet']['description']
        channelId = video['snippet']['channelId']
        tags = video['snippet'].get('tags', [])
        thumbnails = video['snippet']['thumbnails']['high']['url']
        combined_text = f"{title} {description} {' '.join(tags)}"

        # Generate AI suggestions
        ai_suggestions = generate_ai_suggestions(title, description, tags)
        try:
            # Parse AI suggestions into a dictionary
            suggestions_dict = json.loads(ai_suggestions)
        except json.JSONDecodeError:
            # Handle cases where AI response is not valid JSON
            suggestions_dict = {"error": "AI response could not be parsed as JSON."}

        # Perform sentiment analysis
        sentiment = predict_sentiment(combined_text)

        return {
            "Title": title,
            "Description": description,
            "Tags": tags,
            "Sentiment": sentiment,
            "Suggestions": ai_suggestions,
            "Thumbnails": thumbnails,
            "channelId":channelId,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
