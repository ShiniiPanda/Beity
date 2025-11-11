export type RoutineData = Record<string, Routine>;

export interface Routine {
  name: string;
  description: string;
  times: Array<RoutineOccurence>;
  interval: number;
}

export interface RoutineOccurence {
  date: string;
  actor: string;
}
