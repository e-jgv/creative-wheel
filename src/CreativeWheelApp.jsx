// CreativeWheelApp.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const exampleData = {
  Mood: ["Happy", "Melancholic", "Angry"],
  Setting: ["Beach", "City", "Forest"],
  Medium: ["Poem", "Painting", "Short Film"]
};

const categoryColors = ["#FFB3BA", "#BAE1FF", "#B9FBC0"];

const getRandomCombo = (data) => {
  const combo = {};
  for (const category in data) {
    const options = data[category];
    combo[category] = options[Math.floor(Math.random() * options.length)];
  }
  return combo;
};

export default function CreativeWheelApp() {
  const [result, setResult] = useState(getRandomCombo(exampleData));
  const [rotations, setRotations] = useState(Object.keys(exampleData).map(() => 0));

  const spinWheels = () => {
    const newRotations = rotations.map(
      () => 360 * 2 + Math.floor(Math.random() * 360)
    );
    setRotations(newRotations);
    setResult(getRandomCombo(exampleData));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Creative Wheel</h1>

      <div className="relative" style={{ width: 320, height: 320 }}>
        <motion.svg
          width={320}
          height={320}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <g transform="translate(160,160)">
            {Object.entries(exampleData).map(([category, values], i) => {
              const radius = 120 - i * 30;
              const rotation = rotations[i];
              const total = values.length;
              const angle = (2 * Math.PI) / total;
              const color = categoryColors[i % categoryColors.length];

              return (
                <motion.g
                  key={category}
                  animate={{ rotate: rotation }}
                  transition={{ duration: 1 }}
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
                          fontSize="10"
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

      <button
        onClick={spinWheels}
        className="mt-6 px-4 py-2 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800"
      >
        Spin
      </button>

      <div className="mt-4 text-center">
        {Object.entries(result).map(([cat, val]) => (
          <p key={cat} className="text-md">
            <strong>{cat}:</strong> {val}
          </p>
        ))}
      </div>
    </div>
  );
}
