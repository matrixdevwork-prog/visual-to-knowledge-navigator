import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ConceptNode } from '../types';

interface ConceptMapTreeProps {
  data: ConceptNode;
}

const ConceptMapTree: React.FC<ConceptMapTreeProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 600
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const width = dimensions.width;
    const height = dimensions.height;

    const root = d3.hierarchy<ConceptNode>(data);
    
    // Create tree layout
    const treeLayout = d3.tree<ConceptNode>()
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    
    treeLayout(root);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Initial centering logic
    // We can't perfectly center without knowing bounding box, but we start with a reasonable margin
    // The user can zoom/pan

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<ConceptNode>, d3.HierarchyPointNode<ConceptNode>>()
        .x(d => d.y)
        .y(d => d.x));

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // We use foreignObject to render HTML inside SVG nodes
    // This allows for automatic text wrapping and CSS styling
    const nodeWidth = 140;
    const nodeHeight = 50; // flexible, but we set a base for calculation

    node.append("foreignObject")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("x", -nodeWidth / 2) // Center horizontally
      .attr("y", -nodeHeight / 2) // Center vertically
      .style("overflow", "visible") // Allow expansion
      .append("xhtml:div")
      .style("width", `${nodeWidth}px`)
      .style("height", `${nodeHeight}px`)
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "center")
      .html(d => `
        <div class="px-3 py-2 bg-white border border-blue-200 rounded-lg shadow-sm text-center transform transition-transform hover:scale-105 hover:shadow-md cursor-default">
          <p class="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">${d.data.name}</p>
        </div>
      `);

  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="w-full bg-slate-50 rounded-xl shadow-inner border border-slate-200 overflow-hidden relative">
        <div className="absolute top-3 left-4 z-10">
            <h3 className="font-semibold text-slate-700 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200 text-sm">Concept Map</h3>
        </div>
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="block cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

export default ConceptMapTree;