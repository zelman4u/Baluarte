import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface OrganizationMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  reportsTo?: string; // ID of the parent member
}

export interface CommunityHappening {
  id: string;
  title: string;
  description: string;
  image?: string;
  date: string;
}

export interface QuickFact {
  id: string;
  label: string;
  value: string;
}

export interface LandingPageContent {
  pageId: 'main' | 'justice' | 'health' | 'youth';
  title: string;
  heroImages: string[];
  announcements: Announcement[];
  body: string;
  organization: OrganizationMember[];
  communityHappenings: CommunityHappening[];
  quickFacts?: QuickFact[];
  updatedAt?: any;
  updatedBy?: string;
}

const COLLECTION_NAME = 'landing_pages';

/**
 * Recursively removes any keys with undefined values from an object.
 * Firestore does not allow undefined values in data.
 */
function cleanData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => v === undefined ? null : cleanData(v));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanData(v)])
    );
  }
  return obj;
}

export const landingPageService = {
  async getPageContent(pageId: string): Promise<LandingPageContent | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, pageId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as LandingPageContent;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching page content for ${pageId}:`, error);
      throw error;
    }
  },

  async updatePageContent(pageId: string, content: Partial<LandingPageContent>, userId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, pageId);
      const rawUpdate = {
        ...content,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, cleanData(rawUpdate));
      } else {
        const fullContent = {
          ...content,
          pageId,
          title: content.title || (pageId === 'main' ? 'Barangay Baluarte' : `Barangay ${pageId.charAt(0).toUpperCase() + pageId.slice(1)} Unit`),
          heroImages: content.heroImages || [],
          announcements: content.announcements || [],
          body: content.body || '',
          organization: content.organization || [],
          communityHappenings: content.communityHappenings || [],
          updatedAt: serverTimestamp(),
          updatedBy: userId
        };
        await setDoc(docRef, cleanData(fullContent));
      }
    } catch (error) {
      console.error(`Error updating page content for ${pageId}:`, error);
      throw error;
    }
  }
};
