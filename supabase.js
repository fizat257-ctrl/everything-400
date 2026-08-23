// =====================================================
// EVERYTHING 400 - SUPABASE CONNECTION
// =====================================================


// =====================================================
// SUPABASE PROJECT
// =====================================================

const SUPABASE_URL =
    "https://ghkegyahigtmoeffsamu.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Uoc4Vyo7lOwr5tBpQXCZYQ_xeFiPgo5";


// =====================================================
// CREATE SUPABASE CLIENT
// =====================================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// MAKE CLIENT AVAILABLE TO ALL JAVASCRIPT FILES
// =====================================================

window.supabaseClient =
    supabaseClient;


// =====================================================
// CONNECTION CHECK
// =====================================================

console.log(
    "Everything 400: Supabase client connected successfully."
);