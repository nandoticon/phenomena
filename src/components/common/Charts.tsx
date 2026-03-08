import React from 'react';
import { ChartPoint } from '../../types';

export function LineChart({
  title,
  points,
  accent = 'var(--accent)',
  activePoint,
  onPointFocus,
}: {
  title: string;
  points: ChartPoint[];
  accent?: string;
  activePoint?: ChartPoint | null;
  onPointFocus?: (point: ChartPoint) => void;
}) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - (point.value / max) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="chart-card">
      <div className="chart-head">
        <strong>{title}</strong>
        <span>Pico {max} min</span>
      </div>
      <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={title}>
        <path className="line-chart-area" d={`${path} L 100 100 L 0 100 Z`} />
        <path className="line-chart-path" d={path} style={{ stroke: accent }} />
        {points.map((point, index) => {
          const x = (index / Math.max(points.length - 1, 1)) * 100;
          const y = 100 - (point.value / max) * 100;
          return (
            <circle
              cx={x}
              cy={y}
              key={`${point.label}-${index}`}
              r="2.8"
              style={{ fill: accent }}
              onMouseEnter={() => onPointFocus?.(point)}
              onFocus={() => onPointFocus?.(point)}
              tabIndex={0}
            />
          );
        })}
      </svg>
      {activePoint ? (
        <div className="chart-detail">
          <strong>{activePoint.label}</strong>
          <span>{activePoint.value} min</span>
          {activePoint.note ? <small>{activePoint.note}</small> : null}
        </div>
      ) : null}
      <div className="chart-axis">
        {points.map((point, index) => (
          <div key={`${point.label}-${index}`}>
            <strong>{point.value}</strong>
            <span>{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({
  title,
  points,
  accent = 'var(--secondary)',
  activePoint,
  onPointFocus,
}: {
  title: string;
  points: ChartPoint[];
  accent?: string;
  activePoint?: ChartPoint | null;
  onPointFocus?: (point: ChartPoint) => void;
}) {
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <div className="chart-card">
      <div className="chart-head">
        <strong>{title}</strong>
        <span>{points.reduce((sum, point) => sum + point.value, 0)} total</span>
      </div>
      <div className="bar-chart">
        {points.map((point, index) => (
          <div className="bar-row" key={`${title}-${point.label}-${index}`}>
            <div className="bar-labels">
              <strong>{point.label}</strong>
              <span>{point.note ?? `${point.value}`}</span>
            </div>
            <div className="bar-track" onMouseEnter={() => onPointFocus?.(point)} onFocus={() => onPointFocus?.(point)} tabIndex={0}>
              <div className="bar-fill" style={{ width: `${(point.value / max) * 100}%`, background: accent }} />
            </div>
            <span className="bar-value">{point.value}</span>
          </div>
        ))}
      </div>
      {activePoint ? (
        <div className="chart-detail">
          <strong>{activePoint.label}</strong>
          <span>{activePoint.value}</span>
          {activePoint.note ? <small>{activePoint.note}</small> : null}
        </div>
      ) : null}
    </div>
  );
}
