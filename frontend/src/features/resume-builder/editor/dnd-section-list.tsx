"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { useResumeStore } from "@/store/resume-store"
import type { SectionType, SectionConfig } from "@/types/resume"
import { ContactEditor } from "./sections/contact-editor"
import { SummaryEditor } from "./sections/summary-editor"
import { ExperienceEditor } from "./sections/experience-editor"
import { EducationEditor } from "./sections/education-editor"
import { SkillsEditor } from "./sections/skills-editor"
import { LanguagesEditor } from "./sections/languages-editor"
import { CertificationsEditor } from "./sections/certifications-editor"
import { ProjectsEditor } from "./sections/projects-editor"
import { AwardsEditor } from "./sections/awards-editor"
import { InterestsEditor } from "./sections/interests-editor"
import { ReferencesEditor } from "./sections/references-editor"

type SortableSectionProps = {
  section: SectionConfig
  onToggleVisibility: (id: string) => void
}

function SortableSection({ section, onToggleVisibility }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  }

  const renderEditor = () => {
    const commonProps = {
      sectionId: section.id,
      visible: section.visible,
      onToggleVisibility: () => onToggleVisibility(section.id),
      dragHandleProps,
    }

    switch (section.type) {
      case "contact":
        return <ContactEditor {...commonProps} />
      case "summary":
        return <SummaryEditor {...commonProps} />
      case "experience":
        return <ExperienceEditor {...commonProps} />
      case "education":
        return <EducationEditor {...commonProps} />
      case "skills":
        return <SkillsEditor {...commonProps} />
      case "languages":
        return <LanguagesEditor {...commonProps} />
      case "certifications":
        return <CertificationsEditor {...commonProps} />
      case "projects":
        return <ProjectsEditor {...commonProps} />
      case "awards":
        return <AwardsEditor {...commonProps} />
      case "interests":
        return <InterestsEditor {...commonProps} />
      case "references":
        return <ReferencesEditor {...commonProps} />
      default:
        return null
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      {renderEditor()}
    </div>
  )
}

export function DndSectionList() {
  const sections = useResumeStore((s) => s.resume.sections)
  const reorderSections = useResumeStore((s) => s.reorderSections)
  const toggleSectionVisibility = useResumeStore((s) => s.toggleSectionVisibility)

  const sortedSections = [...sections]
    .filter((s) => s.type !== "contact")
    .sort((a, b) => a.order - b.order)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        const oldIndex = sortedSections.findIndex((s) => s.id === active.id)
        const newIndex = sortedSections.findIndex((s) => s.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderSections(oldIndex, newIndex)
        }
      }
    },
    [sortedSections, reorderSections]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedSections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {sortedSections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              onToggleVisibility={toggleSectionVisibility}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
