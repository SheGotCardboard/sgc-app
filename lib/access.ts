import { createClient } from "@/lib/supabase/server";

export type TierSlug = "story" | "chronicle" | "legacy";

export type AccessBenefits = {
  tier: TierSlug | null;
  isAuthenticated: boolean;
  isMember: boolean;
  // Content access
  hasEarlyAccess: boolean;
  hasFullArchive: boolean;
  hasCelebratesGallery: boolean;
  hasEzineAccess: boolean;
  hasChecklistDownload: boolean;
  hasMerchEarlyAccess: boolean;
  // Member features — Story (free)
  hasProfile: boolean;
  hasFollows: boolean;
  // Member features — Chronicle+
  hasWishlist: boolean;
  hasCardFavorites: boolean;
  // Member features — Legacy+
  hasSavedArticles: boolean;
  hasReadingHistory: boolean;
};

const TIER_BENEFITS: Record<TierSlug, Omit<AccessBenefits, "tier" | "isAuthenticated" | "isMember">> = {
  story: {
    hasEarlyAccess: false,
    hasFullArchive: false,
    hasCelebratesGallery: false,
    hasEzineAccess: false,
    hasChecklistDownload: false,
    hasMerchEarlyAccess: false,
    hasProfile: true,
    hasFollows: true,
    hasWishlist: false,
    hasCardFavorites: false,
    hasSavedArticles: false,
    hasReadingHistory: false,
  },
  chronicle: {
    hasEarlyAccess: true,
    hasFullArchive: true,
    hasCelebratesGallery: true,
    hasEzineAccess: false,
    hasChecklistDownload: false,
    hasMerchEarlyAccess: false,
    hasProfile: true,
    hasFollows: true,
    hasWishlist: true,
    hasCardFavorites: true,
    hasSavedArticles: false,
    hasReadingHistory: false,
  },
  legacy: {
    hasEarlyAccess: true,
    hasFullArchive: true,
    hasCelebratesGallery: true,
    hasEzineAccess: true,
    hasChecklistDownload: true,
    hasMerchEarlyAccess: true,
    hasProfile: true,
    hasFollows: true,
    hasWishlist: true,
    hasCardFavorites: true,
    hasSavedArticles: true,
    hasReadingHistory: true,
  },
};

export async function getAccess(): Promise<AccessBenefits> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      tier: null,
      isAuthenticated: false,
      isMember: false,
      hasEarlyAccess: false,
      hasFullArchive: false,
      hasCelebratesGallery: false,
      hasEzineAccess: false,
      hasChecklistDownload: false,
      hasMerchEarlyAccess: false,
      hasProfile: false,
      hasFollows: false,
      hasWishlist: false,
      hasCardFavorites: false,
      hasSavedArticles: false,
      hasReadingHistory: false,
    };
  }

  const { data: subscription } = await supabase
    .from("member_subscriptions")
    .select("tier_slug, status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const rawTier = (subscription as { tier_slug?: string } | null)?.tier_slug;
  const tierSlug: TierSlug = (rawTier as TierSlug) ?? "story";
  const benefits = TIER_BENEFITS[tierSlug];

  return {
    tier: tierSlug,
    isAuthenticated: true,
    isMember: true,
    ...benefits,
  };
}

export function isContentVisible(
  publishDate: string,
  freePublishDate: string | null,
  hasEarlyAccess: boolean
): boolean {
  const now = new Date();
  const publish = new Date(publishDate);
  const freePublish = freePublishDate ? new Date(freePublishDate) : null;
  if (hasEarlyAccess) return now >= publish;
  if (freePublish) return now >= freePublish;
  return now >= publish;
}