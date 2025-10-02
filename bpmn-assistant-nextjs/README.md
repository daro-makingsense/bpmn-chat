# BPMN Assistant - Next.js Implementation

A full-stack Next.js implementation of the BPMN Assistant, featuring AI-powered BPMN diagram creation, analysis, modification, and explanation.

## Features

- **AI-Powered BPMN Assistant**: Create, analyze, modify, and explain BPMN diagrams using OpenAI GPT-4
- **Real-time Streaming**: Stream AI responses for better user experience
- **BPMN Editor**: Full-featured BPMN diagram editor powered by bpmn-js
- **Auto Layout**: Automatically layout BPMN diagrams using bpmn-auto-layout
- **Modern UI**: Built with ShadCN UI components and Tailwind CSS
- **State Management**: Powered by Zustand for efficient state management

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: ShadCN UI
- **State Management**: Zustand
- **BPMN Engine**: bpmn-js
- **AI**: OpenAI GPT-4 API
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Installation

1. Clone the repository:
```bash
cd bpmn-assistant-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Assistant Modes

- **Create**: Describe a business process and the assistant will generate a BPMN diagram
- **Analyze**: Upload or create a diagram and get insights about potential improvements
- **Modify**: Request changes to existing diagrams
- **Explain**: Get explanations about BPMN diagrams and their elements

### Example Prompts

**Create Mode:**
- "Create a BPMN diagram for an online order process"
- "Design a vacation request approval workflow"

**Analyze Mode:**
- "Analyze this diagram for potential bottlenecks"
- "Check if this process follows BPMN best practices"

**Modify Mode:**
- "Add an approval gateway after the review task"
- "Split the payment process into two parallel tasks"

**Explain Mode:**
- "Explain what this diagram represents"
- "What does the XOR gateway do in this process?"

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── api/             # API routes
│   │   ├── assistant/   # AI assistant endpoint
│   │   └── bpmn/       # BPMN-specific endpoints
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/          # React components
│   ├── ui/             # ShadCN UI components
│   ├── bpmn-editor.tsx # BPMN diagram editor
│   └── chat.tsx        # Chat interface
├── services/           # Service modules
│   ├── bpmn-assistant-service.ts
│   ├── bpmn-service.ts
│   └── openai-service.ts
├── store/              # Zustand stores
│   └── bpmn-store.ts
├── types/              # TypeScript types
│   └── bpmn.ts
└── lib/                # Utilities
    └── utils.ts
```

## Development

### Adding New Features

1. **New Assistant Capabilities**: Modify `src/services/bpmn-assistant-service.ts`
2. **UI Components**: Add to `src/components/`
3. **API Endpoints**: Create in `src/app/api/`
4. **State Management**: Update `src/store/bpmn-store.ts`

### Testing

Run the linter:
```bash
npm run lint
```

Build the project:
```bash
npm run build
```

## Credits

This is a Next.js implementation of the original [BPMN Assistant](https://github.com/jtlicardo/bpmn-assistant) project.

## License

MIT