"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PresentationForm } from "./form";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useMutation, useQuery } from "@tanstack/react-query";

export default function Home() {
  const validate = useMutation({
    mutationFn: async ({ url, file }: { url?: string; file?: File }) => {
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      }

      if (url) {
        formData.append("url", url);
      }

      return fetch("/api/validate", {
        method: "POST",
        body: formData,
      })
        .then(async (r) => {
          console.log(r);
          if (!r.ok) throw new Error(await r.text());

          return r;
        })
        .then((r) => r.json());
    },
  });

  console.log(validate.data);
  console.log(validate.error);

  if (validate.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{validate.error.message}</AlertDescription>
      </Alert>
    );
  }
  if (validate.data) {
    const {
      format,
      totalSlides,
      hasTitleSlide,
      fontsUsed,
      slidesWithAudio,
      slidesWithVideo,
      bulletCount,
      imageCount,
    } = validate.data;
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Valid format</h3>
        <ol className="space-y-2">
          <li>✅ {format}</li>
        </ol>
        <h3 className="font-semibold">Valid presentation</h3>
        <ol className="space-y-2">
          <li>✅ Slides: {totalSlides}</li>
          <li>{hasTitleSlide ? "✅" : "❌"} Has title slide</li>
          <li>✅ Fonts: {fontsUsed.join(", ")}</li>
          <li>✅ Videos: {slidesWithVideo}</li>
          <li>✅ Audios: {slidesWithAudio}</li>
          <li>✅ Images: {imageCount}</li>
          <li>✅ Bullets: {bulletCount}</li>
        </ol>

        <Button className="w-full" onClick={() => validate.reset()}>
          Reset
        </Button>
      </div>
    );
  }
  return (
    <div>
      <PresentationForm
        isLoading={validate.isPending}
        onSubmit={({ url, file }) => validate.mutate({ url, file })}
      />
    </div>
  );
  return (
    <div>
      <form>
        {/* <Label htmlFor="url">URL to Presentation</Label> */}
        <Input
          id="url"
          name="url"
          placeholder="https://"
          pattern="^(https:\/\/docs\.google\.com\/presentation\/d\/[^\/]+\/(edit|present|preview)(\?.*)?|https:\/\/www\.figma\.com\/(file|proto)\/[^\/]+\/[^\/?]+(\?.*)?|https:\/\/canvas\.yourcanvasdomain\.edu\/courses\/\d+\/(files|pages)\/[^\/]+(\?.*)?)$"
          placeholder="Enter your presentation link"
          title="Please enter a valid Google Slides, Figma, or Canvas presentation link."
        />
        <div className="flex justify-center text-sm py-4">or</div>
        {/* <Label htmlFor="file">Upload Presentation</Label> */}
        <Input id="file" type="file" />
        <div className="pt-4">
          <Button className="w-full">Validate Slides</Button>
        </div>
      </form>
    </div>
  );
}
