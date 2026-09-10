import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { name, phone, email, password } = await request.json();

    if (!name || !phone || !email || !password) {
      return NextResponse.json({ error: "Name, phone, email, and password are all required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: name },
    });

    if (userError || !userData.user) {
      const message = userError?.message.includes("already been registered")
        ? "That email is already registered to an account."
        : userError?.message || "Could not create the login account.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from("delivery_officers").insert({
      user_id: userData.user.id,
      name,
      phone,
      active: true,
    });

    if (insertError) {
      // Roll back the auth user if we couldn't save the profile, to avoid an orphaned login.
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json({ error: "Could not save the delivery officer profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
