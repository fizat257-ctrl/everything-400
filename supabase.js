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
// CHECK SUPABASE LIBRARY
// =====================================================

(function () {

    console.log(
        "Everything 400: Checking Supabase library..."
    );


    // Check if Supabase CDN loaded

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "Supabase library is NOT loaded."
        );

        console.error(
            "Make sure the Supabase CDN is loaded BEFORE supabase.js."
        );

        window.supabaseClient = null;

        return;
    }


    // =================================================
    // CREATE SUPABASE CLIENT
    // =================================================

    try {

        const client =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


        // =================================================
        // MAKE CLIENT AVAILABLE GLOBALLY
        // =================================================

        window.supabaseClient =
            client;


        // =================================================
        // SUCCESS CHECK
        // =================================================

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