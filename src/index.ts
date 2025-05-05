import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import axios from "axios";
import { z } from "zod";
import RaidShadowLegendsButItsMCP from "./RaidShadowLegendsButItsMCP.js";
import {
  RaidStatus,
  MqttResponse,
  CommandRequest,
  ApiResponse,
  RaidGoal,
  BattleType
} from "./types.js";

// MQTT configuration
const MQTT_SERVER_URL = "http://localhost:9900/mqtt";

// Initialize server
const server = new McpServer({
  name: "RaidShadowLegendsButItsMCP",
  version: "1.0.0"
});

// Setup Express app
const app = express();
app.use(express.json());

// Cache for MQTT statuses
const statusCache: RaidStatus = {
  lastUpdate: new Date(),
  status: "unknown",
  progress: 0,
  battleCount: 0,
  energyRemaining: 0
};

// Helper function to publish to MQTT
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

// Helper function to get MQTT message
async function getMqttMessage(topic: string): Promise<MqttResponse> {
  try {
    const response = await axios.get(`${MQTT_SERVER_URL}?topic=${topic}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error getting MQTT message:", error);
    return { success: false, error };
  }
}

// Periodically update status cache
setInterval(async () => {
  const result = await getMqttMessage("status/raid");
  if (result.success && result.data) {
    try {
      const data = JSON.parse(result.data);
      statusCache.lastUpdate = new Date();
      statusCache.status = data.status || "unknown";
      statusCache.progress = data.progress || 0;
      statusCache.battleCount = data.battleCount || 0;
      statusCache.energyRemaining = data.energyRemaining || 0;
      statusCache.currentActivity = data.currentActivity;
      statusCache.error = data.error;
    } catch (e) {
      console.error("Error parsing MQTT status:", e);
    }
  }
}, 5000);

// Create an SSE endpoint that clients can connect to
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

// REST API for controlling Raid Shadow Legends

// Get current status
app.get("/api/status", (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      ...statusCache,
      timestamp: new Date()
    }
  };
  res.json(response);
});

// Command schema for validation
const commandSchema = z.object({
  command: z.string(),
  parameters: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});

// Send command to Raid
app.post("/api/command", async (req, res) => {
  try {
    const { command, parameters = {} } = commandSchema.parse(req.body) as CommandRequest;
    
    // Format parameters as a string if provided
    const paramString = Object.entries(parameters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // Define the message format based on the command type
    let message = command;
    if (paramString) {
      message += `?${paramString}`;
    }
    
    // Publish to the Raid commands topic
    const result = await publishToMqtt("commands/raid", message);
    
    const response: ApiResponse = result.success
      ? { success: true, message: `Command ${command} sent successfully` }
      : { success: false, error: "Failed to send command" };
    
    res.status(result.success ? 200 : 500).json(response);
  } catch (error) {
    const response: ApiResponse = { 
      success: false, 
      error: "Invalid command format" 
    };
    res.status(400).json(response);
  }
});

// Set goal schema for validation
const goalSchema = z.object({
  battleCount: z.number().min(1).max(100),
  battleType: z.enum([
    BattleType.ARENA,
    BattleType.CAMPAIGN,
    BattleType.DUNGEON,
    BattleType.CLAN_BOSS
  ]),
  autoSell: z.boolean().optional(),
  energyRefill: z.boolean().optional()
});

// Set goal for Raid
app.post("/api/goal", async (req, res) => {
  try {
    const goal = goalSchema.parse(req.body) as RaidGoal;
    
    // Format the goal message
    const message = JSON.stringify(goal);
    
    // Publish to the Raid goals topic
    const result = await publishToMqtt("commands/raid/goals", message);
    
    const response: ApiResponse = result.success
      ? { success: true, message: `Goal set: ${goal.battleCount} ${goal.battleType} battles` }
      : { success: false, error: "Failed to set goal" };
    
    res.status(result.success ? 200 : 500).json(response);
  } catch (error) {
    const response: ApiResponse = { 
      success: false, 
      error: "Invalid goal format" 
    };
    res.status(400).json(response);
  }
});

// Create an endpoint to receive messages from clients 
app.post("/messages", express.json(), async (req, res) => {
  // Handle the message and send response
  res.json({ success: true });
});

// Start HTTP server
const port = 3000;
app.listen(port, () => {
  console.log(`MCP server running on http://localhost:${port}`);
  console.log(`REST API available at http://localhost:${port}/api`);
  console.log(`SSE endpoint available at http://localhost:${port}/sse`);
}); 

// Initialize the RaidShadowLegendsButItsMCP component
RaidShadowLegendsButItsMCP(server);
