import json5 from "json5";

export const parseJSON = (text: string) => {
  try {
    return json5.parse(text);
  } catch (error) {
    console.error(`Error parsing JSON. Text: ${text}`);
    throw error;
  }
};
