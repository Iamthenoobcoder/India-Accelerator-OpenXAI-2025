import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const prompt = `Create a quiz from the following text. Generate 4-6 multiple choice questions in JSON format with the following structure:
{
  "quiz": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Make questions challenging but fair, with plausible distractors for incorrect options.

Text: ${text}`

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
        const quizMatch = data.response.match(/\{[\s\S]*\}/)
        if (quizMatch) {
          const quizData = JSON.parse(quizMatch[0])
          return NextResponse.json(quizData)
        }
      } catch (parseError) {
        console.log('Could not parse JSON, returning formatted response')
      }

      // Fallback: create a simple quiz structure
      return NextResponse.json({
        quiz: [
          {
            question: "What is the main topic of the provided text?",
            options: ["Topic A", "Topic B", "Topic C", "Topic D"],
            correct: 0,
            explanation: data.response || 'Generated from your text'
          }
        ]
      })
    } catch (ollamaError) {
      console.error('Ollama connection error:', ollamaError)
      
      // Fallback response when Ollama is not available
      const fallbackQuiz = generateFallbackQuiz(text)
      return NextResponse.json({
        quiz: fallbackQuiz,
        message: "Ollama is not running. Using fallback quiz. To enable AI-powered quizzes, please start Ollama with: ollama run llama3.2:1b"
      })
    }
  } catch (error) {
    console.error('Quiz API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}

function generateFallbackQuiz(text: string) {
  // Simple fallback quiz generation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
  
  const quiz = []
  
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const sentence = sentences[i].trim()
    if (sentence.length > 20) {
      const words = sentence.split(' ')
      const keyWord = words[Math.floor(words.length / 2)]
      
      quiz.push({
        question: `What is the main concept discussed in: "${sentence.substring(0, 50)}..."?`,
        options: [
          keyWord || "Main concept",
          "Secondary concept", 
          "Unrelated topic",
          "Background information"
        ],
        correct: 0,
        explanation: "This question tests your understanding of the main concepts in the provided text."
      })
    }
  }
  
  // If we don't have enough sentences, create generic quiz questions
  while (quiz.length < 2) {
    quiz.push({
      question: `What is the primary focus of the provided text?`,
      options: [
        "Key concepts and definitions",
        "Historical background", 
        "Technical details",
        "General overview"
      ],
      correct: 0,
      explanation: "Review the text to identify the main topics and key concepts discussed."
    })
  }
  
  return quiz
} 