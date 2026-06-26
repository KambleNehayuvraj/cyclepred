import os
from google import genai

api_key = "AIzaSyBOlXEdyUPgm1AcgyGucZOkFl6lnaiKXBs"
client = genai.Client(api_key=api_key)

print("Available models:")
for m in client.models.list():
    print(m.name)
