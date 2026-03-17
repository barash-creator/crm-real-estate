import { CPP_MAX_EARNINGS, CPP_EXEMPTION, CPP_RATE_SELF } from "../constants/tax.js";

export function calcBracketTax(income, brackets, bpa) {
  const taxable = Math.max(0, income - bpa);
  let tax = 0;
  for (const b of brackets) {
    if (taxable <= b.min) break;
    const amt = Math.min(taxable, b.max) - b.min;
    tax += amt * b.rate;
  }
  return tax;
}

export function calcCPP(income) {
  const pensionable  = Math.min(income, CPP_MAX_EARNINGS);
  const contributory = Math.max(0, pensionable - CPP_EXEMPTION);
  return contributory * CPP_RATE_SELF;
}
