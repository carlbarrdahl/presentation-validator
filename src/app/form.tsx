"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z
  .object({
    url: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^(https:\/\/docs\.google\.com\/presentation\/d\/[^\/]+\/(edit|present|preview)(\?.*)?|https:\/\/www\.figma\.com\/(file|proto|slides)\/[^\/]+\/[^\/?]+(\?.*)?|https:\/\/canvas\.yourcanvasdomain\.edu\/courses\/\d+\/(files|pages)\/[^\/]+(\?.*)?)$/.test(
            value
          ),
        {
          message:
            "The URL must be a valid link to Google Slides, Figma, or Canvas.",
        }
      ),
    file: z
      .any()
      .optional()
      .refine(
        (file) => !file || file.size <= 10 * 1024 * 1024, // Max size 10MB
        "File size must be less than 10MB."
      ),
  })
  .refine(
    (data) => data.url || data.file, // Require either a URL or a file
    { message: "You must provide either a URL or a file." }
  )
  .refine(
    (data) => !(data.url && data.file), // Ensure both aren't provided at the same time
    { message: "You can provide either a URL or a file, but not both." }
  );
export function PresentationForm({
  isLoading = false,
  onSubmit,
}: {
  isLoading?: boolean;
  onSubmit: (values: { url?: string; file?: File }) => void;
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      file: null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* URL Input Field */}
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Presentation URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://docs.google.com/presentation/..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter a Google Slides, Figma, or Canvas presentation link.
              </FormDescription>
              <FormMessage />
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    field.onChange(
                      "https://docs.google.com/presentation/d/1NnYelsyJnnDCKrtr24hB86jKz3s9AcKoJ33vO1yROK8/edit?usp=sharing"
                    )
                  }
                >
                  Example
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    field.onChange(
                      "https://docs.google.com/presentation/d/1NXcEQZQfVMEZ2pMoZvyhG-oxnNHr-B6zfq7OE8UHvxQ/edit?usp=sharing"
                    )
                  }
                >
                  Example 2
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    field.onChange(
                      "https://docs.google.com/presentation/d/1yzEX9iwu7mKVubfBeCFblmAyo_mLxfRq5ZbgaKL5xWA/edit?usp=sharing"
                    )
                  }
                >
                  Example 3
                </Button>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-center">- or -</div>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={(e) => alert("Not implemented yet")}
                  // onChange={(e) => field.onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormDescription>
                Only PDF or PowerPoint files under 100MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={!form.formState.isValid || isLoading}
          isLoading={isLoading}
          className="w-full"
          type="submit"
        >
          Validate Presentation
        </Button>
      </form>
    </Form>
  );
}
