import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SubmissionForm } from './SubmissionForm';

interface Category {
  id: string;
  name: string;
}

interface SubmissionFormWithProviderProps {
  convexUrl: string;
  categories: Category[];
}

export const SubmissionFormWithProvider: React.FC<SubmissionFormWithProviderProps> = ({ 
  convexUrl, 
  categories 
}) => {
  const convex = new ConvexReactClient(convexUrl);

  return (
    <ConvexProvider client={convex}>
      <SubmissionForm categories={categories} />
    </ConvexProvider>
  );
};
