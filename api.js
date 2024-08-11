const Groq = require('groq-sdk');

const groq = new Groq({apiKey: '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'});
async function main() {
  const chatCompletion = await groq.chat.completions.create({
    "messages": [
      {
        "role": "user",
        "content": "explain the bubble sort algorithm"
      }
    ],
    "model": "llama-3.1-70b-versatile",
    "temperature": 1,
    "max_tokens": 1024,
    "top_p": 1,
    "stream": true,
    "stop": null
  });

  for await (const chunk of chatCompletion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

main();