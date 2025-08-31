import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json()

    if (!notes) {
      return NextResponse.json(
        { error: 'Notes are required' },
        { status: 400 }
      )
    }

    const prompt = `Create flashcards from the following notes. Generate 5-8 flashcards in JSON format with the following structure:
{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ]
}

Focus on key concepts, definitions, and important facts. Make questions clear and answers concise.

Notes: ${notes}`

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:1b',
          prompt: prompt,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama responded with status: ${response.status}`)
      }

      const data = await response.json()
      
      try {
        // Try to parse JSON from the response
        const flashcardsMatch = data.response.match(/\{[\s\S]*\}/)
        if (flashcardsMatch) {
          const flashcardsData = JSON.parse(flashcardsMatch[0])
          return NextResponse.json(flashcardsData)
        }
      } catch (parseError) {
        // If JSON parsing fails, return a structured response
        console.log('Could not parse JSON, returning formatted response')
      }

      // Fallback: create a simple structure from the response
      return NextResponse.json({
        flashcards: [
          {
            front: "Generated from your notes",
            back: data.response || 'No response from model'
          }
        ]
      })
    } catch (ollamaError) {
      console.error('Ollama connection error:', ollamaError)
      
      // Fallback response when Ollama is not available
      const fallbackFlashcards = generateFallbackFlashcards(notes)
      return NextResponse.json({
        flashcards: fallbackFlashcards,
        message: "Ollama is not running. Using fallback flashcards. To enable AI-powered flashcards, please start Ollama with: ollama run llama3.2:1b"
      })
    }
  } catch (error) {
    console.error('Flashcards API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    )
  }
}

function generateFallbackFlashcards(notes: string) {
  // Simple fallback flashcard generation
  const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const flashcards = []
  
  for (let i = 0; i < Math.min(5, sentences.length); i++) {
    const sentence = sentences[i].trim()
    if (sentence.length > 20) {
      const words = sentence.split(' ')
      const midPoint = Math.floor(words.length / 2)
      
      flashcards.push({
        front: words.slice(0, midPoint).join(' ') + '...',
        back: words.slice(midPoint).join(' ')
      })
    }
  }
  
  // If we don't have enough sentences, create generic flashcards
  while (flashcards.length < 3) {
    flashcards.push({
      front: `Key concept ${flashcards.length + 1}`,
      back: "Review your notes for important concepts and definitions."
    })
  }
  
  return flashcards
} 