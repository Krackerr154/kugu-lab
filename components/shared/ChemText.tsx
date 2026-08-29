// ChemText — renders chemical formulas with proper subscripts/superscripts
//
// Supports two input formats:
// 1. Markup mode (preferred):  H_{2}S, Ag^{+}, Pb^{2+}, Fe(OH)_{3}
// 2. Legacy Unicode:           H₂S, Ag⁺, Pb²⁺  (auto-converted for backward compat)
//
// No auto-detection of plain-text formulas — use explicit markup in source data.
"use client";

import { ReactNode } from "react";

const subMap: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
};
const supMap: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁺": "+", "⁻": "-",
};

function renderChemText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let i = 0;
  let key = 0;
  let buffer = "";

  const flush = () => {
    if (buffer) {
      parts.push(buffer);
      buffer = "";
    }
  };

  while (i < text.length) {
    // Explicit subscript markup: _{...}
    if (text[i] === "_" && text[i + 1] === "{") {
      flush();
      const end = text.indexOf("}", i + 2);
      if (end !== -1) {
        parts.push(<sub key={key++}>{text.slice(i + 2, end)}</sub>);
        i = end + 1;
        continue;
      }
    }
    // Explicit superscript markup: ^{...}
    if (text[i] === "^" && text[i + 1] === "{") {
      flush();
      const end = text.indexOf("}", i + 2);
      if (end !== -1) {
        parts.push(<sup key={key++}>{text.slice(i + 2, end)}</sup>);
        i = end + 1;
        continue;
      }
    }
    // Legacy Unicode subscript chars
    if (subMap[text[i]]) {
      flush();
      let sub = "";
      while (subMap[text[i]]) {
        sub += subMap[text[i]];
        i++;
      }
      parts.push(<sub key={key++}>{sub}</sub>);
      continue;
    }
    // Legacy Unicode superscript chars
    if (supMap[text[i]]) {
      flush();
      let sup = "";
      while (supMap[text[i]]) {
        sup += supMap[text[i]];
        i++;
      }
      parts.push(<sup key={key++}>{sup}</sup>);
      continue;
    }
    // Regular character
    buffer += text[i];
    i++;
  }

  flush();
  return parts;
}

export function ChemText({ children }: { children: string }): ReactNode {
  return <>{renderChemText(children)}</>;
}
