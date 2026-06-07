"use client";

import React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import ResumeCard from '@/components/dashboard/ResumeCard';

interface ResumeItem {
  id: string;
  title: string;
  createdAt: string; // ISO string
  updatedAt: string;
  templateId: string | null;
}

interface Props {
  resumes: ResumeItem[];
  /** Height of each row in pixels */
  itemHeight?: number;
  /** Max height of the list container */
  maxHeight?: number;
}

const Row = ({ index, style, data }: ListChildComponentProps) => {
  const resume: ResumeItem = data[index];
  return (
    <div style={style} className="p-2">
      <ResumeCard
        resume={{
          ...resume,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
        }}
      />
    </div>
  );
};

export default function VirtualizedResumeList({ resumes, itemHeight = 220, maxHeight = 800 }: Props) {
  if (resumes.length === 0) {
    return null;
  }

  const height = Math.min(maxHeight, resumes.length * itemHeight);

  return (
    <List
      height={height}
      itemCount={resumes.length}
      itemSize={itemHeight}
      width="100%"
      itemData={resumes}
    >
      {Row}
    </List>
  );
}
