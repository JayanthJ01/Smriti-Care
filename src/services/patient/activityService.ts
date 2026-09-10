import type { ActivityItem, ActivityKind, ActivityType } from '../../types';
import { nowDisplayTime, nowIso } from '../../utils/datetime';

let seq = 0;

/**
 * Centralized activity factory. UI components never mutate raw activity
 * arrays directly — they go through PatientDataContext which uses this
 * service, so a future queue (offline / Supabase) can hook in here.
 */
export function buildActivity(
  type: ActivityType,
  title: string,
  titleAssamese: string,
  kind: ActivityKind,
  detail: string,
  opts: { titleKey?: string; patientId?: string; meta?: Record<string, string | number | boolean | null> } = {},
): ActivityItem {
  seq += 1;
  return {
    id: `act-${Date.now()}-${seq}`,
    type,
    title,
    titleAssamese,
    titleKey: opts.titleKey,
    kind,
    detail,
    time: nowDisplayTime(),
    timestamp: nowIso(),
    patientId: opts.patientId,
    meta: opts.meta,
  };
}

export function prependActivity(list: ActivityItem[], item: ActivityItem, max = 12): ActivityItem[] {
  return [item, ...list].slice(0, max);
}

export const activityService = {
  build: buildActivity,
  prepend: prependActivity,
};