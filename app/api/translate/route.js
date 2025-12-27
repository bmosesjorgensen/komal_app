export async function POST(request) {
  try {
    const { text, fromLang, toLang } = await request.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Translate the following text from ${fromLang} to ${toLang}. 

IMPORTANT: 
- Detect the emotional context (romantic, formal, casual, family, business)
- Translate naturally to match that context
- Preserve tone and warmth
- Use appropriate honorifics if needed
- Output ONLY the translation, no explanations

Text to translate: "${text}"`
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      return new Response(JSON.stringify({ translation: data.content[0].text.trim() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ translation: 'Translation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Server translation error:', error);
    return new Response(JSON.stringify({ translation: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```
