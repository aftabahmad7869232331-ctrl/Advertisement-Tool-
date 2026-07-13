import { Campaign, GalleryAsset, SupportTicket, FaqArticle, FeedbackMessage } from "./types";
import { Project } from "./types/Project";
import { INITIAL_CAMPAIGNS, INITIAL_PROJECTS } from "./data";
import { workspaceApi } from "./services/workspaceApi";

// Firebase is intentionally disconnected for now.
// Hosting-time wiring can replace this file with the real Firebase adapter.
export const db = null;

const STORAGE_PREFIX = "brick-maker-local";
const CAMPAIGNS_COLLECTION = "campaigns";
const PROJECTS_COLLECTION = "projects";
const GALLERY_COLLECTION = "gallery_assets";
const SUPPORT_COLLECTION = "support_tickets";
const FAQ_COLLECTION = "faqs";
const FEEDBACK_COLLECTION = "feedback";

const INITIAL_FAQS: FaqArticle[] = [
  {
    id: "faq_1",
    question: "What is Brick-Maker Studio?",
    answer: "Brick-Maker Studio is an all-in-one elite creative workspace offering marketing content creation, video rendering, flyer design, and direct branding solutions for premium masonry, construction, and architectural businesses.",
    category: "Getting Started"
  },
  {
    id: "faq_2",
    question: "How do I start a video generation job?",
    answer: "Navigate to the Video tab. Enter a description of your scene, select the resolution (480P is recommended for maximum stability and speed with Wan2.1 T2V 1.3B), and click 'Generate'. The system will compile the rendering task.",
    category: "Video Production"
  },
  {
    id: "faq_3",
    question: "How do I upgrade to Premium?",
    answer: "Go to the Premium section from the navigation bar. Select your enterprise scaling package, complete the checkout form, and instant gold-tier credits will be credited to your account.",
    category: "Premium Membership"
  },
  {
    id: "faq_4",
    question: "Can I manage campaigns and budgets?",
    answer: "Yes, the Growth and Dashboard sections allow you to create, manage, pause, and analyze real-time search, print, and social media campaigns.",
    category: "Business Growth Center"
  }
];

