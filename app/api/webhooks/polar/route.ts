import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const tierMap: Record<string, string> = {
  "The Story": "story",
  "The Chronicle": "chronicle",
  "The Legacy": "legacy",
};

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async ({ type, data }) => {
    switch (type) {
      case "subscription.created":
      case "subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = data as any;
        const email = sub.customer?.email ?? sub.customer_email;
        if (!email) break;

        const tierSlug = tierMap[sub.product?.name ?? ""] ?? "story";

        await supabase.from("member_subscriptions").upsert({
          polar_subscription_id: sub.id,
          polar_customer_id: sub.customer_id,
          email,
          tier_slug: tierSlug,
          status: sub.status,
          current_period_start: sub.current_period_start ?? null,
          current_period_end: sub.current_period_end ?? null,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          updated_at: new Date().toISOString(),
        }, { onConflict: "polar_subscription_id" });
        break;
      }

      case "subscription.canceled": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = data as any;
        await supabase
          .from("member_subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("polar_subscription_id", sub.id);
        break;
      }
    }
  },
});