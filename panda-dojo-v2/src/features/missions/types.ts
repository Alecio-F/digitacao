export interface DailyMission {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  target: number;
  progress: number;
  completed: boolean;
  rewarded: boolean;
}
