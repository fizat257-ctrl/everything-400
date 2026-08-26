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

(function initializeSupabase() {

    console.log(
        "Everything 400: Checking Supabase library..."
    );


    // -------------------------------------------------
    // CHECK SUPABASE LIBRARY
    // -------------------------------------------------

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "Everything 400: Supabase library is NOT loaded."
        );

        console.error(
            "Make sure Supabase CDN is loaded BEFORE this file."
        );

        window.supabaseClient = null;

        return;
    }


    // -------------------------------------------------
    // CREATE CLIENT
    // -------------------------------------------------

    try {

        const client =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


        // -------------------------------------------------
        // MAKE CLIENT AVAILABLE TO ALL JS FILES
        // -------------------------------------------------

        window.supabaseClient =
            client;


        // -------------------------------------------------
        // VERIFY CLIENT
        // -------------------------------------------------

        if (window.supabaseClient) {

            console.log(
                "Everything 400: Supabase client connected successfully."
            );

        } else {

            console.error(
                "Everything 400: Supabase client could not be created."
            );

        }

    } catch (error) {

        console.error(
            "Everything 400: Supabase initialization error:",
            error
        );

        window.supabaseClient = null;
    }

})();