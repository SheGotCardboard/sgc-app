import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateEvent, WebhookVerificationError } from "@polar-sh/nextjs";

// Use service role client — bypasses RLS for webhook writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("webhook-signature") ?? "";

  // Verify the webhook came from Polar
  let event;
  try {
    event = validateEvent(
      body,
      request.headers,
      process.env.POLAR_WEBHOOK_SECRET!
    );
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      console.error("Polar webhook verification failed:", e.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
    throw e;
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "subscription.created":
      case "subscription.updated": {
        const sub = data as {
          id: string;
          customer_id: string;
          customer_email?: string;
          product_id: string;
          product?: { name?: string };
          status: string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
        };

        // Map Polar product name to our tier slug
        const tierMap: Record<string, string> = {
          "The Story": "story",
          "The Chronicle": "chronicle",
          "The Legacy": "legacy",
        };

        const productName = sub.product?.name ?? "";
        const tierSlug = tierMap[productName] ?? "story";

        // Find user by email
        const email = sub.customer_email;
        if (!email) break;

        // Upsert into member_subscriptions
        const { error } = await supabase
          .from("member_subscriptions")
          .upsert({
            polar_subscription_id: sub.id,
            polar_customer_id: sub.customer_id,
            email: email,
            tier_slug: tierSlug,
            status: sub.status,
            current_period_start: sub.current_period_start ?? null,
            current_period_end: sub.current_period_end ?? null,
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "polar_subscription_id"
          });

        if (error) {
          console.error("Supabase upsert error:", error);
          return NextResponse.json({ error: "DB error" }, { status: 500 });
        }
        break;
      }

      case "subscription.canceled": {
        const sub = data as { id: string };
        const { error } = await supabase
          .from("member_subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("polar_subscription_id", sub.id);

        if (error) {
          console.error("Supabase update error:", error);
          return NextResponse.json({ error: "DB error" }, { status: 500 });
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}