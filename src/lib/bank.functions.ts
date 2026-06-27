import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const saveBankAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      bankName: z.string().trim().min(2).max(100),
      accountNumber: z.string().trim().min(4).max(40),
      accountHolder: z.string().trim().min(2).max(100),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const key = process.env.BANK_ENCRYPTION_KEY;
    if (!key) throw new Error("Bank encryption key not configured");
    const { data: id, error } = await context.supabase.rpc("upsert_bank_account", {
      _bank_name: data.bankName,
      _account_number: data.accountNumber,
      _account_holder: data.accountHolder,
      _key: key,
    });
    if (error) throw new Error(error.message);
    return { id };
  });
