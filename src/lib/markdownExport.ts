import { patternEquations, type PatternEquation } from './patternEquations';

/**
 * Convert a LaTeX string to a more readable plain-text/markdown representation.
 * We keep LaTeX in fenced math blocks for tools that render it.
 */
function latexBlock(latex: string): string {
  return `$$\n${latex}\n$$`;
}

function equationSection(eq: PatternEquation): string {
  const lines: string[] = [];

  lines.push(`## ${eq.name}`);
  lines.push('');

  const categoryLabels: Record<string, string> = {
    cumulative: 'Cumulative Distribution',
    intensity: 'Intensity Function',
    empirical: 'Empirical Method',
  };
  lines.push(`**Category:** ${categoryLabels[eq.category] ?? eq.category}`);
  lines.push('');

  // Equations
  lines.push('### Equations');
  lines.push('');
  for (const e of eq.equations) {
    lines.push(`**${e.label}**`);
    lines.push('');
    lines.push(latexBlock(e.latex));
    lines.push('');
    lines.push(`> ${e.description}`);
    lines.push('');
  }

  // Variables
  lines.push('### Variables');
  lines.push('');
  lines.push('| Symbol | Meaning |');
  lines.push('|--------|---------|');
  for (const v of eq.variables) {
    // Escape pipes in content
    const symbol = `$${v.symbol}$`;
    lines.push(`| ${symbol} | ${v.meaning} |`);
  }
  lines.push('');

  // Notes
  if (eq.notes) {
    lines.push('### Notes');
    lines.push('');
    lines.push(eq.notes);
    lines.push('');
  }

  // Reference
  lines.push('### Reference');
  lines.push('');
  lines.push(`- **Title:** ${eq.reference.title}`);
  lines.push(`- **Citation:** ${eq.reference.citation} (${eq.reference.year})`);
  if (eq.reference.link) {
    lines.push(`- **Link:** [${eq.reference.link}](${eq.reference.link})`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

export function generateFullMarkdownExport(): string {
  const header = `# Rain Canvas Studio — Design Storm Equations & Methodology

> Auto-generated reference document containing all ${patternEquations.length} rainfall distribution
> patterns with their mathematical formulations, variables, and source references.
>
> Generated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC

---

## Table of Contents

${patternEquations.map((eq, i) => `${i + 1}. [${eq.name}](#${eq.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')})`).join('\n')}

---

`;

  const sections = patternEquations.map(equationSection).join('');

  const footer = `## About This Document

This document was exported from **Rain Canvas Studio** (World Rainfall Pattern Painter).
It contains the mathematical basis for all supported design storm temporal distributions.

LaTeX equations are provided in fenced math blocks (\`$$...$$\`) and can be rendered by
most Markdown viewers (GitHub, Obsidian, Typora, VS Code, etc.).

For interactive exploration of these equations, visit the application directly.
`;

  return header + sections + footer;
}

export function downloadMarkdown() {
  const content = generateFullMarkdownExport();
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rain-canvas-design-storm-equations.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
