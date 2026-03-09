import { TeamName } from '../types';

export interface ScheduledPause {
    start: string; // "HH:MM"
    end: string;   // "HH:MM"
    startMessage: string;
    endMessage: string;
}

export const getScheduledPauses = (team: TeamName): ScheduledPause[] => {
    switch (team) {
        case 'Hringurinn':
            return [
                {
                    start: '12:45',
                    end: '13:15',
                    startMessage: '🍕 Hádegispási! Tími til að endurhlaða batteríið. Njóttu!',
                    endMessage: '⚡ Pása búin! Áfram með ásælina - kláraðu daginn með stil!'
                },
                {
                    start: '14:45',
                    end: '15:00',
                    startMessage: '☕ Skammtur af kaffi og nesti? 15 mínutur til að anda að sér!',
                    endMessage: '🔥 Kaffiið er drukkið - nú er kominn tími til að rífa til!'
                },
                {
                    start: '17:00',
                    end: '17:15',
                    startMessage: '🌅 Síðasta púst! Smá hvíld fyrir lokalotu dagsins.',
                    endMessage: '💪 Tilbúinn fyrir endasprettinn? Gangi þér vel!'
                }
            ];
        case 'Verið':
            return [
                {
                    start: '14:45',
                    end: '15:00',
                    startMessage: '🍩 Sykurstuð - tími fyrir smá nesti og hvíld!',
                    endMessage: '🎯 Pásan er búin! Aftur í gang með fullu!'
                },
                {
                    start: '17:00',
                    end: '17:30',
                    startMessage: '🌆 Kvöldpási í gangi. 30 mínútur til að slaka á!',
                    endMessage: '🚀 Pausan er lokið! Markmið framundan - áfram kákk!'
                }
            ];
        default:
            return [];
    }
};

export const checkIfPauseTime = (team: TeamName, currentTime: Date): {
    inPause: boolean;
    pauseInfo: ScheduledPause | null;
    shouldStart: boolean;
} => {
    const pauses = getScheduledPauses(team);
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

    for (const pause of pauses) {
        // Check if we should START a pause
        if (currentTimeStr === pause.start) {
            return { inPause: false, pauseInfo: pause, shouldStart: true };
        }

        // Check if we're currently IN a pause
        const [startH, startM] = pause.start.split(':').map(Number);
        const [endH, endM] = pause.end.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        if (currentTotalMinutes >= startMinutes && currentTotalMinutes < endMinutes) {
            return { inPause: true, pauseInfo: pause, shouldStart: false };
        }
    }

    return { inPause: false, pauseInfo: null, shouldStart: false };
};

export const calculatePauseDuration = (start: string, end: string): number => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return endMinutes - startMinutes;
};
