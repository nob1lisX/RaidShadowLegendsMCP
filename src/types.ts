// Raid Shadow Legends commands
export enum RaidCommand {
  START_RAID = "raid_start",
  CLAN_BOSS = "clanboss",
  TOGGLE_AUTO = "raid_auto_toggle",
  END_RAID = "raid_end",
  LOCK_SCREEN = "raid_lock_toggle"
}

// Battle types
export enum BattleType {
  ARENA = "arena",
  CAMPAIGN = "campaign",
  DUNGEON = "dungeon",
  CLAN_BOSS = "clan_boss"
}

// Raid status
export interface RaidStatus {
  status: "idle" | "running" | "paused" | "completed" | "error" | "unknown";
  progress: number;
  battleCount: number;
  energyRemaining: number;
  lastUpdate: Date;
  currentActivity?: string;
  error?: string;
}

// Command parameters
export interface CommandParameters {
  [key: string]: string | number | boolean;
}

// Raid goal settings
export interface RaidGoal {
  battleCount: number;
  battleType: BattleType;
  autoSell?: boolean;
  energyRefill?: boolean;
}

// MQTT response
export interface MqttResponse {
  success: boolean;
  data?: any;
  error?: any;
}

// API command request
export interface CommandRequest {
  command: string;
  parameters?: CommandParameters;
}

// API response
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
} 