function storageKey(collectionName: string) {
  return `${STORAGE_PREFIX}:${collectionName}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCollection<T>(collectionName: string, fallback: T[] = []): T[] {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey(collectionName));
    return raw ? (JSON.parse(raw) as T[]) : fallback;
  } catch (err) {
    console.warn(`Local storage read failed for ${collectionName}:`, err);
    return fallback;
  }
}

function writeCollection<T>(collectionName: string, items: T[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(storageKey(collectionName), JSON.stringify(items));
  } catch (err) {
    console.warn(`Local storage write failed for ${collectionName}:`, err);
  }
}

function sortByCreatedAtDesc<T extends { createdAt?: string | Date }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
  );
}

function upsertById<T extends { id: string }>(collectionName: string, item: T, fallback: T[] = []) {
  const items = readCollection<T>(collectionName, fallback);
  const exists = items.some((existing) => existing.id === item.id);
  const nextItems = exists
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [item, ...items];

  writeCollection(collectionName, nextItems);
}

function updateById<T extends { id: string }>(collectionName: string, id: string, updates: Partial<T>, fallback: T[] = []) {
  const items = readCollection<T>(collectionName, fallback);
  writeCollection(
    collectionName,
    items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
  );
}

function deleteById<T extends { id: string }>(collectionName: string, id: string, fallback: T[] = []) {
  const items = readCollection<T>(collectionName, fallback);
  writeCollection(
    collectionName,
    items.filter((item) => item.id !== id),
  );
}

export async function getCampaignsFromDb(): Promise<Campaign[]> {
  return sortByCreatedAtDesc(readCollection<Campaign>(CAMPAIGNS_COLLECTION, INITIAL_CAMPAIGNS));
}

export async function saveCampaignToDb(campaign: Campaign): Promise<void> {
  upsertById(CAMPAIGNS_COLLECTION, campaign, INITIAL_CAMPAIGNS);
}

export async function updateCampaignStatusInDb(
  id: string,
  status: "Active" | "Paused" | "Completed" | "Draft",
): Promise<void> {
  updateById<Campaign>(CAMPAIGNS_COLLECTION, id, { status }, INITIAL_CAMPAIGNS);
}

export async function getProjectsFromDb(): Promise<Project[]> {
  return sortByCreatedAtDesc(readCollection<Project>(PROJECTS_COLLECTION, INITIAL_PROJECTS));
}

export async function saveProjectToDb(project: Project): Promise<void> {
  upsertById(PROJECTS_COLLECTION, project, INITIAL_PROJECTS);
}

export async function updateProjectInDb(id: string, updates: Partial<Project>): Promise<void> {
  updateById<Project>(PROJECTS_COLLECTION, id, updates, INITIAL_PROJECTS);
}

export async function deleteProjectFromDb(id: string): Promise<void> {
  deleteById<Project>(PROJECTS_COLLECTION, id, INITIAL_PROJECTS);
}

export async function getGalleryAssetsFromDb(): Promise<GalleryAsset[]> {
  try {
    const remote = await workspaceApi.list<GalleryAsset>(GALLERY_COLLECTION);
    if (remote.length > 0) writeCollection(GALLERY_COLLECTION, remote);
    return sortByCreatedAtDesc(remote.length > 0 ? remote : readCollection<GalleryAsset>(GALLERY_COLLECTION));
  } catch {
    return sortByCreatedAtDesc(readCollection<GalleryAsset>(GALLERY_COLLECTION));
  }
}

export async function saveGalleryAssetToDb(asset: GalleryAsset): Promise<void> {
  upsertById(GALLERY_COLLECTION, asset);
  await workspaceApi.save(GALLERY_COLLECTION, asset).catch(() => undefined);
}

export async function deleteGalleryAssetFromDb(id: string): Promise<void> {
  deleteById<GalleryAsset>(GALLERY_COLLECTION, id);
  await workspaceApi.remove(GALLERY_COLLECTION, id).catch(() => undefined);
}

export async function getSupportTicketsFromDb(): Promise<SupportTicket[]> {
  try {
    const remote = await workspaceApi.list<SupportTicket>(SUPPORT_COLLECTION);
    if (remote.length > 0) writeCollection(SUPPORT_COLLECTION, remote);
    return sortByCreatedAtDesc(remote.length > 0 ? remote : readCollection<SupportTicket>(SUPPORT_COLLECTION));
  } catch {
    return sortByCreatedAtDesc(readCollection<SupportTicket>(SUPPORT_COLLECTION));
  }
}

export async function saveSupportTicketToDb(ticket: SupportTicket): Promise<void> {
  upsertById(SUPPORT_COLLECTION, ticket);
  await workspaceApi.save(SUPPORT_COLLECTION, ticket).catch(() => undefined);
}

export async function updateSupportTicketInDb(id: string, updates: Partial<SupportTicket>): Promise<void> {
  updateById<SupportTicket>(SUPPORT_COLLECTION, id, updates);
  await workspaceApi.update<SupportTicket>(SUPPORT_COLLECTION, id, updates).catch(() => undefined);
}

export async function deleteSupportTicketFromDb(id: string): Promise<void> {
  deleteById<SupportTicket>(SUPPORT_COLLECTION, id);
  await workspaceApi.remove(SUPPORT_COLLECTION, id).catch(() => undefined);
}

export async function getFaqsFromDb(): Promise<FaqArticle[]> {
  try {
    const remote = await workspaceApi.list<FaqArticle>(FAQ_COLLECTION);
    return remote.length > 0 ? remote : readCollection<FaqArticle>(FAQ_COLLECTION, INITIAL_FAQS);
  } catch {
    return readCollection<FaqArticle>(FAQ_COLLECTION, INITIAL_FAQS);
  }
}

export async function saveFaqToDb(faq: FaqArticle): Promise<void> {
  upsertById(FAQ_COLLECTION, faq, INITIAL_FAQS);
  await workspaceApi.save(FAQ_COLLECTION, faq).catch(() => undefined);
}

export async function deleteFaqFromDb(id: string): Promise<void> {
  deleteById<FaqArticle>(FAQ_COLLECTION, id, INITIAL_FAQS);
  await workspaceApi.remove(FAQ_COLLECTION, id).catch(() => undefined);
}

export async function getFeedbackFromDb(): Promise<FeedbackMessage[]> {
  try {
    const remote = await workspaceApi.list<FeedbackMessage>(FEEDBACK_COLLECTION);
    return sortByCreatedAtDesc(remote.length > 0 ? remote : readCollection<FeedbackMessage>(FEEDBACK_COLLECTION));
  } catch {
    return sortByCreatedAtDesc(readCollection<FeedbackMessage>(FEEDBACK_COLLECTION));
  }
}

export async function saveFeedbackToDb(feedback: FeedbackMessage): Promise<void> {
  upsertById(FEEDBACK_COLLECTION, feedback);
  await workspaceApi.save(FEEDBACK_COLLECTION, feedback).catch(() => undefined);
}

