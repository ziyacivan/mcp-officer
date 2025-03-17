# LSPD Interrogation MCP Server

A Model Context Protocol (MCP) based police interrogation simulation server powered by OpenAI.

## 📌 Key Features

- **MCP Integration**:

  - Built using Model Context Protocol SDK
  - HTTP transport support
  - Dynamic resource management (officer-profile, conduct-interrogation)

- **OpenAI Integration**:

  - Uses GPT-3.5-turbo model
  - Generates dynamic interrogation strategies
  - Simulates suspect responses
  - Creates realistic dialogue flows

- **Core Components**:
  - Police officer profile management
  - Smart interrogation mechanics
  - Suspect behavior simulation
  - Crime type and evidence integration

## 🚀 Installation

```bash
npm install
# Required environment variables
cp .env.example .env
# Start server
npm start
```

## ⚙️ Configuration

`.env` file:

```ini
OPENAI_API_KEY=your_api_key_here
```

Configurable parameters in `config.ts`:

- AI model selection
- Maximum token count
- Temperature parameter (creativity level)

## 🌐 API Endpoints

### Officer Profile

`GET /profile/:badgeNumber`

```bash
curl http://localhost:3000/profile/1234
```

### Start Interrogation

`POST /interrogations/{suspectId}`

```json
{
  "suspectName": "John Doe",
  "pressureLevel": 75,
  "crime": "Armed robbery",
  "evidence": ["Fingerprint", "Security camera footage"]
}
```

### Suspect Response

`POST /interrogations/{suspectId}/respond`

```json
{
  "suspectName": "John Doe",
  "officerStatement": "Your fingerprints were found at the crime scene!",
  "guilt": 85,
  "personality": "cowardly",
  "previousResponses": ["I'm innocent!"]
}
```

## 🔍 Example Usage

```bash
# Get officer profile
curl http://localhost:3000/profile/1234

# Start interrogation
curl -X POST http://localhost:3000/interrogations/suspect_01 \
  -H "Content-Type: application/json" \
  -d '{
    "suspectName": "John Doe",
    "pressureLevel": 80,
    "crime": "Drug trafficking",
    "evidence": ["Search records", "Confidential witness statement"]
  }'
```

## ✅ Data Validation

All endpoints include strong type checking and validation using Zod library:

- Pressure Level: 0-100 (required)
- Suspect Name: string format
- Evidence: string array (optional)

## 🔒 Security

- Sensitive data (OpenAI API key) managed through environment variables
- HTTPS enforcement in production
- Secure input handling with request validation

## 🤝 Contribution

1. Fork the repository
2. Create new branch (`feat/my-feature` or `fix/issue-number`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📜 License

Distributed under the MIT License.
