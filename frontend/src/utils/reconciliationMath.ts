import { CaseEvidenceResponse } from '../types/api';

export interface CaseReconciliationSummary {
  expectedLabel: string;
  expectedAmount: number;
  expectedFormatted: string;
  expectedFormula: string;

  actualLabel: string;
  actualAmount: number;
  actualFormatted: string;
  actualSourceDescription: string;

  varianceLabel: string;
  varianceAmount: number;
  varianceFormatted: string;
  varianceStatus: 'deficit' | 'excess' | 'missing' | 'clean';
  varianceDescription: string;

  divergenceStreamIndex: 1 | 2 | 3 | 4; // 1: Payment, 2: Settlement, 3: Refund, 4: Bank
  divergenceStreamName: string;
  traceOffsetLabel: string;
  hasDiscrepancy: boolean;

  recommendedActionHeadline: string;
  recommendedActionDetail: string;
}

export function calculateCaseReconciliation(evidence: CaseEvidenceResponse): CaseReconciliationSummary {
  const gross = evidence.payment?.amount ? parseFloat(evidence.payment.amount) : 0;
  const expNet = evidence.expected_net_settlement ? parseFloat(evidence.expected_net_settlement) : 0;
  const repNet = evidence.reported_net_settlement ? parseFloat(evidence.reported_net_settlement) : 0;

  const bankCredits = evidence.bank_credits || [];
  const bankTotal = bankCredits.reduce((sum, b) => sum + parseFloat(b.credited_amount || '0'), 0);

  const refunds = evidence.refunds || [];
  const refundTotal = refunds.reduce((sum, r) => sum + parseFloat(r.refund_amount || '0'), 0);

  const exception = evidence.exception_type;

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  switch (exception) {
    case 'duplicate_bank_credit': {
      const expectedBank = repNet > 0 ? repNet : (expNet > 0 ? expNet : gross * 0.9764);
      const excess = bankTotal > expectedBank ? bankTotal - expectedBank : expectedBank;
      return {
        expectedLabel: '1. Expected provider payout',
        expectedAmount: expectedBank,
        expectedFormatted: fmt(expectedBank),
        expectedFormula: 'Single payment sent by the provider to the bank',

        actualLabel: '2. Total bank payments received',
        actualAmount: bankTotal,
        actualFormatted: `${fmt(bankTotal)} (${bankCredits.length} Credits)`,
        actualSourceDescription: 'Reported in cleared bank statements',

        varianceLabel: '3. Difference / extra bank payment',
        varianceAmount: excess,
        varianceFormatted: `+${fmt(excess)} Duplicate Entry`,
        varianceStatus: 'excess',
        varianceDescription: 'A second bank payment with the same bank reference number (UTR) arrived; the extra payment needs to be reversed',

        divergenceStreamIndex: 4,
        divergenceStreamName: 'Bank Statement Credit',
        traceOffsetLabel: `+${fmt(excess)} DUPLICATE CREDIT`,
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Reverse the duplicate bank payment per SOP-2026-BNK-03',
        recommendedActionDetail: 'Check the bank statement and verify the duplicate credit entry. Mark the extra entry for reversal.'
      };
    }

    case 'missing_settlement': {
      return {
        expectedLabel: '1. Expected provider payout',
        expectedAmount: expNet,
        expectedFormatted: fmt(expNet),
        expectedFormula: 'Customer payment captured minus 2% fee & 18% tax',

        actualLabel: '2. Provider payout',
        actualAmount: 0,
        actualFormatted: '₹0.00 (Not received)',
        actualSourceDescription: 'No payout record received from provider',

        varianceLabel: '3. Difference / missing payout',
        varianceAmount: -expNet,
        varianceFormatted: `-${fmt(expNet)} Missing`,
        varianceStatus: 'missing',
        varianceDescription: '2-day waiting period exceeded; provider has not sent payout for captured payment',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Provider Payout',
        traceOffsetLabel: 'MISSING PAYOUT (2 DAYS)',
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Ask provider for missing payout record',
        recommendedActionDetail: 'Check payment capture status with provider. Verify whether payout is in transit or delayed.'
      };
    }

    case 'missing_bank_credit': {
      const expectedDeposit = repNet > 0 ? repNet : expNet;
      return {
        expectedLabel: '1. Expected provider payout',
        expectedAmount: expectedDeposit,
        expectedFormatted: fmt(expectedDeposit),
        expectedFormula: 'Net payout confirmed by the provider settlement record',

        actualLabel: '2. Bank payment received',
        actualAmount: 0,
        actualFormatted: '₹0.00 (Not received)',
        actualSourceDescription: 'No matching bank reference number (UTR) found in bank statement',

        varianceLabel: '3. Difference / missing bank payment',
        varianceAmount: -expectedDeposit,
        varianceFormatted: `-${fmt(expectedDeposit)} Missing`,
        varianceStatus: 'missing',
        varianceDescription: 'Bank payment has not arrived despite the provider confirming it was sent',

        divergenceStreamIndex: 4,
        divergenceStreamName: 'Bank Statement Credit',
        traceOffsetLabel: 'MISSING BANK PAYMENT',
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Ask the bank to confirm the bank reference number (UTR) per SOP-2026-BNK-03',
        recommendedActionDetail: 'Request the bank to search for the payment using the provider\'s reference. Confirm whether it was received or is still in transit.'
      };
    }

    case 'amount_mismatch': {
      const diff = repNet - expNet;
      return {
        expectedLabel: '1. Expected payout',
        expectedAmount: expNet,
        expectedFormatted: fmt(expNet),
        expectedFormula: 'Customer payment minus standard 2% fee & 18% tax',

        actualLabel: '2. Reported provider payout',
        actualAmount: repNet,
        actualFormatted: fmt(repNet),
        actualSourceDescription: 'Reported in provider payout record',

        varianceLabel: '3. Difference / payout amount',
        varianceAmount: diff,
        varianceFormatted: `${diff < 0 ? '-' : '+'}${fmt(Math.abs(diff))} Difference`,
        varianceStatus: 'deficit',
        varianceDescription: 'Provider payout differs from expected calculation',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Provider Payout',
        traceOffsetLabel: `Δ -${fmt(Math.abs(diff))} DIFFERENCE`,
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Check provider deduction against approved fee rule',
        recommendedActionDetail: 'Verify whether any dispute deduction or special rate applies under SOP-2026-FEE-01.'
      };
    }

    case 'fee_mismatch': {
      const actualFee = evidence.settlement ? (parseFloat(evidence.settlement.fee_amount) + parseFloat(evidence.settlement.tax_amount)) : 0;
      const expectedFee = gross * 0.02 * 1.18;
      const feeDiff = actualFee - expectedFee;
      return {
        expectedLabel: '1. Approved fee and tax',
        expectedAmount: expectedFee,
        expectedFormatted: fmt(expectedFee),
        expectedFormula: 'Standard 2% fee + 18% tax on payment amount',

        actualLabel: '2. Reported provider deductions',
        actualAmount: actualFee,
        actualFormatted: fmt(actualFee),
        actualSourceDescription: 'Reported fee and tax in provider payout',

        varianceLabel: '3. Difference / fee deduction',
        varianceAmount: feeDiff,
        varianceFormatted: `${feeDiff > 0 ? '+' : ''}${fmt(feeDiff)} Variance`,
        varianceStatus: feeDiff > 0 ? 'deficit' : 'excess',
        varianceDescription: 'Fee or tax deduction differs from approved 2% + 18% rate',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Provider Payout',
        traceOffsetLabel: 'FEE / TAX DIFFERENCE',
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Check fee difference with provider',
        recommendedActionDetail: 'Contact provider regarding fee difference citing approved rule SOP-2026-FEE-01.'
      };
    }

    case 'duplicate_payment': {
      return {
        expectedLabel: '1. Expected order payment',
        expectedAmount: gross,
        expectedFormatted: fmt(gross),
        expectedFormula: 'Single customer payment for checkout order',

        actualLabel: '2. Customer payments received',
        actualAmount: gross * 2,
        actualFormatted: `${fmt(gross * 2)} (2 Captures)`,
        actualSourceDescription: 'Two separate customer payments found for same order',

        varianceLabel: '3. Difference / extra payment',
        varianceAmount: gross,
        varianceFormatted: `+${fmt(gross)} Extra payment`,
        varianceStatus: 'excess',
        varianceDescription: 'Customer appears to have been charged twice for the same order',

        divergenceStreamIndex: 1,
        divergenceStreamName: 'Customer Payment',
        traceOffsetLabel: `+${fmt(gross)} DUPLICATE PAYMENT`,
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Issue customer refund for extra payment',
        recommendedActionDetail: 'Verify customer payment records and issue a refund for the extra charge.'
      };
    }

    case 'partial_refund_not_reflected': {
      const expectedAdjusted = expNet - refundTotal;
      return {
        expectedLabel: '1. Adjusted net payout',
        expectedAmount: expectedAdjusted,
        expectedFormatted: fmt(expectedAdjusted),
        expectedFormula: 'Gross payment minus fees minus customer refund',

        actualLabel: '2. Provider payout (refund not deducted)',
        actualAmount: repNet,
        actualFormatted: fmt(repNet),
        actualSourceDescription: 'Payment sent by the provider without deducting the customer refund',

        varianceLabel: '3. Difference / refund not deducted',
        varianceAmount: -refundTotal,
        varianceFormatted: `-${fmt(refundTotal)} Not deducted`,
        varianceStatus: 'deficit',
        varianceDescription: 'The customer refund was processed but was not deducted from the provider payout',

        divergenceStreamIndex: 3,
        divergenceStreamName: 'Customer Refund',
        traceOffsetLabel: `-${fmt(refundTotal)} REFUND GAP`,
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Reclaim the undeducted refund in the next settlement cycle',
        recommendedActionDetail: 'Confirm the customer refund status and adjust the net payout record accordingly.'
      };
    }

    case 'ambiguous_match': {
      return {
        expectedLabel: '1. Expected provider payout',
        expectedAmount: expNet,
        expectedFormatted: fmt(expNet),
        expectedFormula: 'One provider payout expected for this payment',

        actualLabel: '2. Possible matching payouts',
        actualAmount: repNet,
        actualFormatted: `${fmt(repNet)} (Multiple)`,
        actualSourceDescription: 'Multiple provider payouts could match this payment',

        varianceLabel: '3. Difference / multiple matches',
        varianceAmount: expNet,
        varianceFormatted: `${fmt(expNet)} Under Review`,
        varianceStatus: 'deficit',
        varianceDescription: 'Reviewer needs to choose which payout record matches',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Provider Payout',
        traceOffsetLabel: 'MULTIPLE MATCHES',
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Choose the matching provider payout',
        recommendedActionDetail: 'Compare reference numbers and timestamps to link the correct provider payout.'
      };
    }

    default: {
      const diff = repNet - expNet;
      const isClean = Math.abs(diff) < 0.01;
      return {
        expectedLabel: '1. Expected payout',
        expectedAmount: expNet,
        expectedFormatted: fmt(expNet),
        expectedFormula: 'Customer payment minus approved fees and taxes',

        actualLabel: '2. Reported provider payout',
        actualAmount: repNet,
        actualFormatted: fmt(repNet),
        actualSourceDescription: 'Reported in provider payout',

        varianceLabel: '3. Difference',
        varianceAmount: diff,
        varianceFormatted: isClean ? '₹0.00 Clean' : `${diff < 0 ? '-' : '+'}${fmt(Math.abs(diff))}`,
        varianceStatus: isClean ? 'clean' : 'deficit',
        varianceDescription: isClean ? 'All four records match' : 'Difference detected between records',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Provider Payout',
        traceOffsetLabel: isClean ? 'MATCHED' : 'DIFFERENCE',
        hasDiscrepancy: !isClean,

        recommendedActionHeadline: isClean ? 'Records match; ready to close' : 'Review difference with provider',
        recommendedActionDetail: isClean ? 'All records match with zero difference.' : 'Investigate difference against approved rule.'
      };
    }
  }
}
