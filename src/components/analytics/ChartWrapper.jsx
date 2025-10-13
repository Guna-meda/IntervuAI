import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Custom Tooltip to avoid Redux dependency
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-slate-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Wrapper components that avoid the Redux issue
export const SafeBarChart = ({ data, children, ...props }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} {...props}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <Tooltip content={<CustomTooltip />} />
      {children}
    </BarChart>
  </ResponsiveContainer>
);

export const SafeLineChart = ({ data, children, ...props }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} {...props}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <Tooltip content={<CustomTooltip />} />
      {children}
    </LineChart>
  </ResponsiveContainer>
);

export const SafeAreaChart = ({ data, children, ...props }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} {...props}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <Tooltip content={<CustomTooltip />} />
      {children}
    </AreaChart>
  </ResponsiveContainer>
);

export const SafePieChart = ({ data, children, ...props }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart {...props}>
      <Tooltip content={<CustomTooltip />} />
      {children}
    </PieChart>
  </ResponsiveContainer>
);

export const SafeRadarChart = ({ data, children, ...props }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart data={data} {...props}>
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <PolarRadiusAxis domain={[0, 100]} />
      <Tooltip content={<CustomTooltip />} />
      {children}
    </RadarChart>
  </ResponsiveContainer>
);

export { Bar, XAxis, YAxis, Line, Area, Pie, Cell, Radar };