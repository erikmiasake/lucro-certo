// ─────────────────────────────────────────────────────────────────────
// modes/ — entry point. Páginas e componentes consomem getModeCopy().
// ─────────────────────────────────────────────────────────────────────
import type { BusinessType } from '@/lib/business-config';
import { isPersonalMode } from '@/lib/business-config';
import { businessCopy } from './business';
import { personalCopy } from './personal';
import type { AppMode, ModeCopy } from './types';

export type { AppMode, ModeCopy } from './types';
export { businessCopy, personalCopy };

export function getMode(businessType: BusinessType | null | undefined): AppMode {
  return isPersonalMode(businessType ?? null) ? 'personal' : 'business';
}

export function getModeCopy(mode: AppMode): ModeCopy {
  return mode === 'personal' ? personalCopy : businessCopy;
}

export function getModeCopyFromType(businessType: BusinessType | null | undefined): ModeCopy {
  return getModeCopy(getMode(businessType));
}
