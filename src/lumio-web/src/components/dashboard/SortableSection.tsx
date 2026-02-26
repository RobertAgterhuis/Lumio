"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  id: string;
  children: React.ReactNode;
}

export function SortableSection({ id, children }: Props) {
  const t = useTranslations("dashboard");

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 20 : undefined,
        position: "relative",
      }}
      className="group"
    >
      {/* Drag handle — appears on hover at the top-centre of the section */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background border shadow-sm text-muted-foreground/60 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
          tabIndex={-1}
          aria-label={t("sectieVerplaatsen")}
        >
          <GripHorizontal className="h-3 w-3" />
        </button>
      </div>
      {children}
    </div>
  );
}
