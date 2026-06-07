"use client";

import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, Squares2X2Icon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export type StatIconName = 'resumes' | 'templates' | 'ats' | 'coverLetters';

const STAT_ICONS: Record<StatIconName, ComponentType<{ className?: string }>> = {
  resumes: DocumentTextIcon,
  templates: Squares2X2Icon,
  ats: MagnifyingGlassIcon,
  coverLetters: ChatBubbleLeftRightIcon,
};

export interface StatItem {
  label: string;
  count: number | string;
  icon: StatIconName;
  trend?: 'up' | 'down' | null;
}

const DEFAULT_STATS: StatItem[] = [
  { label: 'Resumes', count: 0, icon: 'resumes', trend: null },
  { label: 'Templates', count: 0, icon: 'templates', trend: null },
  { label: 'ATS Reports', count: 0, icon: 'ats', trend: null },
  { label: 'Cover Letters', count: 0, icon: 'coverLetters', trend: null },
];

export default function StatsBar({ stats = DEFAULT_STATS }: { stats?: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = STAT_ICONS[stat.icon];
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="bg-[--bg-surface] border border-[--border] rounded-2xl p-4 flex flex-col items-center hover:shadow-md transition-shadow duration-200">
              <div className="mb-3">
                <Icon className="h-6 w-6 text-[--color-primary] mb-2" />
              </div>
              <p className="text-xs uppercase tracking-widest text-[--text-muted] mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-[--text-primary] mb-2">
                {stat.count}
              </p>
              {stat.trend && (
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-[--color-success]' : 'text-[--color-danger]'
                }`}>
                  {stat.trend === 'up' ? '▲' : '▼'}
                  <span>{Math.abs(Math.round(Math.random() * 10))}%</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
