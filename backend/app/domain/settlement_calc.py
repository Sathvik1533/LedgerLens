from decimal import Decimal, ROUND_HALF_UP
from typing import Tuple

def quantize_money(amount: Decimal) -> Decimal:
    """Quantize to 2 decimal places using standard financial rounding (HALF_UP)."""
    return amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def calculate_expected_settlement(
    gross_amount: Decimal,
    fee_rate: Decimal = Decimal('0.02'),
    tax_rate_on_fee: Decimal = Decimal('0.18')
) -> Tuple[Decimal, Decimal, Decimal]:
    """
    Calculate expected fee, tax, and net settlement with penny-exact Decimal arithmetic.
    Returns: (fee_amount, tax_amount, expected_net_settlement)
    """
    gross = quantize_money(gross_amount)
    fee = quantize_money(gross * fee_rate)
    tax = quantize_money(fee * tax_rate_on_fee)
    net = quantize_money(gross - fee - tax)
    return fee, tax, net
