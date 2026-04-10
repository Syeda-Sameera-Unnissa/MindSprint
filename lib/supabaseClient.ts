import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ybikeirzfglovrcjwlna.supabase.co";
const supabaseAnonKey = "sb_publishable_bgqKk14MT4SlRbR8E0q50A_jBTVnY2f";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);