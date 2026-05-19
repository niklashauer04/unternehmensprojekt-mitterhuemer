"use client";

import styles from "./price-indicator.module.css";
import { calculatePrice } from "../pricing";
import type { FormValues } from "../model";

type Props = {
  values: FormValues;
  className?: string;
};

function formatEur(n: number): string {
  return n.toLocaleString("de-AT") + " €";
}

export function PriceIndicator({ values, className }: Props) {
  const result = calculatePrice(values);

  if (!result) return null;

  const hasRange = result.range.min !== result.range.max;
  const hasFoerderung = result.foerderung > 0;

  return (
    <aside className={[styles.indicator, className].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <span className={styles.label}>Kostenrahmen</span>
        {result.label && <span className={styles.sublabel}>{result.label}</span>}
      </div>
      <div className={styles.body}>
        {hasRange ? (
          <div className={styles.priceRange}>
            <span className={styles.rangeLabel}>ca.</span>
            <span className={styles.rangeValues}>
              {formatEur(result.range.min)} – {formatEur(result.range.max)}
            </span>
          </div>
        ) : (
          <div className={styles.priceExact}>
            <span className={styles.rangeLabel}>ca.</span>
            <span className={styles.exactValue}>{formatEur(result.brutto)}</span>
          </div>
        )}
        {hasFoerderung && (
          <div className={styles.foerderung}>
            <span className={styles.foerderungLabel}>Förderung</span>
            <span className={styles.foerderungValue}>– {formatEur(result.foerderung)}</span>
          </div>
        )}
        {hasFoerderung && (
          <div className={styles.netto}>
            <span className={styles.nettoLabel}>Netto ca.</span>
            <span className={styles.nettoValue}>{formatEur(result.netto)}</span>
          </div>
        )}
      </div>
      {result.foerderungHint && (
        <div className={styles.hint}>{result.foerderungHint}</div>
      )}
      <div className={styles.disclaimer}>* Orientierungswert — kein verbindliches Angebot</div>
    </aside>
  );
}
