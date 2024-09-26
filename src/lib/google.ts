import { google } from "googleapis";
import { JWT } from "google-auth-library";
import * as path from "path";

// Path to your service account key file
const KEYFILEPATH = path.join(__dirname, "service-account-key.json");

// Specify the required scopes
const SCOPES = ["https://www.googleapis.com/auth/presentations.readonly"];

// Create a JWT client for authentication
const auth = new google.auth.JWT({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// Initialize the Google Slides API client
const slidesService = google.slides({ version: "v1", auth });

// Function to retrieve and parse the presentation
export async function parse(presentationId: string) {
  try {
    // Authorize the client
    await auth.authorize();

    // Retrieve the presentation
    const res = await slidesService.presentations.get({
      presentationId,
    });

    const presentation = res.data;

    console.log(`Title: ${presentation.title}`);
    console.log(`Total slides: ${presentation.slides?.length}`);

    // Iterate through each slide
    presentation.slides?.forEach((slide, slideIndex) => {
      console.log(`\nSlide ${slideIndex + 1}:`);

      // Iterate through each page element
      slide.pageElements?.forEach((element) => {
        if (element.shape?.text) {
          // Extract text content
          const textRuns = element.shape.text.textElements || [];
          const textContent = textRuns
            .map((textElement) => textElement.textRun?.content || "")
            .join("");
          console.log(`Text: ${textContent.trim()}`);
        }

        if (element.image) {
          // Extract image information
          console.log(`Image ID: ${element.objectId}`);
        }
      });
    });
  } catch (error) {
    console.error("Error accessing presentation:", error);
  }
}
