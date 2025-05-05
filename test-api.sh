#!/bin/bash

# Test Raid Shadow Legends MCP API
# This script tests the various endpoints of the Raid Shadow Legends MCP API

SERVER="http://localhost:3000"

echo "Testing Raid Shadow Legends MCP API..."
echo "======================================="

# Test status endpoint
echo -e "\nTesting GET /api/status:"
curl -s "${SERVER}/api/status" | jq

# Test sending a command
echo -e "\nTesting POST /api/command (raid_start):"
curl -s -X POST -H "Content-Type: application/json" \
     -d '{"command": "raid_start", "parameters": {"mode": "campaign"}}' \
     "${SERVER}/api/command" | jq

# Test clan boss command
echo -e "\nTesting POST /api/command (clanboss):"
curl -s -X POST -H "Content-Type: application/json" \
     -d '{"command": "clanboss"}' \
     "${SERVER}/api/command" | jq

# Test toggle auto command
echo -e "\nTesting POST /api/command (raid_auto_toggle):"
curl -s -X POST -H "Content-Type: application/json" \
     -d '{"command": "raid_auto_toggle"}' \
     "${SERVER}/api/command" | jq

# Test setting a goal
echo -e "\nTesting POST /api/goal:"
curl -s -X POST -H "Content-Type: application/json" \
     -d '{"battleCount": 10, "battleType": "campaign", "autoSell": true, "energyRefill": false}' \
     "${SERVER}/api/goal" | jq

echo -e "\nAPI tests complete!" 