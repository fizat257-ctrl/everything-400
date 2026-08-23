// =========================
// EVERYTHING 400 - SUPABASE
// =========================

const SUPABASE_URL =
    "https://ghkegyahigtmoeffsamu.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Uoc4Vyo7lOwr5tBpQXCZYQ_xeFiPgo5";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );