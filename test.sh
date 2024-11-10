#!/bin/bash

# Define the API key and endpoint
API_KEY="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"
ENDPOINT="https://api.openai.com/v1/chat/completions"

# Make a test request using curl
curl -X POST $ENDPOINT \
-H "Authorization: Bearer $API_KEY" \
-H "Content-Type: application/json" \
-d '{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello, can you test if this API key works?"}
  ]
}'

echo -e "\nTest request sent. Check the response for any errors."
