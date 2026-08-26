import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, brandName, aiName, aiPersona, features = [], tagline = '' } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const lowercaseMsg = message.toLowerCase();
    let responseText = '';

    // Smart contextual rules using persona context
    if (lowercaseMsg.includes('price') || lowercaseMsg.includes('cost') || lowercaseMsg.includes('buy') || lowercaseMsg.includes('offer')) {
      responseText = `${brandName || 'Our brand'} offers top tier value! Check out our latest deals on the page. 💰✨`;
    } else if (lowercaseMsg.includes('feature') || lowercaseMsg.includes('spec') || lowercaseMsg.includes('what can it do') || lowercaseMsg.includes('details')) {
      const featText = features.length > 0 ? features.join(', ') : 'Ultra high performance and vibrant designs';
      responseText = `Here are key highlights of ${brandName}: ${featText}! ⚡`;
    } else if (lowercaseMsg.includes('slogan') || lowercaseMsg.includes('tagline') || lowercaseMsg.includes('motto')) {
      responseText = `Our motto: "${tagline || 'The best experience'}" 📣`;
    } else if (lowercaseMsg.includes('who are you') || lowercaseMsg.includes('your name') || lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi')) {
      responseText = `Hello! I'm ${aiName || 'your helper'}, representing ${brandName || 'our brand'}. How can I make your day awesome today? 😊`;
    } else {
      responseText = `${aiName || 'AI Assistant'}: ${tagline ? `"${tagline}" ` : ''}Thanks for reaching out! What else would you like to explore about ${brandName}? 🚀`;
    }

    return NextResponse.json({
      success: true,
      reply: responseText,
      assistantName: aiName || 'AI Assistant',
    });
  } catch (error: any) {
    console.error('Error in AI Chat API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
