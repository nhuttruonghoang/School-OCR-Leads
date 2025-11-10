import { GoogleGenAI, Type } from "@google/genai";
import type { StudentData } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      hoTen: { type: Type.STRING, description: 'Full name of the student.' },
      sdtZalo: { type: Type.STRING, description: 'Phone number or Zalo number.' },
      cccd: { type: Type.STRING, description: 'Citizen ID number.' },
      tinhThanh: { type: Type.STRING, description: 'Province or City (before any mergers).' },
      truongThpt: { type: Type.STRING, description: 'Name of the high school.' },
      email: { type: Type.STRING, description: 'Email address for receiving information.' },
      nganhHoc: { type: Type.STRING, description: 'The major(s) the student is applying for.' },
    },
    required: ['hoTen', 'sdtZalo', 'cccd', 'tinhThanh', 'truongThpt', 'email', 'nganhHoc']
  }
};


export const extractDataFromFiles = async (imageParts: { mimeType: string, data: string }[]): Promise<StudentData[]> => {
  const prompt = `You are an expert OCR system specialized in extracting student application data for Hoa Sen University (HSU) from Vietnam.
Analyze the following image(s) of school data forms or spreadsheets.
Extract the data for each unique student record.
The required columns are: 'Họ & tên', 'SĐT/ Zalo', 'Căn cước Công dân', 'Tỉnh/ Thành phố: (trước sáp nhập)', 'Tên trường THPT', 'Email nhận thông tin/ kết quả xét', 'Ngành học xét'.
Ignore any headers, footers, summary rows, or rows that do not represent a student record.
Return the result as a JSON array where each object represents one student.
The keys of the object must be exactly: 'hoTen', 'sdtZalo', 'cccd', 'tinhThanh', 'truongThpt', 'email', 'nganhHoc'.
If a value is not found for a field, use an empty string "". Ensure the email format is valid.
Process all images provided to compile a complete list.
`;

  const inlineDataParts = imageParts.map(part => ({
    inlineData: {
      mimeType: part.mimeType,
      data: part.data,
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }, ...inlineDataParts] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    // A secondary check in case the response is not valid JSON despite the MIME type request
    if (!jsonText.startsWith('[') || !jsonText.endsWith(']')) {
        throw new Error("Received non-JSON response from model.");
    }

    const parsedData: StudentData[] = JSON.parse(jsonText);
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "An unknown error occurred while communicating with the AI model.";

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (msg.includes('api key not valid')) {
        errorMessage = "Your API Key is invalid. Please check your configuration.";
      } else if (msg.includes('429') || msg.includes('rate limit')) {
        errorMessage = "You've made too many requests in a short period. Please wait a moment and try again.";
      } else if (msg.includes('safety') || msg.includes('blocked')) {
        errorMessage = "The request was blocked for safety reasons. This can happen if the content is inappropriate or the model could not provide a responsible answer. Please try a different file.";
      } else if (msg.includes('json') || msg.includes('unexpected token')) {
        errorMessage = "The AI model returned data in an unexpected format. This could be due to a complex or unreadable document. Please try again.";
      } else {
        errorMessage = "Failed to extract data. The AI model could not process the request. Please check your network connection or try again later.";
      }
    }
    
    throw new Error(errorMessage);
  }
};