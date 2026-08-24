// =====================================================
// EVERYTHING 400 - SUPABASE CONNECTION
// =====================================================

// Supabase Project URL
const SUPABASE_URL =
    "https://ghkegyahigtmoeffsamu.supabase.co";

// Supabase Publishable Key
const SUPABASE_KEY =
    "sb_publishable_Uoc4Vyo7lOwr5tBpQXCZYQ_xeFiPgo5";


// =====================================================
// CHECK SUPABASE LIBRARY
// =====================================================

if (!window.supabase) {

    console.error(
        "Supabase library is NOT loaded."
    );

} else {

    // =================================================
    // CREATE CLIENT
    // =================================================

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    console.log(
        "Everything 400: Supabase client connected successfully."
    );
}