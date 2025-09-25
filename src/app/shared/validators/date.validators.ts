import { AbstractControl, ValidationErrors } from '@angular/forms';

function coerceToDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'string') {
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

/** منع التاريخ من أن يكون في المستقبل */
export function dateNotInFutureValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const dt = coerceToDate(control.value);
    if (!dt) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    return dt > today ? { futureDate: true } : null;
  };
}

export function toYMD(d: Date | null | undefined): string | null {
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function toDateSafe(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

