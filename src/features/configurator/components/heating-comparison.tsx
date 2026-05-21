"use client";

import { useId, useState } from "react";
import comparisonStyles from "./heating-comparison.module.css";
import type { StandbeinId } from "../model";
import {
  HEATING_COMPARISON_CRITERIA,
  getHeatingComparisonSystems,
  type HeatingComparisonSystemId,
} from "../heating-comparison";

type Props = {
  standbein: StandbeinId;
};

export function HeatingComparison({ standbein }: Props) {
  const systems = getHeatingComparisonSystems(standbein);
  const [isOpen, setIsOpen] = useState(false);
  const [leftSystemId, setLeftSystemId] = useState<HeatingComparisonSystemId | "">(
    systems[0]?.id ?? "",
  );
  const [rightSystemId, setRightSystemId] = useState<HeatingComparisonSystemId | "">(
    systems[1]?.id ?? systems[0]?.id ?? "",
  );
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const headingId = useId();

  if (systems.length < 2) {
    return null;
  }

  const leftSystem =
    systems.find((system) => system.id === leftSystemId) ?? systems[0];
  const rightSystem =
    systems.find((system) => system.id === rightSystemId) ??
    systems.find((system) => system.id !== leftSystem.id) ??
    systems[1];

  const handleSelectChange = (side: "left" | "right", nextValue: string) => {
    const nextSystemId = nextValue as HeatingComparisonSystemId;

    if (side === "left") {
      setLeftSystemId(nextSystemId);

      if (nextSystemId === rightSystem.id) {
        const replacement = systems.find((system) => system.id !== nextSystemId);
        setRightSystemId(replacement?.id ?? rightSystem.id);
      }

      return;
    }

    setRightSystemId(nextSystemId);

    if (nextSystemId === leftSystem.id) {
      const replacement = systems.find((system) => system.id !== nextSystemId);
      setLeftSystemId(replacement?.id ?? leftSystem.id);
    }
  };

  return (
    <section
      className={comparisonStyles.comparisonShell}
      data-testid="heating-comparison"
      aria-labelledby={headingId}
    >
      <div className={comparisonStyles.comparisonHeader}>
        <div>
          <p className={comparisonStyles.kicker}>Entscheidungshilfe</p>
          <h3 id={headingId}>Heizsysteme direkt vergleichen</h3>
          <p>
            Zwei Optionen auswählen und die wichtigsten Punkte nebeneinander ansehen.
          </p>
        </div>
        <button
          type="button"
          className={comparisonStyles.toggleButton}
          aria-expanded={isOpen}
          data-testid="heating-comparison-toggle"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          {isOpen ? "Vergleich ausblenden" : "Vergleich öffnen"}
        </button>
      </div>

      {isOpen ? (
        <div className={comparisonStyles.comparisonBody}>
          <div className={comparisonStyles.selectRow}>
            <label className={comparisonStyles.selectField}>
              <span>System A</span>
              <select
                value={leftSystem.id}
                data-testid="heating-comparison-select-left"
                onChange={(event) => handleSelectChange("left", event.target.value)}
              >
                {systems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={comparisonStyles.selectField}>
              <span>System B</span>
              <select
                value={rightSystem.id}
                data-testid="heating-comparison-select-right"
                onChange={(event) => handleSelectChange("right", event.target.value)}
              >
                {systems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={comparisonStyles.mobileSwipeHint}>Auf dem Handy seitlich wischen.</div>

          <div className={comparisonStyles.tableScroller} data-testid="heating-comparison-table">
            <div className={comparisonStyles.tableGrid}>
              <div className={comparisonStyles.tableHeadSpacer} aria-hidden="true" />
              <div className={comparisonStyles.tableHead} data-testid="heating-comparison-heading-left">
                <span>{leftSystem.shortLabel}</span>
                <strong>{leftSystem.label}</strong>
              </div>
              <div className={comparisonStyles.tableHead} data-testid="heating-comparison-heading-right">
                <span>{rightSystem.shortLabel}</span>
                <strong>{rightSystem.label}</strong>
              </div>

              {HEATING_COMPARISON_CRITERIA.map((criterion) => {
                const tooltipId = `comparison-tooltip-${criterion.id}`;
                const isTooltipOpen = openTooltipId === criterion.id;

                return (
                  <div className={comparisonStyles.tableRow} key={criterion.id}>
                    <div className={comparisonStyles.criteriaCell}>
                      <span>{criterion.label}</span>
                      {criterion.tooltip ? (
                        <div
                          className={`${comparisonStyles.inlineInfoWrap} ${
                            isTooltipOpen ? comparisonStyles.inlineInfoWrapOpen : ""
                          }`}
                          onMouseLeave={() =>
                            setOpenTooltipId((currentValue) =>
                              currentValue === criterion.id ? null : currentValue,
                            )
                          }
                        >
                          <button
                            type="button"
                            className={comparisonStyles.inlineInfoButton}
                            aria-label={`${criterion.label} erklären`}
                            aria-describedby={tooltipId}
                            aria-expanded={isTooltipOpen}
                            data-testid={`heating-comparison-info-button-${criterion.id}`}
                            onClick={() =>
                              setOpenTooltipId((currentValue) =>
                                currentValue === criterion.id ? null : criterion.id,
                              )
                            }
                            onFocus={() => setOpenTooltipId(criterion.id)}
                            onBlur={() =>
                              setOpenTooltipId((currentValue) =>
                                currentValue === criterion.id ? null : currentValue,
                              )
                            }
                          >
                            i
                          </button>
                          <div
                            id={tooltipId}
                            role="tooltip"
                            className={comparisonStyles.inlineInfoTooltip}
                            data-testid={`heating-comparison-info-tooltip-${criterion.id}`}
                          >
                            <strong>{criterion.tooltip.title}</strong>
                            <p>{criterion.tooltip.body}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div
                      className={comparisonStyles.valueCell}
                      data-testid={`heating-comparison-value-left-${criterion.id}`}
                    >
                      {leftSystem.values[criterion.id]}
                    </div>
                    <div
                      className={comparisonStyles.valueCell}
                      data-testid={`heating-comparison-value-right-${criterion.id}`}
                    >
                      {rightSystem.values[criterion.id]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
