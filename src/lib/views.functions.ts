import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const registerArticleView = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("increment_article_views" as never, {
      _slug: data.slug,
    } as never);
    if (error) return { ok: false };
    return { ok: true };
  });
