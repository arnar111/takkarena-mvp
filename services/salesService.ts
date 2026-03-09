import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Sale } from '../types';

export interface SalesQueryOptions {
  startDate?: Date;
  endDate?: Date;
  limitCount?: number;
}

/**
 * Subscribe to sales for a specific user with optional date filtering
 */
export const subscribeSales = (
  userId: string,
  callback: (sales: Sale[]) => void,
  options: SalesQueryOptions = {}
): (() => void) => {
  const { startDate, limitCount = 200 } = options;
  
  let q = query(
    collection(db, 'sales'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  // Note: Firestore requires composite index for multiple where clauses with orderBy
  // Date filtering will be done client-side for simplicity
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    let sales = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Sale));
    
    // Client-side date filtering
    if (startDate) {
      sales = sales.filter(sale => new Date(sale.timestamp) >= startDate);
    }
    
    callback(sales);
  }, (error) => {
    console.error('❌ Error fetching sales:', error);
  });

  return unsubscribe;
};

/**
 * Subscribe to ALL sales (for competitions, leaderboards) with date filtering
 * Performance optimized: defaults to last 30 days
 */
export const subscribeAllSales = (
  callback: (sales: Sale[]) => void,
  options: SalesQueryOptions = {}
): (() => void) => {
  const { limitCount = 500 } = options;
  
  // Default to last 30 days for performance
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);
  const startDate = options.startDate || defaultStartDate;
  
  const q = query(
    collection(db, 'sales'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    let sales = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Sale));
    
    // Client-side date filtering
    sales = sales.filter(sale => new Date(sale.timestamp) >= startDate);
    
    callback(sales);
  }, (error) => {
    console.error('❌ Error fetching all sales:', error);
  });

  return unsubscribe;
};

/**
 * Add a new sale
 */
export const addSale = async (sale: Omit<Sale, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'sales'), sale);
  return docRef.id;
};

/**
 * Update an existing sale
 */
export const updateSale = async (id: string, data: Partial<Sale>): Promise<void> => {
  await updateDoc(doc(db, 'sales', id), data);
};

/**
 * Delete a sale
 */
export const deleteSale = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'sales', id));
};

export default {
  subscribeSales,
  subscribeAllSales,
  addSale,
  updateSale,
  deleteSale
};
