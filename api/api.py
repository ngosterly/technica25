import requests

API_KEY = "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"

def ask_openrouter(prompt):
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": "openai/gpt-4.1",   # You can change the model if desired
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(url, headers=headers, json=body)
    data = response.json()
    return data["choices"][0]["message"]["content"]


if __name__ == "__main__":
    answer = ask_openrouter("Send me the numbers 1-10")
    print("GPT says:", answer)
