from flask import Flask, request, jsonify
import openai

app = Flask(__name__)


@app.route('/heartbeat')
def heartbeat(): return jsonify(alive=True)


@app.route('/generate', methods=['POST'])
def generate():
    api_key = request.json.get('api_key')
    title_prompt = request.json.get('title_prompt')
    content_prompt = request.json.get('content_prompt')

    openai.api_key = api_key

    title = generate_completion(title_prompt)
    content = generate_completion(content_prompt % title)

    return jsonify(title=title, content=content)


@app.route('/generate2', methods=['POST'])
def generate2():
    api_key = request.json.get('api_key')
    prompt = request.json.get('prompt')
    content = request.json.get('content')

    openai.api_key = api_key

    reply = generate_completion(prompt, content)

    return jsonify(reply=reply)


@app.route('/generate3', methods=['POST'])
def generate3():
    api_key = request.json.get('api_key')
    system = request.json.get('system')
    messages = request.json.get('messages')

    openai.api_key = api_key

    reply = generate_completion_with_messages(system, messages)

    return jsonify(reply=reply)


def generate_completion_with_messages(system, messages=[]):
    messages = [{
        "role": "system",
        "content": system
    }] + messages

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k",
        messages=messages,
        temperature=1,
        max_tokens=4096,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    message = response.choices[0].message.content.strip()
    print("generated completion: %s" % message)

    return message


def generate_completion(prompt, user_content=None):
    print("generating completion: %s" % prompt)

    messages = [
        {
            "role": "system",
            "content": prompt
        }
    ]
    if user_content is not None:
        messages.append({
            "role": "user",
            "content": user_content
        })

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k",
        messages=messages,
        temperature=1,
        max_tokens=4096,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    message = response.choices[0].message.content.strip()
    print("generated completion: %s" % message)

    return message


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8090)
