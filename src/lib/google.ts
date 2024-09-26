import { google } from "googleapis";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);

const SCOPES = ["https://www.googleapis.com/auth/presentations.readonly"];

const auth = new google.auth.JWT({
  email: serviceAccountKey.client_email,
  key: serviceAccountKey.private_key,
  scopes: SCOPES,
});

const slidesService = google.slides({ version: "v1", auth });

export class SlidesParser {
  async parse(presentationId: string) {
    try {
      // Authorize the client
      await auth.authorize();

      // Retrieve the presentation
      return (
        slidesService.presentations
          .get({ presentationId })
          // .then((r) => r.data);
          .then((r) => validate(r.data))
      );
    } catch (error) {
      console.error("Error accessing presentation:", error);
    }
  }
}

interface ValidationResult {
  totalSlides: number;
  fontsUsed: string[];
  containsVideo: boolean;
  containsAudio: boolean;
  hasTitleSlide: boolean;
  hasTooManyBullets: boolean;
  containsImages: boolean;
}

interface Slide {
  pageElements: {
    shape?: {
      text?: {
        textElements?: {
          textRun?: {
            style?: {
              fontFamily?: string;
            };
          };
        }[];
      };
      shapeType?: string;
      image?: object;
    };
  }[];
}

interface GoogleSlidesJson {
  slides: Slide[];
}

// Define the schema for validation result using zod
const validationSchema = z.object({
  totalSlides: z.number(),
  fontsUsed: z.array(z.string()),
  slidesWithVideo: z.number(),
  slidesWithAudio: z.number(),
  hasTitleSlide: z.boolean(),
  bulletCount: z.number(),
  imageCount: z.number(),
});
async function validate(presentation: GoogleSlidesJson): ValidationResult {
  const prompt = `
You are a slide validator for a conference. I will provide you a Google Slides document in JSON format. 
Your task is to validate this document and return a structured validation result with the following information:
1. The total number of slides.
2. The fonts used in the document (as a list).
3. Slides containing video (number).
4. Slides containing audio (number).
5. Whether the first slide is a title slide (boolean).
6. Bullet count (number)
7. Number of images (number).

Here is the Google Slides document in JSON format:
\`\`\`
${JSON.stringify(presentation.slides)}
\`\`\`
      `;

  // Call generateObject with the OpenAI model and schema
  const { object } = await generateObject({
    model: openai("gpt-4o-mini-2024-07-18"),
    schema: validationSchema,
    prompt: prompt,
  });

  return object;

  let fontsUsed = new Set<string>();
  let containsVideo = false;
  let containsAudio = false;
  let hasTitleSlide =
    presentation.slides[0]?.pageElements?.[0]?.shape?.shapeType === "TEXT_BOX";
  let hasTooManyBullets = false;
  let containsImages = false;

  console.log(
    presentation.slides[0]?.pageElements?.[0]?.shape?.text?.textElements?.map(
      (t) => t.textRun
    )
  );
  const totalSlides = presentation.slides.length;

  presentation.slides.forEach((slide, index) => {
    let bulletPointCount = 0;

    slide.pageElements.forEach((element) => {
      // Check for fonts used
      if (element.shape?.text?.textElements) {
        element.shape.text.textElements.forEach((textElement) => {
          const fontFamily = textElement.textRun?.style?.fontFamily;
          if (fontFamily) {
            fontsUsed.add(fontFamily);
          }
        });
      }

      // Check for presence of images
      if (element.image) {
        containsImages = true;
      }
      if (element.audio) {
        containsAudio = true;
      }
      if (element.video) {
        containsVideo = true;
      }

      // Check if the slide is a title slide
      if (
        index === 0 &&
        element.shape?.shapeType === "TEXT_BOX" &&
        !hasTitleSlide
      ) {
        hasTitleSlide = true;
      }

      if (element.shape?.text?.textElements) {
        bulletPointCount += element.shape?.text?.textElements
          ?.map((t) => t?.paragraphMarker)
          .map((p) => p?.bullet).length;
      }
    });

    // Consider the slide having too many bullet points if more than 50% of the text elements are bullets
    if (bulletPointCount > 3) {
      hasTooManyBullets = true;
    }
  });

  return {
    totalSlides,
    fontsUsed: Array.from(fontsUsed),
    containsVideo,
    containsAudio,
    hasTitleSlide,
    hasTooManyBullets,
    containsImages,
  };
}
