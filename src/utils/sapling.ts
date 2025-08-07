const SAPLING_API_KEY = "F8EARWIEUH7F9DY6QJXBIRYMQQCVH7H4";

export const checkAndCorrectGrammar = async (text: string): Promise<string> => {
  try {
    const response = await fetch("https://api.sapling.ai/api/v1/edits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The Authorization header is removed
      },
      body: JSON.stringify({
        // Add the API key as a 'key' property in the request body
        key: SAPLING_API_KEY,
        text,
        session_id: "textify-user-001",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Sapling API Error: Status ${response.status} - ${response.statusText}`);
      console.error("Error details from API:", errorText);
      return text;
    }

    const data = await response.json();
    if (!data.edits) {
      console.log("No grammar edits found.");
      return text;
    }

    const sortedEdits = [...data.edits].sort((a: any, b: any) => b.start - a.start);
    let corrected = text;

    for (const edit of sortedEdits) {
      corrected = corrected.slice(0, edit.start) + edit.replacement + corrected.slice(edit.end);
    }

    return corrected;
  } catch (error) {
    console.error("Sapling API request failed:", error);
    return text;
  }
};