import React from 'react';
import { ChartPoint } from '../../types';

function getVisibleAxisPoints(points: ChartPoint[], maxLabels = 7) {
  if (points.length <= maxLabels) {
    return points.map((point, index) => ({ point, index }));
  }

  const indexes = new Set<number>([0, points.length - 1]);
  const step = (points.length - 1) / Math.max(maxLabels - 1, 1);

  for (let i = 1; i < maxLabels - 1; i += 1) {
    indexes.add(Math.round(i * step));
  }

  return Array.from(indexes)
    .sort((a, b) => a - b)
    .map((index) => ({ point: points[index], index }));
}

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
  if (points.length === 0) {
    return (
      <div
        className="chart-card"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', borderStyle: 'dashed', opacity: 0.6 }}
      >
        <p style={{ fontStyle: 'italic' }}>No session data available for this range.</p>
      </div>
    );
  }

  const hasRealData = points.some((point) => point.value > 0);

  if (!hasRealData) {
    return (
      <div className="chart-card chart-empty">
        <div className="chart-head">
          <strong>{title}</strong>
          <span>No activity yet</span>
        </div>
        <div className="chart-empty-state">
          <p>No meaningful data is available for this range yet.</p>
          <small>Run a few sessions and this chart will show daily movement instead of zeros.</small>
        </div>
      </div>
    );
  }

  const max = Math.max(...points.map((point) => point.value), 1);
  const handlePointKeyDown = (event: React.KeyboardEvent<SVGCircleElement>, point: ChartPoint) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPointFocus?.(point);
    }
  };

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
        <span>Peak {max} min</span>
      </div>
      <div className="chart-body">
        <svg
          className="line-chart"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="graphics-document"
          aria-label={`Graph of ${title} showing trends over time`}
        >
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
                onKeyDown={(event) => handlePointKeyDown(event, point)}
                tabIndex={0}
                role="button"
                aria-label={`${point.label}: ${point.value} minutes`}
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
          {getVisibleAxisPoints(points).map(({ point, index }) => (
            <div key={`${point.label}-${index}`}>
              <strong>{point.value}</strong>
              <span>{point.label}</span>
            </div>
          ))}
        </div>
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
  if (points.length === 0) {
    return (
      <div
        className="chart-card"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', borderStyle: 'dashed', opacity: 0.6 }}
      >
        <p style={{ fontStyle: 'italic' }}>No session data available for this range.</p>
      </div>
    );
  }

  const max = Math.max(...points.map((point) => point.value), 1);
  const handleBarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, point: ChartPoint) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPointFocus?.(point);
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-head">
        <strong>{title}</strong>
        <span>{points.reduce((sum, point) => sum + point.value, 0)} total</span>
      </div>
      <div className="bar-chart" role="graphics-document" aria-label={`Bar chart showing distribution for ${title}`}>
        {points.map((point, index) => (
          <div className="bar-row" key={`${title}-${point.label}-${index}`}>
            <div className="bar-labels">
              <strong>{point.label}</strong>
              <span>{point.note ?? `${point.value}`}</span>
            </div>
            <div
              className="bar-track"
              onMouseEnter={() => onPointFocus?.(point)}
              onFocus={() => onPointFocus?.(point)}
              onKeyDown={(event) => handleBarKeyDown(event, point)}
              tabIndex={0}
              role="button"
              aria-label={`${point.label}: ${point.value}`}
            >
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
