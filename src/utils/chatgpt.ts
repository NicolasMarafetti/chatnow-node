import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function askGpt(text: string) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: text,
    temperature: 0.6,
    max_tokens: 1000
  });

  return completion.data.choices[0].text;
}