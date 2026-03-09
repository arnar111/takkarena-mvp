// MyTimePlan Integration Service
// Handles clock-in/clock-out via the Netlify serverless proxy

interface MyTimePlanResponse {
    success: boolean;
    message: string;
    action: 'clock_in' | 'clock_out' | 'unknown';
    raw?: any;
}

/**
 * Toggle attendance (clock in or clock out) via MyTimePlan
 * Uses the Netlify serverless proxy to bypass CORS
 */
export async function toggleMyTimePlanAttendance(kennitala: string): Promise<MyTimePlanResponse> {
    if (!kennitala || kennitala.length !== 10) {
        throw new Error('Invalid kennitala - must be 10 digits');
    }

    try {
        // In development, use local Netlify CLI or relative path
        const baseUrl = import.meta.env.DEV
            ? 'http://localhost:8888/.netlify/functions/mytimeplan-proxy'
            : '/.netlify/functions/mytimeplan-proxy';

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ kennitala })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to connect to MyTimePlan');
        }

        return await response.json();
    } catch (error: any) {
        console.error('[MyTimePlan] Error:', error);
        throw error;
    }
}

/**
 * Parse the MyTimePlan response message to extract name and action
 */
export function parseMyTimePlanMessage(message: string): { name: string; action: string; time: string } | null {
    // Example message: "Arnar - INN kl. 20:00"
    const match = message.match(/^(.+?)\s*-\s*(INN|ÚT)\s*kl\.\s*(\d{1,2}:\d{2})/);
    if (match) {
        return {
            name: match[1].trim(),
            action: match[2] === 'INN' ? 'Skráður inn' : 'Skráður út',
            time: match[3]
        };
    }
    return null;
}
