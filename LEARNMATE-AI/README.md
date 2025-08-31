# LearnAI - Educational AI Tools

A Next.js application that provides AI-powered educational tools including flashcards, quizzes, and a study buddy.

## Features

- **Flashcard Maker**: Generate flashcards from your notes
- **Quiz Creator**: Create multiple choice quizzes from text
- **Study Buddy**: Ask questions and get educational responses

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd nextjs-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## AI Features Setup (Optional)

The application works with or without Ollama, but for the full AI experience, you'll need to set up Ollama:

### Installing Ollama

1. Download and install Ollama from [https://ollama.ai](https://ollama.ai)

2. Pull the required model:
```bash
ollama pull llama3.2:1b
```

3. Start Ollama (it runs on localhost:11434 by default)

### Using AI Features

Once Ollama is running, the application will automatically use AI-powered responses for:
- Generating flashcards from your notes
- Creating quizzes from text content
- Providing study buddy responses

### Fallback Mode

If Ollama is not running, the application will still work with fallback responses:
- **Flashcards**: Simple sentence-based flashcard generation
- **Quiz**: Basic multiple choice questions based on text content
- **Study Buddy**: Keyword-based educational responses

You'll see a message indicating that Ollama is not running and instructions on how to enable it.

## API Endpoints

- `POST /api/flashcards` - Generate flashcards from notes
- `POST /api/quiz` - Create quizzes from text
- `POST /api/study-buddy` - Get study assistance

## Development

The application is built with:
- Next.js 14
- TypeScript
- Tailwind CSS
- Ollama for AI features

## Troubleshooting

### 500 Error on API Calls
If you see 500 errors in the console, it likely means Ollama is not running. The application will automatically fall back to basic functionality, but you'll see a message about enabling Ollama for full AI features.

### Ollama Connection Issues
- Ensure Ollama is running: `ollama serve`
- Check that the model is downloaded: `ollama list`
- Verify Ollama is accessible at `http://localhost:11434`

## License

This project is part of the India Accelerator OpenXAI 2025 hackathon. 