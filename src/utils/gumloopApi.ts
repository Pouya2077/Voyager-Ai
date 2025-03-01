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
    console.log(`Fetching Gumloop outputs for workbook ${workbookId} with inputs:`, inputs);
    
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

    const data = await response.json();
    console.log("Gumloop outputs response:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch from Gumloop:", error);
    throw error;
  }
};

/**
 * Start a Gumloop pipeline
 * 
 * @param userId - Gumloop user ID
 * @param savedItemId - Gumloop saved item ID (workbook ID)
 * @param apiKey - Gumloop API key
 * @param inputs - Input parameters for the pipeline
 * @returns Promise with the pipeline run information
 */
export const startGumloopPipeline = async (
  userId: string,
  savedItemId: string,
  apiKey: string,
  inputs: Array<{input_name: string, value: any}>
) => {
  try {
    // Detailed logging for debugging
    console.log("=== GUMLOOP API INPUTS DEBUG ===");
    console.log(`User ID: ${userId}`);
    console.log(`Saved Item ID: ${savedItemId}`);
    console.log("Pipeline inputs:", JSON.stringify(inputs, null, 2));
    
    const requestBody = {
      user_id: userId,
      saved_item_id: savedItemId,
      pipeline_inputs: inputs
    };
    
    console.log("Full request body:", JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.gumloop.com/api/v1/start_pipeline', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gumloop API error: ${response.status} ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("Pipeline start response:", data);
    return data;
  } catch (error) {
    console.error("Failed to start Gumloop pipeline:", error);
    throw error;
  }
};

/**
 * Poll for Gumloop pipeline run status and results
 * 
 * @param runId - The ID of the pipeline run
 * @param userId - Gumloop user ID
 * @param apiKey - Gumloop API key
 * @returns Promise with the run status and outputs
 */
export const getPipelineRunStatus = async (
  runId: string,
  userId: string,
  apiKey: string
) => {
  try {
    console.log(`Getting pipeline status for run ID: ${runId}, user ID: ${userId}`);
    
    const response = await fetch(`https://api.gumloop.com/api/v1/get_pl_run?run_id=${runId}&user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gumloop API error: ${response.status} ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get pipeline run status:", error);
    throw error;
  }
};

/**
 * Transform Gumloop API results into itinerary data
 * This is a helper function to map API results to your application's data structure
 */
export const transformGumloopToItinerary = (gumloopData: any) => {
  try {
    const { outputs } = gumloopData;
    console.log("Transforming API outputs:", outputs);
    
    // Map the sights data from the new API format
    return {
      destination: outputs.destination || "",
      days: outputs.sights || [], // Using sights instead of itinerary
      summary: outputs.summary || "",
      accommodation: outputs.accommodation || [],
      flights: outputs.flights || [],
      // Add other fields as needed
    };
  } catch (error) {
    console.error("Error transforming Gumloop data:", error);
    return null;
  }
};
