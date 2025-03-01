
/**
 * Utility functions for interacting with the Gumloop API
 */

/**
 * Fetch output values from a Gumloop workbook
 * 
 * @param workbookId - The ID of the Gumloop workbook
 * @param apiKey - Your Gumloop API key
 * @param inputs - Optional input parameters for the workbook
 * @returns Promise with the workbook outputs
 */
export const fetchGumloopOutputs = async (
  workbookId: string,
  apiKey: string,
  inputs?: Record<string, any>
) => {
  try {
    const response = await fetch(`https://api.gumloop.com/v1/workbooks/${workbookId}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ inputs: inputs || {} })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gumloop API error: ${response.status} ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from Gumloop:", error);
    throw error;
  }
};

/**
 * Transform Gumloop API results into itinerary data
 * This is a helper function to map API results to your application's data structure
 */
export const transformGumloopToItinerary = (gumloopData: any) => {
  // This is a placeholder implementation
  // Modify according to your actual API response structure
  try {
    const { outputs } = gumloopData;
    
    // Example transformation - adjust based on your actual Gumloop response format
    return {
      destination: outputs.destination || "",
      days: outputs.itinerary || [],
      summary: outputs.summary || "",
      // Add other fields as needed
    };
  } catch (error) {
    console.error("Error transforming Gumloop data:", error);
    return null;
  }
};
