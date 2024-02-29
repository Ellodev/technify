# Import Flask and Json
from flask import Flask, jsonify
from flask_cors import CORS
import json
# Create an instance of Flask
app = Flask(__name__)
CORS(app)  # Apply CORS to all routes

# Define a route for the home page
@app.route("/")
def home():
    return "Hello, this is a Flask server!"

# Define a route for the articles endpoint
@app.route("/articles")
def articles():
    # Read the JSON file with the articles
    with open("articles.json", "r") as f:
        data = json.load(f)
    # Return the JSON data as a response
    return jsonify(data)

# Run the app
if __name__ == "__main__":
    app.run(debug=True)
