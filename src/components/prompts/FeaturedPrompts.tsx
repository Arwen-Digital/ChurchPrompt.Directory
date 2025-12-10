import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import PromptGrid from "./PromptGrid";

interface FeaturedPromptsProps {
  convexUrl: string;
  initialPrompts?: any[];
}

function FeaturedPromptsContent({ initialPrompts }: { initialPrompts?: any[] }) {
  // Fetch featured prompts from Convex
  const queryResult = useQuery(api.prompts.getApprovedPrompts, { limit: 6 });
  const fetchedPrompts = queryResult?.prompts;

  // Filter for featured prompts
  const source = queryResult === undefined && initialPrompts ? initialPrompts : (fetchedPrompts || []);
  const featuredPrompts = source.filter((p: any) => p.featured).slice(0, 6);

  return <PromptGrid prompts={featuredPrompts} />;
}

export function FeaturedPrompts({ convexUrl, initialPrompts }: FeaturedPromptsProps) {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <FeaturedPromptsContent initialPrompts={initialPrompts} />
    </ConvexClientProvider>
  );
}
