"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronRight } from "@/components/ui/Icons";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  id: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  options: readonly SelectOption[];
  onValueChange?: (value: string) => void;
  className?: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
}

/** Seletor com apresentação consistente em navegadores móveis e computadores. */
export function SelectField({ id, name, value, defaultValue, options, onValueChange, className = "field", describedBy, invalid, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? value ?? options[0]?.value ?? "");
  const currentValue = value ?? internalValue;
  const [active, setActive] = useState(Math.max(0, options.findIndex((option) => option.value === currentValue)));
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === currentValue) ?? options[0];

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    if (value === undefined) setInternalValue(option.value);
    onValueChange?.(option.value);
    setActive(index);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setActive(Math.max(0, options.findIndex((option) => option.value === value)));
        setOpen(true);
      } else {
        setActive((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
      }
    } else if (event.key === "Home" && open) {
      event.preventDefault(); setActive(0);
    } else if (event.key === "End" && open) {
      event.preventDefault(); setActive(options.length - 1);
    } else if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault(); choose(active);
    } else if (event.key === "Escape" && open) {
      event.preventDefault(); setOpen(false);
    }
  }

  return (
    <div ref={root} className="select-field relative w-full">
      {name && <input type="hidden" name={name} value={currentValue} />}
      <button
        id={id}
        type="button"
        className={`select-field-trigger ${className} flex items-center justify-between gap-3 bg-white text-left font-serif`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => {
          if (!open) setActive(Math.max(0, options.findIndex((option) => option.value === currentValue)));
          setOpen((state) => !state);
        }}
        onKeyDown={onKeyDown}
      >
        <span className="min-w-0 truncate">{selected?.label ?? "Selecione"}</span>
        <ChevronRight className={`select-field-chevron shrink-0 ${open ? "is-open" : ""}`} width={18} height={18} />
      </button>
      {open && (
        <div id={listId} role="listbox" aria-labelledby={id} className="select-field-menu">
          {options.map((option, index) => (
            <div
              id={`${listId}-option-${index}`}
              key={option.value}
              role="option"
              aria-selected={option.value === currentValue}
              className={`select-field-option ${option.value === currentValue ? "is-selected" : ""} ${active === index ? "is-active" : ""}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              <span className="select-field-indicator" aria-hidden="true">{option.value === currentValue ? "✓" : ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
