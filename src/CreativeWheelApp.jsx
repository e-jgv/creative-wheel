// CreativeWheelApp.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const exampleData = {
  Mood: ["Happy", "Melancholic", "Angry"],
  Setting: ["Beach", "City", "Forest"],
  Medium: ["Poem", "Painting", "Short Film"]
};
const categoryColors = ["#FFB3BA", "#BAE1FF", "#B9FBC0"];

export default function CreativeWheelApp() {
  const [rotations, setRotations] = useState(
    Object.keys(exampleData).map(() => 0)
  );
  const [dragInfo, setDragInfo] = useState({
    isDragging: false,
    index: null,
    startAngle: 0,
    initialRotation: 0
  });
  const svgRef = useRef(null);

  // Compute current overlapping combinations as list of strings
  const combos = useMemo(() => {
    const categories = Object.keys(exampleData);
    // build intervals for each wheel
    const intervals = categories.map((cat, i) => {
      const values = exampleData[cat];
      const count = values.length;
      const angleStep = (2 * Math.PI) / count;
      const rotRad = ((rotations[i] % 360) * Math.PI) / 180;
      return values.map((val, j) => ({
        val,
        start: j * angleStep + rotRad,
        end: (j + 1) * angleStep + rotRad
      }));
    });
    // find triple intersections
    const list = [];
    intervals[0].forEach(i0 => {
      intervals[1].forEach(i1 => {
        const s01 = Math.max(i0.start, i1.start);
        const e01 = Math.min(i0.end, i1.end);
        if (e01 > s01) {
          intervals[2].forEach(i2 => {
            const s012 = Math.max(s01, i2.start);
            const e012 = Math.min(e01, i2.end);
            if (e012 > s012) {
              list.push(`${i0.val} - ${i1.val} - ${i2.val}`);
            }
          });
        }
      });
    });
    return list;
  }, [rotations]);

  // Spin all wheels
  const spinAll = () => {
    setRotations(
      rotations.map(
        () => 360 * 2 + Math.floor(Math.random() * 360)
      )
    );
  };

  // Start dragging a specific wheel
  const handlePointerDown = (index, e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    setDragInfo({
      isDragging: true,
      index,
      startAngle: angle,
      initialRotation: rotations[index]
    });
    e.preventDefault();
  };

  // Handle dragging movement and release
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragInfo.isDragging) return;
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const delta = (angle - dragInfo.startAngle) * (180 / Math.PI);
      setRotations((prev) =>
        prev.map((r, i) =>
          i === dragInfo.index ? dragInfo.initialRotation + delta : r
        )
      );
    };
    const handlePointerUp = () => {
      if (dragInfo.isDragging) {
        setDragInfo((info) => ({ ...info, isDragging: false }));
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragInfo]);

  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen bg-white text-black pt-10"
      style={{ fontFamily: 'Century Gothic, sans-serif' }}
    >
      <h1 className="text-3xl font-bold mb-4">Creative Wheel</h1>
      <button
        onClick={spinAll}
        className="mb-6 px-6 py-3 bg-black text-white rounded-2xl shadow-lg hover:bg-gray-800 text-lg"
      >
        Spin All
      </button>
      <div className="relative mt-40" style={{ width: 400, height: 400 }}>
        <motion.svg
          ref={svgRef}
          width={400}
          height={400}
          style={{ position: 'absolute', top: 0, left: 0, touchAction: 'none' }}
        >
          <g transform="translate(200,200)">
            {Object.entries(exampleData).map(([category, values], i) => {
              const radius = 160 - i * 40;
              const rotation = rotations[i];
              const total = values.length;
              const angle = (2 * Math.PI) / total;
              const color = categoryColors[i % categoryColors.length];
              const isCurrentDrag = dragInfo.isDragging && dragInfo.index === i;
              return (
                <motion.g
                  key={category}
                  animate={{ rotate: rotation }}
                  transition={{ duration: isCurrentDrag ? 0 : 1 }}
                  style={{ cursor: 'grab' }}
                  onPointerDown={(e) => handlePointerDown(i, e)}
                >
                  {values.map((val, j) => {
                    const startAngle = j * angle;
                    const endAngle = (j + 1) * angle;
                    const x1 = radius * Math.cos(startAngle);
                    const y1 = radius * Math.sin(startAngle);
                    const x2 = radius * Math.cos(endAngle);
                    const y2 = radius * Math.sin(endAngle);
                    const labelAngle = startAngle + angle / 2;
                    const labelRadius = radius - 10;
                    const textX = labelRadius * Math.cos(labelAngle);
                    const textY = labelRadius * Math.sin(labelAngle);
                    return (
                      <g key={j}>
                        <path
                          d={`M0,0 L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`}
                          fill={color}
                          stroke="#fff"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="#000"
                          fontSize="12"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          transform={`rotate(${((labelAngle * 180) / Math.PI) + 90} ${textX} ${textY})`}
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}
                </motion.g>
              );
            })}
          </g>
        </motion.svg>
      </div>
      {/* List current combinations */}
      <div className="mt-8 w-full max-w-md px-4">
        <h2 className="text-xl font-semibold mb-2">Current Combinations:</h2>
        <ul className="list-disc list-inside space-y-1">
          {combos.map((combo, idx) => (
            <li key={idx}>{combo}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
