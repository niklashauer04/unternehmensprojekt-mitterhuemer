"use client";

import styles from "./price-indicator.module.css";
import { calculatePrice } from "../pricing";
import type { FormValues } from "../model";
import type { PriceLineItem } from "../pricing";

type Props = {
  values: FormValues;
};

function formatEur(n: number): string {
  return n.toLocaleString("de-AT") + " €";
}

function LineItemRow({ item }: { item: PriceLineItem }) {
  const isReduction = item.amount < 0;
  const isZero = item.amount === 0;

  return (
    <div className={`${styles.lineItem} ${item.isSubsidy ? styles.lineItemSubsidy : ""}`}>
      <div className={styles.lineItemLabel}>
        <span>{item.label}</span>
        {item.hint && <span className={styles.lineItemHint}>{item.hint}</span>}
      </div>
      {!isZero && (
        <span className={`${styles.lineItemAmount} ${isReduction ? styles.lineItemAmountNeg : ""}`}>
          {isReduction ? "−" : "+"} {formatEur(Math.abs(item.amount))}
        </span>
      )}
    </div>
  );
}

export function PriceIndicator({ values }: Props) {
  const result = calculatePrice(values);
  if (!result) return null;

  const hasFoerderung = result.foerderung > 0;
  const isRangeBased = !!result.range;

  // Für range-basierte Preise (Heizung): Anpassungszeilen (Aufschlag, Förderung) separat
  const adjustments = isRangeBased ? result.lineItems : [];
  // Für exakte Preise (PV): Alle Zeilen anzeigen
  const costItems = !isRangeBased ? result.lineItems.filter((i) => i.amount >= 0) : [];
  const subsidyItems = !isRangeBased ? result.lineItems.filter((i) => i.amount < 0) : [];

  return (
    <aside className={styles.indicator}>
      <div className={styles.header}>
        <span className={styles.label}>Kostenrahmen</span>
        {result.label && <span className={styles.sublabel}>{result.label}</span>}
      </div>

      {isRangeBased && result.range ? (
        // Heizung: Range-Anzeige mit Anpassungszeilen
        <div className={styles.body}>
          <div className={styles.rangeBlock}>
            <span className={styles.rangePrefix}>ca.</span>
            <span className={styles.rangeValues}>
              {formatEur(result.range.min)} – {formatEur(result.range.max)}
            </span>
          </div>
          {adjustments.length > 0 && (
            <div className={styles.lineItems}>
              {adjustments.map((item, i) => <LineItemRow key={i} item={item} />)}
            </div>
          )}
          {hasFoerderung && (
            <div className={styles.nettoBlock}>
              <span className={styles.nettoLabel}>Netto ca.</span>
              <span className={styles.nettoValue}>
                {formatEur(result.range.min - result.foerderung)} – {formatEur(result.range.max - result.foerderung)}
              </span>
            </div>
          )}
        </div>
      ) : (
        // PV: Vollständige Aufschlüsselung
        <div className={styles.body}>
          {costItems.length > 0 && (
            <div className={styles.lineItems}>
              {costItems.map((item, i) => <LineItemRow key={i} item={item} />)}
            </div>
          )}
          <div className={styles.bruttoBlock}>
            <span className={styles.bruttoLabel}>Brutto</span>
            <span className={styles.bruttoValue}>{formatEur(result.brutto)}</span>
          </div>
          {subsidyItems.length > 0 && (
            <div className={styles.lineItems}>
              {subsidyItems.map((item, i) => <LineItemRow key={i} item={item} />)}
            </div>
          )}
          <div className={styles.nettoBlock}>
            <span className={styles.nettoLabel}>Netto ca.</span>
            <span className={styles.nettoValue}>{formatEur(result.netto)}</span>
          </div>
        </div>
      )}

      <div className={styles.disclaimer}>* Orientierungswert — kein verbindliches Angebot</div>
    </aside>
  );
}
