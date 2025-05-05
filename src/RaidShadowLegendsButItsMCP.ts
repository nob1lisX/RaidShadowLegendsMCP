import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { 
  RaidCommand, 
  BattleType, 
  MqttResponse,
  CommandParameters
} from "./types.js";

// MQTT broker configuration
const MQTT_SERVER_URL = "http://localhost:9900/mqtt";

// Function to publish a message to MQTT for Tasker to consume
async function publishToMqtt(topic: string, message: string, retain: boolean = true): Promise<MqttResponse> {
  try {
    const response = await axios.post(MQTT_SERVER_URL, {
      topic,
      message,
      retain
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error publishing to MQTT:", error);
    return { success: false, error };
  }
}

export default (server: McpServer) => {
  // Define the Raid Shadow Legends control tool
  server.tool(
    "RaidShadowLegendsControl",
    "Control Raid Shadow Legends automation via Tasker",
    {
      command: z.enum([
        RaidCommand.START_RAID,
        RaidCommand.CLAN_BOSS,
        RaidCommand.TOGGLE_AUTO,
        RaidCommand.END_RAID,
        RaidCommand.LOCK_SCREEN
      ]).describe("The Raid automation command to execute"),
      
      parameters: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
        .describe("Optional parameters for the command")
    },
    async (params) => {
      const { command, parameters = {} } = params;
      
      // Format parameters as a string if provided
      const paramString = formatParameters(parameters);
      
      // Define the message format based on the command type
      let message = command.toString();
      if (paramString) {
        message += `?${paramString}`;
      }
      
      // Publish to the Raid commands topic
      const result = await publishToMqtt("commands/raid", message);
      
      if (result.success) {
        return {
          content: [{
            type: "text",
            text: `Successfully sent ${command} command to Raid automation`
          }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: `Error sending command: ${JSON.stringify(result.error)}`
          }]
        };
      }
    }
  );

  // Define a tool to get the current Raid status
  server.tool(
    "RaidShadowLegendsStatus",
    "Get the current status of Raid Shadow Legends automation",
    {},
    async () => {
      try {
        const response = await axios.get(`${MQTT_SERVER_URL}/status`);
        
        return {
          content: [{
            type: "text",
            text: `Current Raid Status: ${JSON.stringify(response.data)}`
          }]
        };
      } catch (error) {
        console.error("Error fetching Raid status:", error);
        return {
          content: [{
            type: "text",
            text: `Error fetching Raid status: ${JSON.stringify(error)}`
          }]
        };
      }
    }
  );

  // Define a tool to set automation goals for Raid
  server.tool(
    "RaidShadowLegendsSetGoal",
    "Set automation goals for Raid Shadow Legends",
    {
      battleCount: z.number()
        .min(1)
        .max(100)
        .describe("Number of battles to complete"),
      
      battleType: z.enum([
        BattleType.ARENA,
        BattleType.CAMPAIGN,
        BattleType.DUNGEON,
        BattleType.CLAN_BOSS
      ]).describe("Type of battles to run"),
      
      autoSell: z.boolean()
        .optional()
        .describe("Auto-sell artifacts after battles"),
      
      energyRefill: z.boolean()
        .optional()
        .describe("Use gems to refill energy when empty")
    },
    async (params) => {
      const { battleCount, battleType, autoSell = false, energyRefill = false } = params;
      
      // Format the goal message
      const message = JSON.stringify({
        battleCount,
        battleType,
        autoSell,
        energyRefill
      });
      
      // Publish to the Raid goals topic
      const result = await publishToMqtt("commands/raid/goals", message);
      
      if (result.success) {
        return {
          content: [{
            type: "text",
            text: `Successfully set Raid automation goal: ${battleCount} ${battleType} battles`
          }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: `Error setting goal: ${JSON.stringify(result.error)}`
          }]
        };
      }
    }
  );
}

// Helper function to format parameters
function formatParameters(parameters: CommandParameters): string {
  return Object.entries(parameters)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}