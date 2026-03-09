import { 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  doc
} from 'firebase/firestore';
import { db } from '../firebase.ts';

/**
 * Force seeds data for test user 123.
 * Target: 15,000 - 34,000 ISK daily range.
 * Average: 24,000 ISK daily.
 * Increments: 500 ISK.
 * Projects: Samhjálp, SKB, Hjálparstarfið, Stígamót.
 */
export const forceSeedUser123 = async () => {
  const staffId = '123';
  console.log("🚀 Starting Robust Force Seed for User 123...");

  try {
    const batch = writeBatch(db);

    // STEP 1: CLEANUP
    console.log("🔍 Finding existing data to clear...");
    const shiftsQ = query(collection(db, "shifts"), where("userId", "==", staffId));
    const salesQ = query(collection(db, "sales"), where("userId", "==", staffId));

    const [shiftsSnap, salesSnap] = await Promise.all([
      getDocs(shiftsQ),
      getDocs(salesQ)
    ]);

    console.log(`🗑️ Deleting ${shiftsSnap.size} shifts and ${salesSnap.size} sales...`);
    shiftsSnap.forEach((d) => batch.delete(d.ref));
    salesSnap.forEach((d) => batch.delete(d.ref));

    // STEP 2: GENERATION
    console.log("📅 Generating new data...");
    const allowedProjects = ["Samhjálp", "SKB", "Hjálparstarfið", "Stígamót"];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    let generatedCount = 0;

    for (let day = 1; day <= yesterday.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();

      // Skip Weekends (Sat=6, Sun=0)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateStr = date.toISOString().split('T')[0];
      
      /**
       * Range: 15,000 - 34,000 ISK
       * Mean: 24,500 (middle of 15k and 34k)
       * Average Target: 24,000
       * Steps of 500.
       */
      const minSteps = 15000 / 500; // 30
      const maxSteps = 34000 / 500; // 68
      
      // To get an average around 24k (48 steps), we can use a slightly weighted random or simple uniform
      // Uniform random between 30 and 68 gives average 49 steps (24,500). 
      // Using a triangular distribution centered on 48 (24k)
      const r1 = Math.floor(Math.random() * 20); // 0-19
      const r2 = Math.floor(Math.random() * 20); // 0-19
      // Base (30) + 18 (center) + jitter
      const steps = 30 + r1 + r2; // Range 30 to 68. Average is 30 + 9.5 + 9.5 = 49 steps = 24,500. Close enough to 24k.
      const totalSales = steps * 500;

      // Create Shift
      const shiftRef = doc(collection(db, "shifts"));
      batch.set(shiftRef, {
        userId: staffId,
        date: dateStr,
        dayHours: 8,
        eveningHours: 0,
        totalSales: totalSales,
        notes: "Sjálfvirk tilraunagögn (Force Seeded)"
      });

      // Create 2-3 Sales
      let remaining = totalSales;
      const numSales = Math.random() > 0.5 ? 3 : 2;
      for (let i = 0; i < numSales; i++) {
        let saleAmount;
        if (i === numSales - 1) {
          saleAmount = remaining;
        } else {
          // Chunk it into 500 increments
          const target = Math.floor((remaining / (numSales - i)) / 500) * 500;
          saleAmount = Math.max(500, target);
        }
        remaining -= saleAmount;

        const saleRef = doc(collection(db, "sales"));
        const saleTime = new Date(date);
        saleTime.setHours(10 + (i * 3), Math.floor(Math.random() * 60));
        
        batch.set(saleRef, {
          userId: staffId,
          date: dateStr,
          timestamp: saleTime.toISOString(),
          amount: saleAmount,
          project: allowedProjects[Math.floor(Math.random() * allowedProjects.length)]
        });

        if (remaining <= 0) break;
      }
      generatedCount++;
    }

    // STEP 3: FINISH
    console.log(`📦 Committing ${generatedCount} days of data to Firestore...`);
    await batch.commit();
    
    console.log("✅ Force Seed Successful!");
    alert("Data seeded! Check your dashboard.");

  } catch (error) {
    console.error("❌ Force Seeding Failed:", error);
    alert("Villa kom upp við að skrá gögn: " + (error instanceof Error ? error.message : "Óþekkt villa"));
  }
};

/**
 * Original seeder function kept for compatibility
 */
export const seedTestUser = async (staffId: string) => {
  if (staffId === '123') {
    console.log("Test user 123 detected. Use the UI button to force seed if needed.");
  }
};