import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function askGpt(text: string) {
  try {

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      temperature: 0.6,
      max_tokens: 1000,
      n: 1
    });

    return completion.data.choices[0].text ? completion.data.choices[0].text.trim() : undefined;
  } catch (error: any) {
    console.error("error.response", error.response);
    return undefined;
  }
}