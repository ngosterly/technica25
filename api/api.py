# api.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = "google/gemini-2.5-flash"   # can make configurable


# Low-level Gemini call

def ask_gemini(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(OPENROUTER_URL, headers=headers, json=body)
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


# Prompt wrappers

def build_prompt(text: str, type: str) -> str:
    match type:
        case "category":
            wrapper = (
                "Return only a comma-separated list of decision-making categories.\n"
                "Example: 'cost,time,fun'\n\n"
            )
        case "rating":
            wrapper = (
                "Return only a comma-separated list of numeric scores.\n"
                "Example: '1,8,10,6,3,10'\n\n"
            )
        case _:
            wrapper = ""

    return wrapper + text
