import type { ActivityLog } from '../../db/schema';

export interface SerializedActivityLog {
  id: string;
  actionType: string;
  description: string;
  createdAt: Date;
}

export class ActivitySerializer {
  serializeLog(log: Partial<ActivityLog>): SerializedActivityLog {
    return {
      id: log.id!,
      actionType: log.actionType!,
      description: log.description!,
      createdAt: log.createdAt!,
    };
  }

  serializeLogList(logs: Partial<ActivityLog>[]): SerializedActivityLog[] {
    return logs.map((l) => this.serializeLog(l));
  }
}

export const activitySerializer = new ActivitySerializer();
