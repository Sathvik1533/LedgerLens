import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  ReviewQueueItem,
  CaseEvidenceResponse,
  AuditEventItem,
  ExceptionType,
  PaymentFacts,
  SettlementFacts,
  BankCreditFacts,
  RefundFacts,
} from '../types/api';

export interface DemoRunState {
  runId: string;
  seed: number;
  totalRecords: number;
  matchedCount: number;
  reviewCount: number;
  unresolvedCount: number;
  matchRate: number;
  totalAmountReconciled: string;
  moneyToCheck: string;
  paymentsCount: number;
  settlementsCount: number;
  refundsCount: number;
  bankCreditsCount: number;
  exceptionBreakdown: Record<string, number>;
  cases: ReviewQueueItem[];
  caseEvidenceMap: Record<string, CaseEvidenceResponse>;
  auditEvents: AuditEventItem[];
}

interface DemoSimulationContextType {
  isDemoMode: boolean;
  isSimulating: boolean;
  demoRun: DemoRunState | null;
  startNewDemoRun: (customSeed?: number) => Promise<void>;
  clearToZeroRecords: () => void;
  exitDemoMode: () => void;
}

const DemoSimulationContext = createContext<DemoSimulationContextType | undefined>(undefined);

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function createPrng(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DemoSimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [demoRun, setDemoRun] = useState<DemoRunState | null>(null);

  const clearToZeroRecords = useCallback(() => {
    setIsDemoMode(true);
    setDemoRun({
      runId: 'RUN-DEMO-ZERO',
      seed: 0,
      totalRecords: 0,
      matchedCount: 0,
      reviewCount: 0,
      unresolvedCount: 0,
      matchRate: 0,
      totalAmountReconciled: '0.00',
      moneyToCheck: '0.00',
      paymentsCount: 0,
      settlementsCount: 0,
      refundsCount: 0,
      bankCreditsCount: 0,
      exceptionBreakdown: {},
      cases: [],
      caseEvidenceMap: {},
      auditEvents: [
        {
          id: 'audit-zero-init',
          event_type: 'demo_environment_reset',
          actor: 'Demo Reviewer',
          case_id: null,
          batch_id: 'batch_demo_0',
          previous_status: 'populated',
          new_status: 'zero_records',
          occurred_at: new Date().toISOString(),
        },
      ],
    });
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setDemoRun(null);
  }, []);

  const startNewDemoRun = useCallback(async (customSeed?: number) => {
    setIsSimulating(true);
    // Short realistic operational delay
    await new Promise((res) => setTimeout(res, 400));

    const seed = customSeed !== undefined ? customSeed : Math.floor(Math.random() * 89999) + 10001;
    const prng = createPrng(seed);

    const totalRecords = 60;
    const exceptionTypes: ExceptionType[] = [
      'amount_mismatch',
      'fee_mismatch',
      'missing_settlement',
      'missing_bank_credit',
      'duplicate_payment',
      'duplicate_bank_credit',
      'partial_refund_not_reflected',
      'ambiguous_match',
    ];

    // Decide number of matches: between 40 and 44 matches (66.7% to 73.3%)
    const matchedCount = 40 + Math.floor(prng() * 5); // 40, 41, 42, 43, or 44
    const reviewCount = totalRecords - matchedCount;
    const unresolvedCount = 0;
    const matchRate = parseFloat(((matchedCount / totalRecords) * 100).toFixed(1));

    let sumReconciled = 0;
    let sumDiscrepancy = 0;
    const breakdown: Record<string, number> = {};
    const generatedCases: ReviewQueueItem[] = [];
    const evidenceMap: Record<string, CaseEvidenceResponse> = {};

    let paymentsCount = 0;
    let settlementsCount = 0;
    let refundsCount = 0;
    let bankCreditsCount = 0;

    for (let i = 1; i <= totalRecords; i++) {
      const isCleanMatch = i <= matchedCount;
      const baseAmount = Math.round((1000 + prng() * 24000) * 100) / 100;
      const feeMdr = Math.round(baseAmount * 0.02 * 100) / 100;
      const feeGst = Math.round(feeMdr * 0.18 * 100) / 100;
      const totalFee = Math.round((feeMdr + feeGst) * 100) / 100;
      const netExpected = Math.round((baseAmount - totalFee) * 100) / 100;

      paymentsCount++;

      if (isCleanMatch) {
        sumReconciled += baseAmount;
        settlementsCount++;
        bankCreditsCount++;
      } else {
        // Exception record
        const excIndex = (i - matchedCount - 1) % exceptionTypes.length;
        const excType = exceptionTypes[excIndex];
        breakdown[excType] = (breakdown[excType] || 0) + 1;

        let caseDiscrepancy = 0;
        const paymentObj: PaymentFacts = {
          payment_id: `pay_demo_${seed}_${i}`,
          order_id: `order_demo_${seed}_${i}`,
          merchant_id: 'merchant_razorpay_demo',
          amount: baseAmount.toFixed(2),
          currency: 'INR',
          status: 'captured',
          payment_timestamp: new Date(Date.now() - (60 - i) * 60000).toISOString(),
          settlement_id: excType === 'missing_settlement' ? null : `set_demo_${seed}_${i}`,
        };

        let settlementObj: SettlementFacts | null = null;
        let refundList: RefundFacts[] = [];
        let bankCreditList: BankCreditFacts[] = [];

        if (excType === 'missing_settlement') {
          // Payout missing
          caseDiscrepancy = baseAmount;
          sumDiscrepancy += caseDiscrepancy;
        } else if (excType === 'missing_bank_credit') {
          // Settlement arrived, bank credit missing
          settlementsCount++;
          caseDiscrepancy = netExpected;
          sumDiscrepancy += caseDiscrepancy;
          settlementObj = {
            settlement_id: `set_demo_${seed}_${i}`,
            gross_payment_amount: baseAmount.toFixed(2),
            fee_amount: feeMdr.toFixed(2),
            tax_amount: feeGst.toFixed(2),
            net_settlement_amount: netExpected.toFixed(2),
            settlement_timestamp: new Date(Date.now() - (60 - i) * 50000).toISOString(),
            settlement_status: 'processed',
          };
        } else if (excType === 'fee_mismatch') {
          settlementsCount++;
          bankCreditsCount++;
          const feeDeviation = Math.round((25 + prng() * 75) * 100) / 100;
          caseDiscrepancy = feeDeviation;
          sumDiscrepancy += caseDiscrepancy;
          const actualFee = feeMdr + feeDeviation;
          const actualNet = Math.round((baseAmount - actualFee - feeGst) * 100) / 100;
          settlementObj = {
            settlement_id: `set_demo_${seed}_${i}`,
            gross_payment_amount: baseAmount.toFixed(2),
            fee_amount: actualFee.toFixed(2),
            tax_amount: feeGst.toFixed(2),
            net_settlement_amount: actualNet.toFixed(2),
            settlement_timestamp: new Date(Date.now() - (60 - i) * 50000).toISOString(),
            settlement_status: 'processed',
          };
          bankCreditList.push({
            bank_credit_id: `bnk_demo_${seed}_${i}`,
            bank_account_id: 'acc_demo_01',
            bank_name: 'HDFC Bank',
            bank_reference: `DEMOUTR${seed}${i}`,
            credited_amount: actualNet.toFixed(2),
            currency: 'INR',
            bank_credit_timestamp: new Date(Date.now() - (60 - i) * 40000).toISOString(),
            bank_credit_status: 'credited',
            narration: `CMS/UPI/DEMOUTR${seed}${i}`,
          });
        } else if (excType === 'amount_mismatch') {
          settlementsCount++;
          bankCreditsCount++;
          const amountDiff = Math.round((50 + prng() * 150) * 100) / 100;
          caseDiscrepancy = amountDiff;
          sumDiscrepancy += caseDiscrepancy;
          const credited = Math.round((netExpected - amountDiff) * 100) / 100;
          settlementObj = {
            settlement_id: `set_demo_${seed}_${i}`,
            gross_payment_amount: baseAmount.toFixed(2),
            fee_amount: feeMdr.toFixed(2),
            tax_amount: feeGst.toFixed(2),
            net_settlement_amount: netExpected.toFixed(2),
            settlement_timestamp: new Date(Date.now() - (60 - i) * 50000).toISOString(),
            settlement_status: 'processed',
          };
          bankCreditList.push({
            bank_credit_id: `bnk_demo_${seed}_${i}`,
            bank_account_id: 'acc_demo_01',
            bank_name: 'HDFC Bank',
            bank_reference: `DEMOUTR${seed}${i}`,
            credited_amount: credited.toFixed(2),
            currency: 'INR',
            bank_credit_timestamp: new Date(Date.now() - (60 - i) * 40000).toISOString(),
            bank_credit_status: 'credited',
            narration: `CMS/UPI/DEMOUTR${seed}${i}`,
          });
        } else if (excType === 'partial_refund_not_reflected') {
          settlementsCount++;
          bankCreditsCount++;
          refundsCount++;
          const refundAmt = Math.round(baseAmount * 0.25 * 100) / 100;
          caseDiscrepancy = refundAmt;
          sumDiscrepancy += caseDiscrepancy;
          refundList.push({
            refund_id: `rfnd_demo_${seed}_${i}`,
            refund_amount: refundAmt.toFixed(2),
            currency: 'INR',
            refund_status: 'processed',
            refund_type: 'customer_return',
            refund_timestamp: new Date(Date.now() - (60 - i) * 55000).toISOString(),
          });
          settlementObj = {
            settlement_id: `set_demo_${seed}_${i}`,
            gross_payment_amount: baseAmount.toFixed(2),
            fee_amount: feeMdr.toFixed(2),
            tax_amount: feeGst.toFixed(2),
            net_settlement_amount: netExpected.toFixed(2),
            settlement_timestamp: new Date(Date.now() - (60 - i) * 50000).toISOString(),
            settlement_status: 'processed',
          };
          bankCreditList.push({
            bank_credit_id: `bnk_demo_${seed}_${i}`,
            bank_account_id: 'acc_demo_01',
            bank_name: 'HDFC Bank',
            bank_reference: `DEMOUTR${seed}${i}`,
            credited_amount: netExpected.toFixed(2),
            currency: 'INR',
            bank_credit_timestamp: new Date(Date.now() - (60 - i) * 40000).toISOString(),
            bank_credit_status: 'credited',
            narration: `CMS/UPI/DEMOUTR${seed}${i}`,
          });
        } else {
          // General discrepancy
          settlementsCount++;
          bankCreditsCount++;
          const generalDiff = Math.round((20 + prng() * 80) * 100) / 100;
          caseDiscrepancy = generalDiff;
          sumDiscrepancy += caseDiscrepancy;
          settlementObj = {
            settlement_id: `set_demo_${seed}_${i}`,
            gross_payment_amount: baseAmount.toFixed(2),
            fee_amount: feeMdr.toFixed(2),
            tax_amount: feeGst.toFixed(2),
            net_settlement_amount: netExpected.toFixed(2),
            settlement_timestamp: new Date(Date.now() - (60 - i) * 50000).toISOString(),
            settlement_status: 'processed',
          };
          bankCreditList.push({
            bank_credit_id: `bnk_demo_${seed}_${i}`,
            bank_account_id: 'acc_demo_01',
            bank_name: 'HDFC Bank',
            bank_reference: `DEMOUTR${seed}${i}`,
            credited_amount: (netExpected - generalDiff).toFixed(2),
            currency: 'INR',
            bank_credit_timestamp: new Date(Date.now() - (60 - i) * 40000).toISOString(),
            bank_credit_status: 'credited',
            narration: `CMS/UPI/DEMOUTR${seed}${i}`,
          });
        }

        const caseId = `CASE-DEMO-${seed}-${i}`;
        const queueItem: ReviewQueueItem = {
          case_id: caseId,
          payment_id: paymentObj.payment_id,
          exception_type: excType,
          decision_status: 'needs_review',
          confidence: 'high',
          expected_net_settlement: netExpected.toFixed(2),
          reported_net_settlement: settlementObj?.net_settlement_amount ?? null,
          settlement_discrepancy: caseDiscrepancy.toFixed(2),
          amount_at_risk: caseDiscrepancy.toFixed(2),
          case_opened_at: new Date(Date.now() - (60 - i) * 30000).toISOString(),
        };
        generatedCases.push(queueItem);

        evidenceMap[caseId] = {
          case_id: caseId,
          payment_id: paymentObj.payment_id,
          exception_type: excType,
          decision_status: 'needs_review',
          expected_net_settlement: netExpected.toFixed(2),
          reported_net_settlement: settlementObj?.net_settlement_amount ?? null,
          settlement_discrepancy: caseDiscrepancy.toFixed(2),
          currency: 'INR',
          version: 1,
          case_opened_at: new Date(Date.now() - (60 - i) * 30000).toISOString(),
          payment: paymentObj,
          settlement: settlementObj,
          bank_credits: bankCreditList,
          refunds: refundList,
        };
      }
    }

    const runId = `RUN-DEMO-${seed}`;
    const auditEvents: AuditEventItem[] = [
      {
        id: `audit-${seed}-1`,
        event_type: 'reconciliation_batch_completed',
        actor: 'Deterministic Parity Core',
        case_id: null,
        batch_id: runId,
        previous_status: 'pending',
        new_status: `reconciled_${matchedCount}_of_${totalRecords}`,
        occurred_at: new Date().toISOString(),
      },
      {
        id: `audit-${seed}-2`,
        event_type: 'synthetic_intake_loaded',
        actor: 'Demo Environment Engine',
        case_id: null,
        batch_id: runId,
        previous_status: 'empty',
        new_status: 'loaded_60_records',
        occurred_at: new Date(Date.now() - 1000).toISOString(),
      },
    ];

    setDemoRun({
      runId,
      seed,
      totalRecords,
      matchedCount,
      reviewCount,
      unresolvedCount,
      matchRate,
      totalAmountReconciled: sumReconciled.toFixed(2),
      moneyToCheck: sumDiscrepancy.toFixed(2),
      paymentsCount,
      settlementsCount,
      refundsCount,
      bankCreditsCount,
      exceptionBreakdown: breakdown,
      cases: generatedCases,
      caseEvidenceMap: evidenceMap,
      auditEvents,
    });

    setIsDemoMode(true);
    setIsSimulating(false);
  }, []);

  return (
    <DemoSimulationContext.Provider
      value={{
        isDemoMode,
        isSimulating,
        demoRun,
        startNewDemoRun,
        clearToZeroRecords,
        exitDemoMode,
      }}
    >
      {children}
    </DemoSimulationContext.Provider>
  );
};

export const useDemoSimulation = () => {
  const ctx = useContext(DemoSimulationContext);
  if (!ctx) {
    throw new Error('useDemoSimulation must be used within DemoSimulationProvider');
  }
  return ctx;
};
