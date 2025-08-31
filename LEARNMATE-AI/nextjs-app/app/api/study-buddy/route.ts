import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const prompt = `You are a helpful study buddy AI. Answer the following question in a clear, educational way. Provide explanations, examples, and encourage learning. Be friendly and supportive.

Question: ${question}`

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
      
      return NextResponse.json({ 
        answer: data.response || 'I could not process your question. Please try again!' 
      })
    } catch (ollamaError) {
      console.error('Ollama connection error:', ollamaError)
      
      // Fallback response when Ollama is not available
      const fallbackAnswer = generateFallbackAnswer(question)
      return NextResponse.json({
        answer: fallbackAnswer,
        message: "Ollama is not running. Using fallback response. To enable AI-powered study assistance, please start Ollama with: ollama run llama3.2:1b"
      })
    }
  } catch (error) {
    console.error('Study Buddy API error:', error)
    return NextResponse.json(
      { error: 'Failed to get study buddy response' },
      { status: 500 }
    )
  }
}

function generateFallbackAnswer(question: string) {
  const lowerQuestion = question.toLowerCase()
  
  // Simple keyword-based fallback responses
  if (lowerQuestion.includes('what') || lowerQuestion.includes('define')) {
    return "That's a great question! To find the answer, I'd recommend reviewing your course materials, textbooks, or lecture notes. You can also try breaking down the question into smaller parts to better understand what you're looking for."
  } else if (lowerQuestion.includes('how') || lowerQuestion.includes('explain')) {
    return "To explain this concept, start by identifying the key components. Then, think about how they relate to each other. Consider using examples or analogies to help you understand the process or concept better."
  } else if (lowerQuestion.includes('why')) {
    return "Understanding the 'why' behind concepts is crucial for deep learning. Try to connect this to fundamental principles you've learned, and consider the broader context or implications."
  } else if (lowerQuestion.includes('study') || lowerQuestion.includes('learn')) {
    return "Great study strategies include active recall, spaced repetition, and explaining concepts to others. Try creating flashcards, summarizing in your own words, or teaching the material to a friend!"
  } else {
    return "That's an interesting question! To get the most accurate answer, I'd recommend checking your course materials, consulting your textbook, or discussing with classmates. Remember, asking questions is a key part of the learning process!"
  }
} 