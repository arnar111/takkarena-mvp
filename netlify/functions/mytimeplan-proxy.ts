// Netlify serverless function to proxy MyTimePlan API calls
// Bypasses CORS restrictions for browser-based clock-in/clock-out

export async function handler(event: any) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { kennitala } = JSON.parse(event.body || '{}');

        if (!kennitala || kennitala.length !== 10) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid kennitala - must be 10 digits' })
            };
        }

        // Step 1: Fetch the main page to get a fresh postId
        const pageResponse = await fetch('https://regmidlun.mytimeplan.com/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const pageHtml = await pageResponse.text();

        // Extract postId from the page
        const postIdMatch = pageHtml.match(/id="postId"\s+value="([^"]+)"/);
        if (!postIdMatch) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Could not fetch session token from MyTimePlan' })
            };
        }

        const postId = postIdMatch[1];

        // Step 2: Make the registration AJAX call
        const registerUrl = `https://regmidlun.mytimeplan.com/register_ajax.php?postId=${encodeURIComponent(postId)}&SSN=${encodeURIComponent(kennitala)}&unitId=-1`;

        const registerResponse = await fetch(registerUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://regmidlun.mytimeplan.com/',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const result = await registerResponse.json();

        // Result format varies - try multiple field names for the display message
        // MyTimePlan uses long_message for the actual display text
        let displayMessage = result.long_message || result.message || result.displayMessage || result.text || '';

        // Clean up HTML tags
        displayMessage = displayMessage.replace(/<br\s*\/?>/gi, ' | ');

        // Detect action from message text - MyTimePlan uses Innskráning/Útskráning
        const isClockIn = displayMessage.includes('Innskráning') || displayMessage.includes('INN');
        const isClockOut = displayMessage.includes('Útskráning') || displayMessage.includes('ÚT');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: result.success === 1 || result.success === true,
                message: displayMessage || 'Skráning tókst',
                action: isClockIn ? 'clock_in' : isClockOut ? 'clock_out' : 'unknown',
                raw: result
            })
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to communicate with MyTimePlan',
                details: error.message
            })
        };
    }
}
