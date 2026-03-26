import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { type UnitSystem, convertIntensity, convertDepth, getDepthUnit, getIntensityUnit } from "@/lib/unitConversions";
import { type PatternType } from "@/lib/rainfallPatterns";
import { getPatternEquation, patternEquations } from "@/lib/patternEquations";

interface RainfallDataPoint {
  time: number;
  intensity: number;
}

interface PdfReportGeneratorProps {
  data: RainfallDataPoint[];
  pattern: string;
  patternKey?: PatternType;
  totalDepth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
  projectName?: string;
  engineerName?: string;
  companyName?: string;
}

// ── PDF helper types ──
interface PdfContext {
  pdf: any;
  y: number;
  margin: number;
  pageW: number;
  pageH: number;
  contentW: number;
}

function checkPage(ctx: PdfContext, needed: number) {
  if (ctx.y + needed > ctx.pageH - 15) {
    ctx.pdf.addPage();
    ctx.y = ctx.margin;
  }
}

function drawSectionTitle(ctx: PdfContext, title: string) {
  checkPage(ctx, 20);
  ctx.pdf.setTextColor(30, 64, 175);
  ctx.pdf.setFontSize(13);
  ctx.pdf.setFont("helvetica", "bold");
  ctx.pdf.text(title, ctx.margin, ctx.y);
  ctx.y += 6;
}

function drawTableRow(ctx: PdfContext, cells: string[], colWidths: number[], rowH: number, idx: number, opts?: { bold?: boolean; highlight?: number[] }) {
  const bgColor = opts?.highlight ?? (idx % 2 === 0 ? [240, 240, 240] : [250, 250, 250]);
  ctx.pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  ctx.pdf.rect(ctx.margin, ctx.y, ctx.contentW, rowH, "F");
  let x = ctx.margin;
  cells.forEach((cell, i) => {
    ctx.pdf.setFont("helvetica", opts?.bold && i === 0 ? "bold" : "normal");
    ctx.pdf.setTextColor(i === 0 ? 80 : 30, i === 0 ? 80 : 30, i === 0 ? 80 : 30);
    const maxW = colWidths[i] - 4;
    const truncated = ctx.pdf.getTextWidth(cell) > maxW ? cell.slice(0, Math.floor(cell.length * maxW / ctx.pdf.getTextWidth(cell))) + "…" : cell;
    ctx.pdf.text(truncated, x + 2, ctx.y + rowH * 0.65);
    x += colWidths[i];
  });
  ctx.y += rowH;
}

function drawTableHeader(ctx: PdfContext, headers: string[], colWidths: number[], rowH: number = 6) {
  ctx.pdf.setFillColor(30, 64, 175);
  ctx.pdf.rect(ctx.margin, ctx.y, ctx.contentW, rowH, "F");
  ctx.pdf.setTextColor(255, 255, 255);
  ctx.pdf.setFontSize(7.5);
  ctx.pdf.setFont("helvetica", "bold");
  let x = ctx.margin;
  headers.forEach((h, i) => {
    ctx.pdf.text(h, x + 2, ctx.y + rowH * 0.7);
    x += colWidths[i];
  });
  ctx.y += rowH;
}

