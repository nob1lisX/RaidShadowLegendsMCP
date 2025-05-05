# Raid Shadow Legends MCP Server

Control your Raid Shadow Legends Tasker automation via a Mission Control Protocol server.

## Overview

This project provides an MCP server that integrates with Tasker automation for Raid Shadow Legends. It allows you to:

- Control Raid Shadow Legends automation via MCP tools
- Set automation goals through a REST API
- Monitor game status via MQTT
- Interact with Tasker projects

## Prerequisites

- Node.js 18+
- MQTT broker running on port 9900
- Tasker installed on an Android device with the Raid automation project
- The Tasker project should be configured to listen to MQTT topics

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/RaidShadowLegendsButItsMCP.git

# Navigate to the project directory
cd RaidShadowLegendsButItsMCP

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## Configuration

The MCP server connects to an MQTT broker to communicate with Tasker. By default, it connects to:

```
http://localhost:9900/mqtt
```

To change this, modify the `MQTT_SERVER_URL` in both `src/index.ts` and `src/RaidShadowLegendsButItsMCP.ts`.

## API Usage

### REST API

#### Get Status

```
GET /api/status
```

Response:
```json
{
  "lastUpdate": "2023-11-01T12:34:56.789Z",
  "raidStatus": "running",
  "raidProgress": 75,
  "battleCount": 3,
  "energyRemaining": 84,
  "timestamp": "2023-11-01T12:35:00.123Z"
}
```

#### Send Command

```
POST /api/command
```

Request body:
```json
{
  "command": "raid_start",
  "parameters": {
    "mode": "campaign",
    "stage": 12
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Command raid_start sent successfully"
}
```

#### Set Goal

```
POST /api/goal
```

Request body:
```json
{
  "battleCount": 20,
  "battleType": "campaign",
  "autoSell": true,
  "energyRefill": false
}
```

Response:
```json
{
  "success": true,
  "message": "Goal set: 20 campaign battles"
}
```

### MCP Tools

The server provides the following MCP tools:

- `RaidShadowLegendsControl`: Send automation commands
- `RaidShadowLegendsStatus`: Get current game status
- `RaidShadowLegendsSetGoal`: Set automation goals

## MQTT Topics

The server publishes and subscribes to the following MQTT topics:

- `commands/raid`: General commands for the game
- `commands/raid/goals`: Goal settings
- `status/raid`: Status updates from the game

## Tasker Integration

The Tasker project should be configured to:

1. Subscribe to the MQTT topics
2. Parse and execute commands
3. Publish status updates back to the MQTT broker

## Available Commands

- `raid_start`: Start the Raid Shadow Legends app
- `clan_boss`: Navigate to and battle the Clan Boss
- `raid_auto_toggle`: Toggle auto-battle mode
- `raid_end`: End the current battle
- `raid_lock_toggle`: Toggle screen lock

## Troubleshooting

- **MQTT Connection Issues**: Ensure your MQTT broker is running and accessible
- **Tasker Not Responding**: Check that your Tasker project is correctly configured
- **Command Not Working**: Verify the command format and parameters

## TODO

- Add authentication for API access
- Implement more detailed status reporting
- Create a web dashboard for monitoring
- Add support for more complex automation workflows

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 