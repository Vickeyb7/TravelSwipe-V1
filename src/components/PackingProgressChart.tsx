import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PackingItem } from '../types';

interface CategoryProgressData {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  total: number;
  packed: number;
  remaining: number;
  packedPct: number;
  remainingPct: number;
  color: string;
  items: PackingItem[];
}

interface PackingProgressChartProps {
  items: PackingItem[];
  onOpenCategoryChecklist?: (categoryName: string) => void;
}

export const PackingProgressChart: React.FC<PackingProgressChartProps> = ({
  items,
  onOpenCategoryChecklist,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const donutRef = useRef<SVGSVGElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryProgressData | null>(null);

  // Group items by normalized categories
  const categoryData = useMemo<CategoryProgressData[]>(() => {
    const rawCategories: {
      id: string;
      name: string;
      shortName: string;
      icon: string;
      matchKeywords: string[];
      color: string;
    }[] = [
      {
        id: 'clothing',
        name: 'Clothing & Layers',
        shortName: 'Clothing',
        icon: 'checkroom',
        matchKeywords: ['cloth', 'layer', 'apparel', 'jacket', 'pant', 'shirt'],
        color: '#2563eb', // blue-600
      },
      {
        id: 'electronics',
        name: 'Electronics & Gadgets',
        shortName: 'Electronics',
        icon: 'devices',
        matchKeywords: ['electron', 'gadget', 'charger', 'battery', 'cable', 'powerbank'],
        color: '#6366f1', // indigo-500
      },
      {
        id: 'toiletries',
        name: 'Toiletries & Meds',
        shortName: 'Toiletries',
        icon: 'medication',
        matchKeywords: ['toilet', 'med', 'hygiene', 'cosmetic', 'skincare', 'cream', 'spf'],
        color: '#0d9488', // teal-600
      },
      {
        id: 'footwear',
        name: 'Footwear & Boots',
        shortName: 'Footwear',
        icon: 'hiking',
        matchKeywords: ['foot', 'boot', 'shoe', 'sock'],
        color: '#d97706', // amber-600
      },
      {
        id: 'adventure',
        name: 'Adventure & Essentials',
        shortName: 'Gear & Essentials',
        icon: 'backpack',
        matchKeywords: ['adventure', 'essential', 'gear', 'umbrella', 'bag', 'bottle'],
        color: '#059669', // emerald-600
      },
      {
        id: 'documents',
        name: 'Travel Documents & Permits',
        shortName: 'Documents',
        icon: 'description',
        matchKeywords: ['document', 'permit', 'ticket', 'id', 'pass'],
        color: '#475569', // slate-600
      },
    ];

    const result: CategoryProgressData[] = rawCategories.map((cat) => {
      const catItems = items.filter((it) => {
        const itemCat = (it.category || '').toLowerCase();
        return (
          itemCat === cat.name.toLowerCase() ||
          cat.matchKeywords.some((kw) => itemCat.includes(kw))
        );
      });

      const total = catItems.length;
      const packed = catItems.filter((i) => i.status === 'packed').length;
      const remaining = total - packed;
      const packedPct = total > 0 ? Math.round((packed / total) * 100) : 0;
      const remainingPct = 100 - packedPct;

      return {
        id: cat.id,
        name: cat.name,
        shortName: cat.shortName,
        icon: cat.icon,
        total,
        packed,
        remaining,
        packedPct,
        remainingPct,
        color: cat.color,
        items: catItems,
      };
    }).filter((cat) => cat.total > 0); // only show categories with items

    return result;
  }, [items]);

  const totalItems = items.length;
  const totalPacked = items.filter((i) => i.status === 'packed').length;
  const overallPackedPct = totalItems > 0 ? Math.round((totalPacked / totalItems) * 100) : 0;
  const totalRemaining = totalItems - totalPacked;

  // Render D3 Horizontal Stacked Category Progress Bars
  useEffect(() => {
    if (!svgRef.current || categoryData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean previous render

    const width = 420;
    const rowHeight = 44;
    const height = categoryData.length * rowHeight;
    const labelWidth = 100;
    const valueWidth = 65;
    const barWidth = width - labelWidth - valueWidth;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, barWidth]);

    const g = svg.append('g');

    // Create defs for subtle gradient
    const defs = svg.append('defs');
    const grad = defs
      .append('linearGradient')
      .attr('id', 'packedGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#2563eb');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6');

    // Draw rows
    categoryData.forEach((cat, idx) => {
      const y = idx * rowHeight;
      const rowGroup = g
        .append('g')
        .attr('class', 'category-row cursor-pointer')
        .attr('transform', `translate(0, ${y})`)
        .on('click', () => {
          setSelectedCategory((prev) => (prev === cat.id ? null : cat.id));
        })
        .on('mouseenter', () => setHoveredCategory(cat))
        .on('mouseleave', () => setHoveredCategory(null));

      // Category Label (Short Name)
      rowGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('fill', '#1e293b')
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('font-family', 'inherit')
        .text(cat.shortName);

      // Sub-label (packed/total counts)
      rowGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 33)
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .attr('font-family', 'inherit')
        .text(`${cat.packed}/${cat.total} in bag`);

      // Track Background Bar (Remaining items)
      rowGroup
        .append('rect')
        .attr('x', labelWidth)
        .attr('y', 10)
        .attr('width', barWidth)
        .attr('height', 16)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', '#f1f5f9')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1);

      // Remaining segment fill (accentuate remaining items visually)
      if (cat.remaining > 0) {
        rowGroup
          .append('rect')
          .attr('x', labelWidth)
          .attr('y', 10)
          .attr('width', barWidth)
          .attr('height', 16)
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('fill', '#fef3c7') // subtle amber-100
          .attr('opacity', 0.85);
      }

      // Packed Progress Bar (D3 animated transition)
      const packedWidth = xScale(cat.packedPct);
      const packedBar = rowGroup
        .append('rect')
        .attr('x', labelWidth)
        .attr('y', 10)
        .attr('width', 0)
        .attr('height', 16)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', cat.color)
        .attr('opacity', 0.95);

      packedBar
        .transition()
        .duration(650 + idx * 80)
        .ease(d3.easeCubicOut)
        .attr('width', Math.max(packedWidth > 0 ? 10 : 0, packedWidth));

      // Percentage label text
      rowGroup
        .append('text')
        .attr('x', width)
        .attr('y', 23)
        .attr('text-anchor', 'end')
        .attr('fill', cat.packedPct === 100 ? '#059669' : '#0f172a')
        .attr('font-size', '12px')
        .attr('font-weight', '800')
        .attr('font-family', 'inherit')
        .text(`${cat.packedPct}%`);
    });
  }, [categoryData]);

  // Render D3 Overall Radial Donut Arc
  useEffect(() => {
    if (!donutRef.current) return;

    const svg = d3.select(donutRef.current);
    svg.selectAll('*').remove();

    const size = 96;
    const radius = size / 2;
    const thickness = 10;

    svg.attr('viewBox', `0 0 ${size} ${size}`);

    const g = svg.append('g').attr('transform', `translate(${radius}, ${radius})`);

    // Background Arc
    const backgroundArc = d3
      .arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    g.append('path')
      .attr('d', backgroundArc as any)
      .attr('fill', '#f1f5f9');

    // Foreground Progress Arc
    const foregroundArc = d3
      .arc<{ endAngle: number }>()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .cornerRadius(5)
      .startAngle(0)
      .endAngle((d) => d.endAngle);

    const targetAngle = (overallPackedPct / 100) * 2 * Math.PI;

    const path = g
      .append('path')
      .datum({ endAngle: 0 })
      .attr('fill', overallPackedPct === 100 ? '#10b981' : '#2563eb');

    path
      .transition()
      .duration(850)
      .ease(d3.easeCubicOut)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate(d.endAngle, targetAngle);
        return function (t) {
          d.endAngle = interpolate(t);
          return (foregroundArc as any)(d);
        };
      });

    // Center percentage text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('fill', '#0f172a')
      .attr('font-size', '17px')
      .attr('font-weight', '800')
      .attr('font-family', 'inherit')
      .text(`${overallPackedPct}%`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.3em')
      .attr('fill', '#64748b')
      .attr('font-size', '8px')
      .attr('font-weight', '700')
      .attr('letter-spacing', '0.05em')
      .text('PACKED');
  }, [overallPackedPct]);

  const activeCategoryObj = categoryData.find((c) => c.id === selectedCategory);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col gap-4">
      {/* Header with Title & Live D3 Donut Metric */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Packing Progress Dashboard
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Category-by-category packed items vs remaining items
          </p>
        </div>

        {/* D3 Donut Meter */}
        <div className="w-16 h-16 shrink-0 flex items-center justify-center">
          <svg ref={donutRef} className="w-full h-full drop-shadow-2xs" />
        </div>
      </div>

      {/* Metric Pills Legend */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
          <span className="text-slate-700 font-bold">{totalPacked} Packed</span>
          <span className="text-[10px] text-slate-400">({overallPackedPct}%)</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
          <span className="text-amber-800 font-bold">{totalRemaining} Remaining</span>
          <span className="text-[10px] text-amber-600">({100 - overallPackedPct}%)</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div className="text-slate-600 font-semibold text-[11px]">
          Total {totalItems}
        </div>
      </div>

      {/* D3 Rendered Progress Chart */}
      <div className="w-full overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-auto select-none"
          style={{ minHeight: `${categoryData.length * 44}px` }}
        />
      </div>

      {/* Interactive Category Details Inspector */}
      {activeCategoryObj && (
        <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex flex-col gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-blue-600">
                {activeCategoryObj.icon}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {activeCategoryObj.name}
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {activeCategoryObj.packed} of {activeCategoryObj.total} packed
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {activeCategoryObj.items.map((it) => {
              const isPacked = it.status === 'packed';
              return (
                <div
                  key={it.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-slate-100 shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        isPacked ? 'text-teal-600' : 'text-amber-600'
                      }`}
                    >
                      {isPacked ? 'check_circle' : 'schedule'}
                    </span>
                    <span
                      className={`truncate font-medium ${
                        isPacked ? 'text-slate-500 line-through' : 'text-slate-800 font-semibold'
                      }`}
                    >
                      {it.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isPacked
                        ? 'bg-teal-50 text-teal-700'
                        : it.status === 'own'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isPacked ? 'In Luggage' : it.status === 'own' ? 'At Home' : 'Need to Buy'}
                  </span>
                </div>
              );
            })}
          </div>

          {onOpenCategoryChecklist && (
            <button
              onClick={() => onOpenCategoryChecklist(activeCategoryObj.name)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 pt-1 cursor-pointer"
            >
              <span>Manage all {activeCategoryObj.shortName} in Checklist</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>
      )}

      {/* Helper footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
        <span>Click any category row to inspect packed items</span>
        <span className="font-semibold text-slate-500">d3.js Dynamic Viz</span>
      </div>
    </div>
  );
};