/** Render a LaTeX string as readable plain text */
function latexToPlain(latex: string): string {
  return latex
    .replace(/\\begin\{cases\}/g, '{ ')
    .replace(/\\end\{cases\}/g, ' }')
    .replace(/\\\\/g, ' | ')
    .replace(/\\left[.(]/g, '(')
    .replace(/\\right[.)]/g, ')')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\cdot/g, '·')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\approx/g, '≈')
    .replace(/\\times/g, '×')
    .replace(/\\sum_\{[^}]*\}\^\{[^}]*\}/g, 'Σ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\bar\{([^}]+)\}/g, '$1̄')
    .replace(/\\quad/g, '  ')
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/\^/g, '^')
    .replace(/_/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Draw one pattern's equations block (reused for main + appendix) */
function drawPatternEquations(ctx: PdfContext, eq: ReturnType<typeof getPatternEquation>) {
  if (!eq) return;
  const rowH = 6.5;

  // Name header
  checkPage(ctx, 16);
  ctx.pdf.setFillColor(30, 64, 175);
  const nameW = Math.min(ctx.pdf.getTextWidth(eq.name) + 8, ctx.contentW);
  ctx.pdf.roundedRect(ctx.margin, ctx.y, nameW, 6, 1, 1, "F");
  ctx.pdf.setTextColor(255, 255, 255);
  ctx.pdf.setFontSize(9);
  ctx.pdf.setFont("helvetica", "bold");
  ctx.pdf.text(eq.name, ctx.margin + 4, ctx.y + 4.2);
  ctx.y += 8;

  // Category & Reference
  const refRows = [
    ["Category", eq.category === 'cumulative' ? 'Cumulative Distribution' : eq.category === 'intensity' ? 'Intensity Function' : 'Empirical Method'],
    ["Reference", eq.reference.citation],
    ["Year", String(eq.reference.year)],
  ];
  ctx.pdf.setFontSize(8);
  refRows.forEach((row, i) => {
    checkPage(ctx, rowH);
    drawTableRow(ctx, row, [ctx.contentW * 0.2, ctx.contentW * 0.8], 5, i, { bold: true });
  });
  ctx.y += 2;

  // Equations
  eq.equations.forEach((eqn) => {
    checkPage(ctx, 18);
    // Label badge
    ctx.pdf.setFillColor(60, 80, 160);
    ctx.pdf.setTextColor(255, 255, 255);
    ctx.pdf.setFontSize(7);
    ctx.pdf.setFont("helvetica", "bold");
    const labelW = ctx.pdf.getTextWidth(eqn.label) + 6;
    ctx.pdf.roundedRect(ctx.margin, ctx.y, labelW, 4.5, 1, 1, "F");
    ctx.pdf.text(eqn.label, ctx.margin + 3, ctx.y + 3.2);
    ctx.y += 6;

    // Equation text
    const plainEq = latexToPlain(eqn.latex);
    ctx.pdf.setFillColor(248, 248, 248);
    const eqLines = ctx.pdf.splitTextToSize(plainEq, ctx.contentW - 10);
    const eqH = Math.max(7, eqLines.length * 3.5 + 3);
    checkPage(ctx, eqH + 5);
    ctx.pdf.rect(ctx.margin, ctx.y, ctx.contentW, eqH, "F");
    ctx.pdf.setFontSize(7);
    ctx.pdf.setFont("courier", "normal");
    ctx.pdf.setTextColor(30, 30, 30);
    ctx.pdf.text(eqLines, ctx.margin + 5, ctx.y + 3.5);
    ctx.y += eqH + 1;

    // Description
    ctx.pdf.setFontSize(7);
    ctx.pdf.setFont("helvetica", "italic");
    ctx.pdf.setTextColor(100, 100, 100);
    ctx.pdf.text(eqn.description, ctx.margin + 3, ctx.y + 1);
    ctx.y += 4;
  });

  // Variables (compact)
  if (eq.variables.length > 0) {
    checkPage(ctx, 12);
    ctx.pdf.setFontSize(7);
    ctx.pdf.setFont("helvetica", "bold");
    ctx.pdf.setTextColor(60, 60, 60);
    ctx.pdf.text("Variables:", ctx.margin, ctx.y + 3);
    ctx.y += 4;
    eq.variables.forEach((v) => {
      checkPage(ctx, 4);
      const sym = v.symbol.replace(/\\/g, '').replace(/\{/g, '').replace(/\}/g, '');
      ctx.pdf.setFont("courier", "normal");
      ctx.pdf.setFontSize(7);
      ctx.pdf.setTextColor(30, 30, 30);
      ctx.pdf.text(sym, ctx.margin + 3, ctx.y + 2.5);
      ctx.pdf.setFont("helvetica", "normal");
      ctx.pdf.setTextColor(80, 80, 80);
      const meaning = v.meaning.length > 90 ? v.meaning.slice(0, 87) + "…" : v.meaning;
      ctx.pdf.text(`= ${meaning}`, ctx.margin + ctx.contentW * 0.15, ctx.y + 2.5);
      ctx.y += 3.5;
    });
  }

  // Notes
  if (eq.notes) {
    checkPage(ctx, 8);
    ctx.pdf.setFontSize(6.5);
    ctx.pdf.setFont("helvetica", "italic");
    ctx.pdf.setTextColor(120, 120, 120);
    const noteLines = ctx.pdf.splitTextToSize(`Note: ${eq.notes}`, ctx.contentW - 6);
    ctx.pdf.text(noteLines, ctx.margin + 3, ctx.y + 2.5);
    ctx.y += noteLines.length * 3 + 2;
  }

  ctx.y += 4;
}

export function PdfReportGenerator({
  data, pattern, patternKey, totalDepth, duration, timeStep, unitSystem,
  projectName = "", engineerName = "", companyName = "",
}: PdfReportGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const contentW = pageW - margin * 2;
      const ctx: PdfContext = { pdf, y: margin, margin, pageW, pageH, contentW };
      const rowH = 6.5;

      const depthUnit = getDepthUnit(unitSystem);
      const intensityUnit = getIntensityUnit(unitSystem);
      const exportDepth = convertDepth(totalDepth, "USA", unitSystem);
      const convertedData = data.map(d => ({
        ...d,
        convertedIntensity: convertIntensity(d.intensity, "USA", unitSystem),
      }));
      const peakIntensity = Math.max(...convertedData.map(d => d.convertedIntensity));
      const peakIdx = convertedData.findIndex(d => d.convertedIntensity === peakIntensity);
      const peakTime = peakIdx >= 0 ? data[peakIdx].time : 0;
      const stepHr = timeStep / 60;
      const timestamp = new Date().toLocaleString();
      const reportId = `RCS-${Date.now().toString(36).toUpperCase()}`;

      // Compute incremental depths & cumulative
      const depths = convertedData.map(d => d.convertedIntensity * stepHr);
      const depthSum = depths.reduce((s, v) => s + v, 0);
      const depthError = Math.abs(depthSum - exportDepth) / exportDepth * 100;

      // ── PAGE 1: Header bar ──
      pdf.setFillColor(30, 64, 175);
      pdf.rect(0, 0, pageW, 30, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("DESIGN STORM REPORT", margin, 13);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Generated by Rain Canvas Studio", margin, 20);
      pdf.text(timestamp, margin, 26);
      pdf.text(`Report ID: ${reportId}`, pageW - margin, 26, { align: "right" });
      ctx.y = 38;

      // ── Project Info ──
      if (projectName || engineerName || companyName) {
        pdf.setTextColor(30, 64, 175);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Project Information", margin, ctx.y);
        ctx.y += 5;
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(30, 30, 30);
        if (projectName) { pdf.text(`Project: ${projectName}`, margin + 3, ctx.y); ctx.y += 5; }
        if (engineerName) { pdf.text(`Engineer: ${engineerName}`, margin + 3, ctx.y); ctx.y += 5; }
        if (companyName) { pdf.text(`Company: ${companyName}`, margin + 3, ctx.y); ctx.y += 5; }
        ctx.y += 3;
      }

      // ── Storm Parameters Table ──
      drawSectionTitle(ctx, "Storm Parameters");
      const metaRows = [
        ["Pattern", pattern],
        ["Total Depth", `${exportDepth.toFixed(unitSystem === "USA" ? 2 : 1)} ${depthUnit}`],
        ["Duration", `${duration} hours`],
        ["Time Step", `${timeStep} minutes`],
        ["Peak Intensity", `${peakIntensity.toFixed(2)} ${intensityUnit}`],
        ["Time to Peak", `${peakTime.toFixed(2)} hours`],
        ["Unit System", unitSystem === "USA" ? "US Customary (inches)" : "SI Metric (mm)"],
        ["Data Points", `${data.length}`],
      ];

      pdf.setFontSize(9);
      const colW = contentW / 2;
      metaRows.forEach((row, i) => {
        drawTableRow(ctx, row, [colW, colW], rowH, i, { bold: true });
      });
      ctx.y += 6;

      // ══════════════════════════════════════════════════
      // ── DETAILED STORM STATISTICS (NEW) ──
      // ══════════════════════════════════════════════════
      drawSectionTitle(ctx, "Detailed Storm Statistics");

      // Compute advanced stats
      let cumDepths: number[] = [];
      let cumSum = 0;
      depths.forEach(d => { cumSum += d; cumDepths.push(cumSum); });
      const totalCalc = cumSum;

      // Quartile times (time at which 25%, 50%, 75% of depth has fallen)
      const findQuartileTime = (frac: number) => {
        const target = frac * totalCalc;
        const idx = cumDepths.findIndex(c => c >= target);
        return idx >= 0 ? data[idx].time : duration;
      };
      const q25Time = findQuartileTime(0.25);
      const q50Time = findQuartileTime(0.50);
      const q75Time = findQuartileTime(0.75);

      // Centroid of hyetograph (center of mass)
      let momentSum = 0;
      let massSum = 0;
      convertedData.forEach((d, i) => {
        momentSum += d.convertedIntensity * data[i].time;
        massSum += d.convertedIntensity;
      });
      const centroid = massSum > 0 ? momentSum / massSum : duration / 2;

      // Intensity statistics
      const intensities = convertedData.map(d => d.convertedIntensity);
      const meanIntensity = intensities.reduce((s, v) => s + v, 0) / intensities.length;
      const sortedIntensities = [...intensities].sort((a, b) => a - b);
      const medianIntensity = sortedIntensities.length % 2 === 0
        ? (sortedIntensities[sortedIntensities.length / 2 - 1] + sortedIntensities[sortedIntensities.length / 2]) / 2
        : sortedIntensities[Math.floor(sortedIntensities.length / 2)];
      const stdDev = Math.sqrt(intensities.reduce((s, v) => s + (v - meanIntensity) ** 2, 0) / intensities.length);
      const skewness = intensities.length > 2
        ? (intensities.reduce((s, v) => s + ((v - meanIntensity) / stdDev) ** 3, 0) / intensities.length)
        : 0;

      // Peak-to-mean ratio
      const peakToMean = meanIntensity > 0 ? peakIntensity / meanIntensity : 0;

      // Depth in top 20% of intervals
      const sortedDepths = [...depths].sort((a, b) => b - a);
      const top20Count = Math.max(1, Math.ceil(depths.length * 0.2));
      const top20Depth = sortedDepths.slice(0, top20Count).reduce((s, v) => s + v, 0);
      const top20Pct = totalCalc > 0 ? (top20Depth / totalCalc) * 100 : 0;

      // Duration of "effective" rainfall (> 10% of peak)
      const threshold = peakIntensity * 0.1;
      const effectiveIntervals = intensities.filter(i => i > threshold).length;
      const effectiveDuration = effectiveIntervals * timeStep;

      const statsRows = [
        ["Mean Intensity", `${meanIntensity.toFixed(3)} ${intensityUnit}`],
        ["Median Intensity", `${medianIntensity.toFixed(3)} ${intensityUnit}`],
        ["Peak Intensity", `${peakIntensity.toFixed(3)} ${intensityUnit}`],
        ["Peak-to-Mean Ratio", `${peakToMean.toFixed(2)}`],
        ["Std Deviation", `${stdDev.toFixed(3)} ${intensityUnit}`],
        ["Skewness", `${skewness.toFixed(3)}`],
        ["Centroid (Center of Mass)", `${centroid.toFixed(2)} hr`],
        ["25% Depth Time (Q1)", `${q25Time.toFixed(2)} hr`],
        ["50% Depth Time (Q2)", `${q50Time.toFixed(2)} hr`],
        ["75% Depth Time (Q3)", `${q75Time.toFixed(2)} hr`],
        ["Effective Duration (>10% peak)", `${effectiveDuration} min (${effectiveIntervals} intervals)`],
        ["Top 20% Intervals Depth", `${top20Depth.toFixed(3)} ${depthUnit} (${top20Pct.toFixed(1)}% of total)`],
        ["Total Computed Depth", `${totalCalc.toFixed(4)} ${depthUnit}`],
        ["Volume Error", `${depthError.toFixed(4)}%`],
      ];

      pdf.setFontSize(9);
      statsRows.forEach((row, i) => {
        checkPage(ctx, rowH);
        drawTableRow(ctx, row, [colW, colW], rowH, i, { bold: true });
      });
      ctx.y += 6;

      // ── Pattern Equations & Source (selected pattern) ──
      const equationInfo = patternKey ? getPatternEquation(patternKey) : undefined;
      if (equationInfo) {
        drawSectionTitle(ctx, "Pattern Source & Reference");
        const refRows = [
          ["Pattern Name", equationInfo.name],
          ["Category", equationInfo.category === 'cumulative' ? 'Cumulative Distribution' : equationInfo.category === 'intensity' ? 'Intensity Function' : 'Empirical Method'],
          ["Reference", equationInfo.reference.title],
          ["Citation", equationInfo.reference.citation],
          ["Year", String(equationInfo.reference.year)],
        ];
        if (equationInfo.reference.link) {
          refRows.push(["URL", equationInfo.reference.link]);
        }

        pdf.setFontSize(9);
        refRows.forEach((row, i) => {
          checkPage(ctx, rowH);
          const val = row[1].length > 80 ? row[1].slice(0, 77) + "..." : row[1];
          drawTableRow(ctx, [row[0], val], [colW * 0.4, colW * 1.6], rowH, i, { bold: true });
        });
        ctx.y += 4;

        if (equationInfo.notes) {
          checkPage(ctx, 15);
          pdf.setFillColor(240, 248, 255);
          pdf.rect(margin, ctx.y, contentW, 10, "F");
          pdf.setFontSize(8);
          pdf.setTextColor(60, 60, 60);
          pdf.setFont("helvetica", "italic");
          const noteLines = pdf.splitTextToSize(`Note: ${equationInfo.notes}`, contentW - 6);
          pdf.text(noteLines, margin + 3, ctx.y + 4);
          ctx.y += Math.max(10, noteLines.length * 4 + 4);
          ctx.y += 3;
        }

        drawSectionTitle(ctx, "Equations Used");
        drawPatternEquations(ctx, equationInfo);
      }

      // ── Verification Checks ──
      drawSectionTitle(ctx, "Verification Checks");
      const checks = [
        ["Mass Balance", `Sum of increments = ${depthSum.toFixed(4)} ${depthUnit}`, depthError < 0.1 ? "✓ PASS" : "✗ FAIL"],
        ["Depth Match", `Error = ${depthError.toFixed(4)}%`, depthError < 0.1 ? "✓ PASS" : "⚠ WARNING"],
        ["Interval Count", `${data.length} × ${timeStep} min = ${(data.length * timeStep / 60).toFixed(1)} hr`, data.length === Math.ceil(duration * 60 / timeStep) ? "✓ PASS" : "✓ OK"],
        ["Non-Negative", `Min = ${Math.min(...depths).toFixed(4)} ${depthUnit}`, Math.min(...depths) >= 0 ? "✓ PASS" : "✗ FAIL"],
      ];

      const checkColWidths = [contentW * 0.25, contentW * 0.55, contentW * 0.2];
      drawTableHeader(ctx, ["Check", "Result", "Status"], checkColWidths);
      pdf.setFontSize(8);
      checks.forEach((row, i) => {
        checkPage(ctx, 6);
        const bgColor = i % 2 === 0 ? 248 : 255;
        pdf.setFillColor(bgColor, bgColor, bgColor);
        pdf.rect(margin, ctx.y, contentW, 5.5, "F");
        let xPos = margin;
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(60, 60, 60);
        pdf.text(row[0], xPos + 2, ctx.y + 3.8);
        xPos += checkColWidths[0];
        pdf.setFont("helvetica", "normal");
        pdf.text(row[1], xPos + 2, ctx.y + 3.8);
        xPos += checkColWidths[1];
        if (row[2].includes("PASS") || row[2].includes("OK")) {
          pdf.setTextColor(22, 163, 74);
        } else if (row[2].includes("FAIL")) {
          pdf.setTextColor(220, 38, 38);
        } else {
          pdf.setTextColor(234, 179, 8);
        }
        pdf.setFont("helvetica", "bold");
        pdf.text(row[2], xPos + 2, ctx.y + 3.8);
        ctx.y += 5.5;
      });
      ctx.y += 8;

      // ── Hyetograph Chart ──
      const chartEl = document.querySelector(".recharts-responsive-container")?.parentElement;
      if (chartEl) {
        checkPage(ctx, 80);
        drawSectionTitle(ctx, "Rainfall Hyetograph");
        const canvas = await html2canvas(chartEl as HTMLElement, {
          backgroundColor: "#ffffff", scale: 2, useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");
        const imgW = contentW;
        const imgH = (canvas.height / canvas.width) * imgW;
        pdf.addImage(imgData, "PNG", margin, ctx.y, imgW, imgH);
        ctx.y += imgH + 3;

        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        pdf.text(
          `Figure 1: ${pattern} hyetograph — ${exportDepth.toFixed(2)} ${depthUnit}, ${duration}-hr, ${timeStep}-min intervals`,
          margin, ctx.y
        );
        ctx.y += 8;
      }

      // ── Timeseries Data Table ──
      checkPage(ctx, 30);
      drawSectionTitle(ctx, "Timeseries Data");

      const tColWidths = [contentW * 0.08, contentW * 0.15, contentW * 0.22, contentW * 0.22, contentW * 0.22, contentW * 0.11];
      const tHeaders = ["#", "Time (hr)", `Intensity (${intensityUnit})`, `Incr. Depth (${depthUnit})`, `Cumul. Depth (${depthUnit})`, "Cumul. %"];

      const drawTSeriesHeader = () => {
        drawTableHeader(ctx, tHeaders, tColWidths);
      };

      drawTSeriesHeader();
      pdf.setFontSize(7);

      let cumDepthRun = 0;
      data.forEach((point, i) => {
        if (ctx.y > 260) {
          pdf.addPage();
          ctx.y = margin;
          drawTSeriesHeader();
          pdf.setFontSize(7);
        }

        const intensity = convertedData[i].convertedIntensity;
        const incrDepth = depths[i];
        cumDepthRun += incrDepth;
        const cumPct = exportDepth > 0 ? (cumDepthRun / exportDepth * 100) : 0;
        const isPeak = i === peakIdx;

        const bgColor = isPeak ? [254, 243, 199] : (i % 2 === 0 ? [248, 248, 248] : [255, 255, 255]);
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        pdf.rect(margin, ctx.y, contentW, 5, "F");

        pdf.setTextColor(60, 60, 60);
        pdf.setFont("helvetica", isPeak ? "bold" : "normal");
        let x = margin;
        const decimals = unitSystem === "USA" ? 4 : 2;
        const cells = [
          `${i + 1}`,
          point.time.toFixed(2),
          intensity.toFixed(decimals),
          incrDepth.toFixed(decimals),
          cumDepthRun.toFixed(decimals),
          `${cumPct.toFixed(1)}%`,
        ];
        cells.forEach((c, j) => {
          pdf.text(c, x + 1.5, ctx.y + 3.6);
          x += tColWidths[j];
        });
        ctx.y += 5;
      });

      // ══════════════════════════════════════════════════
      // ── APPENDIX: ALL PATTERN EQUATIONS ──
      // ══════════════════════════════════════════════════
      pdf.addPage();
      ctx.y = margin;

      // Appendix title page header
      pdf.setFillColor(30, 64, 175);
      pdf.rect(0, 0, pageW, 24, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("APPENDIX: ALL PATTERN EQUATIONS", margin, 12);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${patternEquations.length} patterns documented`, margin, 20);
      pdf.text(timestamp, pageW - margin, 20, { align: "right" });
      ctx.y = 32;

      // Table of contents for appendix
      pdf.setTextColor(30, 64, 175);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Pattern Index", margin, ctx.y);
      ctx.y += 5;

      // Group patterns by category
      const cumPatterns = patternEquations.filter(p => p.category === 'cumulative');
      const intPatterns = patternEquations.filter(p => p.category === 'intensity');
      const empPatterns = patternEquations.filter(p => p.category === 'empirical');

      const categories = [
        { label: "Cumulative Distributions", patterns: cumPatterns },
        { label: "Intensity Functions", patterns: intPatterns },
        { label: "Empirical Methods", patterns: empPatterns },
      ];

      pdf.setFontSize(8);
      categories.forEach(cat => {
        if (cat.patterns.length === 0) return;
        checkPage(ctx, 8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 64, 175);
        pdf.text(`${cat.label} (${cat.patterns.length})`, margin + 2, ctx.y + 3);
        ctx.y += 4;
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(60, 60, 60);
        // List names in columns
        const names = cat.patterns.map(p => p.name);
        const perCol = Math.ceil(names.length / 3);
        const col3W = contentW / 3;
        for (let row = 0; row < perCol; row++) {
          checkPage(ctx, 4);
          for (let col = 0; col < 3; col++) {
            const idx = row + col * perCol;
            if (idx < names.length) {
              const name = names[idx].length > 28 ? names[idx].slice(0, 25) + "…" : names[idx];
              pdf.text(`• ${name}`, margin + col * col3W + 4, ctx.y + 2.5);
            }
          }
          ctx.y += 3.5;
        }
        ctx.y += 2;
      });

      // Now render all equations
      categories.forEach(cat => {
        if (cat.patterns.length === 0) return;
        pdf.addPage();
        ctx.y = margin;

        // Category header
        pdf.setFillColor(30, 64, 175);
        pdf.rect(0, 0, pageW, 18, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(cat.label.toUpperCase(), margin, 12);
        ctx.y = 24;

        cat.patterns.forEach((eq) => {
          checkPage(ctx, 40);
          drawPatternEquations(ctx, eq);

          // Separator line
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, ctx.y, margin + contentW, ctx.y);
          ctx.y += 3;
        });
      });

      // ── Footer on all pages ──
      const pageCount = pdf.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        pdf.setPage(p);
        const footY = pdf.internal.pageSize.getHeight() - 8;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, footY - 3, pageW - margin, footY - 3);
        pdf.setFontSize(7);
        pdf.setTextColor(160, 160, 160);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Rain Canvas Studio — Design Storm Report — ${reportId}`, margin, footY);
        pdf.text(`Page ${p} of ${pageCount}`, pageW - margin, footY, { align: "right" });
      }

      pdf.save(`DesignStorm_${pattern.replace(/\s+/g, '_')}_${exportDepth.toFixed(1)}${depthUnit}_${duration}hr.pdf`);
      toast.success("PDF report generated with equations appendix");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handleEmailReport = () => {
    const subject = encodeURIComponent(`Design Storm Report — ${pattern} — ${totalDepth}${getDepthUnit(unitSystem)}, ${duration}hr`);
    const body = encodeURIComponent(
      `Hello,\n\nPlease find attached the Design Storm Report generated by Rain Canvas Studio.\n\n` +
      `Pattern: ${pattern}\n` +
      `Total Depth: ${convertDepth(totalDepth, "USA", unitSystem).toFixed(2)} ${getDepthUnit(unitSystem)}\n` +
      `Duration: ${duration} hours\n` +
      `Time Step: ${timeStep} minutes\n\n` +
      `Download the PDF from the app and attach it to this email.\n\n` +
      `— Generated by Rain Canvas Studio\nhttps://rain-canvas-studio.lovable.app`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    toast.info("Opening email client — attach the downloaded PDF");
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={generatePdf} disabled={generating} className="gap-2">
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {generating ? "Generating…" : "PDF Engineering Report"}
      </Button>
      <Button variant="outline" size="icon" onClick={handleEmailReport} title="Email report">
        <Mail className="w-4 h-4" />
      </Button>
    </div>
  );
}
