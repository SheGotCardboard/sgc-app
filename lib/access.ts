import { createClient } from "@/lib/supabase/server";

export type TierSlug = "story" | "chronicle" | "legacy";

export type AccessBenefits = {
  tier: TierSlug | null;
  isAuthenticated: boolean;
  isMember: boolean;
  hasEarlyAccess: boolean;
  hasFullArchive: boolean;
  hasCelebratesGallery: boolean;
  hasEzineAccess: boolean;
  hasChecklistDownload: boolean;
  hasMerchEarlyAccess: boolean;
};

const TIER_BENEFITS: Record<TierSlug, Omit<AccessBenefits, "tier" | "isAuthenticated" | "isMember">> = {
  story: {
    hasEarlyAccess: false,
    hasFullArchive: false,
    hasCelebratesGallery: false,
    hasEzineAccess: false,
    hasChecklistDownload: false,
    hasMerchEarlyAccess: false,
  },
  chronicle: {
    hasEarlyAccess: true,
    hasFullArchive: true,
    hasCelebratesGallery: true,
    hasEzineAccess: false,
    hasChecklistDownload: false,
    hasMerchEarlyAccess: false,
  },
  legacy: {
    hasEarlyAccess: true,
    hasFullArchive: true,
    hasCelebratesGallery: true,
    hasEzineAccess: true,
    hasChecklistDownload: true,
    hasMerchEarlyAccess: true,
  },
};

export async function getAccess(): Promise<AccessBenefits> {
  const supabase = await createClient();

  // Get current user
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
    };
  }

  // Look up active subscription by email
   const { data: subscription } = await supabase
    .from("member_subscriptions")
    .select("tier_slug, status")
    .eq("email", user.email!)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Authenticated but no active subscription — Story tier (free)
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

// Helper to check if content is accessible based on publish dates
export function isContentVisible(
  publishDate: string,
  freePublishDate: string | null,
  hasEarlyAccess: boolean
): boolean {
  const now = new Date();
  const publish = new Date(publishDate);
  const freePublish = freePublishDate ? new Date(freePublishDate) : null;

  // Early access members see content from publish_date
  if (hasEarlyAccess) {
    return now >= publish;
  }

  // Free members see content from free_publish_date
  if (freePublish) {
    return now >= freePublish;
  }

  // No free_publish_date — content is always visible
  return now >= publish;
}